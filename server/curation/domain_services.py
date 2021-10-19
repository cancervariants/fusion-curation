"""Provide lookup services for functional domains.

TODO
 * domains file should be a JSON and pre-pruned to unique pairs
 * get_possible_domains shouldn't have to force uniqueness
"""
from typing import List, Tuple, Dict
import csv
import os
from pathlib import Path

from curation import APP_ROOT, logger, ServiceWarning


# type stubs
DomainPair = Tuple[str, str]


class DomainService():
    """Handler class providing requisite services for functional domain lookup."""

    domains: Dict[str, List[DomainPair]] = {}

    def load_mapping(self) -> None:
        """Load mapping file.

        Checks the environment variable FUSION_CURATION_DOMAIN_FILE for a valid path.
        If that fails, checks APP_ROOT/data for a file matching the glob
        `domain_lookup_*.tsv`.
        """
        domain_file = os.environ.get("FUSION_CURATION_DOMAIN_FILE")
        if not domain_file or not Path(domain_file).exists():
            domain_files = list((APP_ROOT / "data").glob("domain_lookup_*.tsv"))
            if not domain_files:
                msg = "No domain lookup mappings found."
                print("Warning: " + msg)
                logger.warning(msg)
                return
            domain_files.sort(key=lambda f: f.name, reverse=True)
            domain_file = domain_files[0]
        with open(domain_file, "r") as df:
            reader = csv.reader(df, delimiter="\t")
            for row in reader:
                interpro_id = f"interpro:{row[2]}"
                gene_id = row[0].lower()
                if gene_id in self.domains:
                    self.domains[gene_id].append((interpro_id, row[3]))
                else:
                    self.domains[gene_id] = [(interpro_id, row[3])]

    def get_possible_domains(self, gene_id: str) -> List[DomainPair]:
        """Given normalized gene ID, return associated domain names and IDs

        :return: List of valid domain names (up to n names) paired with domain IDs
        :raise: ServiceWarning if no matches are available for gene ID
        """
        try:
            domains = self.domains[gene_id.lower()]
        except KeyError:
            logger.warning(f"Unable to retrieve associated domains for {gene_id}")
            raise ServiceWarning
        return list(set(domains))


domain_service = DomainService()
domain_service.load_mapping()
get_possible_domains = domain_service.get_possible_domains
