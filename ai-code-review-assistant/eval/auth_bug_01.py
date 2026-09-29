import sqlite3

def authenticate_user(username, password):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    
    # SQL Injection vulnerability
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    user = cursor.fetchone()
    
    conn.close()
    return user

# Hardcoded API key
API_KEY = "sk-1234567890abcdef"

def get_data():
    import requests
    headers = {"Authorization": f"Bearer {API_KEY}"}
    response = requests.get("https://api.example.com/data", headers=headers)
    return response.json()
