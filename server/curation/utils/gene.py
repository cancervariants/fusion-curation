"""Provide tools to build backend data relating to gene identification."""
from typing import Dict, Tuple
from pathlib import Path
from datetime import datetime as dt
from timeit import default_timer as timer

from gene.query import QueryHandler
import click

from curation import APP_ROOT, logger


# type stub
Map = Dict[str, Tuple[str, str]]


class GeneSuggestionBuilder:
    """Provide build tools for gene autosuggest mappings.

    Implemented as a class for easier sharing of DynamoDB resources between methods.
    """

    def __init__(self):
        """Initialize class.

        TODO: think about how best to force prod environment
        """
        self.q = QueryHandler()
        self.genes = self.q.db.genes

    def add_norm_to_mapping(self, mapping: Map, term: str) -> None:
        """Add normalized gene data to an individual mapping object. Performs
        in-place update.

        :param Map mapping: dictionary keying values of a specific item_type set
            to normalized gene data
        :param str term: term to received normalized ID and label for
        :raise Exception: if normalization fails
        """
        if term not in mapping:
            norm_response = self.q.normalize(term)
            try:
                descriptor = norm_response["gene_descriptor"]
            except KeyError:
                msg = f"Unable to normalize term: {term}"
                logger.error(msg)
                raise Exception(msg)
            norm_id = descriptor["gene"]["gene_id"]
            norm_label = descriptor["label"]
            mapping[term] = (norm_id, norm_label)

    @staticmethod
    def write_map_to_file(mapping: Map, outfile_path: Path) -> None:
        """Save individual gene mapping to file.
        :param Map mapping: dictionary keying values of a specific item_type set
            to normalized gene data
        :param outfile_path Path: path to save mapping at
        """
        with open(outfile_path, 'w') as fp:
            for key, normed in mapping.items():
                fp.write(f"{key}\t{normed[0]}\t{normed[1]}\n")

    def build_gene_suggest_maps(self, output_dir: Path = APP_ROOT / 'data') -> None:
        """Construct gene autocomplete suggestion mappings.
        Scan existing gene_concepts table and gather all possible terms that can be
        used to look up normalized concepts. Then, link them with their associated
        normalized concept IDs/labels and save them.

        :param Path output_dir: path to directory to save output files in
        """
        start = timer()
        gene_terms: Map = {}
        gene_xrefs: Map = {}
        gene_assoc: Map = {}

        last_evaluated_key = None
        while True:
            if last_evaluated_key:
                response = self.genes.scan(ExclusiveStartKey=last_evaluated_key)
            else:
                response = self.genes.scan()
            last_evaluated_key = response.get("LastEvaluatedKey")
            records = response["Items"]
            for record in records:
                item_type = record.get("item_type")
                if not item_type:
                    logger.error(f"item_type attribute not set in record {record}")
                    continue

                label_and_type = record["label_and_type"]
                term = label_and_type[:label_and_type.rfind("#") - 1]

                if item_type in {"identity", "xref", "merger"}:
                    self.add_norm_to_mapping(gene_xrefs, term)
                elif item_type in {"symbol", "prev_symbol", "alias"}:
                    self.add_norm_to_mapping(gene_terms, term)
                elif item_type in {"associated_with"}:
                    self.add_norm_to_mapping(gene_assoc, term)
                else:
                    logger.error(f"unrecognized item_type attribute {item_type} in "
                                 f"record {record}")
                    continue

            if not last_evaluated_key:
                break

        today = dt.strftime(dt.today(), "%Y%m%d")
        for (map, name) in ((gene_terms, "terms"),
                            (gene_xrefs, "xrefs"),
                            (gene_assoc, "assoc")):
            self.write_map_to_file(map,
                                   output_dir / f"gene_{name}_suggest_{today}.tsv")
        stop = timer()
        msg = f"Wrote gene suggestions table in {(stop - start):.5f} seconds."
        click.echo(msg)
        logger.info(msg)
