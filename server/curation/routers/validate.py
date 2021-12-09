"""Provide route for fusion object validation endpoint"""
from typing import Dict

from fastapi import APIRouter

from curation.schemas import FusionValidationResponse
from curation.validation_services import validate_fusion

router = APIRouter()


@router.post(
    "/validate",
    operation_id="validateFusion",
    response_model=FusionValidationResponse,
    response_model_exclude_none=True,
)
def validate_object(proposed_fusion: Dict) -> Dict:
    """Validate constructed Fusion object. Return warnings if invalid.
    No arguments supplied, but receives a POSTed JSON payload via Flask request context.
    :return: Dict served as JSON with validated Fusion object if correct, and empty
        Object + a list of Warnings if not.
    """
    return validate_fusion(proposed_fusion)
