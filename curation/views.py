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
    if gene == 'None':
        gene = None
    response = {
        "tx_ac": tx_ac,
        "gene": gene,
        "start_exon": None,
        "end_exon": None,
        "chr": None,
        "start": None,
        "end": None
    }
    genomic_coords = uta.get_genomic_coords(tx_ac, start_exon, end_exon, gene=gene)
    if genomic_coords:
        response['gene'] = genomic_coords.get("gene", None)
        response['chr'] = genomic_coords.get("chr", None)
        response['start'] = genomic_coords.get("start", None)
        response['end'] = genomic_coords.get("end", None)
        response['start_exon'] = genomic_coords.get("start_exon", None)
        response['end_exon'] = genomic_coords.get("end_exon", None)
    return response
