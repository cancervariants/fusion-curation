"""Fusion curation interface."""
from flask import Flask
app = Flask(__name__, static_url_path='', static_folder='build', template_folder='build')

import curation.views  # noqa: F401 E402
