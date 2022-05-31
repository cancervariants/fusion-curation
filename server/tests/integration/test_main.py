"""Test main service routes."""
import re

import pytest


@pytest.mark.asyncio
async def test_service_info(async_client):
    """Test /service_info endpoint"""
    response = await async_client.get("/service_info")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["warnings"] == []
    SEMVER_PATTERN = r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"  # noqa: E501
    assert re.match(SEMVER_PATTERN, response_json["fusion_curation_version"])
    assert re.match(SEMVER_PATTERN, response_json["fusor_version"])
    assert re.match(SEMVER_PATTERN, response_json["uta_tools_version"])
    assert re.match(
        SEMVER_PATTERN, response_json["vrs_python_version"]
    )  # not passing, whatever
