"""Wrapper for required Gene Normalization services."""
from typing import List, Tuple, Dict
import csv

from gene.query import QueryHandler
from gene.schemas import MatchType

from curation import logger, ServiceWarning, MAX_SUGGESTIONS, APP_ROOT


# term -> (normalized ID, normalized label)
Map = Dict[str, Tuple[str, str, str]]


class GeneService:
    """Provide gene ID resolution and term autocorrect suggestions."""

    # set Gene Normalization settings via env variables -- see Gene Normalization README
    gene_query_handler = QueryHandler()

    aliases_map: Map = {}
    labels_map: Map = {}
    prev_symbols_map: Map = {}
    symbols_map: Map = {}

    # not currently used
    xrefs_map: Map = {}
    assoc_with_map: Map = {}

    def load_mapping(self) -> None:
        """Load mapping files for use in autocomplete."""
        data_dir = APP_ROOT / "data"
        map_pairs = (("aliases", self.aliases_map), ("assoc_with", self.assoc_with_map),
                     ("xrefs", self.xrefs_map), ("prev_symbols", self.prev_symbols_map),
                     ("labels", self.labels_map), ("symbols", self.symbols_map))
        for name, map in map_pairs:
            map_files = list(data_dir.glob(f"gene_{name}_*.tsv"))
            if not map_files:
                msg = f"No gene {name} mappings found."
                print("Warning: " + msg)
                logger.warning(msg)
                continue
            map_files.sort(key=lambda f: f.name, reverse=True)
            map_file = map_files[0]
            with open(map_file, "r") as m:
                reader = csv.reader(m, delimiter="\t")
                for term_lower, term, normalized_id, normalized_label in reader:
                    map[term_lower] = (term, normalized_id, normalized_label)

    def get_gene_id(self, term: str) -> str:
        """Get normalized ID given gene symbol/label/alias.
        :param str term: user-entered gene term
        :returns: concept ID, str, if successful
        :raises ServiceWarning: if lookup fails
        """
        response = self.gene_query_handler.normalize(term)
        if response["match_type"] != MatchType.NO_MATCH:
            concept_id = response["gene_descriptor"]["gene"]["gene_id"]
            return concept_id
        else:
            warn = f"Lookup of gene term {term} failed."
            logger.warning(warn)
            raise ServiceWarning(warn)

    def suggest_genes(self, query: str) -> List[Tuple[str, str, str, str]]:
        """Provide autocomplete suggestions based on submitted term.

        Outstanding questions:
         * Where to make decisions about item types -- in client? provide as route
         parameter? in gene services? All of the above?
         * how to reduce redundant suggestions
         * how to order suggestions

        :param str query: text entered by user
        :returns: list containing any number of suggestion tuples, where each is the
        normalized ID, normalized label, and item type
        :raises ServiceWarning: if number of matching suggestions exceeds
        MAX_SUGGESTIONS
        """
        # tentatively, just search terms
        q_lower = query.lower()
        symbols = [(v[0], v[1], v[2], "symbol") for t, v in self.symbols_map.items()
                   if t.startswith(q_lower)]
        labels = [(v[0], v[1], v[2], "label") for t, v in self.labels_map.items()
                  if t.startswith(q_lower)]
        aliases = [(v[0], v[1], v[2], "alias") for t, v in self.aliases_map.items()
                   if t.startswith(q_lower)]
        prev_symbols = [(v[0], v[1], v[2], "prev_symbol") for t, v
                        in self.prev_symbols_map.items() if t.startswith(q_lower)]

        suggestions = symbols + labels + aliases + prev_symbols  # type: ignore

        n = len(suggestions)
        if n > MAX_SUGGESTIONS:
            warn = f"Got {n} possible matches for {query} (exceeds {MAX_SUGGESTIONS})"
            logger.warning(warn)
            raise ServiceWarning(warn)
        else:
            return suggestions


gene_service = GeneService()
gene_service.load_mapping()
get_gene_id = gene_service.get_gene_id
suggest_genes = gene_service.suggest_genes
