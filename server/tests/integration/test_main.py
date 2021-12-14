"""Test main service routes."""
import re

from fastapi.testclient import TestClient


def test_service_info(client: TestClient):
    """Test /service_info endpoint"""
    response = client.get("/service_info")
    assert response.status_code == 200
    response_json = response.json()
    assert response_json["warnings"] is None
    SEMVER_PATTERN = r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$"  # noqa: E501
    assert re.match(SEMVER_PATTERN, response_json["version"])
