from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import time

load_dotenv()

app = FastAPI(title="DevLens ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IndexRequest(BaseModel):
    repo_id: str
    owner: str
    repo: str

class ChatRequest(BaseModel):
    repo_id: str
    question: str

@app.get("/")
def root():
    return {"message": "DevLens ML Service is running!"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/index")
async def index_repository(request: IndexRequest):
    try:
        from github_fetcher import fetch_repo_files
        from embeddings import chunk_code, get_embedding
        from vector_store import upsert_chunks, delete_repo_vectors

        print(f"Fetching files for {request.owner}/{request.repo}")
        files = fetch_repo_files(request.owner, request.repo, max_files=15)

        if not files:
            raise HTTPException(status_code=400, detail="No files found in repository")

        print(f"Found {len(files)} files, chunking...")
        all_chunks = []
        for file in files:
            chunks = chunk_code(file['path'], file['content'])
            all_chunks.extend(chunks)

        print(f"Generated {len(all_chunks)} chunks, generating embeddings...")

        # Delete old vectors for this repo
        delete_repo_vectors(request.repo_id)

        # Generate embeddings in batches with rate limit delay
        embeddings = []
        batch_size = 10
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            for chunk in batch:
                embedding = get_embedding(chunk['text'])
                embeddings.append(embedding)
            print(f"Embedded {min(i + batch_size, len(all_chunks))}/{len(all_chunks)} chunks")
            if i + batch_size < len(all_chunks):
                time.sleep(65)

        print("Storing in Pinecone...")
        upsert_chunks(request.repo_id, all_chunks, embeddings)

        return {
            "message": "Repository indexed successfully",
            "files_processed": len(files),
            "chunks_created": len(all_chunks)
        }

    except Exception as e:
        print(f"Indexing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        from embeddings import get_query_embedding
        from vector_store import search_similar
        from chat import chat_with_codebase

        query_embedding = get_query_embedding(request.question)
        matches = search_similar(request.repo_id, query_embedding)

        if not matches:
            return {
                "answer": "I don't have enough context about this repository yet. Please index it first."
            }

        answer = chat_with_codebase(request.question, matches)
        return {"answer": answer}

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))