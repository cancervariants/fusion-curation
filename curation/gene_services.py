"""Wrapper for required Gene Normalization services."""
from curation import logger
from gene.query import QueryHandler
from gene.schemas import MatchType
from typing import List, Tuple


class GeneService():
    """Provide services related to gene symbol and ID resolution."""

    def __init__(self):
        """Initialize gene service handler."""
        # set Gene Normalization settings via environment variables -- see Gene Normalization README
        self.gene_query_handler = QueryHandler()

    def get_gene_id(self, term: str) -> Tuple[str, List[str]]:
        """Get normalized ID given gene symbol/label/alias.
        :param str term: user-entered gene term
        :returns: Tuple with a symbol (str, empty if fails) and List of
            warnings (empty if fully successful)
        """
        response = self.gene_query_handler.normalize(term)
        if response['match_type'] != MatchType.NO_MATCH:
            concept_id = response['gene_descriptor']['gene']['gene_id']
            return (concept_id, [])
        else:
            warn = f'Lookup of gene symbol {term} failed.'
            logger.warning(warn)
            return ('', [warn])

gene_service = GeneService()
