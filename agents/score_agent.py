from models.llm_manager import generate


def score_agreement(query, context):

    prompt = f"""
    User Question:
    {query}

    You are a legal document scoring expert. Evaluate this agreement and assign
    an AI Legal Score from 0-100 (higher = more favorable / lower risk for a
    typical business reader reviewing the contract).

    Return STRICT JSON ONLY (no markdown, no extra text).

    {{
      "overall_score": 72,
      "grade": "B+",
      "label": "Moderate — review key clauses",
      "summary": "One sentence explaining the score",
      "dimensions": {{
        "risk_exposure": {{
          "score": 65,
          "note": "Brief note on liability, indemnity, termination risk"
        }},
        "fairness_balance": {{
          "score": 78,
          "note": "Brief note on party balance and one-sided terms"
        }},
        "clause_completeness": {{
          "score": 70,
          "note": "Brief note on missing or weak clauses"
        }},
        "clarity_enforceability": {{
          "score": 75,
          "note": "Brief note on drafting clarity and enforceability"
        }}
      }},
      "highlights": [
        "positive aspect of the agreement"
      ],
      "concerns": [
        "main concern lowering the score"
      ]
    }}

    Scoring guide:
    - 85-100: A range — strong, balanced, low concern
    - 70-84: B range — acceptable with minor review items
    - 55-69: C range — moderate risk, negotiate key terms
    - 40-54: D range — significant concerns
    - 0-39: F range — high risk, seek legal counsel

    Agreement Context:
    {context}
    """

    return generate(prompt)
