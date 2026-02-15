"""
Unit tests for CSL (Currency & Surface Localization) model validation.
Feature: ANCLORA-CSL-001
"""

import pytest
from decimal import Decimal
from pydantic import ValidationError
from backend.models.prospection import PropertyCreate, PropertyUpdate

def test_property_create_valid_surfaces():
    """Correct surface areas should be accepted."""
    prop = PropertyCreate(
        source="idealista",
        useful_area_m2=Decimal("80.5"),
        built_area_m2=Decimal("100.0"),
        plot_area_m2=Decimal("500.0")
    )
    assert prop.useful_area_m2 == Decimal("80.5")
    assert prop.built_area_m2 == Decimal("100.0")
    assert prop.plot_area_m2 == Decimal("500.0")

def test_property_create_useful_gt_built_rejected():
    """useful_area_m2 > built_area_m2 must be rejected."""
    with pytest.raises(ValidationError, match="useful_area_m2 .* must be <= built_area_m2"):
        PropertyCreate(
            source="idealista",
            useful_area_m2=Decimal("120.0"),
            built_area_m2=Decimal("100.0")
        )

def test_property_create_negative_area_rejected():
    """Negative areas must be rejected."""
    with pytest.raises(ValidationError):
        PropertyCreate(source="idealista", useful_area_m2=Decimal("-1"))
    with pytest.raises(ValidationError):
        PropertyCreate(source="idealista", built_area_m2=Decimal("-1"))
    with pytest.raises(ValidationError):
        PropertyCreate(source="idealista", plot_area_m2=Decimal("-1"))

def test_property_update_validation():
    """PropertyUpdate should also enforce surface logical check."""
    # Valid
    update = PropertyUpdate(useful_area_m2=Decimal("50"), built_area_m2=Decimal("60"))
    assert update.useful_area_m2 == Decimal("50")
    
    # Invalid
    with pytest.raises(ValidationError, match="useful_area_m2"):
        PropertyUpdate(useful_area_m2=Decimal("70"), built_area_m2=Decimal("60"))

def test_property_create_built_only():
    """Can have built area without useful area."""
    prop = PropertyCreate(source="idealista", built_area_m2=Decimal("100"))
    assert prop.built_area_m2 == Decimal("100")
    assert prop.useful_area_m2 is None

def test_property_create_useful_only():
    """Can have useful area without built area (logical check only applies if both exist)."""
    # Wait, the spec says "when both exist". Let's check my implementation.
    # self.useful_area_m2 is not None and self.built_area_m2 is not None
    prop = PropertyCreate(source="idealista", useful_area_m2=Decimal("100"))
    assert prop.useful_area_m2 == Decimal("100")
    assert prop.built_area_m2 is None
