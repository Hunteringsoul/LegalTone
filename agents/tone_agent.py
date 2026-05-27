from models.llm_manager import generate


def analyze_tone(query, context):

    prompt = f"""
    User Question:
    {query}

    Analyze the legal tone of the agreement relevant to the question.

    Return STRICT JSON ONLY (no markdown, no extra text).

    {{
      "overall_tone": "short label e.g. Formal, Aggressive, Neutral",
      "sentiment": "positive | neutral | negative | mixed",
      "scores": {{
        "professionalism": "low | moderate | high",
        "aggressiveness": "low | moderate | high",
        "fairness": "low | moderate | high | balanced"
      }},
      "summary": "2-4 sentence overview of tone and drafting style",
      "observations": [
        "specific observation about wording or tone"
      ],
      "concerns": [
        "tone-related concern for the reader, if any"
      ]
    }}

    Agreement Context:
    {context}
    """

    return generate(prompt)
