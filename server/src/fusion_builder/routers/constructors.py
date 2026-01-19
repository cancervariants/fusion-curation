"""Provide routes for element construction endpoints"""

from typing import Annotated

from cool_seq_tool.schemas import CoordinateType
from fastapi import APIRouter, Query, Request
from fusor.models import DomainStatus, RegulatoryClass
from pydantic import ValidationError

from fusion_builder import logger
from fusion_builder.routers import parse_identifier
from fusion_builder.schemas import (
    GeneElementResponse,
    GetDomainResponse,
    RegulatoryElementResponse,
    ResponseDict,
    RouteTag,
    TemplatedSequenceElementResponse,
    TxSegmentElementResponse,
)
from fusion_builder.sequence_services import get_strand

router = APIRouter()


@router.get(
    "/api/construct/structural_element/gene",
    operation_id="buildGeneElement",
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
def build_gene_element(
    request: Request, term: Annotated[str, Query("")]
) -> GeneElementResponse:
    """Construct valid gene element given user-provided term."""
    gene_element, warnings = request.app.state.fusor.gene_element(term)
    return GeneElementResponse(
        element=gene_element, warnings=[] if not warnings else [warnings]
    )


@router.get(
    "/api/construct/structural_element/tx_segment_ec",
    operation_id="buildTranscriptSegmentElementECT",
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
async def build_tx_segment_ec(
    request: Request,
    transcript: str,
    exon_start: Annotated[int | None, Query(None)],
    exon_start_offset: Annotated[int, Query(0)],
    exon_end: Annotated[int | None, Query(None)],
    exon_end_offset: Annotated[int, Query(0)],
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing transcript and exon coordinates.

    Either exon_start or exon_end are required.
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
    "/api/construct/structural_element/tx_segment_gc",
    operation_id="buildTranscriptSegmentElementGC",
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
async def build_tx_segment_gc(
    request: Request,
    gene: str,
    chromosome: str,
    transcript: str,
    start: Annotated[int | None, Query(None)],
    end: Annotated[int | None, Query(None)],
) -> TxSegmentElementResponse:
    """Construct Transcript Segment element by providing gene and/or transcript and genomic
    coordinates (chromosome, start, end positions).
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_element(
        tx_to_genomic_coords=False,
        gene=gene,
        genomic_ac=parse_identifier(chromosome),
        seg_start_genomic=start,
        seg_end_genomic=end,
        transcript=transcript,
    )
    return TxSegmentElementResponse(element=tx_segment, warnings=warnings)


@router.get(
    "/api/construct/structural_element/templated_sequence",
    operation_id="buildTemplatedSequenceElement",
    response_model_exclude_none=True,
    tags=[RouteTag.CONSTRUCTORS],
)
def build_templated_sequence_element(
    request: Request, start: int, end: int, sequence_id: str, strand: str
) -> TemplatedSequenceElementResponse:
    """Construct templated sequence element"""
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
        coordinate_type=CoordinateType.RESIDUE,
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
    """Construct complete functional domain object given constitutive parameters."""
    response: ResponseDict = {}
    try:
        domain, warnings = request.app.state.fusor.functional_domain(
            status,
            name,
            domain_id,
            gene_id,
            sequence_id,
            start,
            end,
            coordinate_type=CoordinateType.RESIDUE,
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
    request: Request,
    element_class: RegulatoryClass,
    gene_name: str,
    feature_id: str | None = None,
    sequence_id: str | None = None,
    start: int | None = None,
    end: int | None = None,
) -> ResponseDict:
    """Construct regulatory element from given params."""
    response: ResponseDict = {"warnings": None, "regulatoryElement": None}
    try:
        normalized_class = RegulatoryClass[element_class.upper()]
    except KeyError:
        response["warnings"] = [f"unrecognized regulatory class value: {element_class}"]
        return response

    try:
        element, warnings = request.app.state.fusor.regulatory_element(
            normalized_class,
            gene_name,
            feature_id=feature_id,
            sequence_id=sequence_id,
            start=start,
            end=end,
            coordinate_type=CoordinateType.RESIDUE,
        )
        if warnings:
            response["warnings"] = [warnings]
        else:
            response["regulatoryElement"] = element
    except ValidationError as e:
        response["warnings"] = [f"Unable to construct Regulatory Element: {e}"]

    return response
