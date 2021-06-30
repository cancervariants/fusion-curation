"""Wrapper for required Gene Normalization services."""
from gene.query import QueryHandler


gene_query_handler = QueryHandler()


def get_gene_id(symbol: str) -> str:
    """Get ID given gene symbol.

    :param str symbol: user-entered gene symbol
    :returns: concept ID as a string
    :raises LookupError: if no match is found
    """
    normed = gene_query_handler.search_sources(symbol, incl='hgnc', keyed=True)
    hgnc = normed['source_matches']['HGNC']
    if hgnc['match_type'] > 0:
        return hgnc['records'][0].concept_id
    else:
        raise LookupError(f"Could not find matching ID for symbol {symbol}")
