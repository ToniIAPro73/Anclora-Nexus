"""
Anclora Intelligence API Routes Module
"""

from fastapi import APIRouter
from .intelligence import router as intelligence_router
from .prospection import router as prospection_router
from .public import router as public_router

router = APIRouter()
router.include_router(intelligence_router, prefix="/intelligence", tags=["Intelligence"])
router.include_router(prospection_router, prefix="/prospection", tags=["Prospection"])
router.include_router(public_router, prefix="/public", tags=["Public"])

__all__ = ["router"]
