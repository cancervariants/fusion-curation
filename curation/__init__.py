"""Fusion curation interface."""
from flask import Flask
from pathlib import Path
from os import environ
import logging


# provide consistent paths
APP_ROOT = Path(__file__).resolve().parents[0]

# establish environment-dependent params
if 'FUSION_EB_PROD' in environ:
    environ['FUSION_EB_PROD'] = 'true'
    LOG_FN = '/tmp/fusion_backend.log'
else:
    LOG_FN = 'fusion_backend.log'

# set up logging
logging.basicConfig(
    filename=LOG_FN,
    format='[%(asctime)s] - %(name)s - %(levelname)s : %(message)s'
)
logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.INFO)
logger.handlers = []

if 'FUSION_EB_PROD' in environ:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    logger.addHandler(ch)

# Locate static resources
# E.g., copy `build` folder generated by `npm run build` into the `curation` dir.
app = Flask(__name__, static_url_path='', static_folder='build', template_folder='build')

# get UTA DB url
if 'UTA_DB_URL' in environ:
    UTA_DB_URL = environ['UTA_DB_URL']
else:
    UTA_DB_URL = 'postgresql://uta_admin@localhost:5433/uta/uta_20210129'

# get local seqrepo location
if 'SEQREPO_DATA_PATH' not in environ:
    SEQREPO_DATA_PATH = f"{APP_ROOT}/data/seqrepo/latest"
else:
    SEQREPO_DATA_PATH = environ['SEQREPO_DATA_PATH']
