// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import advisoriesRouter from "./routes/advisories.js"
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import farmRoutes from "./routes/farmRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" })); // accept larger payloads (tiles metadata)
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/advisories", advisoriesRouter);
app.use("/api/auth", authRoutes)
app.use("/api/farms", farmRoutes)

app.get("/", (req, res) => res.json({ ok: true, service: "AgriSense Backend" }));

// start
(async () => {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
