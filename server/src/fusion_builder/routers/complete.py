"""Provide routes for autocomplete/term suggestion methods"""

from typing import Annotated, Any

from fastapi import APIRouter, Query, Request

from fusion_builder import MAX_SUGGESTIONS, LookupServiceError
from fusion_builder.schemas import (
    AssociatedDomainResponse,
    ResponseDict,
    RouteTag,
    SuggestGeneResponse,
)

router = APIRouter()


@router.get(
    "/api/complete/gene",
    operation_id="suggestGene",
    response_model=SuggestGeneResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.COMPLETION],
)
def suggest_gene(request: Request, term: Annotated[str, Query("")]) -> ResponseDict:
    """Provide completion suggestions for term provided by user."""
    response: ResponseDict = {"term": term}
    possible_matches = request.app.state.genes.suggest_genes(term)
    n = (
        len(possible_matches["concept_id"])
        + len(possible_matches["symbol"])
        + len(possible_matches["prev_symbols"])
        + len(possible_matches["aliases"])
    )

    response["matches_count"] = n
    if n > MAX_SUGGESTIONS:
        warn = f"Exceeds max matches: Got {n} possible matches for {term} (limit: {MAX_SUGGESTIONS})"
        response["warnings"] = [warn]
        term_upper = term.upper()
        for match_type in ("concept_id", "symbol", "prev_symbols", "aliases"):
            reduced = [
                m for m in possible_matches[match_type] if m[0].upper() == term_upper
            ]
            possible_matches[match_type] = reduced
    response.update(possible_matches)
    return response


@router.get(
    "/api/complete/domain",
    operation_id="suggestDomain",
    response_model=AssociatedDomainResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.COMPLETION],
)
def suggest_domain(
    request: Request, gene_id: Annotated[str, Query("")]
) -> ResponseDict:
    """Provide possible domains associated with a given gene to be selected by a user."""
    response: dict[str, Any] = {"gene_id": gene_id}
    try:
        possible_matches = request.app.state.domains.get_possible_domains(gene_id)
        response["suggestions"] = possible_matches
    except LookupServiceError:
        response["warnings"] = [f"No associated domains for {gene_id}"]
    return response
