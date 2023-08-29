"""Fusion curation interface."""
import logging
from os import environ
from pathlib import Path

from .version import __version__

# provide consistent paths
APP_ROOT = Path(__file__).resolve().parents[0]

# establish environment-dependent params
if "FUSION_EB_PROD" in environ:
    environ["FUSION_EB_PROD"] = "true"
    LOG_FN = "/tmp/curfu.log"
else:
    LOG_FN = "curfu.log"

# set up logging
logging.basicConfig(
    filename=LOG_FN, format="[%(asctime)s] - %(name)s - %(levelname)s : %(message)s"
)
logger = logging.getLogger("fusion_backend")
logger.setLevel(logging.DEBUG)
logger.handlers = []

# double check that this doesn't break prod logging
logging.getLogger("boto3").setLevel(logging.INFO)
logging.getLogger("botocore").setLevel(logging.INFO)
logging.getLogger("nose").setLevel(logging.INFO)
logging.getLogger("python_jsonschema_objects.classbuilder").setLevel(logging.INFO)

if "FUSION_EB_PROD" in environ:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    logger.addHandler(ch)
else:
    logging.getLogger("urllib3").setLevel(logging.INFO)


# get UTA DB url
if "UTA_DB_URL" in environ:
    UTA_DB_URL = environ["UTA_DB_URL"]
else:
    UTA_DB_URL = "postgresql://uta_admin@localhost:5433/uta/uta_20210129"

# get local seqrepo location
if "SEQREPO_DATA_PATH" not in environ:
    SEQREPO_DATA_PATH = f"{APP_ROOT}/data/seqrepo/latest"
else:
    SEQREPO_DATA_PATH = environ["SEQREPO_DATA_PATH"]


class LookupServiceError(Exception):
    """Custom Exception to use when lookups fail in curation services."""


# define max acceptable matches for autocomplete suggestions
MAX_SUGGESTIONS = 50
