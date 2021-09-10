"""Provide lookup services for functional domains."""
from pathlib import Path
from datetime import datetime
from curation import APP_ROOT, logger
import csv
from ftplib import FTP
from typing import List, Tuple


class DomainService():
    """Handler class providing requisite services for functional domain lookup."""

    def __init__(self):
        """Initialize handler class. Download files if necessary, then load and store."""
        # check if files exist
        self._data_dir = APP_ROOT / 'data'
        self._data_dir.mkdir(exist_ok=True, parents=True)
        interpro_files: List[Path] = list(self._data_dir.glob('interpro_*.tsv'))
        if len(interpro_files) < 1:
            self.download_interpro()
            interpro_files = list(self._data_dir.glob('interpro_*.tsv'))
        interpro_file: Path = sorted(interpro_files, reverse=True)[0]

        # load file
        with open(interpro_file) as tsvfile:
            reader = csv.reader(tsvfile, delimiter='\t')
            reader.__next__()  # skip header
            valid_entry_types = {'Active_site', 'Binding_site', 'Conserved_site', 'Domain'}
            self.domains = {row[2].lower(): {'case': row[2], 'id': row[0]}
                            for row in reader if row[1] in valid_entry_types}

    def download_interpro(self):
        """Retrieve InterPro entry list TSV from EMBL-EBI servers."""
        logger.info('Downloading InterPro entry list...')
        today = datetime.today().strftime("%Y%m%d")
        fpath: Path = self._data_dir / f'interpro_{today}.tsv'
        try:
            with FTP('ftp.ebi.ac.uk') as ftp:
                ftp.login()
                ftp.cwd('pub/databases/interpro')
                with open(fpath, 'wb') as fp:
                    ftp.retrbinary('RETR entry.list', fp.write)
        except Exception as e:
            logger.error(f'FTP download failed: {e}')
            raise Exception(e)
        logger.info('InterPro entry list download complete.')

    def get_domain_id(self, name: str) -> Tuple[str, List[str]]:
        """Given functional domain name, return Interpro ID.
        :param str name: name to fetch ID for (case insensitive)
        :return: Tuple containing domain ID (as CURIE) if found, empty string otherwise,
            and a List of warnings (empty if successful)
        """
        domain_id = self.domains.get(name.lower())
        if not domain_id:
            warn = f'Could not retrieve ID for domain {name}'
            logger.info(warn)
            return ('', [warn])
        else:
            return (f'interpro:{domain_id["id"]}', [])

    def get_possible_matches(self, query: str, n: int = 10) -> List[str]:
        """Given input query, return possible domain matches (for autocomplete)
        :param str query: user-entered string (case insensitive)
        :param int n: max # of items to return
        :return: List of valid domain names (up to n names)
        """
        return [v['case'] for k, v in self.domains.items()
                if k.startswith(query.lower())][:n]


domain_service = DomainService()
