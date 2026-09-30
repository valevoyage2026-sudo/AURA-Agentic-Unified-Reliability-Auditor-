"""
API v1 Router aggregation.
"""

from fastapi import APIRouter
from app.api.v1.endpoints.verify import router as verify_router

api_v1_router = APIRouter(prefix="/v1")
api_v1_router.include_router(verify_router, tags=["Verification & Audit"])
