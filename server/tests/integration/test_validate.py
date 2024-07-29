"""Test /validate endpoint."""

import pytest
from httpx import AsyncClient


@pytest.fixture(scope="session")
def alk_fusion():
    """Define basic alk fusion fixture"""
    return {
        "input": {
            "type": "CategoricalFusion",
            "structure": [
                {
                    "type": "GeneElement",
                    "gene": {
                        "id": "normalize.gene:ALK",
                        "type": "Gene",
                        "label": "ALK",
                        "gene_id": "hgnc:427",
                    },
                },
                {"type": "MultiplePossibleGenesElement"},
            ],
        },
        "output": {
            "type": "CategoricalFusion",
            "structure": [
                {
                    "type": "GeneElement",
                    "gene": {
                        "id": "normalize.gene:ALK",
                        "type": "Gene",
                        "label": "ALK",
                        "gene_id": "hgnc:427",
                    },
                },
                {"type": "MultiplePossibleGenesElement"},
            ],
        },
        "warnings": None,
    }


@pytest.fixture(scope="session")
def ewsr1_fusion():
    """Define basic EWSR1 fusion."""
    return {
        "input": {
            "type": "AssayedFusion",
            "structure": [
                {
                    "type": "GeneElement",
                    "gene": {
                        "type": "Gene",
                        "id": "normalize.gene:EWSR1",
                        "label": "EWSR1",
                        "gene_id": "hgnc:3508",
                    },
                },
                {"type": "UnknownGeneElement"},
            ],
            "causativeEvent": {
                "type": "CausativeEvent",
                "eventType": "rearrangement",
            },
            "assay": {
                "type": "Assay",
                "methodUri": "pmid:33576979",
                "assayId": "obi:OBI_0003094",
                "assayName": "fluorescence in-situ hybridization assay",
                "fusionDetection": "inferred",
            },
        },
        "output": {
            "type": "AssayedFusion",
            "structure": [
                {
                    "type": "GeneElement",
                    "gene": {
                        "type": "Gene",
                        "id": "normalize.gene:EWSR1",
                        "label": "EWSR1",
                        "gene_id": "hgnc:3508",
                    },
                },
                {"type": "UnknownGeneElement"},
            ],
            "causativeEvent": {
                "type": "CausativeEvent",
                "eventType": "rearrangement",
            },
            "assay": {
                "type": "Assay",
                "methodUri": "pmid:33576979",
                "assayId": "obi:OBI_0003094",
                "assayName": "fluorescence in-situ hybridization assay",
                "fusionDetection": "inferred",
            },
        },
        "warnings": None,
    }


@pytest.fixture(scope="session")
def ewsr1_fusion_fill_types():
    """Define EWSR1 fusion with some missing type properties. Tests basic Pydantic/FUSOR
    property inference.
    """
    return {
        "input": {
            "structure": [
                {
                    "gene": {
                        "id": "normalize.gene:EWSR1",
                        "label": "EWSR1",
                        "gene_id": "hgnc:3508",
                    },
                },
                {"type": "UnknownGeneElement"},
            ],
            "causativeEvent": {
                "type": "CausativeEvent",
                "eventType": "rearrangement",
            },
            "assay": {
                "methodUri": "pmid:33576979",
                "assayId": "obi:OBI_0003094",
                "assayName": "fluorescence in-situ hybridization assay",
                "fusionDetection": "inferred",
            },
        },
        "output": {
            "type": "AssayedFusion",
            "structure": [
                {
                    "type": "GeneElement",
                    "gene": {
                        "type": "Gene",
                        "id": "normalize.gene:EWSR1",
                        "label": "EWSR1",
                        "gene_id": "hgnc:3508",
                    },
                },
                {"type": "UnknownGeneElement"},
            ],
            "causativeEvent": {
                "type": "CausativeEvent",
                "eventType": "rearrangement",
            },
            "assay": {
                "type": "Assay",
                "methodUri": "pmid:33576979",
                "assayId": "obi:OBI_0003094",
                "assayName": "fluorescence in-situ hybridization assay",
                "fusionDetection": "inferred",
            },
        },
        "warnings": None,
    }


@pytest.fixture(scope="session")
def wrong_type_fusion():
    """Define fusion with incorrect type."""
    return {
        "input": {
            "type": "CategoricalFusion",
            "structure": [
                {
                    "type": "GeneElement",
                    "gene": {
                        "type": "Gene",
                        "id": "normalize.gene:EWSR1",
                        "label": "EWSR1",
                        "gene_id": "hgnc:3508",
                    },
                },
                {"type": "UnknownGeneElement"},
            ],
            "causativeEvent": {
                "type": "CausativeEvent",
                "eventType": "rearrangement",
            },
            "assay": {
                "type": "Assay",
                "methodUri": "pmid:33576979",
                "assayId": "obi:OBI_0003094",
                "assayName": "fluorescence in-situ hybridization assay",
                "fusionDetection": "inferred",
            },
        },
        "output": None,
        "warnings": [
            "Unable to construct fusion with provided args: FUSOR.categorical_fusion()"
            " got an unexpected keyword argument 'causativeEvent'"
        ],
    }


async def check_validated_fusion_response(client, fixture: dict, case_name: str):
    """Run basic checks on fusion validation response.

    Todo:
    ----
    * FUSOR should provide a "fusion equality" utility function -- incorporate it here
      when that's done

    """
    response = await client.post("/api/validate", json=fixture["input"])

    assert response.status_code == 200, f"{case_name}: status code failed"
    response_json = response.json()
    assert (
        response_json.get("fusion") == fixture["output"]
    ), f"{case_name}: fusion incorrect"
    assert (
        response_json.get("warnings") == fixture["warnings"]
    ), f"{case_name}: warnings incorrect"


@pytest.mark.asyncio()
async def test_validate_fusion(
    async_client: AsyncClient,
    alk_fusion,
    ewsr1_fusion,
    ewsr1_fusion_fill_types,
    wrong_type_fusion,
):
    """Perform some basic tests on the fusion validation endpoint."""
    await check_validated_fusion_response(async_client, alk_fusion, "ALK fusion")
    await check_validated_fusion_response(async_client, ewsr1_fusion, "EWSR1 fusion")
    await check_validated_fusion_response(
        async_client, ewsr1_fusion_fill_types, "EWSR1 fusion needing type inference"
    )
    await check_validated_fusion_response(
        async_client, wrong_type_fusion, "Wrong fusion type case"
    )
