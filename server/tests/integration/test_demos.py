"""Test demo endpoints"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_demo(async_client: AsyncClient):
    """Test /api/demo/ endpoints.
    Probably not worth it to check individual property values, but the Pydantic models
    provide a good assurance that if the endpoint responses are successful, then it
    should be at least mostly correct.
    """
    response = await async_client.get("/api/demo/alk")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/api/demo/ewsr1")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/api/demo/bcr_abl1")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/api/demo/tpm3_ntrk1")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/api/demo/tpm3_pdgfrb")
    assert response.status_code == 200
    assert response.json()["fusion"]

    response = await async_client.get("/api/demo/igh_myc")
    assert response.status_code == 200
    assert response.json()["fusion"]
