"""Provide validation endpoint to confirm correctness of fusion object structure."""

from typing import Annotated

from fastapi import APIRouter, Body, Request
from fusor.exceptions import FUSORParametersException

from fusion_builder.schemas import ResponseDict, RouteTag, ValidateFusionResponse

router = APIRouter()


@router.post(
    "/api/validate",
    operation_id="validateFusion",
    response_model=ValidateFusionResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.VALIDATORS],
)
def validate_fusion(request: Request, fusion: Annotated[dict, Body()]) -> ResponseDict:
    """Validate proposed Fusion object. Return warnings if invalid."""
    fusor = request.app.state.fusor
    response = {}
    try:
        verified_fusion = fusor.fusion(**fusion)
    except FUSORParametersException as e:
        response["warnings"] = str(e).split("\n")
    else:
        response["fusion"] = verified_fusion
    return response
