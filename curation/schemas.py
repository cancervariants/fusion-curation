"""Provide schemas for FastAPI responses."""
from pydantic import BaseModel, StrictStr, StrictInt, validator, Extra
from typing import List, Optional
from ga4gh.vrsatile.pydantic.vrsatile_model import CURIE
from fusor.model import Fusion


class NormalizeGeneResponse(BaseModel):
    """Response model for gene normalization endpoint."""

    term: StrictStr
    concept_id: Optional[CURIE]
    warnings: List

    class Config:
        """Configure class."""

        extra = Extra.forbid


class CompleteGeneResponse(BaseModel):
    """Response model for gene autocomplete suggestions endpoint."""

    term: StrictStr
    suggestions: Optional[List[StrictStr]]
    warnings: Optional[List[StrictStr]]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class DomainIDResponse(BaseModel):
    """Response model for domain ID retrieval endpoint."""

    domain: StrictStr
    domain_id: Optional[CURIE]
    warnings: List

    class Config:
        """Configure class."""

        extra = Extra.forbid


class ExonCoordsRequest(BaseModel):
    """Request model for genomic coordinates retrieval"""

    tx_ac: StrictStr
    gene: Optional[StrictStr] = ''
    exon_start: Optional[StrictInt] = 0
    exon_start_offset: Optional[StrictInt] = 0
    exon_end: Optional[StrictInt] = 0
    exon_end_offset: Optional[StrictInt] = 0

    @validator('gene')
    def validate_gene(cls, v) -> str:
        """Replace None with empty string."""
        if v is None:
            return ''
        return v

    @validator('exon_start', 'exon_start_offset', 'exon_end', 'exon_end_offset')
    def validate_number(cls, v) -> int:
        """Replace None with 0 for numeric fields."""
        if v is None:
            return 0
        return v


class ExonCoordsResponse(BaseModel):
    """Response model for genomic coordinates retrieval"""

    tx_ac: Optional[StrictStr]
    gene: Optional[StrictStr]
    gene_id: Optional[StrictStr]
    exon_start: Optional[StrictInt]
    exon_start_offset: Optional[StrictInt]
    exon_end: Optional[StrictInt]
    exon_end_offset: Optional[StrictInt]
    sequence_id: Optional[CURIE]
    chr: Optional[StrictStr]
    start: Optional[StrictInt]
    end: Optional[StrictInt]
    warnings: List

    class Config:
        """Configure class."""

        extra = Extra.forbid


class SequenceIDResponse(BaseModel):
    """Response model for sequence ID retrieval endpoint."""

    sequence: StrictStr
    sequence_id: StrictStr = ''
    warnings: List

    class Config:
        """Configure class."""

        extra = Extra.forbid


class FusionValidationResponse(BaseModel):
    """Response model for fusion validation endpoint."""

    fusion: Optional[Fusion]
    warnings: List

    class Config:
        """Configure class."""

        extra = Extra.forbid
