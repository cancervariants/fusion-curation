"""Provide routes for element construction endpoints"""

from fastapi import APIRouter, Query, Request
from fusor.models import DomainStatus, RegulatoryClass
from pydantic import ValidationError

from curfu import logger
from curfu.routers import parse_identifier
from curfu.schemas import (
    GeneElementResponse,
    GetDomainResponse,
    RegulatoryElementResponse,
    ResponseDict,
    RouteTag,
    TemplatedSequenceElementResponse,
    TxSegmentElementResponse,
)
from curfu.sequence_services import get_strand

router = APIRouter()


@router.get(
    "/api/construct/structural_element/gene",
    operation_id="buildGeneElement",
    response_model=GeneElementResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
def build_gene_element(request: Request, term: str = Query("")) -> GeneElementResponse:
    """Construct valid gene element given user-provided term.

    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param term: gene symbol/alias/name/etc
    :return: Pydantic class with gene element if successful and warnings otherwise
    """
    gene_element, warnings = request.app.state.fusor.gene_element(term)
    return GeneElementResponse(
        element=gene_element, warnings=[] if not warnings else [warnings]
    )


@router.get(
    "/api/construct/structural_element/tx_segment_ect",
    operation_id="buildTranscriptSegmentElementECT",
    response_model=TxSegmentElementResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
async def build_tx_segment_ect(
    request: Request,
    transcript: str,
    exon_start: int | None = Query(None),
    exon_start_offset: int = Query(0),
    exon_end: int | None = Query(None),
    exon_end_offset: int = Query(0),
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing transcript and exon
        coordinates. Either exon_start or exon_end are required.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param transcript: transcript accession identifier
    :param exon_start: number of starting exon, 0 by default
    :param exon_start_offset: offset from starting exon
    :param exon_end: number of ending exon
    :param exon_end_offset: offset from ending exon, 0 by default
    :return: Pydantic class with TranscriptSegment element if successful, and warnings
        otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        transcript=parse_identifier(transcript),
        exon_start=exon_start,
        exon_start_offset=exon_start_offset,
        exon_end=exon_end,
        exon_end_offset=exon_end_offset,
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/api/construct/structural_element/tx_segment_gct",
    operation_id="buildTranscriptSegmentElementGCT",
    response_model=TxSegmentElementResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
async def build_tx_segment_gct(
    request: Request,
    transcript: str,
    chromosome: str,
    start: int | None = Query(None),
    end: int | None = Query(None),
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing transcript and genomic
    coordinates (chromosome, start, end positions).
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param transcript: transcript accession identifier
    :param chromosome: chromosome (TODO how to identify?)
    :param start: starting position (TODO assume residue-based?)
    :param end: ending position
    :return: Pydantic class with TranscriptSegment element if successful, and
        warnings otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        tx_to_genomic_coords=False,
        transcript=parse_identifier(transcript),
        chromosome=parse_identifier(chromosome),
        seg_start_genomic=start,
        seg_end_genomic=end,
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/api/construct/structural_element/tx_segment_gcg",
    operation_id="buildTranscriptSegmentElementGCG",
    response_model=TxSegmentElementResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
async def build_tx_segment_gcg(
    request: Request,
    gene: str,
    chromosome: str,
    start: int | None = Query(None),
    end: int | None = Query(None),
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing gene and genomic
    coordinates (chromosome, start, end positions).
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param gene: gene (TODO how to identify?)
    :param chromosome: chromosome (TODO how to identify?)
    :param start: starting position (TODO assume residue-based?)
    :param end: ending position
    :return: Pydantic class with TranscriptSegment element if successful, and
        warnings otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        tx_to_genomic_coords=False,
        gene=gene,
        chromosome=parse_identifier(chromosome),
        seg_start_genomic=start,
        seg_end_genomic=end,
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/api/construct/structural_element/templated_sequence",
    operation_id="buildTemplatedSequenceElement",
    response_model=TemplatedSequenceElementResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
def build_templated_sequence_element(
    request: Request, start: int, end: int, sequence_id: str, strand: str
) -> TemplatedSequenceElementResponse:
    """Construct templated sequence element
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param start: genomic starting position
    :param end: genomic ending position
    :param sequence_id: chromosome accession for sequence
    :param strand: chromosome strand - must be one of {'+', '-'}
    :return: Pydantic class with Templated Sequnce element if successful, or warnings
        otherwise
    """
    try:
        strand_n = get_strand(strand)
    except ValueError:
        warning = f"Received invalid strand value: {strand}"
        logger.warning(warning)
        return TemplatedSequenceElementResponse(warnings=[warning], element=None)
    element = request.app.state.fusor.templated_sequence_element(
        start=start,
        end=end,
        sequence_id=parse_identifier(sequence_id),
        strand=strand_n,
    )
    return TemplatedSequenceElementResponse(element=element, warnings=[])


@router.get(
    "/api/construct/domain",
    operation_id="getDomain",
    response_model=GetDomainResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
def build_domain(
    request: Request,
    status: DomainStatus,
    name: str,
    domain_id: str,
    gene_id: str,
    sequence_id: str,
    start: int,
    end: int,
) -> ResponseDict:
    """Construct complete functional domain object given constitutive parameters.
    \f

    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param status: status of domain
    :param name: domain name (should match InterPro entry but not validated here)
    :param domain_id: InterPro ID (expected to be formatted as a CURIE)
    :param gene_id: normalized gene ID (expected to be formatted as a CURIE)
    :param sequence_id: associated protein sequence ID (expected to be refseq-style,
        but not validated, and namespace shouldn't be included)
    :param start: the domain's protein start position
    :param end: the domain's protein end position
    :return: complete domain or warning msg
    """
    response: ResponseDict = {}
    try:
        domain, warnings = request.app.state.fusor.functional_domain(
            status, name, domain_id, gene_id, sequence_id, start, end
        )
        if warnings:
            response["warnings"] = [warnings]
        else:
            response["domain"] = domain
    except ValidationError as e:
        response["warnings"] = [f"Unable to construct Functional Domain: {e}"]
    return response


@router.get(
    "/api/construct/regulatory_element",
    operation_id="getRegulatoryElement",
    response_model=RegulatoryElementResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
def build_regulatory_element(
    request: Request, element_class: RegulatoryClass, gene_name: str
) -> ResponseDict:
    """Construct regulatory element from given params.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Used to access
        FUSOR and UTA-associated tools.
    :param element_class: type of regulatory element
    :param gene_name: referent acquired from autocomplete.
    :return: complete regulatory element object or warning message
    """
    try:
        normalized_class = RegulatoryClass[element_class.upper()]
    except KeyError:
        return {"warnings": [f"unrecognized regulatory class value: {element_class}"]}
    element, warnings = request.app.state.fusor.regulatory_element(
        normalized_class, gene_name
    )
    return {"regulatoryElement": element, "warnings": warnings}
