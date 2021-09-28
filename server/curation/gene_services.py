"""Wrapper for required Gene Normalization services."""
from curation import logger
from gene.query import QueryHandler
from gene.schemas import MatchType
from typing import List, Tuple, Optional


# set Gene Normalization settings via environment variables -- see Gene Normalization README
gene_query_handler = QueryHandler()


def get_gene_id(term: str) -> Tuple[Optional[str], List[str]]:
    """Get normalized ID given gene symbol/label/alias.
    :param str term: user-entered gene term
    :returns: Tuple with a concept ID (str, empty if fails) and List of
        warnings (empty if fully successful)
    """
    response = gene_query_handler.normalize(term)
    if response['match_type'] != MatchType.NO_MATCH:
        concept_id = response['gene_descriptor']['gene']['gene_id']
        return (concept_id, [])
    else:
        warn = f'Lookup of gene term {term} failed.'
        logger.warning(warn)
        return (None, [warn])
