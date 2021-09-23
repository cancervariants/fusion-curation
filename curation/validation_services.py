"""Perform validation of user-provided Fusion objects."""
from fusor.model import Fusion
from typing import Dict, Any
from pydantic import ValidationError


def validate_fusion(fusion: Dict) -> Dict[str, Any]:
    """Validate fusion, returning properly-structured object along with
    any validation warnings.

    :param Dict fusion: incoming Fusion object
    :return: Dict containing Fusion object adhering to object model, or None +
        warnings if validation errors are raised
    """
    response: Dict[str, Any] = {
        'warnings': []
    }
    try:
        response['fusion'] = Fusion(**fusion).dict(exclude_none=True)
        response['warnings'] = []
    except ValidationError as e:
        response['warnings'].append(e.errors())
        response['fusion'] = None
    return response
