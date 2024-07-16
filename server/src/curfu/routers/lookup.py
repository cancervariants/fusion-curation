"""Provide routes for basic data lookup endpoints"""
from fastapi import APIRouter, Query, Request

from curfu import LookupServiceError
from curfu.schemas import NormalizeGeneResponse, ResponseDict, RouteTag

router = APIRouter()


@router.get(
    "/api/lookup/gene",
    operation_id="normalizeGene",
    response_model=NormalizeGeneResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.LOOKUP],
)
def normalize_gene(request: Request, term: str = Query("")) -> ResponseDict:
    """Normalize gene term provided by user.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene symbol/alias/name/etc
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
    return response
