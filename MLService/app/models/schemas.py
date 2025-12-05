from pydantic import BaseModel
from typing import Dict, Any, Optional

class NDVIComputeRequest(BaseModel):
    """
    red_path and nir_path can be:
      - local filesystem path (for testing)
      - s3://bucket/key (if S3 adapter implemented)
      - presigned url (http)
    polygon_geojson: GeoJSON dict (Polygon / MultiPolygon) in same CRS as raster or WGS84
    """
    red_path: str
    nir_path: str
    polygon_geojson: Dict[str, Any]
    save_preview: Optional[bool] = True  # return a small PNG preview (base64) for quick tests

class NDVIComputeResponse(BaseModel):
    mean_ndvi: float
    median_ndvi: float
    pct_stress: float
    stress_threshold: float
    preview_png_base64: Optional[str] = None
    message: Optional[str] = None
