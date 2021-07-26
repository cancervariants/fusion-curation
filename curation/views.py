"""Provide Views for curation application."""
from curation import app
from flask import render_template
from curation.gene_services import get_gene_id
from curation.domain_services import get_domain_id
import logging
from typing import Dict

logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)


@app.route('/', methods=['GET'])
def serve_static():
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
        'warnings': None
    }
    try:
        concept_id = get_gene_id(symbol)
        response['concept_id'] = concept_id
    except LookupError:
        logger.warning(f'Lookup of gene symbol {symbol} failed.')
        response['warnings'] = 'gene normalization unsuccessful'
    except Exception as e:
        logger.warning(f'Lookup of gene symbol {symbol} failed with exception {e}.')
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
        'warnings': None
    }
    try:
        domain_id = get_domain_id(name)
        response['domain_id'] = domain_id
    except LookupError:
        logger.warning(f'Lookup of domain {name} failed.')
        response['warnings'] = 'domain ID lookup unsuccessful'
    except Exception as e:
        logger.warning(f'Lookup of domain {name} failed with exception {e}.')
    return response
