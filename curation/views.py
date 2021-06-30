"""Provide Views for curation application."""
from curation import app
from flask import render_template, request
from .gene_services import get_gene_id


@app.route('/entry.html')
def main_page():
    """Entry point for application."""
    return render_template('entry.html', page_title="main page")


@app.route('/submit', methods=['POST'])
def submit_fusion():
    """Endpoint for submitting fusion entries."""
    submission = request.json
    junctions = submission.get('junctions')
    if junctions:
        for end_num in ('3', '5'):
            end_str = f'{end_num}_prime_end'
            if end_str in junctions:
                symbol = junctions[end_str].get('gene_symbol')
                if symbol:
                    concept_id = get_gene_id(symbol)
                    del junctions[end_str]['gene_symbol']
                    junctions[end_str]['gene'] = {
                        'id': concept_id,
                        'symbol': symbol
                    }
    return submission
