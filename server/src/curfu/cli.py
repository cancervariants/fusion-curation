"""Provide command-line interface to application and associated utilities."""
import os
from pathlib import Path
from typing import Optional

import click

from curfu import APP_ROOT
from curfu.devtools import DEFAULT_INTERPRO_TYPES
from curfu.devtools.build_client_types import build_client_types
from curfu.devtools.build_gene_suggest import GeneSuggestionBuilder
from curfu.devtools.build_interpro import build_gene_domain_maps


@click.command()
@click.option("--port", "-p", default=5000, help="Bind socket to this port.")
def serve(port: int) -> None:
    """Start application service on localhost.
    \f
    :param int port: port to serve at (default: 5000)
    """
    # calling uvicorn.run() doesn't get logs printed to console --
    # performing a syscall for now until a more elegant solution appears
    os.system(
        f"uvicorn curfu.main:app --reload --port={port} --reload-dir={str(APP_ROOT.absolute())}"
    )


@click.group()
def devtools() -> None:
    """Provide setup utilities for constructing data for Fusion Curation app."""


types_help = """
Interpro entry types to include as possible functional domain values, provided as a
comma-separated list (that likely must be quoted to be parsed correctly by your shell).
Possible values: {`active_site`, `binding_site`, `conserved_site`, `domain`, `family`,
`homologous_superfamily`, `ptm`, `repeat`}
"""


@devtools.command()
@click.option("--types", "-t", help=types_help, default=DEFAULT_INTERPRO_TYPES)
@click.option(
    "--protein2ipr",
    "-p",
    help="Path to InterPro-Uniprot protein2ipr.dat file",
    default=None,
)
@click.option(
    "--refs",
    "-r",
    help="Path to generated uniprot_refs_YYYYMMDD.tsv file",
    default=None,
)
@click.option(
    "--uniprot", "-u", help="Path to uniprot_sprot_YYYYMMDD.xml", default=None
)
def domains(
    types: str, protein2ipr: Optional[str], refs: Optional[str], uniprot: Optional[str]
) -> None:
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
        uniprot_path = Path(uniprot)
    else:
        uniprot_path = None

    if refs:
        refs_path = Path(refs)
    else:
        refs_path = None

    build_gene_domain_maps(
        interpro_types=types_split,
        protein_ipr_path=protein2ipr_path,
        uniprot_sprot_path=uniprot_path,
        uniprot_refs_path=refs_path,
    )


@devtools.command()
def genes() -> None:
    """Build gene mappings for use in Fusion Curation gene autocomplete."""
    builder = GeneSuggestionBuilder()
    builder.build_gene_suggestion_file()


@devtools.command()
def client_types() -> None:
    """Build type definitions for use in client development."""
    build_client_types()
