import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth.js";
import { casesRouter } from "./routes/cases.js";
import { documentsRouter } from "./routes/documents.js";
import { analyticsRouter } from "./routes/analytics.js";
import { adminsRouter } from "./routes/admins.js";

const app = express();
const server = createServer(app);
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const corsOrigin = (origin, callback) => {
  if (!origin || clientOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};
const io = new Server(server, { cors: { origin: corsOrigin } });

app.set("io", io);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "../storage/uploads");
app.use("/uploads", express.static(uploadDir));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "medical-cases-api" }));
app.use("/api/auth", authRouter);
app.use("/api/cases", casesRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admins", adminsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File quá lớn. Dung lượng tối đa là 15MB." });
  }
  if (err.message?.startsWith("File không hợp lệ")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Medical cases API listening on http://localhost:${port}`);
});
