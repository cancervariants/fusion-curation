"""Provide routes for basic data lookup endpoints"""

from fastapi import APIRouter, Query, Request

from curfu import LookupServiceError
from curfu.schemas import (
    GetGeneTranscriptsResponse,
    NormalizeGeneResponse,
    ResponseDict,
    RouteTag,
)

router = APIRouter()


@router.get(
    "/api/lookup/gene",
    operation_id="normalizeGene",
    response_model=NormalizeGeneResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.LOOKUP],
)
def normalize_gene(request: Request, term: str = Query("")) -> NormalizeGeneResponse:
    """Normalize gene term provided by user.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access FUSOR
        and UTA-associated tools.
    :param term: gene symbol/alias/name/etc
    :return: JSON response with normalized ID if successful and warnings otherwise
    """
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
    """Get all transcripts for gene term.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str gene: gene term provided by user
    :return: Dict containing transcripts if lookup succeeds, or warnings upon failure
    """
    normalized = request.app.state.fusor.gene_normalizer.normalize(gene)
    symbol = normalized.gene.label
    transcripts = await request.app.state.fusor.cool_seq_tool.uta_db.get_transcripts(
        gene=symbol
    )
    tx_for_gene = list(transcripts.rows_by_key("tx_ac"))
    if transcripts.is_empty():
        return {"warnings": [f"No matching transcripts: {gene}"], "transcripts": []}
    return {"transcripts": tx_for_gene}
