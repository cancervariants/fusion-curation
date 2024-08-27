"""Provide routes for app utility endpoints"""

import tempfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import FileResponse
from gene import schemas as gene_schemas
from starlette.background import BackgroundTasks

from curfu import logger
from curfu.schemas import (
    CoordsUtilsResponse,
    GetTranscriptsResponse,
    RouteTag,
    SequenceIDResponse,
)

router = APIRouter()


@router.get(
    "/api/utilities/get_transcripts",
    operation_id="getMANETranscripts",
    response_model=GetTranscriptsResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.UTILITIES],
)
def get_mane_transcripts(request: Request, term: str) -> dict:
    """Get MANE transcripts for gene term.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param term: gene term provided by user
    :return: Dict containing transcripts if lookup succeeds, or warnings upon failure
    """
    normalized = request.app.state.fusor.gene_normalizer.normalize(term)
    if normalized.match_type == gene_schemas.MatchType.NO_MATCH:
        return {"warnings": [f"Normalization error: {term}"], "transcripts": None}
    if not normalized.normalized_id.startswith("hgnc"):
        return {"warnings": [f"No HGNC symbol: {term}"], "transcripts": None}
    symbol = normalized.gene.label
    transcripts = request.app.state.fusor.cool_seq_tool.mane_transcript_mappings.get_gene_mane_data(
        symbol
    )
    if not transcripts:
        return {"warnings": [f"No matching transcripts: {term}"]}
    return {"transcripts": transcripts}


@router.get(
    "/api/utilities/get_genomic",
    operation_id="getGenomicCoords",
    response_model=CoordsUtilsResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.UTILITIES],
)
async def get_genome_coords(
    request: Request,
    gene: str | None = None,
    transcript: str | None = None,
    exon_start: int | None = None,
    exon_end: int | None = None,
    exon_start_offset: int | None = None,
    exon_end_offset: int | None = None,
) -> CoordsUtilsResponse:
    """Convert provided exon positions to genomic coordinates
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param gene: gene symbol/ID on which exons lie
    :param transcript: transcript accession ID
    :param exon_start: starting exon number
    :param exon_end: ending exon number
    :param exon_start_offset: base offset count from starting exon
    :param exon_end_offset: base offset count from end exon
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
        warning = "No start param: exon_start_offset parameter requires explicit exon_start parameter"
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

    response = await request.app.state.fusor.cool_seq_tool.ex_g_coords_mapper.tx_segment_to_genomic(
        transcript=transcript,
        gene=gene,
        exon_start=exon_start,
        exon_end=exon_end,
        exon_start_offset=exon_start_offset,
        exon_end_offset=exon_end_offset,
    )
    warnings = response.errors
    if warnings:
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    return CoordsUtilsResponse(coordinates_data=response, warnings=None)


@router.get(
    "/api/utilities/get_exon",
    operation_id="getExonCoords",
    response_model=CoordsUtilsResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.UTILITIES],
)
async def get_exon_coords(
    request: Request,
    chromosome: str,
    start: int | None = None,
    end: int | None = None,
    gene: str | None = None,
    transcript: str | None = None,
) -> CoordsUtilsResponse:
    """Convert provided genomic coordinates to exon coordinates
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access FUSOR
        and UTA-associated tools.
    :param chromosome: chromosome, either as a number/X/Y or as an accession
    :param start: genomic start position
    :param end: genomic end position
    :param gene: gene symbol or ID
    :param transcript: transcript accession ID
    :return: response with exon coordinates if successful, or warnings if failed
    """
    warnings: list[str] = []
    if start is None and end is None:
        warnings.append("Must provide start and/or end coordinates")
    if transcript is None and gene is None:
        warnings.append("Must provide gene and/or transcript")
    if warnings:
        for warning in warnings:
            logger.warning(warning)
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    response = await request.app.state.fusor.cool_seq_tool.ex_g_coords_mapper.genomic_to_tx_segment(
        genomic_ac=chromosome,
        seg_start_genomic=start,
        seg_end_genomic=end,
        transcript=transcript,
        gene=gene,
    )
    warnings = response.errors
    if warnings:
        return CoordsUtilsResponse(warnings=warnings, coordinates_data=None)

    return CoordsUtilsResponse(coordinates_data=response, warnings=None)


@router.get(
    "/api/utilities/get_sequence_id",
    operation_id="getSequenceId",
    response_model=SequenceIDResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.UTILITIES],
)
async def get_sequence_id(request: Request, sequence: str) -> SequenceIDResponse:
    """Get GA4GH sequence ID and aliases given sequence sequence ID
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access FUSOR
        and UTA-associated tools.
    :param sequence_id: user-provided sequence identifier to translate
    :return: Response object with ga4gh ID and aliases
    """
    params: dict[str, Any] = {"sequence": sequence}
    sr = request.app.state.fusor.cool_seq_tool.seqrepo_access

    sr_ids, errors = sr.translate_identifier(sequence)
    if errors:
        params["warnings"] = [f"Identifier {sequence} could not be retrieved"]
        return SequenceIDResponse(**params)

    tmp_aliases = []
    for alias in sr_ids:
        if alias.startswith("ga4gh"):
            params["ga4gh_id"] = alias
        elif alias.startswith("refseq"):
            params["refseq_id"] = alias
        else:
            tmp_aliases.append(alias)

    # drop redundant IDs
    prefix_dict = {}
    for alias in tmp_aliases:
        if alias.startswith("NCBI") and params.get("refseq_id"):
            continue
        prefix = alias.split(":")[0]
        if prefix not in prefix_dict:
            prefix_dict[prefix] = alias
        else:
            existing_alias = prefix_dict[prefix].split(":")[1]
            if len(alias) > len(existing_alias):
                prefix_dict[prefix] = alias
    params["aliases"] = list(prefix_dict.values())

    return SequenceIDResponse(**params)


@router.get(
    "/api/utilities/download_sequence",
    summary="Get sequence for ID",
    description="Given a known accession identifier, retrieve sequence data and return as a FASTA file",
    response_class=FileResponse,
    tags=[RouteTag.UTILITIES],
)
async def get_sequence(
    request: Request,
    background_tasks: BackgroundTasks,
    sequence_id: str = Query(
        ..., description="ID of sequence to retrieve, sans namespace"
    ),
) -> FileResponse:
    """Get sequence for requested sequence ID.

    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access FUSOR
        and UTA-associated tools.
    :param background_tasks: Starlette background tasks object. Use to clean up
        tempfile after get method returns.
    :param sequence_id: accession ID, sans namespace, eg `NM_152263.3`
    :return: FASTA file if successful, or 404 if unable to find matching resource
    """
    _, path = tempfile.mkstemp(suffix=".fasta")
    try:
        request.app.state.fusor.cool_seq_tool.seqrepo_access.get_fasta_file(
            sequence_id, Path(path)
        )
    except KeyError as ke:
        resp = (
            request.app.state.fusor.cool_seq_tool.seqrepo_access.translate_identifier(
                sequence_id, "refseq"
            )
        )
        if len(resp[0]) < 1:
            raise HTTPException(
                status_code=404, detail="No sequence available for requested identifier"
            ) from ke
        try:
            new_seq_id = resp[0][0].split(":")[1]
            request.app.state.fusor.cool_seq_tool.get_fasta_file(new_seq_id, Path(path))
        except KeyError as e:
            raise HTTPException(
                status_code=404,
                detail="No sequence available for requested identifier",
            ) from e
    background_tasks.add_task(lambda p: Path(p).unlink(), path)
    return FileResponse(path, filename=f"{sequence_id}.FASTA")
