"""Provide schemas for FastAPI responses."""

from enum import Enum
from typing import Literal

from cool_seq_tool.schemas import GenomicData
from fusor.models import (
    AssayedFusion,
    CategoricalFusion,
    FunctionalDomain,
    Fusion,
    GeneElement,
    LinkerElement,
    MultiplePossibleGenesElement,
    RegulatoryElement,
    Strand,
    TemplatedSequenceElement,
    TranscriptSegmentElement,
    UnknownGeneElement,
)
from ga4gh.vrsatile.pydantic.vrsatile_models import CURIE
from pydantic import BaseModel, Extra, Field, StrictInt, StrictStr, validator

ResponseWarnings = list[StrictStr] | None

ResponseDict = dict[
    str,
    str | int | CURIE | list[str] | list[tuple[str, str, str, str]] | FunctionalDomain,
]
Warnings = list[str]


class ClientStructuralElement(BaseModel):
    """Abstract class to provide identification properties used by client."""

    element_id: StrictStr
    nomenclature: StrictStr


class ClientTranscriptSegmentElement(TranscriptSegmentElement, ClientStructuralElement):
    """TranscriptSegment element class used client-side."""

    input_type: (
        Literal["genomic_coords_gene"]
        | Literal["genomic_coords_tx"]
        | Literal["exon_coords_tx"]
    )
    input_tx: str | None
    input_strand: Strand | None
    input_gene: str | None
    input_chr: str | None
    input_genomic_start: str | None
    input_genomic_end: str | None
    input_exon_start: str | None
    input_exon_start_offset: str | None
    input_exon_end: str | None
    input_exon_end_offset: str | None


class ClientLinkerElement(LinkerElement, ClientStructuralElement):
    """Linker element class used client-side."""


class ClientTemplatedSequenceElement(TemplatedSequenceElement, ClientStructuralElement):
    """Templated sequence element used client-side."""

    input_chromosome: str | None
    input_start: str | None
    input_end: str | None


class ClientGeneElement(GeneElement, ClientStructuralElement):
    """Gene element used client-side."""


class ClientUnknownGeneElement(UnknownGeneElement, ClientStructuralElement):
    """Unknown gene element used client-side."""


class ClientMultiplePossibleGenesElement(
    MultiplePossibleGenesElement, ClientStructuralElement
):
    """Multiple possible gene element used client-side."""


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

    element: GeneElement | None


class TxSegmentElementResponse(Response):
    """Response model for transcript segment element construction endpoint."""

    element: TranscriptSegmentElement | None


class TemplatedSequenceElementResponse(Response):
    """Response model for transcript segment element construction endpoint."""

    element: TemplatedSequenceElement | None


class NormalizeGeneResponse(Response):
    """Response model for gene normalization endpoint."""

    term: StrictStr
    concept_id: CURIE | None
    symbol: StrictStr | None
    cased: StrictStr | None


class SuggestGeneResponse(Response):
    """Response model for gene autocomplete suggestions endpoint."""

    term: StrictStr
    matches_count: int
    # complete term, normalized symbol, normalized concept ID, chromosome ID, strand
    concept_id: list[tuple[str, str, str, str, str]] | None
    symbol: list[tuple[str, str, str, str, str]] | None
    prev_symbols: list[tuple[str, str, str, str, str]] | None
    aliases: list[tuple[str, str, str, str, str]] | None


class DomainParams(BaseModel):
    """Fields for individual domain suggestion entries"""

    interpro_id: CURIE
    domain_name: StrictStr
    start: int
    end: int
    refseq_ac: StrictStr


class GetDomainResponse(Response):
    """Response model for functional domain constructor endpoint."""

    domain: FunctionalDomain | None


class AssociatedDomainResponse(Response):
    """Response model for domain ID autocomplete suggestion endpoint."""

    gene_id: StrictStr
    suggestions: list[DomainParams] | None


class ValidateFusionResponse(Response):
    """Response model for Fusion validation endpoint."""

    fusion: Fusion | None


class ExonCoordsRequest(BaseModel):
    """Request model for genomic coordinates retrieval"""

    tx_ac: StrictStr
    gene: StrictStr | None = ""
    exon_start: StrictInt | None = 0
    exon_start_offset: StrictInt | None = 0
    exon_end: StrictInt | None = 0
    exon_end_offset: StrictInt | None = 0

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

    coordinates_data: GenomicData | None


class SequenceIDResponse(Response):
    """Response model for sequence ID retrieval endpoint."""

    sequence: StrictStr
    refseq_id: StrictStr | None
    ga4gh_id: StrictStr | None
    aliases: list[StrictStr] | None


class ManeGeneTranscript(BaseModel):
    """Base object containing MANE-provided gene transcript metadata"""

    NCBI_GeneID: str = Field(..., alias="#NCBI_GeneID")
    Ensembl_Gene: str
    HGNC_ID: str
    symbol: str
    name: str
    RefSeq_nuc: str
    RefSeq_prot: str
    Ensembl_nuc: str
    Ensembl_prot: str
    MANE_status: str
    GRCh38_chr: str
    chr_start: str
    chr_end: str
    chr_strand: str


class GetTranscriptsResponse(Response):
    """Response model for MANE transcript retrieval endpoint."""

    transcripts: list[ManeGeneTranscript] | None


class ServiceInfoResponse(Response):
    """Response model for service_info endpoint."""

    curfu_version: StrictStr
    fusor_version: StrictStr
    cool_seq_tool_version: StrictStr

    # consider additional tool versions:
    # - UTA (https://github.com/GenomicMedLab/cool-seq-tool/issues/98)
    # - vrs/vrs-python
    # - the gene normalizer


class ClientCategoricalFusion(CategoricalFusion):
    """Categorial fusion with client-oriented structural element models. Used in
    global FusionContext.
    """

    regulatory_element: ClientRegulatoryElement | None = None
    structural_elements: list[
        ClientTranscriptSegmentElement
        | ClientGeneElement
        | ClientTemplatedSequenceElement
        | ClientLinkerElement
        | ClientMultiplePossibleGenesElement
    ]
    critical_functional_domains: list[ClientFunctionalDomain] | None


class ClientAssayedFusion(AssayedFusion):
    """Assayed fusion with client-oriented structural element models. Used in
    global FusionContext.
    """

    regulatory_element: ClientRegulatoryElement | None = None
    structural_elements: list[
        ClientTranscriptSegmentElement
        | ClientGeneElement
        | ClientTemplatedSequenceElement
        | ClientLinkerElement
        | ClientUnknownGeneElement
    ]


class NomenclatureResponse(Response):
    """Response model for regulatory element nomenclature endpoint."""

    nomenclature: str | None


class RegulatoryElementResponse(Response):
    """Response model for regulatory element constructor."""

    regulatory_element: RegulatoryElement


class DemoResponse(Response):
    """Response model for demo fusion object retrieval endpoints."""

    fusion: ClientAssayedFusion | ClientCategoricalFusion


class RouteTag(str, Enum):
    """Define tags for API routes."""

    UTILITIES = "Utilities"
    CONSTRUCTORS = "Constructors"
    VALIDATORS = "Validators"
    COMPLETION = "Completion"
    NOMENCLATURE = "Nomenclature"
    DEMOS = "Demos"
    META = "Meta"
    SERVICE = "Service"
    LOOKUP = "Lookup"
