"""Fusion curation interface."""
from flask import Flask
import logging
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[0]


app = Flask(__name__, static_url_path='', static_folder='build', template_folder='build')

logging.basicConfig(filename="fusion_backend.log",
                    format='[%(asctime)s] - %(name)s - %(levelname)s : %(message)s')
logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)

import curation.views  # noqa: F401 E402
