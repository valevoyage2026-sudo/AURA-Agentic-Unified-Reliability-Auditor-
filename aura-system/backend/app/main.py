from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AURA - Agentic Unified Reliability Auditor",
    version="0.1.0",
    description="AURA System API Backend"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "system": "AURA Agentic Unified Reliability Auditor"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
