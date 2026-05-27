from fastapi import APIRouter

from agents.orchestrator import AGENT_TASKS

router = APIRouter()

AGENT_LABELS = {
    "legal_score": "Score",
    "recommendations": "Recs",
    "summary": "Summary",
    "tone_analysis": "Tone",
    "risk_analysis": "Risk",
    "clause_analysis": "Clause",
}


@router.get("/agents/status")
def get_agents_status():
    return {
        "backend": "online",
        "agents": {
            name: "ready"
            for name in AGENT_TASKS
        },
    }
