from fastapi import FastAPI

from app import __version__

app = FastAPI(title="AI PlatformTrust API", version=__version__)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
