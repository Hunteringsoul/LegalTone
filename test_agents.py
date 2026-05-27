from agents.orchestrator import run_agents

query = "What are the risks in this contract?"

result = run_agents(query)

print(result)