"""Perform validation of user-provided Fusion objects."""
from typing import Dict, Any

from pydantic import ValidationError
from fusor.models import Fusion


def validate_fusion(fusion: Dict) -> Dict[str, Any]:
    """Validate fusion, returning properly-structured object along with
    any validation warnings.

    :param Dict fusion: incoming Fusion object
    :return: Dict containing Fusion object adhering to object model, or None +
        warnings if validation errors are raised
    """
    response: Dict[str, Any] = {
        "warnings": []
    }
    try:
        response["fusion"] = Fusion(**fusion).dict(exclude_none=True)
    except ValidationError as e:
        response["warnings"].append(e.errors())
        response["fusion"] = None
    return response
