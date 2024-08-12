"""Provide service meta information"""

from cool_seq_tool import __version__ as cool_seq_tool_version
from fastapi import APIRouter
from fusor import __version__ as fusor_version

from curfu import __version__ as curfu_version
from curfu.schemas import RouteTag, ServiceInfoResponse

router = APIRouter()


@router.get(
    "/api/service_info",
    operation_id="serviceInfo",
    response_model=ServiceInfoResponse,
    tags=[RouteTag.META],
)
def get_service_info() -> ServiceInfoResponse:
    """Return service info."""
    return ServiceInfoResponse(
        curfu_version=curfu_version,
        cool_seq_tool_version=cool_seq_tool_version,
        fusor_version=fusor_version,
        warnings=[],
    )
