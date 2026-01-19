"""Provide routes for basic data lookup endpoints"""

from typing import Annotated

from fastapi import APIRouter, Query, Request

from fusion_builder import LookupServiceError
from fusion_builder.schemas import (
    GetGeneTranscriptsResponse,
    NormalizeGeneResponse,
    ResponseDict,
    RouteTag,
)

router = APIRouter()


@router.get(
    "/api/lookup/gene",
    operation_id="normalizeGene",
    response_model_exclude_none=True,
    tags=[RouteTag.LOOKUP],
)
def normalize_gene(
    request: Request, term: Annotated[str, Query()] = ""
) -> NormalizeGeneResponse:
    """Normalize gene term provided by user."""
    response: ResponseDict = {"term": term}
    try:
        concept_id, symbol, cased = request.app.state.genes.get_normalized_gene(
            term.strip(), request.app.state.fusor.gene_normalizer
        )
        response["concept_id"] = concept_id
        response["symbol"] = symbol
        response["cased"] = cased
    except LookupServiceError as e:
        response["warnings"] = [str(e)]
        response["concept_id"] = None
        response["symbol"] = None
        response["cased"] = None
    return NormalizeGeneResponse(**response)


@router.get(
    "/api/utilities/get_transcripts_for_gene",
    operation_id="getTranscriptsFromGene",
    response_model=GetGeneTranscriptsResponse,
    response_model_exclude_none=True,
)
async def get_transcripts_for_gene(request: Request, gene: str) -> dict:
    """Get all transcripts for gene term."""
    normalized = request.app.state.fusor.gene_normalizer.normalize(gene)
    symbol = normalized.gene.name
    transcripts = await request.app.state.fusor.cool_seq_tool.uta_db.get_transcripts(
        gene=symbol
    )
    tx_for_gene = list(transcripts.rows_by_key("tx_ac"))
    if transcripts.is_empty():
        return {"warnings": [f"No matching transcripts: {gene}"], "transcripts": []}
    return {"transcripts": tx_for_gene}
