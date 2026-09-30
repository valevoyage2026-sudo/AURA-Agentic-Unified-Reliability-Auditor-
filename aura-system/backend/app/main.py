import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_v1_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AURA - Agentic Unified Reliability Auditor",
    version="0.1.0",
    description="AURA System API Backend for Hallucination & Reliability Verification"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "AURA Agentic Unified Reliability Auditor",
        "version": "0.1.0",
        "documentation": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Sanitized global exception handler to prevent leaking raw tracebacks or DB credentials (AGENTS.md §10.2).
    """
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "status": "error"
        }
    )
