"""Module for UTA queries for genomic and transcript data."""
from curation import UTA_DB_URL
from six.moves.urllib import parse as urlparse
import asyncpg
from asyncpg.exceptions import InterfaceError
from typing import Dict, List, Optional, Tuple
from os import environ
import logging
from urllib.parse import quote, unquote
import boto3

logger = logging.getLogger('fusion_backend')
logger.setLevel(logging.DEBUG)


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


class PostgresDatabase():
    """Database instance class. Should survive for the duration of application runtime."""

    def __init__(self, db_url: str = UTA_DB_URL, db_pwd: str = '') -> None:
        """Initialize DB class.
        :param str db_url: URL to DB
        :param str db_pwd: DB password if necessary
        """
        self.args = self._get_conn_args(('FUSION_EB_PROD' in environ), db_url, db_pwd)
        self._cursor = None
        self._connection_pool = None
        self.conn = None

    async def create_pool(self):
        """Connect to DB and create connection pool."""
        if not self._connection_pool:
            try:
                self._connection_pool = await asyncpg.create_pool(
                    min_size=1,
                    max_size=10,
                    command_timeout=60,
                    host=self.args['host'],
                    port=self.args['port'],
                    user=self.args['user'],
                    password=self.args['password'],
                    database=self.args['database'],
                )
            except InterfaceError as e:
                logger.error(f'While creating connection pool, encountered exception {e}')

    async def execute_query(self, query: str):
        if not self._connection_pool:
            await self.create_pool()
        else:
            self.conn = await self._connection_pool.acquire()
            try:
                result = await self.conn.fetch(query)
                return result
            except Exception as e:  # TODO more specific?
                logger.warning(f'Encountered exception executing query {query}: {e}')
            finally:
                await self._connection_pool.release(self.conn)

    def _get_conn_args(self, is_prod: bool, db_url: str, db_pwd: str = '') -> Dict:
        """Return connection arguments.

        :param bool is_prod: `True` if production environment. `False` otherwise.
        :param str db_url: PostgreSQL db url
        :param str db_pwd: uta_admin's user password
        :return: A dictionary containing db credentials
        """
        if not is_prod:
            db_url = self._update_db_url(db_pwd, db_url)
            db_url = self._url_encode_password(db_url)
            url = ParseResult(urlparse.urlparse(db_url))
            self.schema = url.schema
            return self._get_args(url.hostname, url.port, url.database,
                                  url.username, unquote(url.password))
        else:
            self.schema = environ['UTA_SCHEMA']
            region = 'us-east-2'
            client = boto3.client('rds', region_name=region)
            token = client.generate_db_auth_token(
                DBHostname=environ['UTA_HOST'], Port=environ['UTA_PORT'],
                DBUsername=environ['UTA_USER'], Region=region
            )
            return self._get_args(environ['UTA_HOST'],
                                  int(environ['UTA_PORT']),
                                  environ['UTA_DATABASE'], environ['UTA_USER'],
                                  token)

    @staticmethod
    def _update_db_url(db_pwd: str, db_url: str) -> Optional[str]:
        """Return new db_url containing password.

        :param str db_pwd: uta_admin's user password
        :param str db_url: PostgreSQL db url
        :return: PostgreSQL db url with password included, or None if invalid parameters
            encountered
        """
        if 'UTA_DB_URL' in environ:
            return environ["UTA_DB_URL"]
        if not db_pwd and 'UTA_PASSWORD' not in environ:
            raise Exception('Environment variable UTA_PASSWORD '
                            'or `db_pwd` param must be set')
        else:
            uta_password_in_environ = 'UTA_PASSWORD' in environ
            db_url = db_url.split('@')
            if uta_password_in_environ and db_pwd:
                if db_pwd != environ['UTA_PASSWORD']:
                    raise Exception('If both environment variable UTA_PASSWORD and param db_pwd '
                                    'is set, they must both be the same')
            else:
                if uta_password_in_environ and not db_pwd:
                    db_pwd = environ['UTA_PASSWORD']
            return f"{db_url[0]}:{db_pwd}@{db_url[1]}"

    def _url_encode_password(self, db_url: str) -> str:
        """Update DB URL to url encode password.

        :param str db_url: URL for PostgreSQL Database
        :return: DB URL encoded
        """
        original_pwd = db_url.split('//')[-1].split('@')[0].split(':')[-1]
        return db_url.replace(original_pwd, quote(original_pwd))

    def _get_args(self, host: str, port: int, database: str, user: str, password: str) -> Dict:
        """Return db credentials.

        :param str host: DB Host name
        :param int port: DB port number
        :param str database: DB name
        :param str user: DB user name
        :param str password: DB password for user
        :return: DB Credentials
        """
        return dict(
            host=host,
            port=port,
            database=database,
            user=user,
            password=password,
            application_name='fusion_backend'
        )


postgres_instance = PostgresDatabase()


async def get_genomic_coords(db: PostgresDatabase, tx_ac: str, start_exon: int, end_exon: int,
                             start_exon_offset: int = 0, end_exon_offset: int = 0,
                             gene: str = None) -> Optional[Dict]:
    """Get genomic chromosome and start/end exon coordinates.

    :param PostgresDatabase db: asyncpg-driven PostgreSQL database instance
    :param str tx_ac: Transcript accession
    :param int start_exon: Starting exon number
    :param int end_exon: Ending exon number
    :param int start_exon_offset: Starting exon offset
    :param int end_exon_offset: Ending exon offset
    :param str gene: Gene symbol
    :return: Dictionary containing transcript and exon data, or None if lookup fails
    """
    if gene:
        gene = gene.upper().strip()

    if tx_ac:
        tx_ac = tx_ac.strip()

    tx_exon_start_end = await get_tx_exon_start_end(db, tx_ac, start_exon, end_exon)
    if not tx_exon_start_end:
        return None
    (tx_exons, start_exon, end_exon) = tx_exon_start_end

    tx_exon_coords = get_tx_exon_coords(tx_exons, start_exon, end_exon)
    if not tx_exon_coords:
        return None
    tx_exon_start, tx_exon_end = tx_exon_coords

    alt_ac_start_end = await get_alt_ac_start_and_end(db, tx_ac, tx_exon_start, tx_exon_end,
                                                      gene=gene)
    if not alt_ac_start_end:
        return None
    alt_ac_start, alt_ac_end = alt_ac_start_end

    start = alt_ac_start[3]
    end = alt_ac_end[2]
    strand = alt_ac_start[4]
    if strand == -1:
        start_offset = start_exon_offset * -1
        end_offset = end_exon_offset * -1
    else:
        start_offset = start_exon_offset
        end_offset = end_exon_offset
    start += start_offset
    end += end_offset

    return {
        "gene": alt_ac_start[0],
        "chr": alt_ac_start[1],
        "start": start,
        "end": end,
        "exon_start": start_exon,
        "exon_start_offset": start_exon_offset,
        "exon_end": end_exon,
        "exon_end_offset": end_exon_offset,
    }


async def get_tx_exons(db: PostgresDatabase, tx_ac: str) -> Optional[List[str]]:
    """Get list of transcript exons start/end coordinates.

    :param PostgresDatabase db: asyncpg-driven PostgreSQL database instance
    :param str tx_ac: Transcript accession
    :return: List of a transcript's accessions, or None if lookup fails
    """
    query = (
        f"""
        SELECT cds_se_i
        FROM {postgres_instance.schema}._cds_exons_fp_v
        WHERE tx_ac = '{tx_ac}';
        """
    )
    cds_se_i = await db.execute_query(query)
    if not cds_se_i:
        logger.warning(f"Unable to get exons for {tx_ac}")
        return None
    return cds_se_i[0][0].split(';')


async def get_tx_exon_start_end(db: PostgresDatabase, tx_ac: str, start_exon: int, end_exon: int)\
        -> Optional[Tuple[List[str], int, int]]:
    """Get exon start/end coordinates given accession and gene.

    :param PostgresDatabase db: asyncpg-driven PostgreSQL database instance
    :param str tx_ac: Transcript accession
    :param int start_exon: Starting exon number
    :param int end_exon: Ending exon number
    :return: Transcript's exons and start/end exon coordinates, or None if lookup fails
    """
    if start_exon and end_exon:
        if start_exon > end_exon:
            logger.warning(f"start exon, {start_exon},"
                           f"is greater than end exon, {end_exon}")
            return None
        elif end_exon < start_exon:
            logger.warning(f"end exon, {end_exon}, "
                           f"is less than start exon, {start_exon}")
            return None

    tx_exons = await get_tx_exons(db, tx_ac)
    if not tx_exons:
        return None

    if start_exon == 0:
        start_exon = 1

    if end_exon == 0:
        end_exon = len(tx_exons)

    return tx_exons, start_exon, end_exon


def get_tx_exon_coords(tx_exons: List[str], start_exon: int, end_exon: int)\
        -> Optional[Tuple[List, List]]:
    """Get transcript exon coordinates.

    :param list tx_exons: List of transcript exons
    :param int start_exon: Start exon number
    :param int end_exon: End exon number
    :return: Transcript start exon coords, Transcript end exon coords, or None if there's a
        mismatch between coordinates and retrieved exon numbers
    """
    try:
        tx_exon_start = tx_exons[start_exon - 1].split(',')
        tx_exon_end = tx_exons[end_exon - 1].split(',')
    except IndexError as e:
        logger.warning(e)
        return None
    return tx_exon_start, tx_exon_end


async def get_alt_ac_start_and_end(db: PostgresDatabase, tx_ac: str, tx_exon_start: List[str],
                                   tx_exon_end: List[str], gene: str=None)\
        -> Optional[Tuple[Tuple, Tuple]]:
    """Get genomic coordinates for related transcript exon start and end.

    :param PostgresDatabase db: asyncpg-driven PostgreSQL database instance
    :param str tx_ac: Transcript accession
    :param List[str] tx_exon_start: Transcript's exon start coordinates
    :param List[str] tx_exon_end: Transcript's exon end coordinates
    :param str gene: Gene symbol
    :return: Alt ac start and end data
    """
    alt_ac_start = await get_alt_ac_start_or_end(db, tx_ac, int(tx_exon_start[0]), int(tx_exon_start[1]),
                                           gene=gene)
    if not alt_ac_start:
        return None

    alt_ac_end = await get_alt_ac_start_or_end(db, tx_ac, int(tx_exon_end[0]), int(tx_exon_end[1]),
                                         gene=gene)
    if not alt_ac_end:
        return None

    # validate
    if alt_ac_start[0] != alt_ac_end[0]:
        logger.warning(f"{alt_ac_start[0]} != {alt_ac_end[0]}")
        return None
    if alt_ac_start[1] != alt_ac_end[1]:
        logger.warning(f"{alt_ac_start[1]} != {alt_ac_end[1]}")
        return None
    if alt_ac_start[4] != alt_ac_end[4]:
        logger.warning(f"{alt_ac_start[4]} != {alt_ac_end[4]}")
        return None
    return alt_ac_start, alt_ac_end


async def get_alt_ac_start_or_end(db: PostgresDatabase, tx_ac: str, tx_exon_start: int,
                                  tx_exon_end: int, gene: Optional[str])\
        -> Optional[Tuple[str, str, int, int, int]]:
    """Get genomic data for related transcript exon start or end.

    :param PostgresDatabase db: asyncpg-driven PostgreSQL database instance
    :param str tx_ac: Transcript accession
    :param int tx_exon_start: Transcript's exon start coordinate
    :param int tx_exon_end: Transcript's exon end coordinate
    :param Optional[str] gene: Gene symbol
    :return: hgnc symbol, genomic accession for chromosome,
        start exon's end coordinate, end exon's start coordinate, strand
    """
    if gene:
        gene_query = f"AND T.hgnc = '{gene}'"
    else:
        gene_query = ''

    query = (
        f"""
        SELECT T.hgnc, T.alt_ac, T.alt_start_i, T.alt_end_i, T.alt_strand
        FROM uta_20210129._cds_exons_fp_v as C
        JOIN uta_20210129.tx_exon_aln_v as T ON T.tx_ac = C.tx_ac
        WHERE T.tx_ac = '{tx_ac}'
        {gene_query}
        AND {tx_exon_start} BETWEEN T.tx_start_i AND T.tx_end_i
        AND {tx_exon_end} BETWEEN T.tx_start_i AND T.tx_end_i
        AND T.alt_aln_method = 'splign'
        AND T.alt_ac LIKE 'NC_00%'
        ORDER BY T.alt_ac DESC;
        """
    )
    results = await db.execute_query(query)
    if not results:
        logger.warning(f"Unable to get genomimc data for {tx_ac}"
                       f" on start exon {tx_exon_start} and "
                       f"end exon {tx_exon_end}")
        return None
    result = results[0]
    return result[0], result[1], result[2], result[3], result[4]
