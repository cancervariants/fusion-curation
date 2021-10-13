"""Provide utilities relating to data fetched from InterPro service."""
from typing import List, Set, Union
from pathlib import Path
import csv
from datetime import datetime
from timeit import default_timer as timer
import os

from gene.query import QueryHandler
from gene.database import Database
from gene.schemas import MatchType

from curation import APP_ROOT, logger
from curation.utils import ftp_download


def __init__(self):
    """Initialize handler class. Download files if necessary, then load and store."""
    # check if files exist
    self._data_dir = APP_ROOT / "data"
    self._data_dir.mkdir(exist_ok=True, parents=True)
    interpro_files: List[Path] = list(self._data_dir.glob("interpro_*.tsv"))
    if len(interpro_files) < 1:
        self.download_interpro()
        interpro_files = list(self._data_dir.glob("interpro_*.tsv"))
    interpro_file: Path = sorted(interpro_files, reverse=True)[0]

    # load file
    with open(interpro_file) as tsvfile:
        reader = csv.reader(tsvfile, delimiter="\t")
        reader.__next__()  # skip header
        valid_entry_types = {"Active_site", "Binding_site", "Conserved_site", "Domain"}
        self.domains = {row[2].lower(): {"case": row[2], "id": row[0]}
                        for row in reader if row[1] in valid_entry_types}


def download_domains_list(self) -> None:
    """Retrieve InterPro domain entry list TSV from EMBL-EBI servers."""
    logger.info("Downloading InterPro entry list...")
    today = datetime.today().strftime("%Y%m%d")
    fpath: Path = self._data_dir / f"interpro_{today}.tsv"
    ftp_download("ftp.ebi.ac.uk", "pub/databases/interpro", "entry.list", fpath)
    logger.info("InterPro entry list download complete.")


def download_protein2ipr(output_dir: Path) -> None:
    """Download, unpack, and store Uniprot-InterPro translation table
    :param Path output_dir: location to save file within
    """
    logger.info("Downloading domain listings from InterPro...")
    outpath = output_dir / "protein2ipr.dat.gz"
    ftp_download("ftp.ebi.ac.uk", "pub/databases/interpro", "protein2ipr.dat.gz",
                 outpath)


def _get_uniprot_refs(output_dir: Path = APP_ROOT / 'data') -> None:
    """Produce reference list for all Uniprot IDs referenced in the VICC
    gene normalizer. Saves a txt file where each line is a uniprot ID (sans
    namespace).
    :param Path output_dir: location to save output file in
    """
    os.environ["GENE_NORM_PROD"] = "TRUE"
    g = Database().genes

    uniprot_ids = []
    last_evaluated_key = None
    while True:
        if last_evaluated_key:
            response = g.scan(ExclusiveStartKey=last_evaluated_key)
        else:
            response = g.scan()
        last_evaluated_key = response.get("LastEvaluatedKey")
        records = response["Items"]
        for record in records:
            if record["item_type"] != "associated_with":
                continue
            if record["label_and_type"].startswith("uniprot"):
                uniprot_ids.append(record["label_and_type"].split("##")[0])
        if not last_evaluated_key:
            break

    outfile = open(output_dir / 'uniprot_refs.txt', 'w')
    for uniprot_id in set(uniprot_ids):
        outfile.write(uniprot_id + "\n")
    outfile.close()


def produce_gene_domain_table(protein_ipr_path: Path,
                              interpro_path: Path,
                              uniprot_refs_path: Path,
                              output_dir: Path = APP_ROOT / 'data') -> None:
    """Produce the gene-to-domain lookup table at out_path using the Interpro-Uniprot
    translation table, the Interpro names table, and the VICC Gene Normalizer.
    :param Path protein_ipr_path: path to protein2ipr_{date}.dat
    :param Path interpro_path: path to interpro_{date}.tsv
    :param Path output_dir: location to save output file within. Defaults to app data
        directory.
    """
    start = timer()
    interpro = open(interpro_path, "r")
    interpro_reader = csv.reader(interpro, delimiter="\t")
    interpro_reader.__next__()  # skip header
    valid_entry_types = {"Domain"}
    domain_ids = set([row[0] for row in interpro_reader if row[1] in valid_entry_types])
    interpro.close()

    uniprot_refs: Union[List[str], Set[str]] = []
    uniprot_refs_file = open(uniprot_refs_path, 'r')
    for row in uniprot_refs_file:
        uniprot_refs.append(row.strip())
    uniprot_refs_file.close()
    uniprot_refs = set(uniprot_refs)

    today = datetime.today()
    protein_ipr = open(protein_ipr_path, "r")
    protein_ipr_reader = csv.reader(protein_ipr, delimiter="\t")

    outfile_name = f"domain_lookup_{datetime.strftime(today, '%Y%m%d')}.tsv"
    outfile_path = output_dir / outfile_name
    outfile = open(outfile_path, 'w')
    q = QueryHandler()
    no_match = MatchType.NO_MATCH
    for row in protein_ipr_reader:
        if row[1] in domain_ids:
            uniprot_id = f"uniprot:{row[0]}"
            if uniprot_id.lower() not in uniprot_refs:
                continue

            norm_response = q.normalize(uniprot_id)
            if norm_response["match_type"] == no_match:
                continue

            gene_id = norm_response["gene_descriptor"]["gene"]["gene_id"]
            gene_label = norm_response["gene_descriptor"]["label"]
            line = f"{gene_id}\t{gene_label}\t{row[1]}\t{row[2]}\n"
            outfile.write(line)

    outfile.close()
    protein_ipr.close()
    stop = timer()
    print(f"Wrote gene-domain table in {(stop - start):.5f} seconds.")


if __name__ == '__main__':
    produce_gene_domain_table(APP_ROOT / 'data' / 'protein2ipr_20210915.dat',
                              APP_ROOT / 'data' / 'interpro_20211012.tsv',
                              APP_ROOT / 'data' / 'uniprot_refs.txt')
