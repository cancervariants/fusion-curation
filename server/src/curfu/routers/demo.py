"""Provide routes for accessing demo objects to client."""

from uuid import uuid4

from fastapi import APIRouter, Request
from fusor import FUSOR, examples
from fusor.models import (
    AssayedFusion,
    CategoricalFusion,
    FUSORTypes,
    RegulatoryElement,
    StructuralElementType,
)
from fusor.nomenclature import (
    gene_nomenclature,
    reg_element_nomenclature,
    templated_seq_nomenclature,
    tx_segment_nomenclature,
)

from curfu.schemas import (
    ClientAssayedFusion,
    ClientCategoricalFusion,
    ClientGeneElement,
    ClientLinkerElement,
    ClientMultiplePossibleGenesElement,
    ClientTemplatedSequenceElement,
    ClientTranscriptSegmentElement,
    ClientUnknownGeneElement,
    DemoResponse,
    GeneElement,
    LinkerElement,
    MultiplePossibleGenesElement,
    RouteTag,
    TemplatedSequenceElement,
    TranscriptSegmentElement,
    UnknownGeneElement,
)

router = APIRouter()


ElementUnion = (
    TranscriptSegmentElement
    | LinkerElement
    | TemplatedSequenceElement
    | GeneElement
    | UnknownGeneElement
    | MultiplePossibleGenesElement
)
ClientElementUnion = (
    ClientTranscriptSegmentElement
    | ClientLinkerElement
    | ClientTemplatedSequenceElement
    | ClientGeneElement
    | ClientUnknownGeneElement
    | ClientMultiplePossibleGenesElement
)
Fusion = CategoricalFusion | AssayedFusion
ClientFusion = ClientCategoricalFusion | ClientAssayedFusion


def clientify_structural_element(
    element: ElementUnion,
    fusor_instance: FUSOR,
) -> ClientElementUnion:
    """Add fields required by client to structural element object.
    \f
    :param element: a structural element object
    :param fusor_instance: instantiated FUSOR object, passed down from FastAPI request
        context
    :return: client-ready structural element
    """
    element_args = element.dict()
    element_args["elementId"] = str(uuid4())

    if element.type == StructuralElementType.UNKNOWN_GENE_ELEMENT:
        element_args["nomenclature"] = "?"
        return ClientUnknownGeneElement(**element_args)
    if element.type == StructuralElementType.MULTIPLE_POSSIBLE_GENES_ELEMENT:
        element_args["nomenclature"] = "v"
        return ClientMultiplePossibleGenesElement(**element_args)
    if element.type == StructuralElementType.LINKER_SEQUENCE_ELEMENT:
        nm = element.linker_sequence.sequence
        element_args["nomenclature"] = nm
        return ClientLinkerElement(**element_args)
    if element.type == StructuralElementType.TEMPLATED_SEQUENCE_ELEMENT:
        nm = templated_seq_nomenclature(element, fusor_instance.seqrepo)
        element_args["nomenclature"] = nm
        element_args["inputChromosome"] = element.region.sequenceReference.id.split(
            ":"
        )[1]
        element_args["inputStart"] = element.region.start
        element_args["inputEnd"] = element.region.end
        return ClientTemplatedSequenceElement(**element_args)
    if element.type == StructuralElementType.GENE_ELEMENT:
        nm = gene_nomenclature(element)
        element_args["nomenclature"] = nm
        return ClientGeneElement(**element_args)
    if element.type == StructuralElementType.TRANSCRIPT_SEGMENT_ELEMENT:
        nm = tx_segment_nomenclature(element)
        element_args["nomenclature"] = nm
        element_args["inputType"] = "exon_coords_tx"
        element_args["inputTx"] = element.transcript.split(":")[1]
        element_args["inputExonStart"] = element.exonStart
        element_args["inputExonStartOffset"] = element.exonStartOffset
        element_args["inputExonEnd"] = element.exonEnd
        element_args["inputExonEndOffset"] = element.exonEndOffset
        element_args["inputGene"] = element.gene.label
        return ClientTranscriptSegmentElement(**element_args)
    msg = "Unknown element type provided"
    raise ValueError(msg)


def clientify_fusion(fusion: Fusion, fusor_instance: FUSOR) -> ClientFusion:
    """Add client-required properties to fusion object.

    :param fusion: fusion to append to
    :param fusor_instance: FUSOR object instance provided by FastAPI request context
    :return: completed client-ready fusion
    """
    fusion_args = fusion.dict()
    client_elements = [
        clientify_structural_element(element, fusor_instance)
        for element in fusion.structure
    ]
    fusion_args["structure"] = client_elements

    if fusion_args.get("regulatoryElement"):
        reg_element_args = fusion_args["regulatoryElement"]
        nomenclature = reg_element_nomenclature(
            RegulatoryElement(**reg_element_args), fusor_instance.seqrepo
        )
        reg_element_args["nomenclature"] = nomenclature
        regulatory_class = fusion_args["regulatoryElement"]["regulatoryClass"]
        if regulatory_class == "enhancer":
            reg_element_args["displayClass"] = "Enhancer"
        else:
            msg = "Undefined reg element class used in demo"
            raise Exception(msg)
        fusion_args["regulatoryElement"] = reg_element_args

    if fusion.type == FUSORTypes.CATEGORICAL_FUSION:
        if fusion.criticalFunctionalDomains:
            client_domains = []
            for domain in fusion.criticalFunctionalDomains:
                client_domain = domain.dict()
                client_domain["domainId"] = str(uuid4())
                client_domains.append(client_domain)
            fusion_args["criticalFunctionalDomains"] = client_domains
        return ClientCategoricalFusion(**fusion_args)
    if fusion.type == FUSORTypes.ASSAYED_FUSION:
        return ClientAssayedFusion(**fusion_args)
    msg = "Unknown fusion type provided"
    raise ValueError(msg)


@router.get(
    "/api/demo/alk",
    operation_id="alkDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.DEMOS],
)
def get_alk(request: Request) -> DemoResponse:
    """Retrieve ALK assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        fusion=clientify_fusion(examples.alk, request.app.state.fusor), warnings=[]
    )


@router.get(
    "/api/demo/ewsr1",
    operation_id="ewsr1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.DEMOS],
)
def get_ewsr1(request: Request) -> DemoResponse:
    """Retrieve EWSR1 assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        fusion=clientify_fusion(examples.ewsr1, request.app.state.fusor), warnings=[]
    )


@router.get(
    "/api/demo/bcr_abl1",
    operation_id="bcrAbl1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.DEMOS],
)
def get_bcr_abl1(request: Request) -> DemoResponse:
    """Retrieve BCR-ABL1 categorical fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        fusion=clientify_fusion(examples.bcr_abl1, request.app.state.fusor), warnings=[]
    )


@router.get(
    "/api/demo/tpm3_ntrk1",
    operation_id="tpm3Ntrk1Demo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.DEMOS],
)
def get_tpm3_ntrk1(request: Request) -> DemoResponse:
    """Retrieve TPM3-NTRK1 assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        fusion=clientify_fusion(examples.tpm3_ntrk1, request.app.state.fusor),
        warnings=[],
    )


@router.get(
    "/api/demo/tpm3_pdgfrb",
    operation_id="tpm3PdgfrbDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.DEMOS],
)
def get_tpm3_pdgfrb(request: Request) -> DemoResponse:
    """Retrieve TPM3-PDGFRB assayed fusion.
    \f
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        fusion=clientify_fusion(examples.tpm3_pdgfrb, request.app.state.fusor),
        warnings=[],
    )


@router.get(
    "/api/demo/igh_myc",
    operation_id="ighMycDemo",
    response_model=DemoResponse,
    response_model_exclude_none=True,
    tags=[RouteTag.DEMOS],
)
def get_igh_myc(request: Request) -> DemoResponse:
    """Retrieve IGH-MYC assayed fusion.
    :param Request request: the HTTP request context, supplied by FastAPI. Use to access
        FUSOR and UTA-associated tools.
    """
    return DemoResponse(
        fusion=clientify_fusion(examples.igh_myc, request.app.state.fusor), warnings=[]
    )
