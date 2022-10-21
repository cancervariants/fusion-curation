"""Provide tools to build backend data relating to gene identification."""
from typing import Dict, Tuple
from pathlib import Path
from datetime import datetime as dt
from timeit import default_timer as timer

from gene.query import QueryHandler
import click

from curfu import APP_ROOT, logger


# type stub
Map = Dict[str, Tuple[str, str, str]]


class GeneSuggestionBuilder:
    """Provide build tools for gene autosuggest mappings.

    Implemented as a class for easier sharing of DynamoDB resources between methods.
    """

    xrefs_map = {}
    symbol_map = {}
    label_map = {}
    prev_symbol_map = {}
    alias_map = {}
    assoc_with_map = {}

    def __init__(self):
        """Initialize class.

        TODO: think about how best to force prod environment
        """
        self.q = QueryHandler()
        self.genes = self.q.db.genes

    @staticmethod
    def write_map_to_file(mapping: Map, outfile_path: Path) -> None:
        """Save individual gene mapping to file.
        :param Map mapping: dictionary keying values of a specific item_type set
        to normalized gene data
        :param outfile_path Path: path to save mapping at
        """
        with open(outfile_path, "w") as fp:
            for normed in mapping.values():
                fp.write(f"{normed[0]}\t{normed[1]}\t{normed[2]}\n")

    def update_maps(self, record: Dict) -> None:
        """Add map entries for relevant data in given DB record.
        :param Dict record: individual identity or merged record from DDB. Ideally,
        should not duplicate previous records (i.e., `record` should not be a record
        for which an associated merged record exists).
        """
        norm_id = record["concept_id"]
        norm_symbol = record["symbol"]

        for xref in [norm_id] + record.get("xrefs", []):
            self.xrefs_map[xref.lower()] = (xref, norm_id, norm_symbol)

        self.symbol_map[norm_symbol.lower()] = (norm_symbol, norm_id, "")

        for prev_symbol in record.get("previous_symbols", []):
            self.prev_symbol_map[prev_symbol.lower()] = (
                prev_symbol,
                norm_id,
                norm_symbol,
            )

        for assoc_with in record.get("associated_with", []):
            self.assoc_with_map[assoc_with.lower()] = (assoc_with, norm_id, norm_symbol)

        label = record.get("label")
        if label:
            self.label_map[label.lower()] = (label, norm_id, norm_symbol)

        for alias in record.get("aliases", []):
            self.alias_map[alias.lower()] = (alias, norm_id, norm_symbol)

    def build_gene_suggest_maps(self, output_dir: Path = APP_ROOT / "data") -> None:
        """Construct gene autocomplete suggestion mappings.
        Scan existing gene_concepts table and gather all possible terms that can be
        used to look up normalized concepts. Then, link them with their associated
        normalized concept IDs/labels and save them.

        :param Path output_dir: path to directory to save output files in
        """
        start = timer()

        last_evaluated_key = None
        valid_item_types = ("identity", "merger")
        while True:
            if last_evaluated_key:
                response = self.genes.scan(ExclusiveStartKey=last_evaluated_key)
            else:
                response = self.genes.scan()
            last_evaluated_key = response.get("LastEvaluatedKey")
            records = response["Items"]

            for record in records:
                if record["item_type"] not in valid_item_types:
                    continue
                elif "merge_ref" in record:
                    continue
                self.update_maps(record)

            if not last_evaluated_key:
                break

        today = dt.strftime(dt.today(), "%Y%m%d")
        for (map, name) in (
            (self.xrefs_map, "xrefs"),
            (self.symbol_map, "symbols"),
            (self.label_map, "labels"),
            (self.prev_symbol_map, "prev_symbols"),
            (self.alias_map, "aliases"),
            (self.assoc_with_map, "assoc_with"),
        ):
            self.write_map_to_file(map, output_dir / f"gene_{name}_suggest_{today}.tsv")

        stop = timer()
        msg = f"Built gene suggestions table in {(stop - start):.5f} seconds."
        click.echo(msg)
        logger.info(msg)
