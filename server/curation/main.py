"""Initialize FastAPI and provide routes."""
from typing import Dict, Any

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from curation import APP_ROOT
from curation.version import __version__
from curation.schemas import NormalizeGeneResponse, DomainIDResponse, SuggestDomainResponse, \
    ExonCoordsRequest, ExonCoordsResponse, SequenceIDResponse, FusionValidationResponse
from curation.gene_services import get_gene_id
from curation.domain_services import get_domain_id, get_domain_matches
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

@app.on_event('startup')
async def startup():
    """Initialize asyncpg thread pool."""
    await postgres_instance.create_pool()
    app.state.db = postgres_instance


@app.get('/lookup/gene',
         operation_id='normalizeGene',
         response_model=NormalizeGeneResponse)
def normalize_gene(term: str = Query('')) -> Dict:
    """Normalize gene term provided by user.
    :param str term: gene symbol/alias/name/etc
    :return: JSON response with normalized ID if successful and warnings otherwise
    """
    concept_id, warnings = get_gene_id(term.strip())
    return {
        'term': term,
        'concept_id': concept_id,
        'warnings': warnings
    }


@app.get('/lookup/domain',
         operation_id='getDomainID',
         response_model=DomainIDResponse)
def fetch_domain_id(domain: str = Query('')) -> Dict:
    """Fetch interpro ID given functional domain name.
    :param str name: name of functional domain
    :return: Dict (to be served as JSON) containing provided name, ID (as CURIE) if available,
        and relevant warnings
    """
    (domain_id, warnings) = get_domain_id(domain.strip())
    print(domain_id)
    return {
        'domain': domain,
        'domain_id': domain_id,
        'warnings': warnings
    }


@app.get('/complete/domain',
         operation_id='suggestDomain',
         response_model=SuggestDomainResponse,
         response_model_exclude_none=True)
def suggest_domain(term: str = Query('')) -> Dict:
    """Provide completion suggestions for domain term provided by user.
    :param str term: text typed by user in domain field
    :return: JSON response with suggestions listed, or warnings if unable to
        provide suggestions.
    """
    response: Dict[str, Any] = {
        'term': term,
    }
    possible_matches = get_domain_matches(term)
    if len(possible_matches) < 25:
        response['suggestions'] = possible_matches
    else:
        response['warnings'] = ['Max suggestions exceeded']
    return response


@app.post('/lookup/coords',
          operation_id='getExonCoords',
          response_model=ExonCoordsResponse)
async def get_exon_coords(request: Request, exon_data: ExonCoordsRequest) -> Dict:
    """Fetch a transcript's exon information.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access DB
        retrieval methods by way of the `state` property.
    :param ExonCoordsRequest exon_data: exon data to retrieve coordinates for. See schemas for
        expected structure.
    :return: Dict served as JSON containing transcript's exon information
    """
    print(exon_data)
    if not exon_data.gene:
        exon_data.gene = ''

    genomic_coords = await get_genomic_coords(request.app.state.db, exon_data.tx_ac,
                                              exon_data.exon_start,
                                              exon_data.exon_end,
                                              exon_data.exon_start_offset,
                                              exon_data.exon_end_offset, exon_data.gene)

    if genomic_coords:
        genomic_coords['gene_id'] = get_gene_id(genomic_coords['gene'])[0]
        genomic_coords['sequence_id'] = get_ga4gh_sequence_id(genomic_coords['chr'])[0]
        genomic_coords['tx_ac'] = exon_data.tx_ac
        genomic_coords['warnings'] = []
        return genomic_coords
    else:
        return {'warnings': ['Coordinate retrieval failed.']}


@app.get('/lookup/sequence_id',
         operation_id='getSequenceID',
         response_model=SequenceIDResponse)
def get_sequence_id(input_sequence: str) -> Dict:
    """Get GA4GH sequence ID CURIE for input sequence.
    :param str input_sequence: user-submitted sequence to retrieve ID for
    :return: Dict (served as JSON) containing either GA4GH sequence ID or
        warnings if unable to retrieve ID
    """
    (sequence_id, warnings) = get_ga4gh_sequence_id(input_sequence.strip())
    return {
        'sequence': input_sequence,
        'sequence_id': sequence_id,
        'warnings': warnings
    }


@app.post('/lookup/validate',
          operation_id='validateFusion',
          response_model=FusionValidationResponse)
def validate_object(proposed_fusion: Dict) -> Dict:
    """Validate constructed Fusion object. Return warnings if invalid.
    No arguments supplied, but receives a POSTed JSON payload via Flask request context.
    :return: Dict served as JSON with validated Fusion object if correct, and empty
        Object + a list of Warnings if not.
    """
    return validate_fusion(proposed_fusion)


app.mount('/', StaticFiles(html=True, directory=APP_ROOT / 'build'))


if __name__ == '__main__':
    uvicorn.run("curation.main:app", port=5000, reload=True)
