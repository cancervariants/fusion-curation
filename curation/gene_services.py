"""Wrapper for required Gene Normalization services."""
from gene.query import QueryHandler


class GeneService():
    """Provide services related to gene symbol and ID resolution."""

    def __init__(self):
        """Initialize gene service handler."""
        self.gene_query_handler = QueryHandler()

    def get_gene_id(self, symbol: str) -> str:
        """Get ID given gene symbol.
        TODO: handle multiple records/IDs for the same input string

        :param str symbol: user-entered gene symbol
        :returns: concept ID as a string
        :raises LookupError: if no match is found
        """
        normed = self.gene_query_handler.search_sources(symbol, incl='hgnc', keyed=True)
        hgnc = normed['source_matches']['HGNC']
        if hgnc['match_type'] > 0:
            return hgnc['records'][0].concept_id
        else:
            raise LookupError(f"Could not find matching ID for symbol {symbol}")


gene_service = GeneService()
