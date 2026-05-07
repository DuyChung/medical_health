import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "../storage/uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const allowed = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/octet-stream",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safe}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.has(file.mimetype) && !allowedExtensions.has(ext)) {
      return cb(new Error("File không hợp lệ. Chỉ hỗ trợ PDF, DOC, DOCX, JPG, PNG, WEBP."));
    }
    cb(null, true);
  }
});
