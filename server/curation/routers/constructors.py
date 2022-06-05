"""Provide routes for element construction endpoints"""
from typing import Optional

from fastapi import Query, Request, APIRouter
from pydantic import ValidationError
from fusor.models import Strand, DomainStatus

from curation import logger
from curation.schemas import (
    GeneElementResponse,
    TxSegmentElementResponse,
    TemplatedSequenceElementResponse,
    GetDomainResponse,
    ResponseDict,
)
from curation.sequence_services import get_strand, InvalidInputException

router = APIRouter()


@router.get(
    "/construct/structural_element/gene",
    operation_id="buildGeneElement",
    response_model=GeneElementResponse,
    response_model_exclude_none=True,
)
def build_gene_element(request: Request, term: str = Query("")) -> GeneElementResponse:
    """Construct valid gene element given user-provided term.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene symbol/alias/name/etc
    :return: Pydantic class with gene element if successful and warnings otherwise
    """
    gene_element, warnings = request.app.state.fusor.gene_element(term)
    if not warnings:
        warnings_l = []
    else:
        warnings_l = [warnings]
    return GeneElementResponse(element=gene_element, warnings=warnings_l)


@router.get(
    "/construct/structural_element/tx_segment_ect",
    operation_id="buildTranscriptSegmentElementECT",
    response_model=TxSegmentElementResponse,
    response_model_exclude_none=True,
)
async def build_tx_segment_ect(
    request: Request,
    transcript: str,
    exon_start: Optional[int] = Query(None),
    exon_start_offset: int = Query(0),
    exon_end: Optional[int] = Query(None),
    exon_end_offset: int = Query(0),
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing transcript and exon
        coordinates. Either exon_start or exon_end are required.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param Optional[int] exon_start: number of starting exon, 0 by default
    :param int exon_start_offset: offset from starting exon
    :param Optional[int] exon_end: number of ending exon
    :param int exon_end_offset: offset from ending exon, 0 by default
    :return: Pydantic class with TranscriptSegment element if successful, and warnings
        otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        transcript=transcript,
        exon_start=exon_start,
        exon_start_offset=exon_start_offset,
        exon_end=exon_end,
        exon_end_offset=exon_end_offset,
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/construct/structural_element/tx_segment_gct",
    operation_id="buildTranscriptSegmentElementGCT",
    response_model=TxSegmentElementResponse,
    response_model_exclude_none=True,
)
async def build_tx_segment_gct(
    request: Request,
    transcript: str,
    chromosome: str,
    start: Optional[int] = Query(None),
    end: Optional[int] = Query(None),
    strand: Optional[str] = Query(None),
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing transcript and genomic
    coordinates (chromosome, start, end positions).
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param str chromosome: chromosome (TODO how to identify?)
    :param int start: starting position (TODO assume residue-based?)
    :param int end: ending position
    :return: Pydantic class with TranscriptSegment element if successful, and
        warnings otherwise.
    """
    if strand is not None:
        try:
            strand_validated = get_strand(strand)
        except InvalidInputException:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return TxSegmentElementResponse(warnings=[warning], element=None)
    else:
        strand_validated = strand
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        tx_to_genomic_coords=False,
        transcript=transcript,
        chromosome=chromosome,
        start=start,
        end=end,
        strand=strand_validated,
        residue_mode="inter-residue",
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/construct/structural_element/tx_segment_gcg",
    operation_id="buildTranscriptSegmentElementGCG",
    response_model=TxSegmentElementResponse,
    response_model_exclude_none=True,
)
async def build_tx_segment_gcg(
    request: Request,
    gene: str,
    chromosome: str,
    start: Optional[int] = Query(None),
    end: Optional[int] = Query(None),
    strand: Optional[str] = Query(None),
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing gene and genomic
    coordinates (chromosome, start, end positions).
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str gene: gene (TODO how to identify?)
    :param str chromosome: chromosome (TODO how to identify?)
    :param int start: starting position (TODO assume residue-based?)
    :param int end: ending position
    :return: Pydantic class with TranscriptSegment element if successful, and
        warnings otherwise.
    """
    if strand is not None:
        try:
            strand_validated = get_strand(strand)
        except InvalidInputException:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return TxSegmentElementResponse(warnings=[warning], element=None)
    else:
        strand_validated = strand
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        tx_to_genomic_coords=False,
        gene=gene,
        chromosome=chromosome,
        strand=strand_validated,
        start=start,
        end=end,
        residue_mode="inter-residue",
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/construct/structural_element/templated_sequence",
    operation_id="buildTemplatedSequenceElement",
    response_model=TemplatedSequenceElementResponse,
    response_model_exclude_none=True,
)
def build_templated_sequence_element(
    request: Request, start: int, end: int, sequence_id: str, strand: str
) -> TemplatedSequenceElementResponse:
    """Construct templated sequence element
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param int start: genomic starting position
    :param int end: genomic ending position
    :param str sequence_id: chromosome accession for sequence
    :param str strand: chromosome strand - must be one of {'+', '-'}
    :return: Pydantic class with Templated Sequnce element if successful, or warnings
        otherwise
    """
    try:
        strand_n = Strand(strand)
    except ValueError:
        warning = f"Received invalid strand value: {strand}"
        logger.warning(warning)
        return TemplatedSequenceElementResponse(warnings=[warning], element=None)
    element = request.app.state.fusor.templated_sequence_element(
        start=start,
        end=end,
        sequence_id=sequence_id,
        strand=strand_n,
        add_location_id=True,
    )
    return TemplatedSequenceElementResponse(element=element, warnings=[])


@router.get(
    "/construct/domain",
    operation_id="getDomain",
    response_model=GetDomainResponse,
    response_model_exclude_none=True,
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

    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param DomainStatus status: status of domain
    :param str name: domain name (should match InterPro entry but not validated here)
    :param str domain_id: InterPro ID (expected to be formatted as a CURIE)
    :param str gene_id: normalized gene ID (expected to be formatted as a CURIE)
    :param str sequence_id: associated protein sequence ID (expected to be refseq-style,
        but not validated, and namespace shouldn't be included)
    :param int start: the domain's protein start position
    :param int end: the domain's protein end position
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
