"""Test main service routes."""

import pytest


@pytest.mark.asyncio()
async def test_service_info(async_client):
    """Simple test of /service_info endpoint"""
    response = await async_client.get("/api/service_info")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["warnings"] == []
    assert response_json["curfu_version"]
    assert response_json["fusor_version"]
    assert response_json["cool_seq_tool_version"]
