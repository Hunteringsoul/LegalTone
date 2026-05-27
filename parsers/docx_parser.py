from docx import Document

def parse_docx(file_path):
    doc = Document(file_path)

    text = "\n".join(
        [para.text for para in doc.paragraphs]
    )

    return text