from flask import Flask, request

app = Flask(__name__)

@app.route('/search')
def search():
    # No input validation - could be SQL injection or XSS
    query = request.args.get('q')
    # Directly using user input without validation
    return f"Searching for: {query}"

@app.route('/upload', methods=['POST'])
def upload():
    # No file type validation
    file = request.files['file']
    # No check for file type or size
    file.save(f'/uploads/{file.filename}')
    return "File uploaded"
