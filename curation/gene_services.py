"""Wrapper for required Gene Normalization services."""
from gene.query import QueryHandler


class GeneService():
    """Provide services related to gene symbol and ID resolution."""

    def __init__(self):
        """Initialize gene service handler."""
        # set Gene Normalization settings via environment variables -- see Gene Normalization README
        self.gene_query_handler = QueryHandler()

    def get_gene_id(self, term: str) -> str:
        """Get normalized ID given gene symbol/label/alias.
        :param str term: user-entered gene term
        :returns: concept ID as a string
        :raises LookupError: if no match is found
        """
        response = self.gene_query_handler.normalize(term)
        if response['match_type'] != 0:
            return response['gene_descriptor']['value']['id']
        else:
            raise LookupError(f"Could not find matching ID for symbol {term}")


gene_service = GeneService()
