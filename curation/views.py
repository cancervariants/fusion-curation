"""Provide Views for curation application."""
from typing import Dict
from curation import app
from flask import render_template, request
from curation.uta_services import uta
from curation.gene_services import gene_service
from curation.validation_services import validate_fusion
from curation.domain_services import domain_service
from curation.sequence_services import get_ga4gh_sequence_id
import logging


logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)


@app.route('/', methods=['GET'])
def serve_static() -> str:
    """Provide generated static site at root address."""
    return render_template('index.html')


@app.route('/gene/<symbol>')
def normalize_gene(symbol: str) -> Dict:
    """Fetch normalized concept ID given provided gene symbol.
    :param str symbol: gene symbol
    :return: Dict (to be served as JSON) containing gene symbol, ID (as CURIE) if available, and
        any relevant warnings
    """
    response = {
        'symbol': symbol,
        'warnings': [],
        'concept_id': ''
    }
    try:
        concept_id = gene_service.get_gene_id(symbol)
        response['concept_id'] = concept_id
    except LookupError:
        msg = f'Lookup of gene symbol {symbol} failed.'
        logger.warning(msg)
        response['warnings'].append(msg)
    except Exception as e:
        msg = f'Lookup of gene symbol `{symbol}` failed with exception {e}.'
        logger.warning(msg)
        response['warnings'].append(msg)
    return response


@app.route('/domain/<name>')
def get_functional_domain(name: str) -> Dict:
    """Fetch interpro ID given functional domain name.
    :param str name: name of functional domain
    :return: Dict (to be served as JSON) containing provided name, ID (as CURIE) if available,
        and relevant warnings
    """
    response = {
        'name': name,
        'warnings': []
    }
    try:
        domain_id = domain_service.get_domain_id(name)
        response['domain_id'] = domain_id
    except LookupError:
        msg = f'Lookup of domain {name} failed.'
        logger.warning(msg)
        response['warnings'].append(msg)
    except Exception as e:
        msg = f'Lookup of domain `{name}` failed with exception {e}.'
        logger.warning(msg)
        response['warnings'].append(msg)
    return response


@app.route('/domain_matches/<query>')
def get_matching_domain_names(query: str) -> Dict:
    """Get valid functional domain names that start with the provided query. For autocomplete
        purposes.
    :param str query: user-entered query
    :return: Dict (to be served as JSON) containing provided query and matches for possible valid
        functional domain names
    """
    return {
        'query': query,
        'matches': domain_service.get_possible_matches(query)
    }


@app.route('/coordinates', methods=['POST'])
def get_exon() -> Dict:
    """Fetch a transcript's exon information. Takes no arguments, but acquires POSTed JSON payload
    from the Flask request context. The POSTed object should be structured like so:
        {
            "tx_ac": "<str>",
            "gene": "<str, optional>",
            "exon_start": "<int, optional>",
            "exon_end": <int, optional>",
            "exon_start_offset": <int, optional>",
            "exon_end_offset": <int, optional>"
        }
    :return: Dict served as JSON containing transcript's exon information
    """
    response = {
        'tx_ac': None,
        'gene': None,
        'exon_start': None,
        'exon_end': None,
        'chr': None,
        'start': None,
        'end': None,
        'warnings': [],
    }
    r = request.json
    if r is None:
        warn = 'Unable to parse received POST payload to /coordinates'
        logger.warning(warn)
        response['warnings'].append(warn)
        return response

    warnings = []
    for field in ('exon_start', 'exon_end', 'exon_start_offset', 'exon_end_offset'):
        if not r.get(field):
            r[field] = 0
        if not isinstance(r[field], int):
            warnings += [f'{field} expects int, got {type(r[field])} instead']
    if warnings:
        return response

    gene = r.get('gene')
    if gene is None:
        gene = ''

    genomic_coords = uta.get_genomic_coords(r['tx_ac'], r['exon_start'], r['exon_end'],
                                            r['exon_start_offset'], r['exon_end_offset'],
                                            gene)
    if genomic_coords:
        gene = genomic_coords.get('gene', '')
        response['gene'] = gene
        response['gene_id'] = normalize_gene(gene)['concept_id']
        chr = genomic_coords.get('chr', '')
        response['chr'] = chr
        sequence_id = get_sequence_id(chr)
        response['sequence_id'] = sequence_id['sequence_id']
        response['start'] = genomic_coords.get("start", None)
        response['end'] = genomic_coords.get('end', None)
        response['exon_start'] = genomic_coords.get('start_exon', None)
        response['exon_end'] = genomic_coords.get('end_exon', None)
        return response
    else:
        return {}


@app.route('/sequence/<input_sequence>')
def get_sequence_id(input_sequence: str) -> Dict:
    """Get GA4GH sequence ID CURIE for input sequence.
    :param str input_sequence: user-submitted sequence to retrieve ID for
    :return: Dict (served as JSON) containing either GA4GH sequence ID or
        warnings if unable to retrieve ID
    """
    response = {
        'sequence_id': '',
        'warnings': [],
    }
    try:
        response['sequence_id'] = get_ga4gh_sequence_id(input_sequence)
    except (KeyError, IndexError) as e:
        msg = f'Unable to retrieve ga4gh sequence ID for {input_sequence}: {e}'
        logger.warning(msg)
        response['warnings'].append(
            f'Lookup of sequence {input_sequence} failed.'
        )
    return response


@app.route('/validate', methods=['POST'])
def validate_object() -> Dict:
    """Validate constructed Fusion object. Return warnings if invalid."""
    try:
        r = request.json
    except TypeError:
        logger.warning('Request raised unresolvable TypeError.')
        return {'fusion': {}, 'warnings': ['Unable to validate submission']}
    validated = validate_fusion(r)
    return validated
