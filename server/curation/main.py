"""Provide FastAPI application and route declarations."""
from typing import Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fusor import FUSOR

from curation import APP_ROOT
from curation.version import __version__
from curation.schemas import ServiceInfoResponse
from curation.gene_services import GeneService
from curation.domain_services import DomainService
from curation.routers import utilities, constructors, lookup, complete, validate


app = FastAPI(version=__version__, swagger_ui_parameters={"tryItOutEnabled": True})

app.include_router(utilities.router)
app.include_router(constructors.router)
app.include_router(lookup.router)
app.include_router(complete.router)
app.include_router(validate.router)

origins = ["http://localhost", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def start_fusor() -> FUSOR:
    """Initialize FUSOR instance and create UTA thread pool.

    :return: FUSOR instance
    """
    fusor_instance = FUSOR()
    await fusor_instance.uta_tools.uta_db.create_pool()
    return fusor_instance


def get_gene_services() -> GeneService:
    """Initialize gene services instance. Retrieve and load mappings.

    :return: GeneService instance
    """
    gene_services = GeneService()
    gene_services.load_mapping()
    return gene_services


def get_domain_services() -> DomainService:
    """Initialize domain services instance. Retrieve and load mappings.

    :return: DomainService instance
    """
    domain_service = DomainService()
    domain_service.load_mapping()
    return domain_service


@app.on_event("startup")
async def startup():
    """Get FUSOR reference"""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()


@app.on_event("shutdown")
async def shutdown():
    """Clean up thread pool."""
    await app.state.fusor.uta_tools.uta_db._connection_pool.close()


@app.get(
    "/service_info", operation_id="serviceInfo", response_model=ServiceInfoResponse
)
def get_service_info() -> Dict:
    """Return service info."""
    return {"version": __version__}


app.mount("/", StaticFiles(html=True, directory=APP_ROOT / "build"))
