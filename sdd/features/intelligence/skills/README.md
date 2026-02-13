# Intelligence Skills (SDD v2)

This directory contains the refactored and robust versions of the Anclora Intelligence skills.

## Skills Overview

### 1. Lead Intake (`lead_intake.py`)
- **Purpose**: Processes new real estate leads, provides AI-driven prioritization, and generates luxury-toned response drafts.
- **Input**: `LeadInput` (name, email, phone, property_interest, budget).
- **Output**: `LeadOutput` (ai_summary, ai_priority, priority_score, next_action, copy_email, copy_whatsapp).
- **Models**: GPT-4o-mini (Analysis), Claude 3.5 Sonnet (Copy).

### 2. Weekly Prospection (`prospection_weekly.py`)
- **Purpose**: Matches high-priority leads with available properties and generates a weekly summary.
- **Input**: `ProspectionInput` (priority_min).
- **Output**: `ProspectionOutput` (leads_processed, matches_found, matchings, luxury_summary).
- **Models**: GPT-4o-mini (Matching), Claude 3.5 Sonnet (Summary).

### 3. Weekly Recap (`recap_weekly.py`)
- **Purpose**: Generates a high-level executive recap of all agent activities and KPIs.
- **Input**: `RecapInput` (days).
- **Output**: `RecapOutput` (metrics, luxury_summary, top_action).
- **Models**: Claude 3.5 Sonnet.

## Error Handling & Reliability

- **Validation**: All inputs and outputs are validated using **Pydantic v2** models.
- **Retry Logic**: LLM calls are wrapped in a retry wrapper with 3 attempts and exponential backoff.
- **Logging**: All events use structured JSON logging sent to stdout, easily parsable by observability tools.
- **Graceful Degradation**: Skills are designed to return safe defaults or useful partial results if a non-critical step (like parsing an optional LLM field) fails.

## Implementation Details

- **Location**: `sdd/features/intelligence/skills/`
- **Version**: 1.0.0
- **Style**: Google-style docstrings, 100% type hints.
