// src/controllers/advisoryController.js
import Advisory from "../models/Advisory.js";
import crypto from "crypto";

/**
 * Create advisory (called by n8n)
 * Expects JSON shaped like:
 * {
 *   farmId, farmName, ndviReportId, ndviReport: { ... }, advisory_en, advisory_local, sent_to_chat_id, tiles_url
 * }
 */
export async function createAdvisory(req, res) {
  try {
    const payload = req.body;

    // Support both direct and wrapped payloads (n8n test wraps webhook body under "body")
    let body = payload && payload.body ? payload.body : payload;

    // If n8n wrapped body as a JSON string, parse it.
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // leave as-is if not JSON
      }
    }

    const ndvi = body.ndviReport || {};

    // Determine idempotency key (prefer explicit reportId)
    let idempotencyKey = ndvi.reportId || body.ndviReportId || body.idempotency_key;
    if (!idempotencyKey) {
      // fallback deterministic key: farmId + captureDate + rounded pct_stress
      const farm = body.farmId || body.farm_id || "unknown";
      const capture = ndvi.captureDate || body.captureDate || "";
      const pct = String(Math.round((ndvi.pct_stress ?? body.pct_stress ?? 0) * 100));
      idempotencyKey = crypto.createHash("sha256").update(`${farm}|${capture}|${pct}`).digest("hex");
    }

    // build severity if not present
    let severity = body.severity;
    if (!severity) {
      const pct = Number(ndvi.pct_stress ?? body.pct_stress ?? 0);
      severity = pct > 0.6 ? "high" : pct > 0.3 ? "medium" : "low";
    }

    const advisoryData = {
      farmId: body.farmId || body.farm_id,
      farmName: body.farmName,
      // FORCE using computed idempotency key for stored document
      ndviReportId: idempotencyKey,
      mean_ndvi: ndvi.mean_ndvi ?? body.mean_ndvi,
      median_ndvi: ndvi.median_ndvi ?? body.median_ndvi,
      pct_stress: ndvi.pct_stress ?? body.pct_stress,
      stress_threshold: ndvi.stress_threshold ?? body.stress_threshold,
      severity,
      advisory_en: body.advisory_en || body.message_en || "",
      advisory_local: body.advisory_local || body.message_local || "",
      sent_to_chat_id: body.sent_to_chat_id || body.owner?.telegramChatId || body.chat_id,
      tiles_url: ndvi.tiles_url ?? body.tiles_url,
      raw_payload: body
    };

    // Upsert by ndviReportId (idempotency key).
    // Use $setOnInsert so repeated requests don't overwrite existing advisories,
    // and use rawResult to determine whether it was an insert.
    const filter = { ndviReportId: idempotencyKey };
    const update = { $setOnInsert: advisoryData };
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
      rawResult: true
    };

    const result = await Advisory.findOneAndUpdate(filter, update, options);

    // result is a raw result object when rawResult: true
    // raw.result or result.lastErrorObject tells us if it was inserted
    const wasInserted =
      result?.lastErrorObject && result.lastErrorObject.updatedExisting === false;

    // fetch the returned document (Mongoose returns it at 'value' for rawResult:true)
    const advisoryDoc = result.value || result;

    return res.status(wasInserted ? 201 : 200).json({
      success: true,
      advisory: advisoryDoc,
      upsertedBy: idempotencyKey,
      created: !!wasInserted
    });
  } catch (err) {
    console.error("createAdvisory error", err);

    // handle duplicate key race condition gracefully (another process inserted in the meantime)
    if (err && err.code === 11000) {
      try {
        const key = err.keyValue?.ndviReportId;
        if (key) {
          const existing = await Advisory.findOne({ ndviReportId: key });
          if (existing) return res.status(200).json({ success: true, advisory: existing, upsertedBy: key });
        }
      } catch (fetchErr) {
        console.error("fetch after duplicate key error failed", fetchErr);
      }
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function getAdvisories(req, res) {
  try {
    const { farmId, severity, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (farmId) filter.farmId = farmId;
    if (severity) filter.severity = severity;
    const skip = (Number(page) - 1) * Number(limit);
    const advisories = await Advisory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    return res.json({ success: true, count: advisories.length, advisories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

export async function getAdvisoryById(req, res) {
  try {
    const adv = await Advisory.findById(req.params.id);
    if (!adv) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, advisory: adv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}
