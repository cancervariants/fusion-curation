"""Provide lookup services for functional domains."""
from pathlib import Path
from datetime import datetime
from curation import PROJECT_ROOT
import logging
import csv
from ftplib import FTP


logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)


def download_interpro():
    """Retrieve InterPro entry list TSV from EMBL-EBI servers."""
    logger.info('Downloading InterPro entry list...')
    file_path: Path = PROJECT_ROOT / 'data' / f'interpro_{datetime.today().strftime("%Y%m%d")}.tsv'
    try:
        with FTP('ftp.ebi.ac.uk') as ftp:
            ftp.login()
            ftp.cwd('pub/databases/interpro')
            with open(file_path, 'wb') as fp:
                ftp.retrbinary('RETR entry.list', fp.write)
    except Exception as e:
        logger.error(f'FTP download failed: {e}')
        raise Exception(e)
    logger.info('InterPro entry list download complete.')


class DomainServiceHandler():
    """Handler class providing requisite services for functional domain lookup."""

    def __init__(self):
        """Initialize handler class. Download files if necessary, then load and store."""
        # check if files exist
        interpro_files = (PROJECT_ROOT / 'data').glob('interpro_*.tsv')
        if not len(list(interpro_files)) < 0:
            download_interpro()
            interpro_files = (PROJECT_ROOT / 'data').glob('interpro_*.tsv')
        interpro_file: Path = sorted(interpro_files, reverse=True)[0]

        # load file
        with open(interpro_file) as tsvfile:
            reader = csv.reader(tsvfile, delimiter='\t')
            reader.__next__()  # skip header
            self.domains = {row[2].lower(): row[0] for row in reader}


domain_handler = DomainServiceHandler()


def get_domain_id(name) -> str:
    """Given functional domain name, return Interpro ID.
    :param str name: name to fetch ID for (case insensitive)
    :return:
    """
    domain_id = domain_handler.domains.get(name.lower())
    if not domain_id:
        raise LookupError(f'Functional domain ID lookup failed for {name}')
    else:
        return f'interpro:{domain_id}'
