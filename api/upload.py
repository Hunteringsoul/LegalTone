from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import uuid
import shutil
import os

from parsers.pdf_parser import parse_pdf_pages
from parsers.docx_parser import parse_docx
from parsers.txt_parser import parse_txt

from rag.chunker import chunk_document_with_pages, chunk_plain_text
from rag.embedder import generate_embeddings
from rag.vectordb import clear_collection, store_chunks

router = APIRouter()

UPLOAD_DIR = "storage/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    stored_name = f"{file_id}_{file.filename}"

    file_path = os.path.join(UPLOAD_DIR, stored_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    filename_lower = file.filename.lower()

    if filename_lower.endswith(".pdf"):
        pages = parse_pdf_pages(file_path)
        chunk_records = chunk_document_with_pages(pages)
    elif filename_lower.endswith(".docx"):
        text = parse_docx(file_path)
        chunk_records = chunk_plain_text(text)
    elif filename_lower.endswith(".txt"):
        text = parse_txt(file_path)
        chunk_records = chunk_plain_text(text)
    else:
        return {"error": "Unsupported file format"}

    if not chunk_records:
        return {"error": "No text could be extracted from the document"}

    texts = [r["text"] for r in chunk_records]
    embeddings = generate_embeddings(texts)

    clear_collection()
    store_chunks(chunk_records, embeddings, source_name=file.filename)

    return {
        "message": "Document uploaded successfully",
        "file_name": file.filename,
        "stored_name": stored_name,
        "file_url": f"/files/{stored_name}",
        "is_pdf": filename_lower.endswith(".pdf"),
        "chunks_stored": len(chunk_records),
    }


@router.api_route("/files/{stored_name}", methods=["GET", "HEAD"])
async def get_uploaded_file(stored_name: str):
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
