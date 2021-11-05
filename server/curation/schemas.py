"""Provide schemas for FastAPI responses."""
from typing import List, Optional, Tuple, Union, Literal, Dict
from abc import ABC

from pydantic import BaseModel, StrictStr, StrictInt, validator, Extra
from ga4gh.vrsatile.pydantic.vrsatile_model import CURIE
from fusor.models import Fusion, TranscriptSegmentComponent, LinkerComponent, \
    TemplatedSequenceComponent, GeneComponent, UnknownGeneComponent, \
    AnyGeneComponent, RegulatoryElement, CriticalDomain


ResponseWarnings = Optional[List[StrictStr]]


class ClientComponent(BaseModel, ABC):
    """Abstract class to provide identification properties used by client."""

    component_id: StrictStr
    component_name: StrictStr
    hr_name: StrictStr
    shorthand: Optional[StrictStr]


class ClientTranscriptSegmentComponent(TranscriptSegmentComponent, ClientComponent):
    """TranscriptSegment component class used client-side."""

    input_type: Union[Literal["genomic_coords_gene"],
                      Literal["genomic_coords_tx"],
                      Literal["exon_coords_tx"]]


class ClientLinkerComponent(LinkerComponent, ClientComponent):
    """Linker component class used client-side."""

    pass


class ClientTemplatedSequenceComponent(TemplatedSequenceComponent, ClientComponent):
    """Templated sequence component used client-side."""

    pass


class ClientGeneComponent(GeneComponent, ClientComponent):
    """Gene component used client-side."""

    pass


class ClientUnknownGeneComponent(UnknownGeneComponent, ClientComponent):
    """Unknown gene component used client-side."""

    pass


class ClientAnyGeneComponent(AnyGeneComponent, ClientComponent):
    """Any gene component used client-side."""

    pass


class ClientRegulatoryElement(RegulatoryElement):
    """Regulatory element object used client-side."""

    element_id: str

    class Config:
        """Configure class."""

        extra = Extra.forbid


class ClientCriticalDomain(CriticalDomain):
    """Define critical domain object used client-side."""

    domain_id: str

    class Config:
        """Configure class."""

        extra = Extra.forbid


class Response(BaseModel, ABC):
    """Abstract Response class for defining API response structures."""

    warnings: ResponseWarnings


class GeneComponentResponse(Response):
    """Response model for gene component construction endoint."""

    component: Optional[GeneComponent]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class TxSegmentComponentResponse(Response):
    """Response model for transcript segment component construction endpoint."""

    component: Optional[TranscriptSegmentComponent]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class TemplatedSequenceComponentResponse(Response):
    """Response model for transcript segment component construction endpoint."""

    component: Optional[TemplatedSequenceComponent]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class NormalizeGeneResponse(Response):
    """Response model for gene normalization endpoint."""

    term: StrictStr
    concept_id: Optional[CURIE]
    symbol: Optional[StrictStr]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class SuggestGeneResponse(Response):
    """Response model for gene autocomplete suggestions endpoint."""

    term: StrictStr
    # complete term, normalized ID, normalized label, item type
    suggestions: Optional[List[Tuple[str, str, str, str]]]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class AssociatedDomainResponse(Response):
    """Response model for domain ID autocomplete suggestion endpoint."""

    gene_id: StrictStr
    suggestions: Optional[List[Tuple[str, str]]]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class ExonCoordsRequest(BaseModel):
    """Request model for genomic coordinates retrieval"""

    tx_ac: StrictStr
    gene: Optional[StrictStr] = ""
    exon_start: Optional[StrictInt] = 0
    exon_start_offset: Optional[StrictInt] = 0
    exon_end: Optional[StrictInt] = 0
    exon_end_offset: Optional[StrictInt] = 0

    @validator("gene")
    def validate_gene(cls, v) -> str:
        """Replace None with empty string."""
        if v is None:
            return ""
        return v

    @validator("exon_start", "exon_start_offset", "exon_end", "exon_end_offset")
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
    warnings: ResponseWarnings

    class Config:
        """Configure class."""

        extra = Extra.forbid


class SequenceIDResponse(Response):
    """Response model for sequence ID retrieval endpoint."""

    sequence: StrictStr
    sequence_id: StrictStr = ""

    class Config:
        """Configure class."""

        extra = Extra.forbid


class FusionValidationResponse(Response):
    """Response model for fusion validation endpoint."""

    fusion: Optional[Fusion]
    warnings: Optional[List[Dict]]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class GetTranscriptsResponse(Response):
    """Response model for MANE transcript retrieval endpoint."""

    transcripts: Optional[List[Dict[StrictStr, Union[StrictStr, StrictInt]]]]

    class Config:
        """Configure class."""

        extra = Extra.forbid


class ServiceInfoResponse(Response):
    """Response model for service_info endpoint."""

    version: StrictStr

    class Config:
        """Configure class."""

        extra = Extra.forbid


class ClientFusion(Fusion):
    """Fusion with client-oriented structural component models. Used in global
    FusionContext.
    """

    structural_components: List[Union[ClientTranscriptSegmentComponent,
                                      ClientGeneComponent,
                                      ClientAnyGeneComponent,
                                      ClientUnknownGeneComponent,
                                      ClientTemplatedSequenceComponent,
                                      ClientLinkerComponent]]
    regulatory_elements: List[ClientRegulatoryElement]
    protein_domains: List[ClientCriticalDomain]
