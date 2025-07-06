from flask import Flask, request, jsonify, render_template, send_from_directory
import requests
import os

app = Flask(__name__, template_folder='templates', static_folder='static')

# === IBM Watsonx.ai Credentials ===
API_KEY = "lV9CIRi3uHYobaQhpoVxc29CQm3N_XwsBXYkkWC5c3Fl"
PROJECT_ID = "67ca5d9a-9acc-4c48-a218-52cf67e8fd0b"

def get_iam_token(api_key):
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
        "apikey": api_key
    }
    response = requests.post(url, headers=headers, data=data)
    if response.status_code != 200:
        raise Exception("Failed to get token: " + response.text)
    return response.json()["access_token"]

def build_prompt(document_text):
    few_shot_examples = """
Input: The defendant showed remorse and agreed to settle the matter peacefully.
Output: Positive

Input: The claimant alleged multiple breaches of contract and pursued further litigation.
Output: Negative

Input: The court reviewed the documents and reserved judgment for a later date.
Output: Neutral
"""
    return few_shot_examples + f"\nInput: {document_text}\nOutput:"

def analyze_sentiment(prompt, token, project_id):
    url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    body = {
        "input": prompt,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 50
        },
        "model_id": "mistralai/mistral-large",
        "project_id": project_id
    }

    response = requests.post(url, headers=headers, json=body)
    if response.status_code != 200:
        raise Exception(f"API error: {response.text}")

    raw_output = response.json()["results"][0]["generated_text"].strip()
    sentiment = raw_output.split("Output:")[-1].strip()
    return sentiment

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory('static', path)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text', '').strip()
    print("🔍 Received text:", text)
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    try:
        token = get_iam_token(API_KEY)
        prompt = build_prompt(text)
        print("📦 Prompt sent:", prompt)
        sentiment = analyze_sentiment(prompt, token, PROJECT_ID)
        print("✅ Sentiment predicted:", sentiment)
        return jsonify({'sentiment': sentiment})
    except Exception as e:
        print("❌ Error:", str(e))
        return jsonify({'error': str(e)}), 500
if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Bind to 0.0.0.0 so it's accessible externally
    app.run(host='0.0.0.0', port=port, debug=False)
