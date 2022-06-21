"""Utility functions for application setup."""
import ftplib

from curfu import logger


def ftp_download(domain: str, path: str, fname: str, callback) -> None:
    """Acquire file via FTP.
    :param str domain: domain name for remote file host
    :param str path: path within host to desired file
    :param str fname: name of desired file as provided on host
    """
    try:
        with ftplib.FTP(domain) as ftp:
            ftp.login()
            ftp.cwd(path)
            ftp.retrbinary(f"RETR {fname}", callback)
    except ftplib.all_errors as e:
        logger.error(f"FTP download failed: {e}")
        raise Exception(e)


# default interpro entry types to try to gather for domains
DEFAULT_INTERPRO_TYPES = "Active_site,Binding_site,Conserved_site,Domain,Family"
