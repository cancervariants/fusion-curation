"""Test demo endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_demo(async_client: AsyncClient):
    """Test /demo/ endpoints."""
    response = await async_client.get("/demo/alk")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/demo/ewsr1")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/demo/bcr_abl1")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/demo/tpm3_ntrk1")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/demo/tpm3_pdgfrb")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/demo/igh_myc")
    assert response.status_code == 200
    assert response.json()["fusion"]
