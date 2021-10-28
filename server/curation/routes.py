"""Provide FastAPI application and route declarations."""
from typing import Dict, Any, Union, List, Tuple, Optional

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ga4gh.vrsatile.pydantic.vrsatile_model import CURIE
from fusor import FUSOR
from fusor.models import Strand


from curation import APP_ROOT, ServiceWarning, logger
from curation.version import __version__
from curation.schemas import GeneComponentResponse, TxSegmentComponentResponse, \
    TemplatedSequenceComponentResponse
from curation.schemas import NormalizeGeneResponse, SuggestGeneResponse, \
    FusionValidationResponse, AssociatedDomainResponse
from curation.gene_services import get_gene_id, suggest_genes
from curation.domain_services import get_possible_domains
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
    """Initialize asyncpg connection pool."""
    fusor_instance = FUSOR()
    await fusor_instance.uta_tools.uta_db.create_pool()
    app.state.fusor = fusor_instance


@app.on_event("shutdown")
async def shutdown():
    """Clean up thread pool."""
    await app.state.fusor.uta_tools.uta_db._connection_pool.close()


ResponseDict = Dict[str, Union[str,
                               CURIE,
                               List[str],
                               List[Tuple[str, str, str, str]]]]
Warnings = List[str]


@app.get("/component/gene",
         operation_id="buildGeneComponent",
         response_model=GeneComponentResponse,
         response_model_exclude_none=True)
def build_gene_component(request: Request, term: str = Query("")) \
        -> GeneComponentResponse:
    """Construct valid gene component given user-provided term.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene symbol/alias/name/etc
    :return: Pydantic class with gene component if successful and warnings otherwise
    """
    gene_component, warnings = request.app.state.fusor.gene_component(term)
    if not warnings:
        warnings_l = []
    else:
        warnings_l = [warnings]
    return GeneComponentResponse(component=gene_component, warnings=warnings_l)


@app.get("/component/tx_segment_tx_to_g",
         operation_id="buildTranscriptSegmentComponent",
         response_model=TxSegmentComponentResponse,
         response_model_exclude_none=True)
async def build_tx_to_g_segment_component(request: Request,
                                          transcript: str,
                                          gene: Optional[str] = Query(None),
                                          exon_start: Optional[int] = Query(None),
                                          exon_start_offset: int = Query(0),
                                          exon_end: Optional[int] = Query(None),
                                          exon_end_offset: int = Query(0)) \
        -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing transcript/exon numbers.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param Optional[str] gene: name of gene
    :param Optional[int] exon_start: number of starting exon, 0 by default
    :param int exon_start_offset: offset from starting exon
    :param Optional[int] exon_end: number of ending exon
    :param int exon_end_offset: offset from ending exon, 0 by default
    :return: Pydantic class with TranscriptSegment component if successful, and warnings
        otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        transcript=transcript,
        gene=gene,
        exon_start=exon_start,
        exon_start_offset=exon_start_offset,
        exon_end=exon_end,
        exon_end_offset=exon_end_offset
    )
    return TxSegmentComponentResponse(component=tx_segment, warnings=warnings)


@app.get("/component/templated_sequence",
         operation_id="buildTemplatedSequenceComponent",
         response_model=TemplatedSequenceComponentResponse,
         response_model_exclude_none=True)
def build_templated_sequence_component(request: Request, start: int, end: int,
                                       sequence_id: str, strand: str) \
        -> TemplatedSequenceComponentResponse:
    """Construct templated sequence component
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param int start: genomic starting position
    :param int end: genomic ending position
    :param str sequence_id: chromosome accession for sequence
    :param str strand: chromosome strand - must be one of {'+', '-'}
    :return: Pydantic class with Templated Sequnce component if successful, or warnings
        otherwise
    """
    try:
        strand_n = Strand(strand)
    except ValueError:
        warning = f"Received invalid strand value: {strand}"
        logger.warning(warning)
        return TemplatedSequenceComponentResponse(warnings=[warning])
    component = request.app.state.fusor.templated_sequence_component(
        start=start, end=end, sequence_id=sequence_id, strand=strand_n,
        add_location_id=True
    )
    return TemplatedSequenceComponentResponse(component=component, warnings=[])


@app.get("/lookup/gene",
         operation_id="normalizeGene",
         response_model=NormalizeGeneResponse,
         response_model_exclude_none=True)
def normalize_gene(term: str = Query("")) -> ResponseDict:
    """Normalize gene term provided by user.
    :param str term: gene symbol/alias/name/etc
    :return: JSON response with normalized ID if successful and warnings otherwise
    """
    response: ResponseDict = {
        "term": term,
    }
    try:
        concept_id, symbol = get_gene_id(term.strip())
        response["concept_id"] = concept_id
        response["symbol"] = symbol
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
    response: ResponseDict = {'term': term}
    try:
        possible_matches = suggest_genes(term)
        response["suggestions"] = possible_matches
    except ServiceWarning as e:
        response["warnings"] = [str(e)]
    return response


@app.get("/complete/domain",
         operation_id="suggestDomain",
         response_model=AssociatedDomainResponse,
         response_model_exclude_none=True)
def get_domain_suggestions(gene_id: str = Query("")) -> ResponseDict:
    """Provide possible domains associated with a given gene to be selected by a user.
    :param str gene_id: normalized gene concept ID
    :return: JSON response with a list of possible domain name and ID options, or
        warning(s) if relevant
    """
    response: Dict[str, Any] = {"gene_id": gene_id}
    try:
        possible_matches = get_possible_domains(gene_id)
        response["suggestions"] = possible_matches
    except ServiceWarning:
        response["warnings"] = [f"No associated domains for {gene_id}"]
    return response


@app.post("/lookup/validate",
          operation_id="validateFusion",
          response_model=FusionValidationResponse,
          response_model_exclude_none=True)
def validate_object(proposed_fusion: Dict) -> Dict:
    """Validate constructed Fusion object. Return warnings if invalid.
    No arguments supplied, but receives a POSTed JSON payload via Flask request context.
    :return: Dict served as JSON with validated Fusion object if correct, and empty
        Object + a list of Warnings if not.
    """
    return validate_fusion(proposed_fusion)


app.mount("/", StaticFiles(html=True, directory=APP_ROOT / "build"))
