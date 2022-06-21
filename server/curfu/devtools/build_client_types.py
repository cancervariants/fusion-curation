"""Provide client type generation tooling."""
from pathlib import Path
from pydantic2ts.cli.script import generate_typescript_defs


def build_client_types():
    """Construct type definitions for front-end client."""
    client_dir = Path(__file__).resolve().parents[3] / "client"
    generate_typescript_defs(
        "curfu.schemas",
        str((client_dir / "src" / "services" / "ResponseModels.ts").absolute()),
        json2ts_cmd=str((client_dir / "node_modules" / ".bin" / "json2ts").absolute()),
    )
