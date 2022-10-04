"""Provide lookup services for functional domains.

TODO
 * domains file should be a JSON and pre-pruned to unique pairs
 * get_possible_domains shouldn't have to force uniqueness
"""
from typing import List, Dict
import csv

from curfu import logger, ServiceWarning
from curfu.utils import get_data_file


class DomainService:
    """Handler class providing requisite services for functional domain lookup."""

    domains: Dict[str, List[Dict]] = {}

    def load_mapping(self) -> None:
        """Load mapping file.

        Domain map file should be tab separated with a column for each:
        * UniProt accession
        * Normalized gene ID
        * Normalized gene symbol
        * InterPro ID
        * InterPro domain name
        * Start coordinate
        * Stop coordinate
        * RefSeq protein accession
        """
        domain_file = get_data_file("domain_lookup")
        with open(domain_file, "r") as df:
            reader = csv.reader(df, delimiter="\t")
            for row in reader:
                gene_id = row[0].lower()
                domain_data = {
                    "interpro_id": f"interpro:{row[2]}",
                    "domain_name": row[3],
                    "start": int(row[4]),
                    "end": int(row[5]),
                    "refseq_ac": f"{row[6]}",
                }
                if gene_id in self.domains:
                    self.domains[gene_id].append(domain_data)
                else:
                    self.domains[gene_id] = [domain_data]

    def get_possible_domains(self, gene_id: str) -> List[Dict]:
        """Given normalized gene ID, return associated domain names and IDs

        :return: List of valid domain names (up to n names) paired with domain IDs
        :raise: ServiceWarning if no matches are available for gene ID
        """
        try:
            domains = self.domains[gene_id.lower()]
        except KeyError:
            logger.warning(f"Unable to retrieve associated domains for {gene_id}")
            raise ServiceWarning
        return domains
