from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag.retriever import retrieve_context
from models.llm_manager import generate

router = APIRouter()


class AskRequest(BaseModel):
    query: str


@router.post("/ask")
def ask(request: AskRequest):
    """Simple Q&A chat — one answer, no multi-agent cards."""
    query = request.query

    retrieval = retrieve_context(query)
    context = retrieval["context"]

    prompt = f"""
You are LegalTone AI, a legal document assistant.

Answer the user's question using ONLY the agreement context below.
Be clear, concise, and professional. Use plain text (not JSON).

User question:
{query}

Agreement context:
{context}
"""

    try:
        answer = generate(prompt)
    except RuntimeError as exc:
        message = str(exc)
        status = 429 if "rate limit" in message.lower() else 502
        raise HTTPException(status_code=status, detail=message) from exc

    return {
        "query": query,
        "answer": answer,
        "sources": retrieval["sources"],
    }
