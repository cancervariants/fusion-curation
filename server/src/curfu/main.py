"""Provide FastAPI application and route declarations."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fusor import FUSOR
from starlette.templating import _TemplateResponse as TemplateResponse

from curfu import APP_ROOT
from curfu.domain_services import DomainService
from curfu.gene_services import GeneService
from curfu.routers import (
    complete,
    constructors,
    demo,
    lookup,
    meta,
    nomenclature,
    utilities,
    validate,
)
from curfu.version import __version__ as curfu_version

fastapi_app = FastAPI(
    title="Fusion Curation API",
    description="Provide data functions to support [VICC Fusion Curation interface](fusion-builder.cancervariants.org/).",
    contact={
        "name": "Alex H. Wagner",
        "email": "Alex.Wagner@nationwidechildrens.org",
        "url": "https://www.nationwidechildrens.org/specialties/institute-for-genomic-medicine/research-labs/wagner-lab",
    },
    license={
        "name": "MIT",
        "url": "https://github.com/cancervariants/fusion-curation/blob/main/LICENSE",
    },
    version=curfu_version,
    swagger_ui_parameters={"tryItOutEnabled": True},
    docs_url="/docs",
    openapi_url="/openapi.json",
)

fastapi_app.include_router(utilities.router)
fastapi_app.include_router(constructors.router)
fastapi_app.include_router(lookup.router)
fastapi_app.include_router(complete.router)
fastapi_app.include_router(validate.router)
fastapi_app.include_router(nomenclature.router)
fastapi_app.include_router(demo.router)
fastapi_app.include_router(meta.router)

origins = ["http://localhost", "http://localhost:3000"]

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BUILD_DIR = APP_ROOT / "build"


def serve_react_app(app: FastAPI) -> FastAPI:
    """Wrap application initialization in Starlette route param converter.

    :param app: FastAPI application instance
    :return: application with React frontend mounted
    """
    app.mount(
        "/static/",
        StaticFiles(directory=BUILD_DIR / "static"),
        name="React application static files",
    )
    templates = Jinja2Templates(directory=BUILD_DIR.as_posix())

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_app(request: Request, full_path: str) -> TemplateResponse:
        """Add arbitrary path support to FastAPI service.

        React-router provides something akin to client-side routing based out
        of the Javascript embedded in index.html. However, FastAPI will intercede
        and handle all client requests, and will 404 on any non-server-defined paths.
        This function reroutes those otherwise failed requests against the React-Router
        client, allowing it to redirect the client to the appropriate location.
        :param request: client request object
        :param full_path: request path
        :return: Starlette template response object
        """
        return templates.TemplateResponse("index.html", {"request": request})

    return app


app = serve_react_app(fastapi_app)


async def start_fusor() -> FUSOR:
    """Initialize FUSOR instance and create UTA thread pool.

    :return: FUSOR instance
    """
    fusor_instance = FUSOR()
    await fusor_instance.cool_seq_tool.uta_db.create_pool()
    return fusor_instance


def get_gene_services() -> GeneService:
    """Initialize gene services instance. Retrieve and load mappings.

    :return: GeneService instance
    """
    gene_services = GeneService()
    return gene_services


def get_domain_services() -> DomainService:
    """Initialize domain services instance. Retrieve and load mappings.

    :return: DomainService instance
    """
    domain_service = DomainService()
    domain_service.load_mapping()
    return domain_service


@app.on_event("startup")
async def startup() -> None:
    """Get FUSOR reference"""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()


@app.on_event("shutdown")
async def shutdown() -> None:
    """Clean up thread pool."""
    await app.state.fusor.cool_seq_tool.uta_db._connection_pool.close()
