from fastapi import APIRouter, HTTPException
from app.models.schemas import NDVIComputeRequest, NDVIComputeResponse
from app.core.compute_ndvi import compute_ndvi_from_paths

router = APIRouter()

@router.post("/compute", response_model=NDVIComputeResponse)
async def compute_ndvi(payload: NDVIComputeRequest):
    """
    Compute NDVI clipped to the provided polygon.
    For production, prefer sending S3 paths and let the service read/write from S3.
    """
    try:
        result = compute_ndvi_from_paths(
            red_path=payload.red_path,
            nir_path=payload.nir_path,
            polygon_geojson=payload.polygon_geojson,
            save_preview=payload.save_preview
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
