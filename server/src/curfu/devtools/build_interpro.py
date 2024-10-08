"""Provide utilities relating to data fetched from InterPro service."""

import csv
import datetime
import gzip
import shutil
import xml.etree.ElementTree as ET  # noqa: N817
from pathlib import Path
from timeit import default_timer as timer

import click
from gene.database import create_db
from gene.query import QueryHandler

from curfu import APP_ROOT, logger
from curfu.devtools import ftp_download

# uniprot accession id -> (normalized ID, normalized label)
UniprotRefs = dict[str, tuple[str, str]]

# (uniprot accession id, ncbi gene id) -> refseq NP_ accession
UniprotAcRefs = dict[tuple[str, str], str]

# consistent formatting for saved files
DATE_FMT = "%Y%m%d"


def download_protein2ipr(output_dir: Path) -> None:
    """Download, unpack, and store Uniprot-InterPro translation table
    :param output_dir: location to save file within
    """
    logger.info("Retrieving Uniprot mapping data from InterPro")

    gz_file_path = output_dir / "protein2ipr.dat.gz"
    with gz_file_path.open("w") as fp:
        ftp_download(
            "ftp.ebi.ac.uk",
            "pub/databases/interpro",
            "protein2ipr.dat.gz",
            lambda data: fp.write(data),
        )

    today = datetime.datetime.strftime(
        datetime.datetime.now(tz=datetime.timezone.utc), DATE_FMT
    )
    outfile_path = output_dir / f"protein2ipr_{today}.dat"
    with outfile_path.open("wb") as f_out, gzip.open(gz_file_path, "rb") as f_in:
        shutil.copyfileobj(f_in, f_out)
    gz_file_path.unlink()
    if not outfile_path.exists():
        raise Exception

    logger.info("Successfully retrieved UniProt mapping data for Interpro")


def get_uniprot_refs() -> UniprotRefs:
    """Produce list of all Uniprot IDs referenced in the Gene Normalizer along with
    the normalized label and concept ID of the associated gene. Used in conjunction
    with Interpro's provided Uniprot mappings to identify possible functional
    domains for genes.

    :return: Dict keying uniprot accession ID (upper-case) to tuple of normalized ID and
    label, eg {'Q9UPV7': ('hgnc:29180', 'PHF24')}
    """
    start = timer()

    # scanning on DynamoDB_Local is extremely slow
    q = QueryHandler(create_db())  # must be dynamodb
    genes = q.db.genes

    uniprot_ids: UniprotRefs = {}
    last_evaluated_key = None
    while True:
        if last_evaluated_key:
            response = genes.scan(ExclusiveStartKey=last_evaluated_key)
        else:
            response = genes.scan()
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
                norm_id = norm_response.gene.gene_id
                norm_label = norm_response.gene.label
                uniprot_ids[uniprot_id] = (norm_id, norm_label)
        if not last_evaluated_key:
            break

    stop = timer()
    msg = f"Collected valid uniprot refs in {(stop - start):.5f} seconds."
    logger.info(msg)
    click.echo(msg)

    today = datetime.datetime.strftime(
        datetime.datetime.now(tz=datetime.timezone.utc), DATE_FMT
    )
    save_path = APP_ROOT / "data" / f"uniprot_refs_{today}.tsv"
    with save_path.open("w") as out:
        for uniprot_ref, data in uniprot_ids.items():
            out.write(f"{uniprot_ref.split(':')[1].upper()}\t{data[0]}\t{data[1]}\n")

    return uniprot_ids


def download_uniprot_sprot(output_dir: Path) -> Path:
    """Retrieve UniProtKB data.
    :param output_dir: directory to save UniProtKB data in.
    """
    logger.info("Retrieving UniProtKB data.")

    gz_file_path = output_dir / "uniprot_sprot.xml.gz"
    with gz_file_path.open("w") as fp:
        ftp_download(
            "ftp.uniprot.org",
            "pub/databases/uniprot/current_release/knowledgebase/complete/",
            "uniprot_sprot.xml.gz",
            lambda data: fp.write(data),
        )
    today = datetime.datetime.strftime(
        datetime.datetime.now(tz=datetime.timezone.utc), DATE_FMT
    )
    outfile_path = output_dir / f"uniprot_sprot_{today}.dat"
    with outfile_path.open("wb") as f_out, gzip.open(gz_file_path, "rb") as f_in:
        shutil.copyfileobj(f_in, f_out)
    gz_file_path.unlink()
    if not outfile_path.exists():
        raise Exception

    logger.info("Successfully retrieved UniProtKB data.")
    return outfile_path


def get_interpro_uniprot_rels(
    protein_ipr_path: Path | None,
    output_dir: Path,
    domain_ids: set[str],
    uniprot_refs: dict,
) -> dict[str, dict[str, tuple[str, str, str, str, str]]]:
    """Process InterPro to UniProtKB relations, using UniProt references to connect
    genes with domains

    :param protein_ipr_path: path to protein2ipr_YYYYMMDD.dat if given
    :param output_dir: Path to save output data in
    :param domain_ids: InterPro domain IDs to use
    :param uniprot_refs: UniProt references from gene normalizer DB
    :return: Dict mapping Uniprot accession ID to collected domain data,
    """
    if not protein_ipr_path:
        download_protein2ipr(output_dir)
        today = datetime.datetime.strftime(
            datetime.datetime.now(tz=datetime.timezone.utc), DATE_FMT
        )
        protein_ipr_path = output_dir / f"protein2ipr_{today}.dat"
    protein_ipr = protein_ipr_path.open()
    protein_ipr_reader = csv.reader(protein_ipr, delimiter="\t")

    interpro_uniprot = {}
    for row in protein_ipr_reader:
        # FIX HERE
        domain_id = row[1]
        if domain_id in domain_ids:
            uniprot_ac = row[0]
            normed_values = uniprot_refs.get(uniprot_ac)
            if not normed_values:
                continue

            gene_id, gene_label = normed_values
            key = (uniprot_ac, gene_id)
            domain_name = row[2]
            start = row[4]
            end = row[5]
            value = (gene_label, domain_id, domain_name, start, end)
            if key not in interpro_uniprot:
                interpro_uniprot[key] = {domain_id: value}
            elif domain_id not in interpro_uniprot[key]:
                interpro_uniprot[key][domain_id] = value

    protein_ipr.close()
    msg = f"Extracted {len(interpro_uniprot)} UniProt-InterPro references"
    click.echo(msg)
    return interpro_uniprot


def get_protein_accessions(
    relevant_proteins: set[str], uniprot_sprot_path: Path | None
) -> dict[tuple[str, str], str]:
    """Scan uniprot_sprot.xml and extract RefSeq protein accession identifiers for
    relevant Uniprot accessions.
    :param relevant_proteins: captured Uniprot accessions, for proteins coded
        by human genes and containing InterPro functional domains
    :param uniprot_sprot_path: path to local uniprot_sprot.xml file.
    :return: Dict where keys are tuple containing Uniprot accession ID and NCBI gene ID,
        and values are known RefSeq protein accessions
    """
    start = timer()
    if not uniprot_sprot_path:
        uniprot_sprot_path = download_uniprot_sprot(APP_ROOT / "data")
    parser = ET.iterparse(uniprot_sprot_path, ("start", "end"))  # noqa: S314
    accessions_map = {}
    cur_ac = ""
    cur_refseq_ac = ""
    cur_gene_id = ""
    cur_molecule_id = ""
    cur_nucleotide_seq_id = ""
    for _, node in parser:
        if node.tag == "{http://uniprot.org/uniprot}entry":
            cur_refseq_ac = ""
            cur_gene_id = ""
            cur_ac = ""
            cur_molecule_id = ""
            cur_nucleotide_seq_id = ""
        elif (
            (node.tag == "{http://uniprot.org/uniprot}accession")
            and (not cur_ac)
            and node.text
        ):
            tmp_ac = node.text
            if tmp_ac in relevant_proteins:
                cur_ac = tmp_ac
        elif cur_ac and (node.tag == "{http://uniprot.org/uniprot}dbReference"):
            node_type = node.get("type")
            if node_type == "RefSeq" and not cur_molecule_id:
                tmp_refseq_id = node.get("id")
                if tmp_refseq_id.startswith("NP_"):
                    cur_refseq_ac = tmp_refseq_id
            elif node_type == "HGNC":
                cur_gene_id = node.get("id").lower()
        elif (
            cur_ac
            and cur_refseq_ac
            and (node.tag == "{http://uniprot.org/uniprot}molecule")
        ):
            tmp_molecule_id = node.get("id")
            if "-" in tmp_molecule_id:
                if tmp_molecule_id.endswith("-1"):  # canonical sequence
                    cur_molecule_id = tmp_molecule_id
            else:
                # TODO does this happen?
                cur_molecule_id = tmp_molecule_id
        elif (
            cur_ac
            and cur_refseq_ac
            and (not cur_molecule_id)
            and (not cur_nucleotide_seq_id)
            and (node.tag == "{http://uniprot.org/uniprot}property")
        ):
            cur_nucleotide_seq_id = node.get("value")
        if all(
            [
                cur_ac,
                cur_refseq_ac,
                cur_gene_id,
                (cur_molecule_id or cur_nucleotide_seq_id),
                (cur_ac, cur_gene_id) not in accessions_map,
            ]
        ):
            accessions_map[(cur_ac, cur_gene_id)] = cur_refseq_ac
            # cur_ac = ""  # prevent further updates in this record

    stop = timer()
    msg = f"Retrieved accession values in {(stop - start):.5f} seconds."
    logger.info(msg)
    click.echo(msg)
    return accessions_map


def build_gene_domain_maps(
    interpro_types: set[str],
    protein_ipr_path: Path | None = None,
    uniprot_sprot_path: Path | None = None,
    uniprot_refs_path: Path | None = None,
    output_dir: Path = APP_ROOT / "data",
) -> None:
    """Produce the gene-to-domain lookup table at out_path using the Interpro-Uniprot
    translation table, the Interpro names table, and the VICC Gene Normalizer.

    :param interpro_types: types of interpro fields to check references for
    :param protein_ipr_path: path to protein2ipr_{date}.dat if available
    :param uniprot_refs_path: path to existing uniprot_refs_<date>.tsv
        file if available.
    :param output_dir: location to save output file within. Defaults to app data
        directory.
    """
    start_time = timer()
    today = datetime.strftime(datetime.datetime.now(tz=datetime.timezone.utc), DATE_FMT)

    # get relevant Interpro IDs
    interpro_data_bin = []
    ftp_download(
        "ftp.ebi.ac.uk",
        "pub/databases/interpro",
        "entry.list",
        lambda data: interpro_data_bin.append(data),
    )
    # load interpro IDs directly to memory -- no need to save to file
    interpro_data_tsv = "".join([d.decode("UTF-8") for d in interpro_data_bin]).split(
        "\n"
    )
    interpro_types = {t.lower() for t in interpro_types}
    interpro_reader = csv.reader(interpro_data_tsv, delimiter="\t")
    interpro_reader.__next__()  # skip header
    domain_ids = {
        row[0] for row in interpro_reader if row and row[1].lower() in interpro_types
    }

    # get Uniprot to gene references
    if not uniprot_refs_path:
        uniprot_refs: UniprotRefs = get_uniprot_refs()
    else:
        uniprot_refs = {}
        with uniprot_refs_path.open() as f:
            reader = csv.reader(f, delimiter="\t")
            for row in reader:
                uniprot_refs[row[0]] = (row[1], row[2])

    # associate InterPro domains to genes via Uniprot references
    interpro_uniprot = get_interpro_uniprot_rels(
        protein_ipr_path, output_dir, domain_ids, uniprot_refs
    )

    # get refseq accessions for uniprot proteins
    uniprot_acs = {k[0] for k in interpro_uniprot}
    prot_acs = get_protein_accessions(uniprot_acs, uniprot_sprot_path)

    outfile_path = output_dir / f"domain_lookup_{today}.tsv"
    outfile = outfile_path.open("w")
    for k, v_list in interpro_uniprot.items():
        for v in v_list.values():
            if k[0] in uniprot_acs:
                refseq_ac = prot_acs.get((k[0], k[1]))
                if not refseq_ac:
                    logger.warning(f"Unable to lookup refseq ac for {k}, {v}")
                    continue
                items = [k[1], *list(v), refseq_ac]
                line = "\t".join(items) + "\n"
                outfile.write(line)
    outfile.close()

    stop_time = timer()
    msg = f"Wrote gene-domain table in {(stop_time - start_time):.5f} seconds."
    logger.info(msg)
    click.echo(msg)
