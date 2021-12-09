"""Provide routes for app utility endpoints"""
from typing import Dict, Optional

from fastapi import APIRouter, Request
from gene import schemas as GeneSchemas

from curation import logger
from curation.schemas import GetTranscriptsResponse, CoordsUtilsResponse
from curation.sequence_services import get_strand, InvalidInputException


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
    transcripts = (
        request.app.state.fusor.uta_tools.mane_transcript_mappings.get_gene_mane_data(
            symbol
        )
    )
    if not transcripts:
        return {"warnings": [f"No matching transcripts: {term}"]}
    else:
        return {"transcripts": transcripts}


@router.get(
    "utilities/get_genomic",
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
    :param Optional[int] exon_start_offset: base offset count from starting exon
    :param Optional[int] exon_end_offset: base offset count from end exon
    :return: CoordsUtilsResponse containing relevant data or warnings if unsuccesful
    """
    if exon_start is None and exon_end is None:
        warning = "Must provide start and/or end exon positions"
        logger.warning(warning)
        return CoordsUtilsResponse(warnings=[warning])
    if transcript is None and gene is None:
        warning = "Must provide gene and/or transcript"
        logger.warning(warning)
        return CoordsUtilsResponse(warnings=[warning])

    response = (
        await request.app.state.fusor.uta_tools.transcript_to_genomic_coordinates(
            gene=gene,
            transcript=transcript,
            exon_start=exon_start,
            exon_end=exon_end,
            exon_start_offset=exon_start_offset,
            exon_end_offset=exon_end_offset,
        )
    )
    warnings = response.warnings
    if warnings:
        return CoordsUtilsResponse(warnings=warnings)

    return CoordsUtilsResponse(coordinates_data=response.genomic_data)


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
    if start is None and end is None:
        warning = "Must provide start and/or end coordinates"
        logger.warning(warning)
        return CoordsUtilsResponse(warnings=[warning])

    if transcript is None and gene is None:
        warning = "Must provide gene and/or transcript"
        logger.warning(warning)
        return CoordsUtilsResponse(warnings=[warning])

    if strand is not None:
        try:
            strand_validated = get_strand(strand)
        except InvalidInputException:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return CoordsUtilsResponse(warnings=[warning])
    else:
        strand_validated = strand
    response = await request.app.state.fusor.uta_tools.genomic_to_transcript_exon_coordinates(  # noqa: E501
        chromosome=chromosome,
        start=start,
        end=end,
        strand=strand_validated,
        transcript=transcript,
        gene=gene,
    )
    warnings = response.warnings
    if warnings:
        return CoordsUtilsResponse(warnings=warnings)

    return CoordsUtilsResponse(coordinates_data=response.genomic_data)
