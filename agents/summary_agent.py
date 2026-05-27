from models.llm_manager import generate


def summarize(query, context):

    prompt = f"""
    User Question:
    {query}

    You are a legal AI assistant. Write an executive summary of this agreement.

    Return STRICT JSON ONLY (no markdown, no extra text).

    {{
      "agreement_type": "e.g. Service Agreement, NDA, Employment Contract",
      "parties": ["Party A name", "Party B name"],
      "executive_summary": "2-4 sentences in plain text describing the agreement, parties, purpose, and main obligations. MUST be a string, NOT an object.",
      "key_points": [
        "Important bullet about scope, payment, term, or risk"
      ]
    }}

    Rules:
    - executive_summary must be a single plain-text string paragraph
    - Do NOT nest other fields inside executive_summary
    - Do NOT include legal_score or recommendations here (handled by other agents)
    - key_points: 3-5 concise bullets specific to this document

    Agreement Context:
    {context}
    """

    return generate(prompt)
