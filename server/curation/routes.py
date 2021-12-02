"""Provide FastAPI application and route declarations."""
from typing import Dict, Any, Union, List, Tuple, Optional

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError
from ga4gh.vrsatile.pydantic.vrsatile_models import CURIE
from fusor import FUSOR
from fusor.models import Strand, FunctionalDomain, DomainStatus
from gene.schemas import MatchType

from curation import APP_ROOT, ServiceWarning, logger
from curation.version import __version__
from curation.schemas import GeneComponentResponse, TxSegmentComponentResponse, \
    TemplatedSequenceComponentResponse, FusionValidationResponse, \
    AssociatedDomainResponse, NormalizeGeneResponse, SuggestGeneResponse, \
    GetTranscriptsResponse, ServiceInfoResponse, GetDomainResponse
from curation.gene_services import GeneService
from curation.domain_services import DomainService
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


async def start_fusor() -> FUSOR:
    """Initialize FUSOR instance and create UTA thread pool.

    :return: FUSOR instance
    """
    fusor_instance = FUSOR()
    await fusor_instance.uta_tools.uta_db.create_pool()
    return fusor_instance


def get_gene_services() -> GeneService:
    """Initialize gene services instance. Retrieve and load mappings.

    :return: GeneService instance
    """
    gene_services = GeneService()
    gene_services.load_mapping()
    return gene_services


def get_domain_services() -> DomainService:
    """Initialize domain services instance. Retrieve and load mappings.

    :return: DomainService instance
    """
    domain_service = DomainService()
    domain_service.load_mapping()
    return domain_service


@app.on_event("startup")
async def startup():
    """Get FUSOR reference"""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()


@app.on_event("shutdown")
async def shutdown():
    """Clean up thread pool."""
    await app.state.fusor.uta_tools.uta_db._connection_pool.close()


ResponseDict = Dict[str, Union[str,
                               CURIE,
                               List[str],
                               List[Tuple[str, str, str, str]],
                               FunctionalDomain]]
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


@app.get("/component/tx_segment_ect",
         operation_id="buildTranscriptSegmentComponentECT",
         response_model=TxSegmentComponentResponse,
         response_model_exclude_none=True)
async def build_tx_segment_ect(request: Request,
                               transcript: str,
                               exon_start: Optional[int] = Query(None),
                               exon_start_offset: int = Query(0),
                               exon_end: Optional[int] = Query(None),
                               exon_end_offset: int = Query(0)) \
        -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing transcript and exon
        coordinates. Either exon_start or exon_end are required.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param Optional[int] exon_start: number of starting exon, 0 by default
    :param int exon_start_offset: offset from starting exon
    :param Optional[int] exon_end: number of ending exon
    :param int exon_end_offset: offset from ending exon, 0 by default
    :return: Pydantic class with TranscriptSegment component if successful, and warnings
        otherwise.
    """
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        transcript=transcript,
        exon_start=exon_start,
        exon_start_offset=exon_start_offset,
        exon_end=exon_end,
        exon_end_offset=exon_end_offset
    )
    return TxSegmentComponentResponse(component=tx_segment, warnings=warnings)


@app.get("/component/tx_segment_gct",
         operation_id="buildTranscriptSegmentComponentGCT",
         response_model=TxSegmentComponentResponse,
         response_model_exclude_none=True)
async def build_tx_segment_gct(request: Request,
                               transcript: str,
                               chromosome: str,
                               start: Optional[int] = Query(None),
                               end: Optional[int] = Query(None),
                               strand: Optional[str] = Query(None)) \
        -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing transcript and genomic
    coordinates (chromosome, start, end positions).
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str transcript: transcript accession identifier
    :param str chromosome: chromosome (TODO how to identify?)
    :param int start: starting position (TODO assume residue-based?)
    :param int end: ending position
    :return: Pydantic class with TranscriptSegment component if successful, and
        warnings otherwise.
    """
    if strand:
        if strand == '+':
            strand_n = 1
        elif strand == '-':
            strand_n = -1
        else:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return TxSegmentComponentResponse(warnings=[warning])
    else:
        strand_n = None
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        tx_to_genomic_coords=False,
        transcript=transcript,
        chromosome=chromosome,
        start=start,
        end=end,
        strand=strand_n
    )
    return TxSegmentComponentResponse(component=tx_segment, warnings=warnings)


@app.get("/component/tx_segment_gcg",
         operation_id="buildTranscriptSegmentComponentGCG",
         response_model=TxSegmentComponentResponse,
         response_model_exclude_none=True)
async def build_tx_segment_gcg(request: Request,
                               gene: str,
                               chromosome: str,
                               start: Optional[int] = Query(None),
                               end: Optional[int] = Query(None),
                               strand: Optional[str] = Query(None)) \
        -> TxSegmentComponentResponse:
    """Construct Transcript Segment component by providing gene and genomic
    coordinates (chromosome, start, end positions).
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str gene: gene (TODO how to identify?)
    :param str chromosome: chromosome (TODO how to identify?)
    :param int start: starting position (TODO assume residue-based?)
    :param int end: ending position
    :return: Pydantic class with TranscriptSegment component if successful, and
        warnings otherwise.
    """
    if strand:
        if strand == '+':
            strand_n = 1
        elif strand == '-':
            strand_n = -1
        else:
            warning = f"Received invalid strand value: {strand}"
            logger.warning(warning)
            return TxSegmentComponentResponse(warnings=[warning])
    else:
        strand_n = None
    tx_segment, warnings = await request.app.state.fusor.transcript_segment_component(
        tx_to_genomic_coords=False,
        gene=gene,
        chromosome=chromosome,
        strand=strand_n,
        start=start,
        end=end
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
        concept_id, symbol = app.state.genes.get_normalized_gene(
            term.strip(),
            request.app.state.fusor.gene_normalizer
        )
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
        possible_matches = app.state.genes.suggest_genes(term)
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
        possible_matches = app.state.domains.get_possible_domains(gene_id)
        response["suggestions"] = possible_matches
    except ServiceWarning:
        response["warnings"] = [f"No associated domains for {gene_id}"]
    return response


@app.get("/lookup/domain",
         operation_id="getDomain",
         response_model=GetDomainResponse,
         response_model_exclude_none=True)
def get_domain(status: DomainStatus, name: str, domain_id: str, gene_id: str,
               sequence_id: str, start: int, end: int) -> ResponseDict:
    """Construct complete functional domain object given constitutive parameters.

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
        domain, warnings = app.state.fusor.functional_domain(
            status, name, domain_id, gene_id, sequence_id, start, end
        )
        if warnings:
            response["warnings"] = [warnings]
        else:
            response["domain"] = domain
    except ValidationError as e:
        response["warnings"] = [f"Unable to construct Functional Domain: {e}"]
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


@app.get("/utilities/get_transcripts",
         operation_id="getMANETranscripts",
         response_model=GetTranscriptsResponse,
         response_model_exclude_none=True)
def get_mane_transcripts(request: Request, term: str) -> Dict:
    """Get MANE transcripts for gene term.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param str term: gene term provided by user
    :return: Dict containing transcripts if lookup succeeds, or warnings upon failure
    """
    normalized = request.app.state.fusor.gene_normalizer.normalize(term)
    if normalized.match_type == MatchType.NO_MATCH:
        return {"warnings": [f"Normalization error: {term}"]}
    elif not normalized.gene_descriptor.gene_id.lower().startswith('hgnc'):
        return {"warnings": [f"No HGNC symbol: {term}"]}
    symbol = normalized.gene_descriptor.label
    transcripts = (request.app.state
                   .fusor
                   .uta_tools
                   .mane_transcript_mappings
                   .get_gene_mane_data(symbol))
    if not transcripts:
        return {"warnings": [f"No matching transcripts: {term}"]}
    else:
        return {"transcripts": transcripts}


@app.get("/service_info",
         operation_id="serviceInfo",
         response_model=ServiceInfoResponse)
def get_service_info() -> Dict:
    """Return service info."""
    return {"version": __version__}


app.mount("/", StaticFiles(html=True, directory=APP_ROOT / "build"))
