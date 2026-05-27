from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio

from rag.retriever import retrieve_context
from agents.orchestrator import run_agents_stream

router = APIRouter()


class StreamChatRequest(BaseModel):
    query: str


async def generate_stream(query: str):
    retrieval = retrieve_context(query)
    context = retrieval["context"]
    sources = retrieval["sources"]

    for result in run_agents_stream(query, context):
        if result.get("type") == "status":
            payload = result
        else:
            payload = {
                "agent": result["agent"],
                "content": result["content"],
                "sources": sources,
            }
        yield json.dumps(payload) + "\n"
        await asyncio.sleep(0.01)


@router.post("/stream_chat")
async def stream_chat(data: StreamChatRequest):
    return StreamingResponse(
        generate_stream(data.query),
        media_type="application/x-ndjson",
    )
