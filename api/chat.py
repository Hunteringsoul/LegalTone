from fastapi import APIRouter
from pydantic import BaseModel

from rag.retriever import retrieve_context
from agents.orchestrator import run_agents

from memory.chat_memory import (
    add_message,
    get_history
)

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


@router.post("/chat")
def chat(request: ChatRequest):
    query = request.query

    add_message("user", query)

    retrieval = retrieve_context(query)
    context = retrieval["context"]

    result = run_agents(query, context)

    add_message(
        "assistant",
        str(result)
    )

    return {
        "query": query,
        "retrieved_context": context,
        "sources": retrieval["sources"],
        "response": result,
        "chat_history": get_history()
    }
