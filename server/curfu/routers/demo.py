"""Provide routes for accessing demo objects to client."""
from uuid import uuid4
from typing import Union

from fastapi import APIRouter, Request
from fusor import examples, FUSOR
from fusor.models import (
    RegulatoryElement,
    StructuralElementType,
    CategoricalFusion,
    AssayedFusion,
    FUSORTypes,
)
from fusor.nomenclature import (
    tx_segment_nomenclature,
    templated_seq_nomenclature,
    gene_nomenclature,
    reg_element_nomenclature,
)

from curfu.schemas import (
    DemoResponse,
    ClientTranscriptSegmentElement,
    ClientLinkerElement,
    ClientTemplatedSequenceElement,
    ClientGeneElement,
    ClientUnknownGeneElement,
    ClientMultiplePossibleGenesElement,
    TranscriptSegmentElement,
    LinkerElement,
    TemplatedSequenceElement,
    GeneElement,
    UnknownGeneElement,
    MultiplePossibleGenesElement,
    ClientCategoricalFusion,
    ClientAssayedFusion,
)

router = APIRouter()


ElementUnion = Union[
    TranscriptSegmentElement,
    LinkerElement,
    TemplatedSequenceElement,
    GeneElement,
    UnknownGeneElement,
    MultiplePossibleGenesElement,
]
ClientElementUnion = Union[
    ClientTranscriptSegmentElement,
    ClientLinkerElement,
    ClientTemplatedSequenceElement,
    ClientGeneElement,
    ClientUnknownGeneElement,
    ClientMultiplePossibleGenesElement,
]
Fusion = Union[CategoricalFusion, AssayedFusion]
ClientFusion = Union[ClientCategoricalFusion, ClientAssayedFusion]


def clientify_structural_element(
    element: ElementUnion,
    fusor_instance: FUSOR,
) -> ClientElementUnion:
    """
    Add fields required by client to structural element object.
    \f
    :param element: a structural element object
    :param fusor_instance: instantiated FUSOR object, passed down from FastAPI request
        context
    :return: client-ready structural element
    """
    element_args = element.dict()
    element_args["element_id"] = str(uuid4())

    if element.type == StructuralElementType.UNKNOWN_GENE_ELEMENT:
        element_args["nomenclature"] = "?"
        return ClientUnknownGeneElement(**element_args)
    elif element.type == StructuralElementType.MULTIPLE_POSSIBLE_GENES_ELEMENT:
        element_args["nomenclature"] = "v"
        return ClientMultiplePossibleGenesElement(**element_args)
    elif element.type == StructuralElementType.LINKER_SEQUENCE_ELEMENT:
        nm = element.linker_sequence.sequence
        element_args["nomenclature"] = nm
        return ClientLinkerElement(**element_args)
    elif element.type == StructuralElementType.TEMPLATED_SEQUENCE_ELEMENT:
        nm = templated_seq_nomenclature(element, fusor_instance.seqrepo)
        element_args["nomenclature"] = nm
        element_args["input_chromosome"] = element.region.location.sequence_id.split(
            ":"
        )[1]
        element_args["input_start"] = element.region.location.interval.start.value
        element_args["input_end"] = element.region.location.interval.end.value
        return ClientTemplatedSequenceElement(**element_args)
    elif element.type == StructuralElementType.GENE_ELEMENT:
        nm = gene_nomenclature(element)
        element_args["nomenclature"] = nm
        return ClientGeneElement(**element_args)
    elif element.type == StructuralElementType.TRANSCRIPT_SEGMENT_ELEMENT:
        nm = tx_segment_nomenclature(element)
        element_args["nomenclature"] = nm
        element_args["input_type"] = "exon_coords_tx"
        element_args["input_tx"] = element.transcript.split(":")[1]
        element_args["input_exon_start"] = element.exon_start
        element_args["input_exon_start_offset"] = element.exon_start_offset
        element_args["input_exon_end"] = element.exon_end
        element_args["input_exon_end_offset"] = element.exon_end_offset
        return ClientTranscriptSegmentElement(**element_args)
    else:
        raise ValueError("Unknown element type provided")


def clientify_fusion(fusion: Fusion, fusor_instance: FUSOR) -> ClientFusion:
    """
    Add client-required properties to fusion object.
    :param fusion: fusion to append to
    :param fusor_instance: FUSOR object instance provided by FastAPI request context
    :return: completed client-ready fusion
    """
    fusion_args = fusion.dict()
    client_elements = []
    for element in fusion.structural_elements:
        client_elements.append(clientify_structural_element(element, fusor_instance))
    fusion_args["structural_elements"] = client_elements

    if "regulatory_element" in fusion_args and fusion_args["regulatory_element"]:
        reg_element_args = fusion_args["regulatory_element"]
        nomenclature = reg_element_nomenclature(
            RegulatoryElement(**reg_element_args), fusor_instance.seqrepo
        )
        reg_element_args["nomenclature"] = nomenclature
        regulatory_class = fusion_args["regulatory_element"]["regulatory_class"]
        if regulatory_class == "enhancer":
            reg_element_args["display_class"] = "Enhancer"
        else:
            raise Exception("Undefined reg element class used in demo")
        fusion_args["regulatory_element"] = reg_element_args

    if fusion.type == FUSORTypes.CATEGORICAL_FUSION:
        if fusion.critical_functional_domains:
            client_domains = []
            for domain in fusion.critical_functional_domains:
                client_domain = domain.dict()
                client_domain["domain_id"] = str(uuid4())
                client_domains.append(client_domain)
            fusion_args["critical_functional_domains"] = client_domains
        return ClientCategoricalFusion(**fusion_args)
    elif fusion.type == FUSORTypes.ASSAYED_FUSION:
        return ClientAssayedFusion(**fusion_args)
    else:
        raise ValueError("Unknown fusion type provided")


@router.get(
    "/api/demo/alk",
    operation_id="alkDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_alk(request: Request) -> DemoResponse:
    """Retrieve ALK assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        **{
            "fusion": clientify_fusion(examples.alk, request.app.state.fusor),
            "warnings": [],
        }
    )


@router.get(
    "/api/demo/ewsr1",
    operation_id="ewsr1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_ewsr1(request: Request) -> DemoResponse:
    """Retrieve EWSR1 assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        **{
            "fusion": clientify_fusion(examples.ewsr1, request.app.state.fusor),
            "warnings": [],
        }
    )


@router.get(
    "/api/demo/bcr_abl1",
    operation_id="bcrAbl1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_bcr_abl1(request: Request) -> DemoResponse:
    """Retrieve BCR-ABL1 categorical fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        **{
            "fusion": clientify_fusion(examples.bcr_abl1, request.app.state.fusor),
            "warnings": [],
        }
    )


@router.get(
    "/api/demo/tpm3_ntrk1",
    operation_id="tpm3Ntrk1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_tpm3_ntrk1(request: Request) -> DemoResponse:
    """Retrieve TPM3-NTRK1 assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        **{
            "fusion": clientify_fusion(examples.tpm3_ntrk1, request.app.state.fusor),
            "warnings": [],
        }
    )


@router.get(
    "/api/demo/tpm3_pdgfrb",
    operation_id="tpm3PdgfrbDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_tpm3_pdgfrb(request: Request) -> DemoResponse:
    """Retrieve TPM3-PDGFRB assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        **{
            "fusion": clientify_fusion(examples.tpm3_pdgfrb, request.app.state.fusor),
            "warnings": [],
        }
    )


@router.get(
    "/api/demo/igh_myc",
    operation_id="ighMycDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
)
def get_igh_myc(request: Request) -> DemoResponse:
    """Retrieve IGH-MYC assayed fusion.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        **{
            "fusion": clientify_fusion(examples.igh_myc, request.app.state.fusor),
            "warnings": [],
        }
    )
