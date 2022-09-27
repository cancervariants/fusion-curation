"""Provide routes for autocomplete/term suggestion methods"""
from typing import Dict, Any

from fastapi import Query, APIRouter, Request

from curfu import ServiceWarning
from curfu.schemas import ResponseDict, AssociatedDomainResponse, SuggestGeneResponse


router = APIRouter()


@router.get(
    "/complete/gene",
    operation_id="suggestGene",
    response_model=SuggestGeneResponse,
    response_model_exclude_none=True,
)
def suggest_gene(request: Request, term: str = Query("")) -> ResponseDict:
    """Provide completion suggestions for term provided by user.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: entered gene term
    :return: JSON response with suggestions listed, or warnings if unable to
        provide suggestions.
    """
    response: ResponseDict = {"term": term}
    try:
        possible_matches = request.app.state.genes.suggest_genes(term)
        response.update(possible_matches)
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@router.get(
    "/complete/domain",
    operation_id="suggestDomain",
    response_model=AssociatedDomainResponse,
    response_model_exclude_none=True,
)
def suggest_domain(request: Request, gene_id: str = Query("")) -> ResponseDict:
    """Provide possible domains associated with a given gene to be selected by a user.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str gene_id: normalized gene concept ID
    :return: JSON response with a list of possible domain name and ID options, or
        warning(s) if relevant
    """
    response: Dict[str, Any] = {"gene_id": gene_id}
    try:
        possible_matches = request.app.state.domains.get_possible_domains(gene_id)
        response["suggestions"] = possible_matches
    except ServiceWarning:
        response["warnings"] = [f"No associated domains for {gene_id}"]
    return response
