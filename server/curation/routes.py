"""Provide FastAPI application and route declarations."""
from typing import Dict, Any, Union, List, Tuple

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from curation import APP_ROOT, ServiceWarning
from curation.version import __version__
from curation.schemas import NormalizeGeneResponse, SuggestGeneResponse, \
    DomainIDResponse, ExonCoordsRequest, ExonCoordsResponse, SequenceIDResponse, \
    FusionValidationResponse, SuggestDomainResponse
from curation.gene_services import get_gene_id, get_possible_genes
from curation.domain_services import get_domain_id, get_possible_domains
from curation.uta_services import postgres_instance, get_genomic_coords
from curation.sequence_services import get_ga4gh_sequence_id
from curation.validation_services import validate_fusion


app = FastAPI(version=__version__)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Initialize asyncpg thread pool."""
    await postgres_instance.create_pool()
    app.state.db = postgres_instance


@app.on_event("shutdown")
async def shutdown():
    """Clean up thread pool."""
    await app.state.db._connection_pool.close()


ResponseDict = Dict[str, Union[str, List[str], List[Tuple[str, str]]]]


@app.get("/lookup/gene",
         operation_id="normalizeGene",
         response_model=NormalizeGeneResponse)
def normalize_gene(term: str = Query("")) -> ResponseDict:
    """Normalize gene term provided by user.
    :param str term: gene symbol/alias/name/etc
    :return: JSON response with normalized ID if successful and warnings otherwise
    """
    response: ResponseDict = {
        "term": term,
    }
    try:
        concept_id = get_gene_id(term.strip())
        response["concept_id"] = concept_id
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@app.get('/complete/gene',
         operation_id='suggestGene',
         response_model=SuggestGeneResponse,
         response_model_exclude_none=True)
def suggest_gene(term: str = Query('')) -> ResponseDict:
    """Provide completion suggestions for term provided by user.
    :param str term: entered gene term
    :return: JSON response with suggestions listed, or warnings if unable to
        provide suggestions.
    """
    response: ResponseDict = {
        'term': term,
    }
    try:
        possible_matches = get_possible_genes(term)
        response["suggestions"] = possible_matches
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@app.get("/lookup/domain",
         operation_id="getDomainID",
         response_model=DomainIDResponse,
         response_model_exclude_none=True)
def fetch_domain_id(domain: str = Query("")) -> ResponseDict:
    """Fetch interpro ID given functional domain name.
    :param str name: name of functional domain
    :return: Dict (to be served as JSON) containing provided name, ID (as CURIE) if
        available, and relevant warnings
    """
    response: ResponseDict = {"domain": domain}
    try:
        domain_id = get_domain_id(domain.strip())
        response["domain_id"] = domain_id
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@app.get("/complete/domain",
         operation_id="suggestDomain",
         response_model=SuggestDomainResponse,
         response_model_exclude_none=True)
def suggest_domain(term: str = Query("")) -> ResponseDict:
    """Provide completion suggestions for domain term provided by user.
    :param str term: text typed by user in domain field
    :return: JSON response with suggestions listed, or warnings if unable to
        provide suggestions.
    """
    response: Dict[str, Any] = {"term": term}
    possible_matches = get_possible_domains(term)
    if len(possible_matches) < 25:
        response["suggestions"] = possible_matches
    else:
        response["warnings"] = ["Max suggestions exceeded"]
    return response


@app.post('/lookup/coords',
          operation_id='getExonCoords',
          response_model=ExonCoordsResponse,
          response_model_exclude_none=True)
async def get_exon_coords(request: Request, exon_data: ExonCoordsRequest)\
        -> ResponseDict:
    """Fetch a transcript"s exon information.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        DB retrieval methods by way of the `state` property.
    :param ExonCoordsRequest exon_data: exon data to retrieve coordinates for. See
        schemas for expected structure.
    :return: Dict served as JSON containing transcript"s exon information
    """
    if not exon_data.gene:
        exon_data.gene = ""

    try:
        genomic_coords = await get_genomic_coords(request.app.state.db,
                                                  exon_data.tx_ac,
                                                  exon_data.exon_start,
                                                  exon_data.exon_end,
                                                  exon_data.exon_start_offset,
                                                  exon_data.exon_end_offset,
                                                  exon_data.gene)
    except ServiceWarning as e:
        return {"warnings": [str(e)]}
    genomic_coords["gene_id"] = get_gene_id(genomic_coords["gene"])[0]
    genomic_coords["sequence_id"] = get_ga4gh_sequence_id(genomic_coords["chr"])[0]
    genomic_coords["tx_ac"] = exon_data.tx_ac
    genomic_coords["warnings"] = []
    return genomic_coords


@app.get("/lookup/sequence_id",
         operation_id="getSequenceID",
         response_model=SequenceIDResponse,
         response_model_exclude_none=True)
def get_sequence_id(input_sequence: str) -> ResponseDict:
    """Get GA4GH sequence ID CURIE for input sequence.
    :param str input_sequence: user-submitted sequence to retrieve ID for
    :return: Dict (served as JSON) containing either GA4GH sequence ID or
        warnings if unable to retrieve ID
    """
    response: ResponseDict = {"sequence": input_sequence}
    try:
        sequence_id = get_ga4gh_sequence_id(input_sequence.strip())
        response["sequence_id"] = sequence_id
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@app.post("/lookup/validate",
          operation_id="validateFusion",
          response_model=FusionValidationResponse)
def validate_object(proposed_fusion: Dict) -> Dict:
    """Validate constructed Fusion object. Return warnings if invalid.
    No arguments supplied, but receives a POSTed JSON payload via Flask request context.
    :return: Dict served as JSON with validated Fusion object if correct, and empty
        Object + a list of Warnings if not.
    """
    return validate_fusion(proposed_fusion)


app.mount("/", StaticFiles(html=True, directory=APP_ROOT / "build"))
