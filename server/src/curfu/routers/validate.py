"""Provide validation endpoint to confirm correctness of fusion object structure."""

from fastapi import APIRouter, Body, Request
from fusor.exceptions import FUSORParametersException

from curfu.schemas import ResponseDict, RouteTag, ValidateFusionResponse

router = APIRouter()


@router.post(
    "/api/validate",
    operation_id="validateFusion",
    response_model=ValidateFusionResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.VALIDATORS],
)
def validate_fusion(request: Request, fusion: dict = Body()) -> ResponseDict:
    """Validate proposed Fusion object. Return warnings if invalid.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access FUSOR.
    :param proposed_fusion: the POSTed object generated by the client. This should
        probably include an explicit `fusion_type` property.
    :return: Dict served as JSON with validated Fusion object if correct, and empty
        Object + a list of Warnings if not.
    """
    fusor = request.app.state.fusor
    response = {}
    try:
        verified_fusion = fusor.fusion(**fusion)
    except FUSORParametersException as e:
        response["warnings"] = [str(e)]
    else:
        response["fusion"] = verified_fusion
    return response
