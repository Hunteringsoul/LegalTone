from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_document(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " "],
    )
    return splitter.split_text(text)


def chunk_document_with_pages(pages):
    """
    pages: list of {"page_number": int, "text": str}
    Returns list of {"text": str, "page": int}
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " "],
    )

    records = []
    for page in pages:
        page_num = page["page_number"]
        for chunk in splitter.split_text(page["text"]):
            if chunk.strip():
                records.append({"text": chunk, "page": page_num})

    return records


def chunk_plain_text(text, default_page=1):
    """For docx/txt — single virtual page."""
    return [
        {"text": chunk, "page": default_page}
        for chunk in chunk_document(text)
    ]
