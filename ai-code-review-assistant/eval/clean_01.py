import sqlite3
from typing import Optional

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Secure authentication with parameterized query."""
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # Parameterized query - SQL injection safe
        query = "SELECT * FROM users WHERE username = ? AND password = ?"
        cursor.execute(query, (username, password))
        user = cursor.fetchone()
        
        conn.close()
        return user
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return None

def get_data(api_key: str) -> dict:
    """Get data from API with proper error handling."""
    import requests
    try:
        headers = {"Authorization": f"Bearer {api_key}"}
        response = requests.get("https://api.example.com/data", headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"API error: {e}")
        return {}
