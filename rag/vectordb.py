import chromadb
import uuid

client = chromadb.PersistentClient(
    path="storage/chroma_db"
)

collection = client.get_or_create_collection(
    name="legal_documents"
)


def clear_collection():
    """Remove all indexed chunks (e.g. before a new upload)."""
    if collection.count() == 0:
        return
    existing = collection.get()
    if existing["ids"]:
        collection.delete(ids=existing["ids"])


def store_chunks(chunk_records, embeddings, source_name="Unknown"):
    """
    chunk_records: list of {"text": str, "page": int}
    """
    ids = [str(uuid.uuid4()) for _ in chunk_records]
    documents = [r["text"] for r in chunk_records]
    metadatas = [
        {
            "source": source_name,
            "chunk": i,
            "page": int(r["page"]),
        }
        for i, r in enumerate(chunk_records)
    ]

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
    )
