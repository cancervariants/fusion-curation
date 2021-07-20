"""Provide Views for curation application."""
from typing import Dict
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


@app.route('/coordinates/<tx_ac>/<start_exon>/<end_exon>/<start_exon_offset>/<end_exon_offset>/<gene>')  # noqa: E501
def get_exon(tx_ac, start_exon, end_exon, start_exon_offset=0,
             end_exon_offset=0, gene=None) -> Dict:
    """Fetch a transcript's exon information.

    :param str tx_ac: Transcript accession
    :param int start_exon: Start exon number
    :param int end_exon: End exon number
    :param int start_exon_offset: Start exon offset
    :param int end_exon_offset: End exon offset
    :param str gene: Gene symbol
    :return: Transcript and exon data
    """
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

    def _str_to_int(value):
        if isinstance(value, str):
            try:
                value = int(value)
            except ValueError:
                return None
            else:
                return value

    start_exon = _str_to_int(start_exon)
    end_exon = _str_to_int(end_exon)
    start_exon_offset = _str_to_int(start_exon_offset)
    end_exon_offset = _str_to_int(end_exon_offset)

    for var in [start_exon, end_exon, start_exon_offset, end_exon_offset]:
        if var is None:
            return response

    genomic_coords = uta.get_genomic_coords(
        tx_ac, start_exon, end_exon, start_exon_offset=start_exon_offset,
        end_exon_offset=end_exon_offset, gene=gene
    )
    if genomic_coords:
        response['gene'] = genomic_coords.get("gene", None)
        response['chr'] = genomic_coords.get("chr", None)
        response['start'] = genomic_coords.get("start", None)
        response['end'] = genomic_coords.get("end", None)
        response['start_exon'] = genomic_coords.get("start_exon", None)
        response['end_exon'] = genomic_coords.get("end_exon", None)
        return response
    else:
        return None
