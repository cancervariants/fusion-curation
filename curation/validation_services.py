"""Perform validation of user-provided Fusion objects."""
from fusor.model import Fusion
from typing import Dict
from pydantic import ValidationError


def validate_fusion(fusion: Dict) -> Dict:
    """Validate fusion, returning properly-structured object along with
    any validation warnings.

    TODO
     * first, try Fusion modeling w/ validation errors if extra values ? then
       try without + include extraneous values as warnings?
        -- this would require a new class (eg StrictFusion) with model config value
           `extra='forbid'`, and may not work with subclasses

    :param Dict fusion: incoming Fusion object
    :return: Dict containing Fusion object adhering to object model, or None +
        warnings if validation errors are raised
    """
    response = {
        'warnings': []
    }
    try:
        response['fusion'] = Fusion(**fusion).dict()
        response['warnings'] = []
    except ValidationError as e:
        response['warnings'].append(e.errors())
        response['fusion'] = {}
    return response
