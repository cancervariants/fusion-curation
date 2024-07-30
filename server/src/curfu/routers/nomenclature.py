"""Provide routes for nomenclature generation."""

from fastapi import APIRouter, Body, Request
from fusor.exceptions import FUSORParametersException
from fusor.models import (
    GeneElement,
    RegulatoryElement,
    TemplatedSequenceElement,
    TranscriptSegmentElement,
)
from fusor.nomenclature import (
    gene_nomenclature,
    reg_element_nomenclature,
    templated_seq_nomenclature,
    tx_segment_nomenclature,
)
from pydantic import ValidationError

from curfu import logger
from curfu.schemas import NomenclatureResponse, ResponseDict, RouteTag

router = APIRouter()


@router.post(
    "/api/nomenclature/regulatory_element",
    operation_id="regulatoryElementNomenclature",
    response_model=NomenclatureResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.NOMENCLATURE],
)
def generate_regulatory_element_nomenclature(
    request: Request, regulatory_element: dict = Body()
) -> ResponseDict:
    """Build regulatory element nomenclature.

    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param regulatory_element: element to build nomenclature for
    :return: response with nomenclature if successful and warnings otherwise
    """
    try:
        structured_reg_element = RegulatoryElement(**regulatory_element)
    except ValidationError as e:
        error_msg = str(e)
        logger.warning(
            f"Encountered ValidationError: {error_msg} for regulatory element: {regulatory_element}"
        )
        return {"warnings": [error_msg]}
    try:
        nomenclature = reg_element_nomenclature(
            structured_reg_element, request.app.state.fusor.seqrepo
        )
    except ValueError:
        logger.warning(
            f"Encountered parameter errors for regulatory element: {regulatory_element}"
        )
        return {
            "warnings": [
                f"Unable to validate regulatory element with provided parameters: {regulatory_element}"
            ]
        }
    return {"nomenclature": nomenclature}


@router.post(
    "/api/nomenclature/transcript_segment",
    operation_id="txSegmentNomenclature",
    response_model=NomenclatureResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.NOMENCLATURE],
)
def generate_tx_segment_nomenclature(tx_segment: dict = Body()) -> ResponseDict:
    """Build transcript segment element nomenclature.

    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param tx_segment: element to build nomenclature for
    :return: response with nomenclature if successful and warnings otherwise
    """
    try:
        structured_tx_segment = TranscriptSegmentElement(**tx_segment)
    except ValidationError as e:
        error_msg = str(e)
        logger.warning(
            f"Encountered ValidationError: {error_msg} for tx segment: {tx_segment}"
        )
        return {"warnings": [error_msg]}
    nomenclature = tx_segment_nomenclature(structured_tx_segment)
    return {"nomenclature": nomenclature}


@router.post(
    "/api/nomenclature/templated_sequence",
    operation_id="templatedSequenceNomenclature",
    response_model=NomenclatureResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.NOMENCLATURE],
)
def generate_templated_seq_nomenclature(
    request: Request, templated_sequence: dict = Body()
) -> ResponseDict:
    """Build templated sequence element nomenclature.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param templated_sequence: element to build nomenclature for
    :return: response with nomenclature if successful and warnings otherwise
    """
    try:
        structured_templated_seq = TemplatedSequenceElement(**templated_sequence)
    except ValidationError as e:
        error_msg = str(e)
        logger.warning(
            f"Encountered ValidationError: {error_msg} for templated sequence element: {templated_sequence}"
        )
        return {"warnings": [error_msg]}
    try:
        nomenclature = templated_seq_nomenclature(
            structured_templated_seq, request.app.state.fusor.seqrepo
        )
    except ValueError:
        logger.warning(
            f"Encountered parameter errors for templated sequence: {templated_sequence}"
        )
        return {
            "warnings": [
                f"Unable to validate templated sequence with provided parameters: {templated_sequence}"
            ]
        }
    return {"nomenclature": nomenclature}


@router.post(
    "/api/nomenclature/gene",
    operation_id="geneNomenclature",
    response_model=NomenclatureResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.NOMENCLATURE],
)
def generate_gene_nomenclature(gene_element: dict = Body()) -> ResponseDict:
    """Build gene element nomenclature.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param gene_element: element to build nomenclature for
    :return: response with nomenclature if successful and warnings otherwise
    """
    try:
        valid_gene_element = GeneElement(**gene_element)
    except ValidationError as e:
        error_msg = str(e)
        logger.warning(
            f"Encountered ValidationError: {error_msg} for gene element: {gene_element}"
        )
        return {"warnings": [error_msg]}
    try:
        nomenclature = gene_nomenclature(valid_gene_element)
    except ValueError:
        logger.warning(f"Encountered parameter errors for gene element: {gene_element}")
        return {
            "warnings": [
                f"Unable to validate gene element with provided parameters: {gene_element}"
            ]
        }
    return {"nomenclature": nomenclature}


@router.post(
    "/api/nomenclature/fusion",
    operation_id="fusionNomenclature",
    response_model=NomenclatureResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.NOMENCLATURE],
)
def generate_fusion_nomenclature(
    request: Request, fusion: dict = Body()
) -> ResponseDict:
    """Generate nomenclature for complete fusion.
    \f
    :param request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    :param fusion: provided fusion object (should be validly constructed)
    :return: response with fusion nomenclature
    """
    try:
        nomenclature = request.app.state.fusor.generate_nomenclature(fusion)
        return {"nomenclature": nomenclature}
    except FUSORParametersException as e:
        return {"warnings": [str(e)]}
