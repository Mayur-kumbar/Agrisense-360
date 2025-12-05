# ml_service/app.py
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
import numpy as np
from PIL import Image
import io
import hashlib
import logging
import os
import asyncio
import json
import httpx
from fastapi import BackgroundTasks


app = FastAPI(title="AgriSense-360 ML Service - NDVI (with auto-resize)")

logger = logging.getLogger("ml_service")
logging.basicConfig(level=logging.INFO)


# ---------- helpers ----------
def imagefile_to_gray_array(file_bytes: bytes) -> np.ndarray:
    """
    Load an image (RGB or grayscale) and return a 2D float array 0..1
    """
    img = Image.open(io.BytesIO(file_bytes))
    # convert to RGB when necessary
    if img.mode == "RGBA":
        img = img.convert("RGB")
    if img.mode == "RGB":
        arr = np.asarray(img).astype("float32") / 255.0  # HxWx3
        # luminance conversion to single channel
        gray = 0.2989 * arr[..., 0] + 0.5870 * arr[..., 1] + 0.1140 * arr[..., 2]
        return gray
    else:
        # convert to L (single channel)
        arr = np.asarray(img.convert("L")).astype("float32") / 255.0
        return arr


# envs
BACKEND_URL = os.getenv("BACKEND_URL")
BACKEND_FARMS_PATH = os.getenv("BACKEND_FARMS_PATH", "/api/farms")

async def fetch_farm_metadata(farm_id: Optional[str]):
    """
    Fetch farm metadata from backend: expected shape { farmId, farmName, owner: { telegramChatId, ... }, tiles_url?... }
    Returns dict or None.
    """
    if not BACKEND_URL or not farm_id:
        return None
    url = f"{BACKEND_URL.rstrip('/')}{BACKEND_FARMS_PATH.rstrip('/')}/{farm_id}"
    try:
        async with httpx.AsyncClient(verify=False, timeout=5.0) as client:
            r = await client.get(url)
            if r.status_code == 200:
                return r.json()
            logger.warning(f"fetch_farm_metadata: backend returned {r.status_code} for farm {farm_id}: {r.text}")
    except Exception as e:
        logger.warning(f"fetch_farm_metadata error for {farm_id}: {e}")
    return None



def arrays_to_ndvi(nir: np.ndarray, red: np.ndarray) -> np.ndarray:
    """
    Compute NDVI safely. Inputs are float arrays in 0..1 range (same shape).
    Result is -1..1
    """
    # ensure same shape
    if nir.shape != red.shape:
        raise ValueError("nir and red arrays must have the same shape")
    denom = (nir + red)
    with np.errstate(divide="ignore", invalid="ignore"):
        ndvi = (nir - red) / denom
        ndvi[denom == 0] = 0.0
    ndvi = np.clip(ndvi, -1.0, 1.0)
    return ndvi


def percent_below_threshold(ndvi: np.ndarray, threshold: float) -> float:
    total = ndvi.size
    if total == 0:
        return 0.0
    below = np.count_nonzero(ndvi < threshold)
    return float(below) / float(total)


def deterministic_report_id(farm_id: Optional[str], capture_date: str, pct_stress: float) -> str:
    key = f"{farm_id or 'unknown'}|{capture_date}|{int(round(pct_stress*100))}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def resize_array_to_shape(arr: np.ndarray, target_shape: tuple) -> np.ndarray:
    """
    Resize a 2D float32 array (0..1) to target_shape (height, width).
    Uses PIL.Image.resize with bilinear interpolation.
    """
    if arr.shape == target_shape:
        return arr
    # convert float 0..1 -> uint8 0..255
    arr_uint8 = np.clip((arr * 255.0), 0, 255).astype("uint8")
    img = Image.fromarray(arr_uint8, mode="L")
    # PIL expects (width, height)
    resized = img.resize((target_shape[1], target_shape[0]), resample=Image.BILINEAR)
    resized_arr = np.asarray(resized).astype("float32") / 255.0
    logger.info(f"Resized array from {arr.shape} to {target_shape}")
    return resized_arr

# ---------- n8n sender helper ----------
N8N_WEBHOOK = os.getenv("N8N_WEBHOOK_URL")  # e.g. https://localhost:5678/webhook/ndvi-alert
N8N_SERVICE_TOKEN = os.getenv("N8N_SERVICE_TOKEN")  # optional, for your webhook auth
N8N_MAX_RETRIES = int(os.getenv("N8N_MAX_RETRIES", "3"))
N8N_RETRY_BASE_SECONDS = float(os.getenv("N8N_RETRY_BASE_SECONDS", "1.0"))

async def send_to_n8n(payload: dict):
    """
    Async send to n8n webhook with retries.
    Payload should be JSON-serializable.
    """
    if not N8N_WEBHOOK:
        logger.info("N8N_WEBHOOK_URL not set — skipping send_to_n8n")
        return {"sent": False, "reason": "no_webhook_configured"}

    headers = {"Content-Type": "application/json"}
    if N8N_SERVICE_TOKEN:
        headers["X-Service-Token"] = N8N_SERVICE_TOKEN

    last_exc = None
    async with httpx.AsyncClient(verify=False, timeout=10.0) as client:
        for attempt in range(1, N8N_MAX_RETRIES + 1):
            try:
                logger.info(f"Sending NDVI payload to n8n (attempt {attempt})")
                r = await client.post(N8N_WEBHOOK, json=payload, headers=headers)
                # Accept 2xx as success
                if 200 <= r.status_code < 300:
                    logger.info(f"n8n accepted payload (status={r.status_code})")
                    return {"sent": True, "status_code": r.status_code, "body": r.text}
                else:
                    logger.warning(f"n8n returned status {r.status_code}: {r.text}")
                    last_exc = Exception(f"status {r.status_code}: {r.text}")
            except Exception as e:
                logger.warning(f"send_to_n8n attempt {attempt} failed: {e}")
                last_exc = e

            # exponential backoff
            backoff = N8N_RETRY_BASE_SECONDS * (2 ** (attempt - 1))
            await asyncio.sleep(backoff)

    logger.error(f"Failed to send to n8n after {N8N_MAX_RETRIES} attempts: {last_exc}")
    return {"sent": False, "reason": "failed_after_retries", "error": str(last_exc)}



# ---------- request/response models ----------
class SimpleArrays(BaseModel):
    farmId: Optional[str] = None
    captureDate: Optional[str] = None  # ISO string allowed
    nir: List[List[float]]
    red: List[List[float]]
    stress_threshold: Optional[float] = 0.3


# ---------- endpoint ----------
@app.post("/v1/ndvi/compute")
async def compute_ndvi(
    nir_file: Optional[UploadFile] = File(None),
    red_file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    payload: Optional[dict] = Body(None),
    farmId: Optional[str] = Form(None),
    captureDate: Optional[str] = Form(None),
    stress_threshold: Optional[float] = Form(0.3),
    background_tasks: BackgroundTasks = None,
):
    """
    Compute NDVI -> produce ndvi_report and schedule a background send to n8n
    Attempts to enrich payload with farm metadata (owner, farmName, tiles_url) by:
      1) using fields present in incoming payload
      2) otherwise calling backend /api/farms/{farmId} (if BACKEND_URL env set)
    """
    try:
        # ---------- load input arrays ----------
        if payload:
            if "nir" in payload and "red" in payload:
                nir_arr = np.array(payload["nir"], dtype="float32")
                red_arr = np.array(payload["red"], dtype="float32")
                # simple normalization heuristic if values > 1
                maxv = float(max(np.nanmax(nir_arr), np.nanmax(red_arr)))
                if maxv > 1.0:
                    nir_arr = nir_arr / maxv
                    red_arr = red_arr / maxv
            else:
                raise HTTPException(status_code=400, detail="JSON payload must include 'nir' and 'red' arrays")
        else:
            if nir_file and red_file:
                nir_bytes = await nir_file.read()
                red_bytes = await red_file.read()
                nir_arr = imagefile_to_gray_array(nir_bytes)
                red_arr = imagefile_to_gray_array(red_bytes)
            elif image:
                img_bytes = await image.read()
                img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                arr = np.asarray(img).astype("float32") / 255.0
                # fallback: use red channel for both (synthetic)
                nir_arr = arr[..., 0]
                red_arr = arr[..., 0]
            else:
                raise HTTPException(status_code=400, detail="Provide JSON payload or multipart with files ('nir_file'+'red_file' or 'image')")

        # ---------- normalize / reduce channels ----------
        if nir_arr.ndim == 3:
            nir_arr = 0.2989 * nir_arr[..., 0] + 0.5870 * nir_arr[..., 1] + 0.1140 * nir_arr[..., 2]
        if red_arr.ndim == 3:
            red_arr = 0.2989 * red_arr[..., 0] + 0.5870 * red_arr[..., 1] + 0.1140 * red_arr[..., 2]

        # ---------- resize mismatched shapes (best-effort) ----------
        if nir_arr.shape != red_arr.shape:
            try:
                target = nir_arr.shape
                red_arr = resize_array_to_shape(red_arr, target)
            except Exception as e:
                logger.warning(f"Failed to resize red->nir: {e}, trying reverse resize")
                target = red_arr.shape
                nir_arr = resize_array_to_shape(nir_arr, target)

        # ---------- compute NDVI and stats ----------
        ndvi = arrays_to_ndvi(nir_arr, red_arr)
        mean_ndvi = float(np.nanmean(ndvi))
        median_ndvi = float(np.nanmedian(ndvi))
        threshold = float(stress_threshold or 0.3)
        pct_stress = percent_below_threshold(ndvi, threshold)

        # capture date
        cap_date = captureDate or (payload.get("captureDate") if payload else None) or datetime.utcnow().isoformat() + "Z"

        # deterministic id
        report_id = deterministic_report_id(farmId or (payload.get("farmId") if payload else None), cap_date, pct_stress)

        # histogram
        hist, edges = np.histogram(ndvi.flatten(), bins=10, range=(-1.0, 1.0))
        histogram = {"bins": hist.tolist(), "edges": edges.tolist()}

        ndvi_report = {
            "reportId": report_id,
            "captureDate": cap_date,
            "mean_ndvi": mean_ndvi,
            "median_ndvi": median_ndvi,
            "pct_stress": pct_stress,
            "stress_threshold": threshold,
            "histogram": histogram,
            "tiles_url": None,  # may be filled from farm metadata below
        }

        # ---------- Build response payload (immediate) ----------
        response_payload = {"success": True, "ndviReport": ndvi_report}

        # ---------- Enrichment: obtain farm metadata (owner, farmName, tiles_url) ----------
        # prefer farmId from form param, else payload
        farm_id_for_n8n = farmId or (payload.get("farmId") if payload else None)

        # local helper to fetch farm metadata from backend (best-effort)
        async def _fetch_farm_metadata_from_backend(fid: Optional[str]):
            BACKEND_URL = os.getenv("BACKEND_URL")
            BACKEND_FARMS_PATH = os.getenv("BACKEND_FARMS_PATH", "/api/farms")
            if not BACKEND_URL or not fid:
                return None
            url = f"{BACKEND_URL.rstrip('/')}{BACKEND_FARMS_PATH.rstrip('/')}/{fid}"
            try:
                async with httpx.AsyncClient(verify=False, timeout=6.0) as client:
                    r = await client.get(url)
                    if r.status_code == 200:
                        return r.json()
                    logger.warning(f"fetch_farm_metadata: backend returned {r.status_code} for farm {fid}: {r.text}")
            except Exception as e:
                logger.warning(f"fetch_farm_metadata error for {fid}: {e}")
            return None

        # 1) prefer any metadata passed in the incoming payload
        farm_meta = None
        if payload and isinstance(payload, dict):
            if any(k in payload for k in ("owner", "farmName")) or (payload.get("ndviReport") or {}).get("tiles_url"):
                farm_meta = {
                    "farmId": farm_id_for_n8n,
                    "farmName": payload.get("farmName"),
                    "owner": payload.get("owner"),
                    "tiles_url": (payload.get("ndviReport") or {}).get("tiles_url")
                }

        # 2) if missing, try backend
        if farm_meta is None and farm_id_for_n8n:
            try:
                farm_meta_backend = await _fetch_farm_metadata_from_backend(farm_id_for_n8n)
                if farm_meta_backend:
                    farm_meta = farm_meta_backend
            except Exception as e:
                logger.warning(f"Failed to fetch farm metadata for {farm_id_for_n8n}: {e}")

        # normalize owner / farmName / tiles_url for payload
        owner_obj = None
        farm_name_final = None
        tiles_url_final = None

        if farm_meta:
            farm_name_final = farm_meta.get("farmName") if isinstance(farm_meta, dict) else None
            # ndvi_report.tiles_url takes precedence if present (e.g., generated preview)
            tiles_url_final = ndvi_report.get("tiles_url") or farm_meta.get("tiles_url")
            # owner normalization - accept multiple possible key names
            owner_candidate = farm_meta.get("owner") if isinstance(farm_meta, dict) else None
            if owner_candidate:
                # canonicalize telegram id into telegramChatId string if possible
                telegram_id = owner_candidate.get("telegramChatId") or owner_candidate.get("telegram_id") or owner_candidate.get("chat_id")
                if telegram_id is not None:
                    # make sure it's a string (Telegram accepts numeric, but we keep consistent)
                    owner_candidate = {**owner_candidate, "telegramChatId": str(telegram_id)}
                owner_obj = owner_candidate

        # Also, if no farm_meta was found but payload contained farmName/owner fields individually, prefer them
        if owner_obj is None and payload and isinstance(payload, dict) and payload.get("owner"):
            owner_candidate = payload.get("owner")
            telegram_id = owner_candidate.get("telegramChatId") or owner_candidate.get("telegram_id") or owner_candidate.get("chat_id")
            if telegram_id is not None:
                owner_candidate = {**owner_candidate, "telegramChatId": str(telegram_id)}
            owner_obj = owner_candidate
            if not farm_name_final and payload.get("farmName"):
                farm_name_final = payload.get("farmName")
            if not tiles_url_final:
                tiles_url_final = (payload.get("ndviReport") or {}).get("tiles_url")

        # ---------- Compose the final n8n payload (accepted shape) ----------
        # friendly advisory text (localized later if you add translate step)
        advisory_text = (
            f"⚠️ AgriSense Alert — {farm_name_final or 'Unknown Farm'}\n"
            f"Stress detected in {int(round(pct_stress * 100))}% of the field (mean NDVI {mean_ndvi:.2f}).\n"
            f"Capture: {cap_date}\n"
            f"Recommended: Inspect for pests/disease; check irrigation/fertilizer scheduling.\n"
            f"NDVI tiles: {tiles_url_final or 'N/A'}"
        )

        n8n_payload = {
            "farmId": farm_id_for_n8n,
            "farmName": farm_name_final,
            "owner": owner_obj,
            "ndviReport": {
                **ndvi_report,
                "tiles_url": tiles_url_final
            },
            "advisory_en": advisory_text,
            "pct_stress_numeric": pct_stress,
            "stress_threshold_numeric": threshold,
            "sendAlert": True
        }

        # ---------- Schedule background send to n8n (non-blocking) ----------
        try:
            if background_tasks is not None:
                background_tasks.add_task(send_to_n8n, n8n_payload)
            else:
                asyncio.create_task(send_to_n8n(n8n_payload))
        except Exception as e:
            logger.warning(f"Could not schedule send_to_n8n: {e}")

        # return immediate ML response
        return JSONResponse(status_code=200, content=response_payload)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("NDVI processing error")
        raise HTTPException(status_code=500, detail=f"NDVI processing failed: {str(e)}")
