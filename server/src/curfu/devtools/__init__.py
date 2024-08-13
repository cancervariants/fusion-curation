"""Utility functions for application setup."""

import ftplib
from collections.abc import Callable

from curfu import logger


def ftp_download(domain: str, path: str, fname: str, callback: Callable) -> None:
    """Acquire file via FTP.
    :param domain: domain name for remote file host
    :param path: path within host to desired file
    :param fname: name of desired file as provided on host
    """
    try:
        with ftplib.FTP(domain) as ftp:
            ftp.login()
            ftp.cwd(path)
            ftp.retrbinary(f"RETR {fname}", callback)
    except ftplib.all_errors as e:
        logger.error(f"FTP download failed: {e}")
        raise Exception(e) from e


# default interpro entry types to try to gather for domains
DEFAULT_INTERPRO_TYPES = "Active_site,Binding_site,Conserved_site,Domain,Family"
