// src/models/Advisory.js
import mongoose from "mongoose";

const AdvisorySchema = new mongoose.Schema(
  {
    farmId: { type: String, required: true, index: true },
    farmName: { type: String },
    ndviReportId: { type: String, index: true, unique: true, sparse: true },
    mean_ndvi: { type: Number },
    median_ndvi: { type: Number },
    pct_stress: { type: Number }, // fraction e.g. 0.45
    stress_threshold: { type: Number },
    severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
    advisory_en: { type: String },
    advisory_local: { type: String },
    sent_to_chat_id: { type: String },
    tiles_url: { type: String },
    raw_payload: { type: mongoose.Schema.Types.Mixed }, // store raw webhook for traceability
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Advisory", AdvisorySchema);
