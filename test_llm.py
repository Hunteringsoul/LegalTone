from models.llm_manager import generate

response = generate(
    "Explain what an indemnity clause means."
)

print(response)