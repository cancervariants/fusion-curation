"""Wrapper for required Gene Normalization services."""
from typing import List, Tuple, Dict, Union
import csv

from gene.query import QueryHandler
from gene.schemas import MatchType
from ga4gh.vrsatile.pydantic.vrsatile_models import CURIE

from curfu import logger, ServiceWarning, MAX_SUGGESTIONS, APP_ROOT


# term -> (normalized ID, normalized label)
Map = Dict[str, Tuple[str, str, str]]


class GeneService:
    """Provide gene ID resolution and term autocorrect suggestions."""

    aliases_map: Map = {}
    prev_symbols_map: Map = {}
    symbols_map: Map = {}

    # not currently used
    labels_map: Map = {}
    xrefs_map: Map = {}
    assoc_with_map: Map = {}

    def load_mapping(self) -> None:
        """Load mapping files for use in autocomplete."""
        data_dir = APP_ROOT / "data"
        map_pairs = (
            ("aliases", self.aliases_map),
            ("assoc_with", self.assoc_with_map),
            ("xrefs", self.xrefs_map),
            ("prev_symbols", self.prev_symbols_map),
            ("labels", self.labels_map),
            ("symbols", self.symbols_map),
        )
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

    @staticmethod
    def get_normalized_gene(
        term: str, normalizer: QueryHandler
    ) -> Tuple[CURIE, str, Union[str, CURIE, None]]:
        """Get normalized ID given gene symbol/label/alias.
        :param str term: user-entered gene term
        :param QueryHandler normalizer:  gene normalizer instance
        :returns: concept ID, str, if successful
        :raises ServiceWarning: if lookup fails
        """
        response = normalizer.normalize(term)
        if response.match_type != MatchType.NO_MATCH:
            gd = response.gene_descriptor
            if not gd or not gd.gene_id:
                msg = f"Unexpected null property in normalized response for `{term}`"
                logger.error(msg)
                raise ServiceWarning(msg)
            concept_id = gd.gene_id
            symbol = gd.label
            if not symbol:
                msg = f"Unable to retrieve symbol for gene {concept_id}"
                logger.error(msg)
                raise ServiceWarning(msg)
            term_lower = term.lower()
            term_cased = None
            if response.match_type == 100:
                if term_lower == symbol.lower():
                    term_cased = symbol
                elif term_lower == concept_id.lower():
                    term_cased = concept_id
            elif response.match_type == 80:
                for ext in gd.extensions:
                    if ext.name == "previous_symbols":
                        for prev_symbol in ext.value:
                            if term_lower == prev_symbol.lower():
                                term_cased = prev_symbol
                                break
                        break
            elif response.match_type == 60:
                if gd.alternate_labels:
                    for alias in gd.alternate_labels:
                        if term_lower == alias.lower():
                            term_cased = alias
                            break
                if not term_cased and gd.xrefs:
                    for xref in gd.xrefs:
                        if term_lower == xref.lower():
                            term_cased = xref
                            break
                if not term_cased:
                    for ext in gd.extensions:
                        if ext.name == "associated_with":
                            for assoc in ext.value:
                                if term_lower == assoc.lower():
                                    term_cased = assoc
                                    break
                            break
            if not term_cased:
                logger.warning(
                    f"Couldn't find cased version for search term {term} matching gene ID {response.gene_descriptor.gene_id}"  # noqa: E501
                )  # noqa: E501
            return (concept_id, symbol, term_cased)
        else:
            warn = f"Lookup of gene term {term} failed."
            logger.warning(warn)
            raise ServiceWarning(warn)

    def suggest_genes(self, query: str) -> Dict[str, List[Tuple[str, str, str]]]:
        """Provide autocomplete suggestions based on submitted term.

        Outstanding questions:
         * Where to make decisions about item types -- in client? provide as route
         parameter? in gene services? All of the above?
         * how to safely reduce redundant suggestions

        :param str query: text entered by user
        :returns: dict returning list containing any number of suggestion tuples, where
        each is the correctly-cased term, normalized ID, normalized label, for each
        item type
        :raises ServiceWarning: if number of matching suggestions exceeds
        MAX_SUGGESTIONS
        """
        # tentatively, just search terms
        q_lower = query.lower()
        suggestions = {}
        suggestions["symbols"] = sorted(
            [
                (v[2], v[1], v[2])
                for t, v in self.symbols_map.items()
                if t.startswith(q_lower)
            ],
            key=lambda s: s[0],
        )
        suggestions["prev_symbols"] = sorted(
            [
                (v[0], v[1], v[2])
                for t, v in self.prev_symbols_map.items()
                if t.startswith(q_lower)
            ],
            key=lambda s: s[0],
        )
        suggestions["aliases"] = sorted(
            [
                (v[0], v[1], v[2])
                for t, v in self.aliases_map.items()
                if t.startswith(q_lower)
            ],
            key=lambda s: s[0],
        )

        n = (
            len(suggestions["symbols"])
            + len(suggestions["prev_symbols"])
            + len(suggestions["aliases"])
        )
        if n > MAX_SUGGESTIONS:
            warn = f"Exceeds max matches: Got {n} possible matches for {query} (limit: {MAX_SUGGESTIONS})"  # noqa: E501
            logger.warning(warn)
            raise ServiceWarning(warn)
        else:
            return suggestions
