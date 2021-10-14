"""Provide utilities relating to data fetched from InterPro service."""
import gzip
from typing import Tuple, Dict
from pathlib import Path
import csv
from datetime import datetime
from timeit import default_timer as timer
import os
import shutil

from gene.query import QueryHandler

from curation import APP_ROOT, logger
from curation.utils import ftp_download

# uniprot concept id -> (normalized ID, normalized label)
UniprotRefs = Dict[str, Tuple[str, str]]


def download_protein2ipr(output_dir: Path) -> None:
    """Download, unpack, and store Uniprot-InterPro translation table
    :param Path output_dir: location to save file within
    """
    logger.info("Retrieving Uniprot mapping data from InterPro")

    gz_file_path = output_dir / "protein2ipr.dat.gz"
    with open(gz_file_path, 'w') as fp:
        def writefile(data):
            fp.write(data)
        ftp_download("ftp.ebi.ac.uk", "pub/databases/interpro", "protein2ipr.dat.gz",
                     writefile)

    today = datetime.strftime(datetime.today(), "%Y%m%d")
    outfile_path = output_dir / f"protein2ipr_{today}.dat"
    with open(outfile_path, 'wb') as f_out, gzip.open(gz_file_path, 'rb') as f_in:
        shutil.copyfileobj(f_in, f_out)
    os.remove(gz_file_path)
    assert outfile_path.exists()

    logger.info("Successfully retrieved Uniprot mapping data for Interpro")


def get_uniprot_refs() -> UniprotRefs:
    """Produce reference list for all Uniprot IDs referenced in the VICC
    gene normalizer.
    :return: Dict keying uniprot ID (lower-case) to tuple of normalized ID and
        label.
    """
    start = timer()

    os.environ["GENE_NORM_PROD"] = "TRUE"
    q = QueryHandler()
    g = q.db.genes

    uniprot_ids: UniprotRefs = {}
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
                uniprot_id = record["label_and_type"].split("##")[0]
                if uniprot_id in uniprot_ids:
                    continue
                norm_response = q.normalize(uniprot_id)
                norm_id = norm_response["gene_descriptor"]["gene"]["gene_id"]
                norm_label = norm_response["gene_descriptor"]["label"]
                uniprot_ids[uniprot_id] = (norm_id, norm_label)
        if not last_evaluated_key:
            break

    stop = timer()
    msg = f"Collected valid uniprot refs in {(stop - start):.5f} seconds."
    logger.info(msg)
    print(msg)

    return uniprot_ids


def produce_gene_domain_table(protein_ipr_path: Path,
                              output_dir: Path = APP_ROOT / 'data') -> None:
    """Produce the gene-to-domain lookup table at out_path using the Interpro-Uniprot
    translation table, the Interpro names table, and the VICC Gene Normalizer.
    :param Path protein_ipr_path: path to protein2ipr_{date}.dat
    :param Path output_dir: location to save output file within. Defaults to app data
        directory.
    """
    start = timer()

    interpro_data_bin = []

    def get_interpro_data(data):
        interpro_data_bin.append(data)
    ftp_download("ftp.ebi.ac.uk", "pub/databases/interpro", "entry.list",
                 get_interpro_data)
    interpro_data_tsv = "".join([d.decode('ascii')
                                 for d in interpro_data_bin]).split("\n")
    interpro_reader = csv.reader(interpro_data_tsv, delimiter="\t")
    interpro_reader.__next__()  # skip header
    valid_entry_types = {"Domain"}
    domain_ids = set([row[0] for row in interpro_reader
                      if row[1] in valid_entry_types])

    uniprot_refs = get_uniprot_refs()

    protein_ipr = open(protein_ipr_path, "r")
    protein_ipr_reader = csv.reader(protein_ipr, delimiter="\t")

    today = datetime.strftime(datetime.today(), '%Y%m%d')
    outfile_path = output_dir / f"domain_lookup_{today}.tsv"
    outfile = open(outfile_path, 'w')
    for row in protein_ipr_reader:
        if row[1] in domain_ids:
            uniprot_id = f"uniprot:{row[0]}"
            normed_values = uniprot_refs.get(uniprot_id.lower())
            if not normed_values:
                logger.info(f"Unable to retrieve normalized gene for {row[1]} {row[2]}")
                continue

            gene_id, gene_label = normed_values
            line = f"{gene_id}\t{gene_label}\t{row[1]}\t{row[2]}\n"
            outfile.write(line)

    outfile.close()
    protein_ipr.close()
    stop = timer()
    msg = f"Wrote gene-domain table in {(stop - start):.5f} seconds."
    logger.info(msg)
    print(msg)
