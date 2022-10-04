"""Miscellaneous helper functions."""
import os
import re
from pathlib import Path

import boto3
from botocore.config import Config
from boto3.exceptions import ResourceLoadException

from curfu import logger, APP_ROOT


def retrieve_s3_file(file_prefix: str) -> Path:
    """Retrieve the latest version of a static file from the VICC CurFu bucket.
    :param file_prefix: a prefix for a file basename: ie, should not include any subdirectories.
    :return: Path to saved file
    :raise:
        ValueError: if given prefix is illegal
        ResourceLoadException: if S3 initialization fails
        FileNotFoundError: if prefix doesn't match existing files
    """
    if not re.match(r"^[^\/]+$", file_prefix):
        raise ValueError(
            f"Provided pattern is not a validly formed basename: {file_prefix}"
        )
    logger.info(f"Attempting S3 lookup for data file pattern {file_prefix}...")
    s3 = boto3.resource("s3", config=Config(region_name="us-east-2"))
    if not s3:
        raise ResourceLoadException("Unable to initialize boto S3 resource")
    bucket = sorted(
        list(
            s3.Bucket("vicc-services")
            .objects.filter(Prefix=f"curfu/{file_prefix}")
            .all()
        ),
        key=lambda f: f.key,
        reverse=True,
    )
    if len(bucket) == 0:
        raise FileNotFoundError(f"No files matching pattern {file_prefix} in bucket.")

    fname = os.path.basename(bucket[0].key)
    save_to = APP_ROOT / "data" / fname
    with open(save_to, "wb") as f:
        bucket[0].Object().download_fileobj(f)
    logger.info(f"Downloaded {fname} successfully.")

    return save_to


def get_static_file(filename_prefix: str) -> Path:
    """
    Acquire most recent version of static data file. Download from S3 if not available locally.
    :param filename_prefix: leading text of filename, eg `gene_aliases_suggest`. Should not
        include filetype or date information.
    :return: Path to acquired file.
    """
    file_glob = f"{filename_prefix}*.tsv"
    files = list((APP_ROOT / "data").glob(file_glob))
    if not files:
        return retrieve_s3_file(filename_prefix)
    else:
        return Path(sorted(files, reverse=True)[0])
