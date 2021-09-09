"""Perform validation of user-provided Fusion objects."""
from fusor.model import Fusion
from typing import Dict
from pydantic import ValidationError


def validate_fusion(fusion: Dict) -> Dict:
    """Validate fusion, returning properly-structured object along with
    any validation warnings.

    :param Dict fusion: incoming Fusion object
    :return: Dict containing Fusion object adhering to object model, or None +
        warnings if validation errors are raised
    """
    response = {
        'warnings': []
    }
    try:
        response['fusion'] = Fusion(**fusion).dict(exclude_none=True)
        response['warnings'] = []
    except ValidationError as e:
        response['warnings'].append(e.errors())
        response['fusion'] = {}
    return response
