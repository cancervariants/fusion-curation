"""Fusion curation interface."""
from .version import __version__  # noqa: F401
import os
from flask import Flask, render_template, request, redirect, url_for


def create_app(test_config=None):

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
        # store data -- call models?
        print(request.json)

        return redirect(url_for('main_page'))

    return app
