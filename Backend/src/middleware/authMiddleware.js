// src/middleware/auth.js
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const serviceToken = req.headers["x-service-token"] || req.headers["x-service-token".toLowerCase()];

  // service token (trusted automation)
  if (serviceToken && process.env.SERVICE_TOKEN && serviceToken === process.env.SERVICE_TOKEN) {
    req.user = { service: true };
    return next();
  }

  // JWT flow
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing auth" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // payload can contain userId, roles etc.
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
