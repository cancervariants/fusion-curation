"""Utility for building client-side models."""
from pathlib import Path

from pydantic2ts import generate_typescript_defs


def build_client_types_file():
    """Build TypeScript type definitions file for client development."""
    client_dir = Path(__file__).resolve().parents[3] / "client"
    generate_typescript_defs(
        "curation.schemas",
        str((client_dir / "src" / "services" / "ResponseModels.ts").absolute()),
        json2ts_cmd=str((client_dir / "node_modules" / ".bin" / "json2ts").absolute()),
    )
