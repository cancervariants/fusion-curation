"""Provide routes for app utility endpoints"""
from typing import Dict, Optional, List, Any

from fastapi import APIRouter, Request
from gene import schemas as GeneSchemas

from curfu import logger
from curfu.schemas import (
    GetTranscriptsResponse,
    CoordsUtilsResponse,
    SequenceIDResponse,
)
from curfu.sequence_services import get_strand, InvalidInputException


router = APIRouter()


@router.get(
    "/utilities/get_transcripts",
    operation_id="getMANETranscripts",
    response_model=GetTranscriptsResponse,
    response_model_exclude_none=True,
)
def get_mane_transcripts(request: Request, term: str) -> Dict:
    """Get MANE transcripts for gene term.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene term provided by user
    :return: Dict containing transcripts if lookup succeeds, or warnings upon failure
    """
    normalized = request.app.state.fusor.gene_normalizer.normalize(term)
    if normalized.match_type == GeneSchemas.MatchType.NO_MATCH:
        return {"warnings": [f"Normalization error: {term}"]}
    elif not normalized.gene_descriptor.gene_id.lower().startswith("hgnc"):
        return {"warnings": [f"No HGNC symbol: {term}"]}
    symbol = normalized.gene_descriptor.label
    transcripts = request.app.state.fusor.uta_tools.mane_transcript_mappings.get_gene_mane_data(  # noqa: E501
        symbol
    )
    if not transcripts:
        return {"warnings": [f"No matching transcripts: {term}"]}
    else:
        return {"transcripts": transcripts}


@router.get(
    "/utilities/get_genomic",
    operation_id="getGenomicCoords",
    response_model=CoordsUtilsResponse,
    response_model_exclude_none=True,
)
async def get_genome_coords(
    request: Request,
    gene: Optional[str] = None,
    transcript: Optional[str] = None,
    exon_start: Optional[int] = None,
    exon_end: Optional[int] = None,
    exon_start_offset: Optional[int] = None,
    exon_end_offset: Optional[int] = None,
) -> CoordsUtilsResponse:
    """Convert provided exon positions to genomic coordinates

    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param Optional[str] gene: gene symbol/ID on which exons lie
    :param Optional[str] transcript: transcript accession ID
    :param Optional[int] exon_start: starting exon number
    :param Optional[int] exon_end: ending exon number
    :param int exon_start_offset: base offset count from starting exon
    :param int exon_end_offset: base offset count from end exon
    :return: CoordsUtilsResponse containing relevant data or warnings if unsuccesful
    """
    warnings = []
    if exon_start is None and exon_end is None:
        warning = "Must provide start and/or end exon positions"
        warnings.append(warning)
    if transcript is None and gene is None:
        warning = "Must provide gene and/or transcript"
        warnings.append(warning)
    if (exon_start is not None) and (exon_end is not None) and (exon_end < exon_start):
        warning = (
            f"Invalid order: exon_end {exon_end} must be >= exon_start {exon_start}"
        )
        warnings.append(warning)
    if (exon_start is None) and (exon_start_offset is not None):
        warning = "No start param: exon_start_offset parameter requires explicit exon_start parameter"  # noqa: E501
        warnings.append(warning)
    if (exon_end is None) and (exon_end_offset is not None):
        warning = "No end param: exon_end_offset parameter requires explicit exon_end parameter"
        warnings.append(warning)
    if warnings:
        for warning in warnings:
            logger.warning(warning)
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    # TODO necessary for now
    if exon_start is not None and exon_start_offset is None:
        exon_start_offset = 0
    if exon_end is not None and exon_end_offset is None:
        exon_end_offset = 0

    response = await request.app.state.fusor.uta_tools.transcript_to_genomic_coordinates(  # noqa: E501
        gene=gene,
        transcript=transcript,
        exon_start=exon_start,
        exon_end=exon_end,
        exon_start_offset=exon_start_offset,
        exon_end_offset=exon_end_offset,
        residue_mode="inter-residue",
    )
    warnings = response.warnings
    if warnings:
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    return CoordsUtilsResponse(coordinates_data=response.genomic_data, warnings=None)


@router.get(
    "/utilities/get_exon",
    operation_id="getExonCoords",
    response_model=CoordsUtilsResponse,
    response_model_exclude_none=True,
)
async def get_exon_coords(
    request: Request,
    chromosome: str,
    start: Optional[int] = None,
    end: Optional[int] = None,
    strand: Optional[str] = None,
    gene: Optional[str] = None,
    transcript: Optional[str] = None,
) -> CoordsUtilsResponse:
    """Convert provided genomic coordinates to exon coordinates
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str chromosome: chromosome, either as a number/X/Y or as an accession
    :param Optional[int] start: genomic start position
    :param Optional[int] end: genomic end position
    :param Optional[str] strand: strand of genomic position
    :param Optional[str] gene: gene symbol or ID
    :param Optional[str] transcript: transcript accession ID
    :return: response with exon coordinates if successful, or warnings if failed
    """
    warnings: List[str] = []
    if start is None and end is None:
        warnings.append("Must provide start and/or end coordinates")
    if transcript is None and gene is None:
        warnings.append("Must provide gene and/or transcript")
    if strand is not None:
        try:
            strand_validated = get_strand(strand)
        except InvalidInputException:
            warnings.append(f"Received invalid strand value: {strand}")
    else:
        strand_validated = strand
    if warnings:
        for warning in warnings:
            logger.warning(warning)
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    response = await request.app.state.fusor.uta_tools.genomic_to_transcript_exon_coordinates(  # noqa: E501
        chromosome,
        start=start,
        end=end,
        strand=strand_validated,  # type: ignore
        transcript=transcript,
        gene=gene,
    )
    warnings = response.warnings
    if warnings:
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    return CoordsUtilsResponse(coordinates_data=response.genomic_data, warnings=None)


@router.get(
    "/utilities/get_sequence_id",
    operation_id="getSequenceId",
    response_model=SequenceIDResponse,
    response_model_exclude_none=True,
)
async def get_sequence_id(request: Request, sequence: str) -> SequenceIDResponse:
    """Get GA4GH sequence ID and aliases given sequence sequence ID
    :param Request request: the HTTP request context, supplied by FastAPI. Use
        to access FUSOR and UTA-associated tools.
    :param str sequence_id: user-provided sequence identifier to translate
    :return: Response object with ga4gh ID and aliases
    """
    params: Dict[str, Any] = {"sequence": sequence}
    sr = request.app.state.fusor.uta_tools.seqrepo_access.seqrepo_client
    try:
        aliases = sr.translate_identifier(sequence)
    except KeyError:
        params["warnings"] = [f"Identifier {sequence} could not be retrieved"]
        aliases = []
    try:
        params["ga4gh_sequence_id"] = [i for i in aliases if i.startswith("ga4gh")][0]
    except IndexError:
        logger.warning(f"No available ga4gh ID for {sequence}")
        params["ga4gh_sequence_id"] = None
    params["aliases"] = [i for i in aliases if not i.startswith("ga4gh")]
    return SequenceIDResponse(**params)