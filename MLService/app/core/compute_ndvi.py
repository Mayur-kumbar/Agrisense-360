"""
NDVI computation helper.

This file tries to use rasterio/geopandas if available (recommended for real data).
If rasterio is not available (quick dev), it falls back to a simple PIL-based loader
which is only suitable for small test images where 'red' and 'nir' are supplied as greyscale PNGs.
"""

import numpy as np
import warnings

# Try to import rasterio and shapely; if not present, we use fallback
try:
    import rasterio
    from rasterio.mask import mask
    from shapely.geometry import shape, mapping
    HAS_RASTERIO = True
except Exception:
    HAS_RASTERIO = False

from app.core.utils import to_png_base64

def compute_ndvi_from_paths(red_path, nir_path, polygon_geojson, save_preview=True, stress_threshold=0.3):
    """
    red_path, nir_path: local paths or URLs (for now we support local filesystem).
    polygon_geojson: GeoJSON mapping (Polygon or MultiPolygon) in same coordinate system as raster.
    Returns summary dict.
    """

    if HAS_RASTERIO:
        return _compute_ndvi_rasterio(red_path, nir_path, polygon_geojson, save_preview, stress_threshold)
    else:
        warnings.warn("rasterio not available — using simplified PIL fallback (for small images only)")
        return _compute_ndvi_pil(red_path, nir_path, polygon_geojson, save_preview, stress_threshold)


def _compute_ndvi_rasterio(red_path, nir_path, polygon_geojson, save_preview, stress_threshold):
    import rasterio
    from rasterio.mask import mask
    from shapely.geometry import shape, mapping

    # Open red and nir as rasters; they must have same shape/transform/CRS in realistic scenarios.
    with rasterio.open(red_path) as src_red, rasterio.open(nir_path) as src_nir:
        # quick sanity check
        if src_red.shape != src_nir.shape:
            # Not always required (bands, transforms). We proceed but users should ensure alignment.
            pass

        geom = [polygon_geojson]
        # mask both rasters to polygon
        red_clip, _ = mask(src_red, geom, crop=True, filled=True)
        nir_clip, _ = mask(src_nir, geom, crop=True, filled=True)

        # convert to float and compute NDVI bandwise (handle multiple bands by taking band 1)
        red = red_clip[0].astype('float32')
        nir = nir_clip[0].astype('float32')
        denom = (nir + red)
        denom[denom == 0] = 1e-6
        ndvi = (nir - red) / denom

        mean_ndvi = float(np.nanmean(ndvi))
        median_ndvi = float(np.nanmedian(ndvi))
        pct_stress = float((ndvi < stress_threshold).sum() / ndvi.size)

        preview_b64 = None
        if save_preview:
            preview_b64 = to_png_base64(ndvi)

        return {
            "mean_ndvi": mean_ndvi,
            "median_ndvi": median_ndvi,
            "pct_stress": pct_stress,
            "stress_threshold": stress_threshold,
            "preview_png_base64": preview_b64,
            "message": "computed with rasterio"
        }


def _compute_ndvi_pil(red_path, nir_path, polygon_geojson, save_preview, stress_threshold):
    """
    Simplified fallback:
    - red_path, nir_path are small greyscale images (PNG/JPG) of equal dimensions.
    - polygon_geojson is ignored in fallback (we simply compute on entire image).
    This is just for quick local tests.
    """
    from PIL import Image
    import numpy as np

    red = np.array(Image.open(red_path).convert('L')).astype('float32')
    nir = np.array(Image.open(nir_path).convert('L')).astype('float32')

    if red.shape != nir.shape:
        raise ValueError("red and nir images must be same dimensions in fallback mode")

    denom = (nir + red)
    denom[denom == 0] = 1e-6
    ndvi = (nir - red) / denom

    mean_ndvi = float(np.nanmean(ndvi))
    median_ndvi = float(np.nanmedian(ndvi))
    pct_stress = float((ndvi < stress_threshold).sum() / ndvi.size)

    preview_b64 = None
    if save_preview:
        preview_b64 = to_png_base64(ndvi)

    return {
        "mean_ndvi": mean_ndvi,
        "median_ndvi": median_ndvi,
        "pct_stress": pct_stress,
        "stress_threshold": stress_threshold,
        "preview_png_base64": preview_b64,
        "message": "computed with PIL fallback (no rasterio)"
    }
