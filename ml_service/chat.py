import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def chat_with_codebase(question: str, context_chunks: list):
    context = "\n\n---\n\n".join([
        f"File: {chunk['metadata']['path']}\n{chunk['metadata']['text']}"
        for chunk in context_chunks
    ])

    prompt = f"""You are an expert code analyst analyzing a GitHub repository.

Based on the following code context, answer the user's question clearly and concisely.
If the answer is not in the context, say so honestly.

CODE CONTEXT:
{context}

USER QUESTION:
{question}

Provide a clear, helpful answer. If referencing specific files or functions, mention them by name."""

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "nvidia/nemotron-3-super-120b-a12b:free",
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
    )

    data = response.json()
    print("OpenRouter response:", data)
    
    if 'choices' in data:
        return data['choices'][0]['message']['content']
    elif 'error' in data:
        raise Exception(f"OpenRouter error: {data['error']}")
    else:
        raise Exception(f"Unexpected response: {data}")