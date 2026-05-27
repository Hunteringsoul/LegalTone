from fastapi import APIRouter
from pydantic import BaseModel

from rag.retriever import retrieve_context
from models.llm_manager import generate

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/analyze")
async def analyze_document(request: QueryRequest):
    retrieval = retrieve_context(request.query)
    context = retrieval["context"]

    prompt = f"""
You are an advanced legal AI assistant.

Analyze the following legal document context.

Tasks:
1. Detect legal tone
2. Detect risks
3. Identify important clauses
4. Summarize clearly

Return structured JSON.

DOCUMENT:
{context}

USER QUERY:
{request.query}
"""

    response = generate(prompt)

    return {
        "response": response,
        "retrieved_context": context,
        "sources": retrieval["sources"],
    }
