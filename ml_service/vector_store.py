from pinecone import Pinecone
import os
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("PINECONE_INDEX", "devlens-embeddings")

def get_index():
    return pc.Index(index_name)

def upsert_chunks(repo_id: str, chunks: list, embeddings: list):
    index = get_index()
    vectors = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        vectors.append({
            'id': f"{repo_id}_{i}",
            'values': embedding,
            'metadata': {
                'repo_id': repo_id,
                'path': chunk['path'],
                'text': chunk['text'][:1000]
            }
        })
    
    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i:i + batch_size]
        index.upsert(vectors=batch, namespace=repo_id)

def search_similar(repo_id: str, query_embedding: list, top_k: int = 5):
    index = get_index()
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        namespace=repo_id,
        include_metadata=True
    )
    return results['matches']

def delete_repo_vectors(repo_id: str):
    index = get_index()
    try:
        index.delete(delete_all=True, namespace=repo_id)
    except:
        pass