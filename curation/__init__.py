"""Fusion curation interface."""
from .version import __version__  # noqa: F401
import os
from flask import Flask, render_template, request

from gene.query import QueryHandler


gene_query_handler = QueryHandler()


def get_gene_id(symbol: str) -> str:
    """Get ID given gene symbol.

    :param str symbol: user-entered gene symbol
    :returns: concept ID as a string
    :raises LookupError: if no match is found
    """
    normed = gene_query_handler.search_sources(symbol, incl='hgnc', keyed=True)
    hgnc = normed['source_matches']['HGNC']
    if hgnc['match_type'] > 0:
        return hgnc['records'][0].concept_id
    else:
        raise LookupError(f"Could not find matching ID for symbol {symbol}")


def create_app(test_config=None):
    """Create app."""
    app = Flask(__name__, instance_relative_config=None)
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/entry.html')
    def main_page():
        return render_template('entry.html', page_title="main page")

    @app.route('/submit', methods=['POST'])
    def submit_fusion():
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

    return app
