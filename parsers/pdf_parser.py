import fitz


def parse_pdf(file_path):
    """Flat text (legacy). Prefer parse_pdf_pages for page-aware indexing."""
    return "\n".join(p["text"] for p in parse_pdf_pages(file_path))


def parse_pdf_pages(file_path):
    """Extract text per PDF page for accurate page highlighting."""
    doc = fitz.open(file_path)
    pages = []

    for index, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            pages.append({
                "page_number": index + 1,
                "text": text,
            })

    doc.close()
    return pages
