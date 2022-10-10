"""Miscellaneous helper functions."""
import os
from pathlib import Path
from typing import TypeVar, List

import boto3
from boto3.exceptions import ResourceLoadException
from botocore.exceptions import ClientError

from botocore.config import Config

from curfu import logger, APP_ROOT

ObjectSummary = TypeVar("ObjectSummary")


def get_latest_s3_file(file_prefix: str) -> ObjectSummary:
    """Get latest S3 object representation for data file
    :param file_prefix: filename prefix for data file
    :return: boto3 ObjectSummary
    :raise:
        ResourceLoadException: if Boto3 S3 initialization fails
        FileNotFoundError: if no matching files exist in the bucket
    """
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
    return bucket[0]


def download_s3_file(bucket_object: ObjectSummary) -> Path:
    """Download local copy of file from S3
    :param bucket_object: boto object representation of S3 file
    :return: Path to downloaded file
    """
    fname = os.path.basename(bucket_object.key)
    save_to = APP_ROOT / "data" / fname
    with open(save_to, "wb") as f:
        try:
            bucket_object.Object().download_fileobj(f)
        except ClientError as e:
            logger.error(f"Failed to download {bucket_object.key}")
            raise e
    logger.info(f"Downloaded {fname} successfully.")
    return save_to


def get_latest_data_file(file_prefix: str, local_files: List[Path]) -> Path:
    """
    Get path to latest version of given data file. Download from S3 if not
    available locally.
    :param file_prefix: leading pattern in filename (eg `gene_aliases`)
    :param local_files: local files matching pattern
    :return: path to up-to-date file
    """
    latest_local_file = sorted(local_files, reverse=True)[0]
    s3_object = get_latest_s3_file(file_prefix)
    if os.path.basename(s3_object.key) > latest_local_file.name:
        return download_s3_file(s3_object)
    else:
        return latest_local_file


def get_data_file(filename_prefix: str) -> Path:
    """
    Acquire most recent version of static data file. Download from S3 if not available locally.
    :param filename_prefix: leading text of filename, eg `gene_aliases_suggest`. Should not
        include filetype or date information.
    :return: Path to acquired file.
    """
    data_dir = APP_ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    file_glob = f"{filename_prefix}*.tsv"
    files = list(data_dir.glob(file_glob))
    if not files:
        return download_s3_file(get_latest_s3_file(filename_prefix))
    else:
        return get_latest_data_file(filename_prefix, files)
