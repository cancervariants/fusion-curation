"""Provide schemas for FastAPI responses."""
from typing import List, Optional, Tuple, Union, Literal, Dict
from abc import ABC

from pydantic import BaseModel, StrictStr, StrictInt, validator, Extra
from ga4gh.vrsatile.pydantic.vrsatile_models import CURIE
from fusor.models import Fusion, TranscriptSegmentComponent, LinkerComponent, \
    TemplatedSequenceComponent, GeneComponent, UnknownGeneComponent, \
    AnyGeneComponent, RegulatoryElement, FunctionalDomain, Strand
from uta_tools.schemas import GenomicData


ResponseWarnings = Optional[List[StrictStr]]

ResponseDict = Dict[
    str, Union[str, CURIE, List[str], List[Tuple[str, str, str, str]], FunctionalDomain]
]
Warnings = List[str]


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
    input_tx: Optional[str]
    input_strand: Optional[Strand]
    input_gene: Optional[str]
    input_chr: Optional[str]
    input_genomic_start: Optional[str]
    input_genomic_end: Optional[str]


class ClientLinkerComponent(LinkerComponent, ClientComponent):
    """Linker component class used client-side."""

    pass


class ClientTemplatedSequenceComponent(TemplatedSequenceComponent, ClientComponent):
    """Templated sequence component used client-side."""

    input_chromosome: Optional[str]
    input_start: Optional[str]
    input_end: Optional[str]


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


class ClientFunctionalDomain(FunctionalDomain):
    """Define functional domain object used client-side."""

    domain_id: str

    class Config:
        """Configure class."""

        extra = Extra.forbid


class Response(BaseModel, ABC):
    """Abstract Response class for defining API response structures."""

    warnings: ResponseWarnings

    class Config:
        """Configure class"""

        extra = Extra.forbid


class GeneComponentResponse(Response):
    """Response model for gene component construction endoint."""

    component: Optional[GeneComponent]


class TxSegmentComponentResponse(Response):
    """Response model for transcript segment component construction endpoint."""

    component: Optional[TranscriptSegmentComponent]


class TemplatedSequenceComponentResponse(Response):
    """Response model for transcript segment component construction endpoint."""

    component: Optional[TemplatedSequenceComponent]


class NormalizeGeneResponse(Response):
    """Response model for gene normalization endpoint."""

    term: StrictStr
    concept_id: Optional[CURIE]
    symbol: Optional[StrictStr]


class SuggestGeneResponse(Response):
    """Response model for gene autocomplete suggestions endpoint."""

    term: StrictStr
    # complete term, normalized ID, normalized label, item type
    suggestions: Optional[List[Tuple[str, str, str, str]]]


class DomainParams(BaseModel):
    """Fields for individual domain suggestion entries"""

    interpro_id: CURIE
    domain_name: StrictStr
    start: int
    end: int
    refseq_ac: StrictStr


class GetDomainResponse(Response):
    """Response model for functional domain constructor endpoint."""

    domain: Optional[FunctionalDomain]


class AssociatedDomainResponse(Response):
    """Response model for domain ID autocomplete suggestion endpoint."""

    gene_id: StrictStr
    suggestions: Optional[List[DomainParams]]


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


class CoordsUtilsResponse(Response):
    """Response model for genomic coordinates retrieval"""

    coordinates_data: Optional[GenomicData]


class SequenceIDResponse(Response):
    """Response model for sequence ID retrieval endpoint."""

    sequence: StrictStr
    sequence_id: StrictStr = ""


class FusionValidationResponse(BaseModel):
    """Response model for fusion validation endpoint."""

    fusion: Optional[Fusion]
    warnings: Optional[List[Dict]]


class GetTranscriptsResponse(Response):
    """Response model for MANE transcript retrieval endpoint."""

    transcripts: Optional[List[Dict[StrictStr, Union[StrictStr, StrictInt]]]]


class ServiceInfoResponse(Response):
    """Response model for service_info endpoint."""

    version: StrictStr


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
    functional_domains: List[ClientFunctionalDomain]
