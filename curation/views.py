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
    concept_id, warnings = gene_service.get_gene_id(symbol.strip())
    return {
        'symbol': symbol,
        'concept_id': concept_id,
        'warnings': warnings,
    }


@app.route('/domain/<name>')
def get_functional_domain(name: str) -> Dict:
    """Fetch interpro ID given functional domain name.
    :param str name: name of functional domain
    :return: Dict (to be served as JSON) containing provided name, ID (as CURIE) if available,
        and relevant warnings
    """
    (domain_id, warnings) = domain_service.get_domain_id(name.strip())
    return {
        'name': name,
        'domain_id': domain_id,
        'warnings': warnings
    }


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
        'matches': domain_service.get_possible_matches(query.strip())
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
            msg = f'{field} expects int, got {type(r[field])} instead'
            logger.warning(msg)
            warnings.append(msg)
    if warnings:
        response['warnings'] = warnings
        return response

    gene = r.get('gene')
    if gene is None:
        gene = ''
    else:
        gene = gene.str()

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
        response['warnings'] = ['Coordinate retrieval failed.']
        return response


@app.route('/sequence/<input_sequence>')
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


@app.route('/validate', methods=['POST'])
def validate_object() -> Dict:
    """Validate constructed Fusion object. Return warnings if invalid.
    No arguments supplied, but receives a POSTed JSON payload via Flask request context.
    :return: Dict served as JSON with validated Fusion object if correct, and empty
        Object + a list of Warnings if not.
    """
    r = request.json
    if r is not None:
        validated = validate_fusion(r)
        return validated
    else:
        logger.warning('Unable to parse received POST payload to /validate')
        return {'fusion': {}, 'warnings': ['Unable to validate submission']}
