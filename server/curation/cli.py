"""Provide command-line interface to application and associated utilities."""
from typing import Optional
from pathlib import Path

import uvicorn
import click

from curation.utils.interpro import build_gene_domain_maps
from curation.utils.gene import GeneSuggestionBuilder

@click.command()
@click.option("--port", "-p", default=5000, help="Bind socket to this port.")
def serve(port: int) -> None:
    """Start application service on localhost.
    :param int port: port to serve at
    """
    uvicorn.run("curation.routes:app", port=port, reload=True)


@click.group()
def utils():
    """Provide setup utilities for constructing necessary data for Fusion Curation app."""
    pass


types_help = """
Interpro entry types to include as possible functional domain values, provided as a
comma-separated list (that likely must be quoted to be parsed correctly by your shell).
Possible values: {"active_site", "binding_site", "conserved_site", "domain", "family",
"homologous_superfamily", "ptm", "repeat"}
"""

@utils.command()
@click.option("--types", "-t", help=types_help, default="domain")
@click.option("--protein2ipr", "-p", help="Path to InterPro-Uniprot protein2ipr.dat file",
              default=None)
@click.option("--uniprot", "-u", help="Path to generated uniprot_refs_YYYYMMDD.tsv file",
              default=None)
def build_domains(types: str, protein2ipr: Optional[str], uniprot: Optional[str]) -> None:
    """Build domain mappings for use in Fusion Curation app.
    \f
    :param str types: comma-separated list
    """
    types_split = set(types.lower().replace(" ", "").split(","))

    if protein2ipr:
        protein2ipr_path = Path(protein2ipr)
    else:
        protein2ipr_path = None

    if uniprot:
        uniprot_refs_path = Path(uniprot)
    else:
        uniprot_refs_path = None
    build_gene_domain_maps(interpro_types=types_split,
                           protein_ipr_path=protein2ipr_path,
                           uniprot_refs_path=uniprot_refs_path)

@utils.command()
def build_genes() -> None:
    """Build gene mappings for use in Fusion Curation gene autocomplete."""
    builder = GeneSuggestionBuilder()
    builder.build_gene_suggest_maps()
