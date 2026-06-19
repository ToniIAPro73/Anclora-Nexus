"""Pydantic models for the lead intake API (Phase 3 — Commercial Loop).

Handles lead ingestion from external sources such as Private Estates Landing,
with validation, temperature assignment, and deduplication support.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


class ContactInfo(BaseModel):
    """Contact information for an incoming lead."""

    name: str = Field(..., min_length=1, description="Contact full name")
    email: Optional[EmailStr] = Field(None, description="Contact email address")
    phone: Optional[str] = Field(None, description="Contact phone number")

    @model_validator(mode="after")
    def at_least_email_or_phone(self) -> "ContactInfo":
        if not self.email and not self.phone:
            raise ValueError("At least one of email or phone must be provided")
        return self


class LeadIntakeRequest(BaseModel):
    """Request body for POST /api/v1/leads/intake."""

    contact: ContactInfo
    source_system: str = Field(
        ..., min_length=1, description="Source system identifier (e.g. 'private-estates-landing')"
    )
    source_channel: str = Field(
        ..., min_length=1, description="Source channel (e.g. 'form-main', 'whatsapp')"
    )
    timestamp: datetime = Field(..., description="Timestamp of the lead event")
    metadata: Optional[dict] = Field(None, description="Additional metadata from the source")


class LeadIntakeResponse(BaseModel):
    """Response body for POST /api/v1/leads/intake."""

    lead_id: str
    status: Literal["created", "duplicate"]
    temperature: Literal["cold", "warm", "hot"]
