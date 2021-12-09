"""Provide routes for component construction endpoints"""
from typing import Optional

from fastapi import Query, Request, APIRouter
from fusor.models import Strand

from curation import logger
from curation.schemas import (
    GeneComponentResponse,
    TxSegmentComponentResponse,
    TemplatedSequenceComponentResponse,
)
from curation.sequence_services import get_strand, InvalidInputException

router = APIRouter()


@router.get(
    "/component/gene",
    operation_id="buildGeneComponent",
    response_model=GeneComponentResponse,
    response_model_exclude_none=True,
)
def build_gene_component(
    request: Request, term: str = Query("")
) -> GeneComponentResponse:
    """Construct valid gene component given user-provided term.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene symbol/alias/name/etc
    :return: Pydantic class with gene component if successful and warnings otherwise
    """
    gene_component, warnings = request.app.state.fusor.gene_component(term)
    if not warnings:
        warnings_l = []
    else:
        warnings_l = [warnings]
    return GeneComponentResponse(component=gene_component, warnings=warnings_l)


@router.get(
    "/component/tx_segment_ect",
    operation_id="buildTranscriptSegmentComponentECT",
    response_model=TxSegmentComponentResponse,
    response_model_exclude_none=True,
)
async def build_tx_segment_ect(
    request: Request,
    transcript: str,
    exon_start: Optional[int] = Query(None),
    exon_start_offset: int = Query(0),
    exon_end: Optional[int] = Query(None),
    exon_end_offset: int = Query(0),
) -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing transcript and exon
        coordinates. Either exon_start or exon_end are required.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param Optional[int] exon_start: number of starting exon, 0 by default
    :param int exon_start_offset: offset from starting exon
    :param Optional[int] exon_end: number of ending exon
    :param int exon_end_offset: offset from ending exon, 0 by default
    :return: Pydantic class with TranscriptSegment component if successful, and warnings
        otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        transcript=transcript,
        exon_start=exon_start,
        exon_start_offset=exon_start_offset,
        exon_end=exon_end,
        exon_end_offset=exon_end_offset,
    )
    return TxSegmentComponentResponse(component=tx_segment, warnings=warnings)


@router.get(
    "/component/tx_segment_gct",
    operation_id="buildTranscriptSegmentComponentGCT",
    response_model=TxSegmentComponentResponse,
    response_model_exclude_none=True,
)
async def build_tx_segment_gct(
    request: Request,
    transcript: str,
    chromosome: str,
    start: Optional[int] = Query(None),
    end: Optional[int] = Query(None),
    strand: Optional[str] = Query(None),
) -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing transcript and genomic
    coordinates (chromosome, start, end positions).
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param str chromosome: chromosome (TODO how to identify?)
    :param int start: starting position (TODO assume residue-based?)
    :param int end: ending position
    :return: Pydantic class with TranscriptSegment component if successful, and
        warnings otherwise.
    """
    if strand is not None:
        try:
            strand_validated = get_strand(strand)
        except InvalidInputException:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return TxSegmentComponentResponse(warnings=[warning])
    else:
        strand_validated = strand
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        tx_to_genomic_coords=False,
        transcript=transcript,
        chromosome=chromosome,
        start=start,
        end=end,
        strand=strand_validated,
    )
    return TxSegmentComponentResponse(component=tx_segment, warnings=warnings)


@router.get(
    "/component/tx_segment_gcg",
    operation_id="buildTranscriptSegmentComponentGCG",
    response_model=TxSegmentComponentResponse,
    response_model_exclude_none=True,
)
async def build_tx_segment_gcg(
    request: Request,
    gene: str,
    chromosome: str,
    start: Optional[int] = Query(None),
    end: Optional[int] = Query(None),
    strand: Optional[str] = Query(None),
) -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing gene and genomic
    coordinates (chromosome, start, end positions).
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str gene: gene (TODO how to identify?)
    :param str chromosome: chromosome (TODO how to identify?)
    :param int start: starting position (TODO assume residue-based?)
    :param int end: ending position
    :return: Pydantic class with TranscriptSegment component if successful, and
        warnings otherwise.
    """
    if strand is not None:
        try:
            strand_validated = get_strand(strand)
        except InvalidInputException:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return TxSegmentComponentResponse(warnings=[warning])
    else:
        strand_validated = strand
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        tx_to_genomic_coords=False,
        gene=gene,
        chromosome=chromosome,
        strand=strand_validated,
        start=start,
        end=end,
    )
    return TxSegmentComponentResponse(component=tx_segment, warnings=warnings)


@router.get(
    "/component/templated_sequence",
    operation_id="buildTemplatedSequenceComponent",
    response_model=TemplatedSequenceComponentResponse,
    response_model_exclude_none=True,
)
def build_templated_sequence_component(
    request: Request, start: int, end: int, sequence_id: str, strand: str
) -> TemplatedSequenceComponentResponse:
    """Construct templated sequence component
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param int start: genomic starting position
    :param int end: genomic ending position
    :param str sequence_id: chromosome accession for sequence
    :param str strand: chromosome strand - must be one of {'+', '-'}
    :return: Pydantic class with Templated Sequnce component if successful, or warnings
        otherwise
    """
    try:
        strand_n = Strand(strand)
    except ValueError:
        warning = f"Received invalid strand value: {strand}"
        logger.warning(warning)
        return TemplatedSequenceComponentResponse(warnings=[warning])
    component = request.app.state.fusor.templated_sequence_component(
        start=start,
        end=end,
        sequence_id=sequence_id,
        strand=strand_n,
        add_location_id=True,
    )
    return TemplatedSequenceComponentResponse(component=component, warnings=[])
