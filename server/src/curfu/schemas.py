"""Provide schemas for FastAPI responses."""

from enum import Enum
from typing import Literal

from cool_seq_tool.schemas import GenomicData
from fusor.models import (
    Assay,
    AssayedFusion,
    AssayedFusionElements,
    CategoricalFusion,
    CategoricalFusionElements,
    CausativeEvent,
    FunctionalDomain,
    Fusion,
    FusionType,
    GeneElement,
    LinkerElement,
    MultiplePossibleGenesElement,
    RegulatoryElement,
    Strand,
    TemplatedSequenceElement,
    TranscriptSegmentElement,
    UnknownGeneElement,
)
from pydantic import BaseModel, Field, StrictInt, StrictStr, field_validator

ResponseWarnings = list[StrictStr] | None

ResponseDict = dict[
    str,
    str | int | list[str] | list[tuple[str, str, str, str]] | FunctionalDomain | None,
]
Warnings = list[str]


class ClientStructuralElement(BaseModel):
    """Abstract class to provide identification properties used by client."""

    elementId: StrictStr
    nomenclature: StrictStr


class ClientTranscriptSegmentElement(TranscriptSegmentElement, ClientStructuralElement):
    """TranscriptSegment element class used client-side."""

    inputType: (
        Literal["genomic_coords_gene"]
        | Literal["genomic_coords_tx"]
        | Literal["exon_coords_tx"]
    )
    inputTx: str | None = None
    inputStrand: Strand | None = None
    inputGene: str | None = None
    inputChr: str | None = None
    inputGenomicStart: str | None = None
    inputGenomicEnd: str | None = None
    inputExonStart: str | None = None
    inputExonStartOffset: str | None = None
    inputExonEnd: str | None = None
    inputExonEndOffset: str | None = None


class ClientLinkerElement(LinkerElement, ClientStructuralElement):
    """Linker element class used client-side."""


class ClientTemplatedSequenceElement(TemplatedSequenceElement, ClientStructuralElement):
    """Templated sequence element used client-side."""

    inputChromosome: str | None
    inputStart: str | None
    inputEnd: str | None


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

    domainId: str

    class Config:
        """Configure class."""

        extra = "forbid"


class ClientRegulatoryElement(RegulatoryElement, ClientStructuralElement):
    """Define regulatory element object used client-side."""

    displayClass: str
    nomenclature: str


class Response(BaseModel):
    """Abstract Response class for defining API response structures."""

    warnings: ResponseWarnings | None = None

    class Config:
        """Configure class"""

        extra = "forbid"


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
    concept_id: StrictStr | None
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

    interproId: StrictStr
    domainName: StrictStr
    start: int
    end: int
    refseqAc: StrictStr


class GetDomainResponse(Response):
    """Response model for functional domain constructor endpoint."""

    domain: FunctionalDomain | None


class AssociatedDomainResponse(Response):
    """Response model for domain ID autocomplete suggestion endpoint."""

    gene_id: StrictStr
    suggestions: list[DomainParams] | None = None


class ValidateFusionResponse(Response):
    """Response model for Fusion validation endpoint."""

    fusion: Fusion | None = None


class ExonCoordsRequest(BaseModel):
    """Request model for genomic coordinates retrieval"""

    txAc: StrictStr
    gene: StrictStr | None = ""
    exonStart: StrictInt | None = 0
    exonStartOffset: StrictInt | None = 0
    exonEnd: StrictInt | None = 0
    exonEndOffset: StrictInt | None = 0

    @field_validator("gene")
    def validate_gene(cls, v) -> str:
        """Replace None with empty string."""
        if v is None:
            return ""
        return v

    @field_validator("exonStart", "exonStartOffset", "exonEnd", "exonEndOffset")
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
    chr_start: int
    chr_end: int
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

    regulatoryElement: ClientRegulatoryElement | None = None
    structure: list[
        ClientTranscriptSegmentElement
        | ClientGeneElement
        | ClientTemplatedSequenceElement
        | ClientLinkerElement
        | ClientMultiplePossibleGenesElement
    ]
    criticalFunctionalDomains: list[ClientFunctionalDomain] | None


class ClientAssayedFusion(AssayedFusion):
    """Assayed fusion with client-oriented structural element models. Used in
    global FusionContext.
    """

    regulatoryElement: ClientRegulatoryElement | None = None
    structure: list[
        ClientTranscriptSegmentElement
        | ClientGeneElement
        | ClientTemplatedSequenceElement
        | ClientLinkerElement
        | ClientUnknownGeneElement
    ]


class FormattedAssayedFusion(BaseModel):
    """Assayed fusion with parameters defined as expected in fusor assayed_fusion function
    validate attempts to validate a fusion by constructing it by sending kwargs. In the models and frontend, these are camelCase,
    but the assayed_fusion and categorical_fusion constructors expect snake_case
    """

    fusion_type: FusionType.ASSAYED_FUSION = FusionType.ASSAYED_FUSION
    structure: AssayedFusionElements
    causative_event: CausativeEvent | None = None
    assay: Assay | None = None
    regulatory_element: RegulatoryElement | None = None
    reading_frame_preserved: bool | None = None


class FormattedCategoricalFusion(BaseModel):
    """Categorical fusion with parameters defined as expected in fusor categorical_fusion function
    validate attempts to validate a fusion by constructing it by sending kwargs. In the models and frontend, these are camelCase,
    but the assayed_fusion and categorical_fusion constructors expect snake_case
    """

    fusion_type: FusionType.CATEGORICAL_FUSION = FusionType.CATEGORICAL_FUSION
    structure: CategoricalFusionElements
    regulatory_element: RegulatoryElement | None = None
    critical_functional_domains: list[FunctionalDomain] | None = None
    reading_frame_preserved: bool | None = None


class NomenclatureResponse(Response):
    """Response model for regulatory element nomenclature endpoint."""

    nomenclature: str | None


class RegulatoryElementResponse(Response):
    """Response model for regulatory element constructor."""

    regulatoryElement: RegulatoryElement


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
