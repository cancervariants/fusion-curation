"""Provide Views for curation application."""
from curation import app
from flask import render_template
from curation.gene_services import get_gene_id
from curation.data_sources.uta import uta
import logging

logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)


@app.route('/', methods=['GET'])
def serve_static():
    """Provide generated static site at root address."""
    return render_template('index.html')


@app.route('/gene/<symbol>')
def normalize_gene(symbol):
    """Fetch normalized concept ID given provided gene symbol."""
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


@app.route('/coordinates/<tx_ac>/<start_exon>/<end_exon>/<gene>')
def get_exon(tx_ac, start_exon, end_exon, gene=None):
    """Fetch a transcript's exon information."""
    response = {
        "tx_ac": tx_ac,
        "gene": gene,
        "start_exon": None,
        "end_exon": None
    }
    genomic_coords = uta.get_genomic_coords(tx_ac, start_exon, end_exon, gene=gene)
    response['chr'] = genomic_coords["chr"]
    response['start'] = genomic_coords["start"]
    response['end'] = genomic_coords["end"]
    response['start_exon'] = genomic_coords["start_exon"]
    response['end_exon'] = genomic_coords["end_exon"]
    return response
