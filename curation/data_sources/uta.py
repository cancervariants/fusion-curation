"""Module for UTA queries for genomic and transcript data."""
from curation import UTA_DB_URL
from six.moves.urllib import parse as urlparse
import psycopg2
import psycopg2.extras
from typing import Dict, List, Optional, Tuple
from os import environ


class UTA:
    """Class for accessing UTA database."""

    def __init__(self, db_url=UTA_DB_URL, db_pwd=None) -> None:
        """Initialize UTA class.

        :param str db_url: UTA DB url
        :param str db_pwd: UTA user uta_admin's password
        """
        self.db_url = self._update_db_url(db_pwd, db_url)
        self.url = ParseResult(urlparse.urlparse(self.db_url))
        self.schema = self.url.schema
        self.args = self._get_conn_args()
        self.conn = psycopg2.connect(**self.args)
        self.conn.autocommit = True
        self.cursor = \
            self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    @staticmethod
    def _update_db_url(db_pwd, db_url) -> Optional[str]:
        """Return new db_url containing password.

        :param str db_pwd: uta_admin's user password
        :param str db_url: PostgreSQL db url
        :return: PostgreSQL db url with password included
        """
        if not db_pwd and 'UTA_PASSWORD' not in environ:
            raise Exception('Environment variable UTA_PASSWORD '
                            'or `db_pwd` param must be set')
        else:
            uta_password_in_environ = 'UTA_PASSWORD' in environ
            db_url = db_url.split('@')
            if uta_password_in_environ and db_pwd:
                if db_pwd != environ['UTA_PASSWORD']:
                    raise Exception('If both environment variable UTA_'
                                    'PASSWORD and param db_pwd is set, '
                                    'they must both be the same')
            else:
                if uta_password_in_environ and not db_pwd:
                    db_pwd = environ['UTA_PASSWORD']
            return f"{db_url[0]}:{db_pwd}@{db_url[1]}"

    def _get_conn_args(self) -> Dict:
        """Return connection arguments.

        :return: A dictionary containing db credentials
        """
        return dict(
            host=self.url.hostname,
            port=self.url.port,
            database=self.url.database,
            user=self.url.username,
            password=self.url.password,
            application_name='gene-fusions',
        )

    def get_genomic_coords(self, tx_ac, start_exon, end_exon, start_exon_offset=0,
                           end_exon_offset=0, gene=None) -> Tuple[str, int, int]:
        """Get genomic chromosome and start/end exon coordinates.

        :param str tx_ac: Transcript accession
        :param int start_exon: Starting exon number
        :param int end_exon: Ending exon number
        :param int start_exon_offset: Starting exon offset
        :param int end_exon_offset: Ending exon offset
        :param str gene: Gene symbol
        :return: genomic accession for chromosome,
            start exon's end coordinate, end exon's start coordinate
        """
        tx_exon_start_end = self._get_tx_exon_start_end(tx_ac, start_exon, end_exon)
        if not tx_exon_start_end:
            return None

        tx_exons, start_exon, end_exon = tx_exon_start_end

        tx_exon_coords = self.get_tx_exon_coords(tx_exons, start_exon, end_exon)
        if not tx_exon_coords:
            return None

        tx_exon_start, tx_exon_end = tx_exon_coords

        alt_ac_start = self._get_alt_ac_start_end(tx_ac, int(tx_exon_start[0]),
                                                  int(tx_exon_start[1]), gene=gene)
        if not alt_ac_start:
            return None

        alt_ac_end = self._get_alt_ac_start_end(tx_ac, int(tx_exon_end[0]),
                                                int(tx_exon_end[1]), gene=gene)
        if not alt_ac_end:
            return None

        # Genomic accessions must be the same
        if alt_ac_start[0] != alt_ac_end[0]:
            return None

        return {
            "chr": alt_ac_start[0],
            "start": alt_ac_start[2],
            "end": alt_ac_end[1],
            "start_exon": start_exon,
            "end_exon": end_exon
        }

    def get_tx_exons(self, tx_ac) -> List[str]:
        """Get list of transcript exons start/end coordinates.

        :param str tx_ac: Transcript accession
        :return: List of a transcript's accessions
        """
        query = (
            f"""
            SELECT cds_se_i
            FROM {self.schema}._cds_exons_fp_v
            WHERE tx_ac = '{tx_ac}';
            """
        )
        self.cursor.execute(query)
        cds_se_i = self.cursor.fetchall()
        if not cds_se_i:
            return None
        return cds_se_i[0][0].split(';')

    def _get_tx_exon_start_end(self, tx_ac, start_exon, end_exon) -> Tuple[int, int]:
        """Get exon start/end coordinates given accession and gene.

        :param str ac: Transcript accession
        :param int start_exon: Starting exon number
        :param int end_exon: Ending exon number
        :return: Transcript's start/end exon coordinates
        """
        tx_exons = self.get_tx_exons(tx_ac)
        if not tx_exons:
            return None

        def _exon_to_int(exon):
            try:
                if isinstance(exon, str):
                    exon = int(exon)
            except ValueError:
                return None
            else:
                return exon

        if start_exon is not None:
            start_exon = _exon_to_int(start_exon)
            if start_exon is None:
                return None
            elif start_exon == 0:
                start_exon = 1
        else:
            start_exon = 1

        if end_exon is not None:
            end_exon = _exon_to_int(end_exon)
            if end_exon is None:
                return None
            elif end_exon == 0:
                end_exon = len(tx_exons)
        else:
            end_exon = len(tx_exons)
        return tx_exons, start_exon, end_exon

    @staticmethod
    def get_tx_exon_coords(tx_exons, start_exon, end_exon):
        """Get transcript exon coordinates."""
        try:
            tx_exon_start = tx_exons[start_exon - 1].split(',')
            tx_exon_end = tx_exons[end_exon - 1].split(',')
        except IndexError:
            return None

        return tx_exon_start, tx_exon_end

    def _get_alt_ac_start_end(self, tx_ac, tx_exon_start,
                              tx_exon_end, gene=None) -> Tuple[str, int, int]:
        """Get genomic coordinates for exon start/end.

        :param str tx_ac: Transcript accession
        :param int tx_exon_start: Transcript's exon start coordinate
        :param int tx_exon_end: Transcript's exon end coordinate
        :param str gene: Gene symbol
        :return: genomic accession for chromosome,
            start exon's end coordinate, end exon's start coordinate
        """
        if gene:
            gene_query = f"AND T.hgnc = '{gene}'"
        else:
            gene_query = ''

        query = (
            f"""
            SELECT T.hgnc, T.tx_ac, T.alt_ac, T.tx_start_i,
                T.tx_end_i, T.alt_start_i, T.alt_end_i, C.cds_se_i
            FROM uta_20210129._cds_exons_fp_v as C
            JOIN uta_20210129.tx_exon_aln_v as T ON T.tx_ac = C.tx_ac
            WHERE T.tx_ac = '{tx_ac}'
            {gene_query}
            AND {tx_exon_start} BETWEEN T.tx_start_i AND T.tx_end_i
            AND {tx_exon_end} BETWEEN T.tx_start_i AND T.tx_end_i
            AND T.alt_aln_method = 'splign'
            AND T.alt_ac LIKE 'NC_00%'
            ORDER BY T.alt_ac DESC
            """
        )
        self.cursor.execute(query)
        results = self.cursor.fetchall()
        if not results:
            return None
        result = results[0]
        return result[2], result[5], result[6]


class ParseResult(urlparse.ParseResult):
    """Subclass of url.ParseResult that adds database and schema methods,
    and provides stringification.
    Source: https://github.com/biocommons/hgvs
    """

    def __new__(cls, pr):
        """Create new instance."""
        return super(ParseResult, cls).__new__(cls, *pr)

    @property
    def database(self):
        """Create database property."""
        path_elems = self.path.split("/")
        return path_elems[1] if len(path_elems) > 1 else None

    @property
    def schema(self):
        """Create schema property."""
        path_elems = self.path.split("/")
        return path_elems[2] if len(path_elems) > 2 else None


uta = UTA(db_pwd="admin")
