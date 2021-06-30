"""Fusion curation interface."""
from flask import Flask
app = Flask(__name__)

import curation.views  # noqa: F401 E402
