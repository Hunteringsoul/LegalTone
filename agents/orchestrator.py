from concurrent.futures import ThreadPoolExecutor, as_completed

from agents.summary_agent import summarize
from agents.tone_agent import analyze_tone
from agents.risk_agent import analyze_risk
from agents.clause_agent import analyze_clauses
from agents.score_agent import score_agreement
from agents.recommendation_agent import recommend_actions

from models.llm_errors import format_llm_error

AGENT_TASKS = {
    "legal_score": score_agreement,
    "recommendations": recommend_actions,
    "summary": summarize,
    "tone_analysis": analyze_tone,
    "risk_analysis": analyze_risk,
    "clause_analysis": analyze_clauses,
}


def run_agents(query, context):
    results = {key: "" for key in AGENT_TASKS}

    with ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(fn, query, context): name
            for name, fn in AGENT_TASKS.items()
        }

        for future in as_completed(futures):
            name = futures[future]
            try:
                results[name] = future.result()
            except Exception as e:
                results[name] = f"Error: {format_llm_error(e)}"

    return results


def run_agents_stream(query, context):
    for name in AGENT_TASKS:
        yield {"type": "status", "agent": name, "status": "running"}

    with ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(fn, query, context): name
            for name, fn in AGENT_TASKS.items()
        }

        for future in as_completed(futures):
            agent_name = futures[future]
            try:
                content = future.result()
                is_error = isinstance(content, str) and content.startswith("Error:")
                status = "error" if is_error else "done"
            except Exception as e:
                content = f"Error: {format_llm_error(e)}"
                status = "error"

            yield {"type": "status", "agent": agent_name, "status": status}
            yield {"agent": agent_name, "content": content}
