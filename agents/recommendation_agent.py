from models.llm_manager import generate


def recommend_actions(query, context):

    prompt = f"""
    User Question:
    {query}

    You are a legal advisor AI. Based on this agreement, provide practical,
    actionable recommendations for someone reviewing or signing the contract.

    Return STRICT JSON ONLY (no markdown, no extra text).

    {{
      "verdict": "proceed | proceed_with_changes | negotiate | review_with_counsel | do_not_sign",
      "summary": "2-3 sentence overall recommendation",
      "actions": [
        {{
          "priority": "high | medium | low",
          "title": "Short action title",
          "reason": "Why this action is recommended",
          "clause_ref": "Section or clause name if applicable"
        }}
      ],
      "negotiation_points": [
        "Specific term to negotiate or redline"
      ],
      "next_steps": [
        "Concrete next step the reader should take"
      ]
    }}

    Guidelines:
    - Give 3-5 prioritized actions (high priority first)
    - Be specific to this agreement, not generic legal advice
    - negotiation_points: concrete clauses or terms to push back on
    - next_steps: practical checklist items (e.g. "Compare indemnity cap to industry standard")

    Agreement Context:
    {context}
    """

    return generate(prompt)
