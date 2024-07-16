"""Provide tools to build backend data relating to gene identification."""

import csv
import datetime
from pathlib import Path
from timeit import default_timer as timer

import click
from biocommons.seqrepo.seqrepo import SeqRepo
from gene.database import create_db
from gene.schemas import RecordType

from curfu import APP_ROOT, SEQREPO_DATA_PATH, logger


class GeneSuggestionBuilder:
    """Provide build tools for gene autosuggest mappings.

    Implemented as a class for easier sharing of database resources between methods.
    """

    def __init__(self) -> None:
        """Initialize class."""
        self.gene_db = create_db()
        self.sr = SeqRepo(SEQREPO_DATA_PATH)
        self.genes = []

    def _get_chromosome(self, record: dict) -> str | None:
        """Extract readable chromosome identifier from gene extensions.

        :param record: stored normalized record
        :return: NC_ chromosome ID if successful
        """
        for source in ("ncbi_locations", "ensembl_locations", "locations"):
            for location in record.get(source, []):
                if location["type"] == "SequenceLocation":
                    identifiers = self.sr.translate_identifier(
                        location["sequence_id"], "NCBI"
                    )
                    if identifiers:
                        return identifiers[0]
        return None

    @staticmethod
    def _make_list_column(values: list[str]) -> str:
        """Convert a list of strings into a comma-separated string, filtering out
        non-alphabetic values.

        This static method takes a list of strings as input and converts it into a
        comma-separated string. The method filters out non-alphabetic values and
        ensures that only unique, alphabetic values are included in the result.

        Note:
        ----
        - The method performs a case-insensitive comparison when filtering unique
          values.
        - If the input list contains non-alphabetic values or duplicates, they will be
          excluded from the result.
        - The result will be a comma-separated string with no leading or trailing
          commas.

        :param values: A list of strings to be converted into a comma-separated string.
        :return: A comma-separated string containing unique, alphabetic values from the
            input list.

        """
        unique = {v.upper() for v in values}
        filtered = {v for v in unique if any(char.isalpha() for char in v)}
        return ",".join(filtered)

    def _process_gene_record(self, record: dict) -> None:
        """Add the gene record to processed suggestions.

        :param record: gene record object retrieved from DB
        """
        symbol = record.get("symbol")
        chromosome = self._get_chromosome(record)
        strand = record.get("strand")
        if not all([symbol, chromosome, strand]):
            return
        gene_data = {
            "concept_id": record["concept_id"],
            "symbol": symbol,
            "aliases": self._make_list_column(record.get("aliases", [])),
            "previous_symbols": self._make_list_column(
                record.get("previous_symbols", [])
            ),
            "chromosome": self._get_chromosome(record),
            "strand": record.get("strand"),
        }
        self.genes.append(gene_data)

    def _save_suggest_file(self, output_dir: Path) -> None:
        """Save the gene suggestions table to a CSV file.

        This method takes the processed gene suggestions stored in the `self.genes`
        attribute and saves them to a CSV file. The CSV file will have the following
        columns:

        - `concept_id`: The unique identifier for the gene concept.
        - `symbol`: The primary gene symbol.
        - `aliases`: Comma-separated list of gene aliases.
        - `previous_symbols`: Comma-separated list of previous gene symbols.
        - `chromosome`: The chromosome where the gene is located.
        - `strand`: The genomic strand where the gene is located.

        The CSV file will be named using the current date in the format
        "gene_suggest_YYYYMMDD.csv" and will be saved in the specified `output_dir`.

        :param output_dir: The directory where the gene suggestions table file will be
            saved.
        """
        fieldnames = [
            "concept_id",
            "symbol",
            "aliases",
            "previous_symbols",
            "chromosome",
            "strand",
        ]
        today = datetime.datetime.strftime(
            datetime.datetime.now(tz=datetime.timezone.utc), "%Y%m%d"
        )
        with (output_dir / f"gene_suggest_{today}.csv").open("w") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in self.genes:
                writer.writerow(row)

    def build_gene_suggestion_file(self, output_dir: Path = APP_ROOT / "data") -> None:
        """Build the gene suggestions table file by processing gene records from the
        gene database.

        - The gene database should be initialized before calling this method.
        - The gene suggestions table file will be saved in CSV format.

        :param output_dir: The directory where the gene suggestions table file will be
            saved. Default is the 'data' directory within the application root.
        :return: None
        """
        start = timer()

        for record in self.gene_db.get_all_records(RecordType.MERGER):
            self._process_gene_record(record)

        self._save_suggest_file(output_dir)

        stop = timer()
        msg = f"Built gene suggestions table in {(stop - start):.5f} seconds."
        click.echo(msg)
        logger.info(msg)
