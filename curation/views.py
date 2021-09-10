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
    concept_id, warnings = gene_service.get_gene_id(symbol)
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
    (domain_id, warnings) = domain_service.get_domain_id(name)
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
        'matches': domain_service.get_possible_matches(query)
    }


@app.route('/coordinates/<tx_ac>/<start_exon>/<end_exon>/<start_exon_offset>/<end_exon_offset>', defaults={'gene': None})  # noqa: E501
@app.route('/coordinates/<tx_ac>/<start_exon>/<end_exon>/<start_exon_offset>/<end_exon_offset>/<gene>')  # noqa: E501
def get_exon(tx_ac, start_exon, end_exon, start_exon_offset,
             end_exon_offset, gene) -> Dict:
    """Fetch a transcript's exon information.

    :param str tx_ac: Transcript accession
    :param int start_exon: Start exon number
    :param int end_exon: End exon number
    :param int start_exon_offset: Start exon offset
    :param int end_exon_offset: End exon offset
    :param str gene: Gene symbol
    :return: Transcript and exon data
    """
    response = {
        "tx_ac": tx_ac,
        "gene": gene,
        "start_exon": None,
        "end_exon": None,
        "chr": None,
        "start": None,
        "end": None,
        "warnings": []
    }

    def _str_to_int(value):
        if isinstance(value, str):
            try:
                value = int(value)
            except ValueError:
                return None
            else:
                return value

    # processed values
    processed = {
        'start_exon': (start_exon, _str_to_int(start_exon)),
        'end_exon': (end_exon, _str_to_int(end_exon)),
        'start_exon_offset': (start_exon_offset, _str_to_int(start_exon_offset)),
        'end_exon_offset': (end_exon_offset, _str_to_int(end_exon_offset)),
    }

    invalid = {k: v for k, v in processed.items() if v[1] is None}
    if invalid:
        response['warnings'] += [f'invalid input in {k} field: {v[0]}' for k, v in invalid.items()]
        return response

    genomic_coords = uta.get_genomic_coords(
        tx_ac,
        processed['start_exon'][1],
        processed['end_exon'][1],
        start_exon_offset=processed['start_exon_offset'][1],
        end_exon_offset=processed['end_exon_offset'][1],
        gene=gene,
    )
    if genomic_coords:
        gene = genomic_coords.get('gene', None)
        response['gene'] = gene
        response['gene_id'] = normalize_gene(gene)['concept_id']
        chr = genomic_coords.get('chr', None)
        response['chr'] = chr
        sequence_id = get_sequence_id(chr)
        response['sequence_id'] = sequence_id['sequence_id']
        response['start'] = genomic_coords.get("start", None)
        response['end'] = genomic_coords.get('end', None)
        response['start_exon'] = genomic_coords.get('start_exon', None)
        response['end_exon'] = genomic_coords.get('end_exon', None)
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
