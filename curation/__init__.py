"""Fusion curation interface."""
from flask import Flask
from pathlib import Path
from os import environ
import logging


PROJECT_ROOT = Path(__file__).resolve().parents[0]

APP_ROOT = Path(__file__).resolve().parents[0]
if "UTA_DB_URL" in environ:
    UTA_DB_URL = environ["UTA_DB_URL"]
else:
    UTA_DB_URL = 'postgresql://uta_admin@localhost:5433/uta/uta_20210129'

app = Flask(__name__, static_url_path='', static_folder='build', template_folder='build')

logging.basicConfig(filename="fusion_backend.log",
                    format='[%(asctime)s] - %(name)s - %(levelname)s : %(message)s')
logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)

import curation.views  # noqa: F401 E402
