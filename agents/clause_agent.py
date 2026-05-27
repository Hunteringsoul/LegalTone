from models.llm_manager import generate


def analyze_clauses(query, context):

    prompt = f"""
    User Question:
    {query}

    Identify clauses in the agreement relevant to the question.

    Return STRICT JSON ONLY (no markdown, no extra text).

    {{
      "summary": "2-3 sentence overview of clause coverage",
      "clauses": [
        {{
          "title": "clause name e.g. Governing Law",
          "section": "section number or heading if known",
          "type": "standard | protective | risky | missing",
          "importance": "low | moderate | high",
          "excerpt": "brief quote or paraphrase from the agreement",
          "note": "why this clause matters for the question"
        }}
      ],
      "missing_or_weak": [
        {{
          "title": "clause that is absent or weak",
          "note": "why it matters"
        }}
      ],
      "recommendations": [
        "actionable recommendation"
      ]
    }}

    Agreement Context:
    {context}
    """

    return generate(prompt)
