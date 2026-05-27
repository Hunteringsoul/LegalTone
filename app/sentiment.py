from flask import request, jsonify
import requests

def get_iam_token(api_key, url):
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {
        'apikey': api_key,
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey'
    }
    response = requests.post(url, headers=headers, data=data)
    response.raise_for_status()
    return response.json()['access_token']

def build_prompt(document_text):
    return f"Analyze the following legal document for tone and sentiment:\n\n{document_text}"

def call_watson_api(api_url, token, prompt):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    data = {
        'input': prompt
    }
    response = requests.post(api_url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

def analyze_document(api_key, api_url, iam_url, document_text):
    token = get_iam_token(api_key, iam_url)
    prompt = build_prompt(document_text)
    analysis_result = call_watson_api(api_url, token, prompt)
    return analysis_result