import requests
import os
import base64
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

SUPPORTED_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c',
    '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.md',
    '.html', '.css', '.json', '.yaml', '.yml', '.sh', '.ipynb',
    '.txt', '.r', '.m', '.scala', '.vue', '.dart'
}

def get_headers():
    headers = {'Accept': 'application/vnd.github.v3+json'}
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'
    return headers

def fetch_repo_files(owner: str, repo: str, max_files: int = 15):
    files = []

    try:
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
        res = requests.get(tree_url, headers=get_headers())
        tree = res.json()

        blobs = [
            f for f in tree.get('tree', [])
            if f['type'] == 'blob' and
            any(f['path'].endswith(ext) for ext in SUPPORTED_EXTENSIONS) and
            f.get('size', 0) < 50000
        ]

        blobs = blobs[:max_files]

        for blob in blobs:
            try:
                content_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{blob['path']}"
                res = requests.get(content_url, headers=get_headers())
                data = res.json()

                if 'content' in data:
                    content = base64.b64decode(data['content']).decode('utf-8', errors='ignore')
                    files.append({
                        'path': blob['path'],
                        'content': content
                    })
            except Exception as e:
                continue

    except Exception as e:
        print(f"Error fetching repo: {e}")

    return files