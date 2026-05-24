from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def chunk_code(file_path: str, content: str, chunk_size: int = 500):
    chunks = []
    lines = content.split('\n')
    current_chunk = []
    current_size = 0

    for line in lines:
        current_chunk.append(line)
        current_size += len(line)

        if current_size >= chunk_size:
            chunk_text = '\n'.join(current_chunk)
            chunks.append({
                'text': f"File: {file_path}\n\n{chunk_text}",
                'path': file_path
            })
            current_chunk = []
            current_size = 0

    if current_chunk:
        chunk_text = '\n'.join(current_chunk)
        chunks.append({
            'text': f"File: {file_path}\n\n{chunk_text}",
            'path': file_path
        })

    return chunks

def get_embedding(text: str):
    result = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values

def get_query_embedding(text: str):
    result = client.models.embed_content(
        model="models/gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values
    return result.embeddings[0].values