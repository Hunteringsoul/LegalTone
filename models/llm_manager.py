import os

from groq import Groq, RateLimitError

from dotenv import load_dotenv

from models.llm_errors import format_llm_error

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_MODEL_FALLBACK = os.getenv("GROQ_MODEL_FALLBACK", "llama-3.1-8b-instant")

client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None


def cloud_generate(prompt: str, *, model: str | None = None) -> str:
    if not client:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to your .env file."
        )

    model = model or GROQ_MODEL

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content
    except RateLimitError:
        if (
            GROQ_MODEL_FALLBACK
            and model != GROQ_MODEL_FALLBACK
        ):
            return cloud_generate(prompt, model=GROQ_MODEL_FALLBACK)
        raise


def generate(prompt: str) -> str:
    try:
        return cloud_generate(prompt)
    except Exception as exc:
        raise RuntimeError(format_llm_error(exc)) from exc
