"""Utility functions for application setup."""
from pathlib import Path
import ftplib

from curation import logger


def ftp_download(domain: str, path: str, fname: str, outpath: Path) -> None:
    """Acquire file via FTP.
    :param str domain: domain name for remote file host
    :param str path: path within host to desired file
    :param str fname: name of desired file as provided on host
    :param Path outpath: Path to save file at
    """
    try:
        with ftplib.FTP(domain) as ftp:
            ftp.login()
            ftp.cwd(path)
            with open(outpath, "wb") as fp:
                ftp.retrbinary(f"RETR {fname}", fp.write)
    except ftplib.all_errors as e:
        logger.error(f"FTP download failed: {e}")
        raise Exception(e)
    assert outpath.exists()
