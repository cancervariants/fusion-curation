"""Provide core fixtures for testing Flask functions."""
import pytest
import asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient

from curation.main import app, start_fusor, get_gene_services, get_domain_services


@pytest.fixture(scope="session")
def event_loop(request):
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def client():
    """Provide Starlette test client fixture."""
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()
    return TestClient(app)


@pytest.fixture(scope="session")
async def async_client():
    """Provide httpx async client fixture."""
    app.state.fusor = await start_fusor()
    app.state.genes = get_gene_services()
    app.state.domains = get_domain_services()
    client = AsyncClient(app=app, base_url="http://test")
    yield client
    await client.aclose()
