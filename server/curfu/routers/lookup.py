"""Provide routes for basic data lookup endpoints"""
from fastapi import Query, Request, APIRouter

from curfu import ServiceWarning
from curfu.schemas import ResponseDict, NormalizeGeneResponse


router = APIRouter()


@router.get(
    "/lookup/gene",
    operation_id="normalizeGene",
    response_model=NormalizeGeneResponse,
    response_model_exclude_none=True,
)
def normalize_gene(request: Request, term: str = Query("")) -> ResponseDict:
    """Normalize gene term provided by user.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene symbol/alias/name/etc
    :return: JSON response with normalized ID if successful and warnings otherwise
    """
    response: ResponseDict = {"term": term}
    try:
        concept_id, symbol = request.app.state.genes.get_normalized_gene(
            term.strip(), request.app.state.fusor.gene_normalizer
        )
        response["concept_id"] = concept_id
        response["symbol"] = symbol
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response
