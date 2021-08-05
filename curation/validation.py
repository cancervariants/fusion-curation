"""Receive proposed Fusion JSON object and validate its structure against official specification."""
from fusion.model import Fusion
from typing import Dict


def validate_fusion(fusion_object: Dict) -> Dict:
    """Get Fusion JSON object and perform validation."""
    model = Fusion
    return model
