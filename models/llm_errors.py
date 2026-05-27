import re

from groq import RateLimitError, AuthenticationError, APIStatusError


def format_llm_error(exc: Exception) -> str:
    """Turn provider exceptions into short, user-safe messages."""

    if isinstance(exc, RateLimitError):
        retry = _extract_retry_hint(str(exc))
        if retry:
            return (
                "Groq rate limit reached — you've used today's token quota for this model. "
                f"Try again in about {retry}, or switch to a smaller model in your .env."
            )
        return (
            "Groq rate limit reached — you've used today's token quota for this model. "
            "Wait a few minutes and try again, or upgrade your Groq plan."
        )

    if isinstance(exc, AuthenticationError):
        return "Groq API key is invalid or missing. Check GROQ_API_KEY in your .env file."

    if isinstance(exc, APIStatusError):
        if exc.status_code == 429:
            return format_llm_error(RateLimitError(str(exc), response=exc.response, body=exc.body))
        return f"Groq API error ({exc.status_code}). Please try again shortly."

    if isinstance(exc, RuntimeError):
        return str(exc)

    message = str(exc).strip()
    if len(message) > 280:
        message = message[:277] + "..."
    return message or "Something went wrong while generating a response."


def _extract_retry_hint(text: str) -> str | None:
    match = re.search(r"try again in ([^.]+)", text, re.IGNORECASE)
    if not match:
        return None
    return match.group(1).strip()
