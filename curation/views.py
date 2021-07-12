"""Provide Views for curation application."""
from curation import app
from flask import render_template
from curation.gene_services import get_gene_id


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
        # TODO log
        response['warnings'] = 'gene normalization unsuccessful'
    return response
