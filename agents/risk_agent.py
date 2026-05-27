from models.llm_manager import generate

def analyze_risk(query, context):

    prompt = f"""
    User Question:
    {query}

    Analyze ONLY relevant legal risks.

    Return STRICT JSON ONLY.

    {{
      "risk_level": "...",
      "answer": "...",
      "key_risks": [
        "...",
        "..."
      ]
    }}

    Agreement Context:
    {context}
    """

    return generate(prompt)