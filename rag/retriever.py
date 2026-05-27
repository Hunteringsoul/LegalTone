from rag.vectordb import collection


def _parse_page(meta):
    raw = (meta or {}).get("page", 0)
    try:
        return int(raw)
    except (TypeError, ValueError):
        return 0


def retrieve_context(query):
    if collection.count() == 0:
        return {
            "context": (
                "No document has been uploaded yet. "
                "Ask the user to upload a legal agreement first."
            ),
            "sources": [],
        }

    results = collection.query(
        query_texts=[query],
        n_results=min(4, collection.count()),
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    if not documents:
        return {
            "context": "No relevant document sections were found for this query.",
            "sources": [],
        }

    context = "\n\n".join(documents)

    sources = []
    for doc, meta in zip(documents, metadatas):
        meta = meta or {}
        sources.append({
            "text": doc[:300],
            "source": meta.get("source") or "Unknown",
            "page": _parse_page(meta),
        })

    return {
        "context": context,
        "sources": sources,
    }
