"""Wrapper for required Gene Normalization services."""

import csv
from pathlib import Path

from gene.query import QueryHandler
from gene.schemas import MatchType

from curfu import LookupServiceError, logger
from curfu.utils import get_data_file

# term -> (normalized ID, normalized label)
Map = dict[str, tuple[str, str, str]]

# term -> (normalized ID, normalized label)
Map = dict[str, tuple[str, str, str]]
# term, symbol, concept ID, chromosome, strand
Suggestion = tuple[str, str, str, str, str]


class GeneService:
    """Provide gene ID resolution and term autocorrect suggestions."""

    def __init__(self, suggestions_file: Path | None = None) -> None:
        """Initialize gene service provider class.

        :param suggestions_file: path to existing suggestions file. If not provided,
            will use newest available file in expected location.
        """
        if not suggestions_file:
            suggestions_file = get_data_file("gene_suggest")

        self.concept_id_map: dict[str, Suggestion] = {}
        self.symbol_map: dict[str, Suggestion] = {}
        self.aliases_map: dict[str, Suggestion] = {}
        self.prev_symbols_map: dict[str, Suggestion] = {}

        for row in csv.DictReader(suggestions_file.open()):
            symbol = row["symbol"]
            concept_id = row["concept_id"]
            suggestion = [symbol, concept_id, row["chromosome"], row["strand"]]
            self.concept_id_map[concept_id.upper()] = (concept_id, *suggestion)
            self.symbol_map[symbol.upper()] = (symbol, *suggestion)
            for alias in row.get("aliases", []):
                self.aliases_map[alias.upper()] = (alias, *suggestion)
            for prev_symbol in row.get("previous_symbols", []):
                self.prev_symbols_map[prev_symbol.upper()] = (prev_symbol, *suggestion)

    @staticmethod
    def get_normalized_gene(
        term: str, normalizer: QueryHandler
    ) -> tuple[str, str, str | str | None]:
        """Get normalized ID given gene symbol/label/alias.
        :param str term: user-entered gene term
        :param QueryHandler normalizer:  gene normalizer instance
        :returns: concept ID, str, if successful
        :raises ServiceWarning: if lookup fails
        """
        response = normalizer.normalize(term)
        if response.match_type != MatchType.NO_MATCH:
            gd = response.gene
            if not gd or not gd.gene_id:
                msg = f"Unexpected null property in normalized response for `{term}`"
                logger.error(msg)
                raise LookupServiceError(msg)
            concept_id = gd.gene_id
            symbol = gd.label
            if not symbol:
                msg = f"Unable to retrieve symbol for gene {concept_id}"
                logger.error(msg)
                raise LookupServiceError(msg)
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
                    f"Couldn't find cased version for search term {term} matching gene ID {response.gene.gene_id}"
                )
            return (concept_id, symbol, term_cased)
        warn = f"Lookup of gene term {term} failed."
        logger.warning(warn)
        raise LookupServiceError(warn)

    @staticmethod
    def _get_completion_results(term: str, lookup: dict) -> list[Suggestion]:
        """Filter valid completions for term.

        :param term: user-entered text
        :param lookup: stored mapping where key is a name (e.g. symbol or alias) and
            value is the complete suggestion
        :return: List of suggested completions along with relevant metadata
        """
        matches = []
        for key, data in lookup.items():
            if key.startswith(term):
                matches.append(data)
        return sorted(matches, key=lambda s: s[0])

    def suggest_genes(self, query: str) -> dict[str, list[Suggestion]]:
        """Provide autocomplete suggestions based on submitted term.

        :param str query: text entered by user
        :returns: dict returning list containing any number of suggestion tuples, where
            each is the correctly-cased term, normalized ID, normalized label, for each
            item type
        """
        q_upper = query.upper()
        suggestions = {}
        suggestions["concept_id"] = self._get_completion_results(
            q_upper, self.concept_id_map
        )
        suggestions["symbol"] = self._get_completion_results(q_upper, self.symbol_map)
        suggestions["prev_symbols"] = self._get_completion_results(
            q_upper, self.prev_symbols_map
        )
        suggestions["aliases"] = self._get_completion_results(q_upper, self.aliases_map)
        return suggestions
