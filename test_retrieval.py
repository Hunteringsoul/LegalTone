from rag.retriever import retrieve_context

query = "indemnity clause"

result = retrieve_context(query)

print(result["context"])
print(result["sources"])
