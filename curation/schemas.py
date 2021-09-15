"""Provide schemas for FastAPI responses."""
from pydantic import BaseModel, StrictStr
from typing import List, Optional
from ga4gh.vrsatile.pydantic.vrsatile_model import CURIE


class NormalizeGeneResponse(BaseModel):

    term: StrictStr
    concept_id: Optional[CURIE]
    warnings: List


