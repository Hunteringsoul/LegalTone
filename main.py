from fastapi import FastAPI
from api.upload import router as upload_router
from api.analyze import router as analyze_router
from api.chat import router as chat_router
from api.ask import router as ask_router
from api.agents import router as agents_router
from fastapi.middleware.cors import CORSMiddleware
from api.stream_chat import router as stream_router

app = FastAPI(title="LegalTone AI")

app.include_router(stream_router)
app.include_router(ask_router)
app.include_router(agents_router)
app.include_router(upload_router)
app.include_router(analyze_router)
app.include_router(chat_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "LegalTone AI Backend Running"}