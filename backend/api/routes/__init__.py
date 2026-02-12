"""
Anclora Intelligence API Routes Module
"""

from fastapi import APIRouter
from .intelligence import router as intelligence_router

router = APIRouter()
router.include_router(intelligence_router, prefix="/intelligence", tags=["Intelligence"])

__all__ = ["router"]
