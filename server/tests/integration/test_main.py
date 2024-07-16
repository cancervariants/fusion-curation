"""Test main service routes."""

import re

import pytest


@pytest.mark.asyncio()
async def test_service_info(async_client):
    """Test /service_info endpoint

    uses semver-provided regex to check version numbers:
    https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string  # noqa: E501
    """
    response = await async_client.get("/api/service_info")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["warnings"] == []
    semver_pattern = r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"
    assert re.match(semver_pattern, response_json["curfu_version"])
    assert re.match(semver_pattern, response_json["fusor_version"])
    assert re.match(semver_pattern, response_json["cool_seq_tool_version"])
    # not sure if I want to include vrs-python
    # also its current version number isn't legal semver
    # assert re.match(
    #     SEMVER_PATTERN, response_json["vrs_python_version"]
    # )
