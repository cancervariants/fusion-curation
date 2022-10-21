"""Provide schemas for FastAPI responses."""
from typing import List, Optional, Tuple, Union, Literal, Dict

from pydantic import BaseModel, StrictStr, StrictInt, validator, Extra
from ga4gh.vrsatile.pydantic.vrsatile_models import CURIE
from fusor.models import (
    AssayedFusion,
    CategoricalFusion,
    Fusion,
    TranscriptSegmentElement,
    LinkerElement,
    TemplatedSequenceElement,
    GeneElement,
    UnknownGeneElement,
    MultiplePossibleGenesElement,
    RegulatoryElement,
    FunctionalDomain,
    Strand,
)
from uta_tools.schemas import GenomicData


ResponseWarnings = Optional[List[StrictStr]]

ResponseDict = Dict[
    str, Union[str, CURIE, List[str], List[Tuple[str, str, str, str]], FunctionalDomain]
]
Warnings = List[str]


class ClientStructuralElement(BaseModel):
    """Abstract class to provide identification properties used by client."""

    element_id: StrictStr
    nomenclature: StrictStr


class ClientTranscriptSegmentElement(TranscriptSegmentElement, ClientStructuralElement):
    """TranscriptSegment element class used client-side."""

    input_type: Union[
        Literal["genomic_coords_gene"],
        Literal["genomic_coords_tx"],
        Literal["exon_coords_tx"],
    ]
    input_tx: Optional[str]
    input_strand: Optional[Strand]
    input_gene: Optional[str]
    input_chr: Optional[str]
    input_genomic_start: Optional[str]
    input_genomic_end: Optional[str]
    input_exon_start: Optional[str]
    input_exon_start_offset: Optional[str]
    input_exon_end: Optional[str]
    input_exon_end_offset: Optional[str]


class ClientLinkerElement(LinkerElement, ClientStructuralElement):
    """Linker element class used client-side."""

    pass


class ClientTemplatedSequenceElement(TemplatedSequenceElement, ClientStructuralElement):
    """Templated sequence element used client-side."""

    input_chromosome: Optional[str]
    input_start: Optional[str]
    input_end: Optional[str]


class ClientGeneElement(GeneElement, ClientStructuralElement):
    """Gene element used client-side."""

    pass


class ClientUnknownGeneElement(UnknownGeneElement, ClientStructuralElement):
    """Unknown gene element used client-side."""

    pass


class ClientMultiplePossibleGenesElement(
    MultiplePossibleGenesElement, ClientStructuralElement
):
    """Multiple possible gene element used client-side."""

    pass


class ClientFunctionalDomain(FunctionalDomain):
    """Define functional domain object used client-side."""

    domain_id: str

    class Config:
        """Configure class."""

        extra = Extra.forbid


class ClientRegulatoryElement(RegulatoryElement):
    """Define regulatory element object used client-side."""

    display_class: str
    nomenclature: str


class Response(BaseModel):
    """Abstract Response class for defining API response structures."""

    warnings: ResponseWarnings

    class Config:
        """Configure class"""

        extra = Extra.forbid


class GeneElementResponse(Response):
    """Response model for gene element construction endoint."""

    element: Optional[GeneElement]


class TxSegmentElementResponse(Response):
    """Response model for transcript segment element construction endpoint."""

    element: Optional[TranscriptSegmentElement]


class TemplatedSequenceElementResponse(Response):
    """Response model for transcript segment element construction endpoint."""

    element: Optional[TemplatedSequenceElement]


class NormalizeGeneResponse(Response):
    """Response model for gene normalization endpoint."""

    term: StrictStr
    concept_id: Optional[CURIE]
    symbol: Optional[StrictStr]
    cased: Optional[StrictStr]


class SuggestGeneResponse(Response):
    """Response model for gene autocomplete suggestions endpoint."""

    term: StrictStr
    # complete term, normalized ID, normalized label
    symbols: Optional[List[Tuple[str, str, str]]]
    prev_symbols: Optional[List[Tuple[str, str, str]]]
    aliases: Optional[List[Tuple[str, str, str]]]


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


class ValidateFusionResponse(Response):
    """Response model for Fusion validation endpoint."""

    fusion: Optional[Fusion]


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
    refseq_id: Optional[StrictStr]
    ga4gh_id: Optional[StrictStr]
    aliases: Optional[List[StrictStr]]


class GetTranscriptsResponse(Response):
    """Response model for MANE transcript retrieval endpoint."""

    transcripts: Optional[List[Dict[StrictStr, Union[StrictStr, StrictInt]]]]


class ServiceInfoResponse(Response):
    """Response model for service_info endpoint."""

    curfu_version: StrictStr
    fusor_version: StrictStr
    uta_tools_version: StrictStr

    # consider additional tool versions:
    # - UTA (https://github.com/GenomicMedLab/uta-tools/issues/98)
    # - vrs/vrs-python
    # - the gene normalizer


class ClientCategoricalFusion(CategoricalFusion):
    """Categorial fusion with client-oriented structural element models. Used in
    global FusionContext.
    """

    structural_elements: List[
        Union[
            ClientTranscriptSegmentElement,
            ClientGeneElement,
            ClientTemplatedSequenceElement,
            ClientLinkerElement,
            ClientMultiplePossibleGenesElement,
        ]
    ]
    critical_functional_domains: Optional[List[ClientFunctionalDomain]]


class ClientAssayedFusion(AssayedFusion):
    """Assayed fusion with client-oriented structural element models. Used in
    global FusionContext.
    """

    structural_elements: List[
        Union[
            ClientTranscriptSegmentElement,
            ClientGeneElement,
            ClientTemplatedSequenceElement,
            ClientLinkerElement,
            ClientUnknownGeneElement,
        ]
    ]


class NomenclatureResponse(Response):
    """Response model for regulatory element nomenclature endpoint."""

    nomenclature: Optional[str]


class RegulatoryElementResponse(Response):
    """Response model for regulatory element constructor."""

    regulatory_element: RegulatoryElement


class DemoResponse(Response):
    """Response model for demo fusion object retrieval endpoints."""

    fusion: Union[ClientAssayedFusion, ClientCategoricalFusion]
