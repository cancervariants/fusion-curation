"""Provide routes for accessing demo objects."""
from fastapi import APIRouter
from fusor import examples

from curfu.schemas import DemoResponse

router = APIRouter()


@router.get(
    "/demo/alk",
    operation_id="alkDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_alk() -> DemoResponse:
    """Retrieve ALK assayed fusion."""
    return DemoResponse(**{"fusion": examples.alk, "warnings": []})


@router.get(
    "/demo/ewsr1",
    operation_id="ewsr1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_ewsr1() -> DemoResponse:
    """Retrieve EWSR1 assayed fusion."""
    return DemoResponse(**{"fusion": examples.ewsr1, "warnings": []})


@router.get(
    "/demo/bcr_abl1",
    operation_id="bcrAbl1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_bcr_abl1() -> DemoResponse:
    """Retrieve BCR-ABL1 categorical fusion."""
    return DemoResponse(**{"fusion": examples.bcr_abl1, "warnings": []})


@router.get(
    "/demo/tpm3_ntrk1",
    operation_id="tpm3Ntrk1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_tpm3_ntrk1() -> DemoResponse:
    """Retrieve TPM3-NTRK1 assayed fusion."""
    return DemoResponse(**{"fusion": examples.tpm3_ntrk1, "warnings": []})


@router.get(
    "/demo/tpm3_pdgfrb",
    operation_id="tpm3PdgfrbDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_tpm3_pdgfrb() -> DemoResponse:
    """Retrieve TPM3-PDGFRB assayed fusion."""
    return DemoResponse(**{"fusion": examples.tpm3_pdgfrb, "warnings": []})


@router.get(
    "/demo/igh_myc",
    operation_id="ighMycDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_igh_myc() -> DemoResponse:
    """Retrieve IGH-MYC assayed fusion."""
    return DemoResponse(**{"fusion": examples.igh_myc, "warnings": []})
