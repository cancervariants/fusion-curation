"""Provide routes for basic data lookup endpoints"""
from fastapi import Query, Request, APIRouter
from pydantic import ValidationError
from fusor.models import DomainStatus

from curation import ServiceWarning
from curation.schemas import (
    ResponseDict,
    NormalizeGeneResponse,
    GetDomainResponse,
)


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
    response: ResponseDict = {
        "term": term,
    }
    try:
        concept_id, symbol = request.app.state.genes.get_normalized_gene(
            term.strip(), request.app.state.fusor.gene_normalizer
        )
        response["concept_id"] = concept_id
        response["symbol"] = symbol
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@router.get(
    "/lookup/domain",
    operation_id="getDomain",
    response_model=GetDomainResponse,
    response_model_exclude_none=True,
)
def get_domain(
    request: Request,
    status: DomainStatus,
    name: str,
    domain_id: str,
    gene_id: str,
    sequence_id: str,
    start: int,
    end: int,
) -> ResponseDict:
    """Construct complete functional domain object given constitutive parameters.

    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param DomainStatus status: status of domain
    :param str name: domain name (should match InterPro entry but not validated here)
    :param str domain_id: InterPro ID (expected to be formatted as a CURIE)
    :param str gene_id: normalized gene ID (expected to be formatted as a CURIE)
    :param str sequence_id: associated protein sequence ID (expected to be refseq-style,
        but not validated, and namespace shouldn't be included)
    :param int start: the domain's protein start position
    :param int end: the domain's protein end position
    """
    response: ResponseDict = {}
    try:
        domain, warnings = request.app.state.fusor.functional_domain(
            status, name, domain_id, gene_id, sequence_id, start, end
        )
        if warnings:
            response["warnings"] = [warnings]
        else:
            response["domain"] = domain
    except ValidationError as e:
        response["warnings"] = [f"Unable to construct Functional Domain: {e}"]
    return response
