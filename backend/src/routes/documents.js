import express from "express";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const documentsRouter = express.Router();

const docSchema = z.object({
  title: z.string().min(4),
  description: z.string().optional().default(""),
  category: z.string().min(2),
  issuedBy: z.string().min(2),
  issuedAt: z.string().datetime()
});

documentsRouter.get("/", async (req, res) => {
  const q = String(req.query.q || "");
  const category = req.query.category ? String(req.query.category) : undefined;
  const items = await prisma.medicalDocument.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { issuedBy: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: { issuedAt: "desc" }
  });
  res.json({ items });
});

documentsRouter.get("/:id/download", async (req, res) => {
  const item = await prisma.medicalDocument.update({
    where: { id: req.params.id },
    data: { downloadCount: { increment: 1 } }
  }).catch(() => null);

  if (!item) return res.status(404).json({ message: "Document not found" });

  const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "../storage/uploads");
  const filePath = path.join(uploadDir, item.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found on server" });

  res.download(filePath, item.originalName);
});

documentsRouter.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File is required" });
  const parsed = docSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid document data", errors: parsed.error.flatten() });

  const item = await prisma.medicalDocument.create({
    data: {
      ...parsed.data,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      adminId: req.admin.id
    }
  });
  res.status(201).json({ item });
});

documentsRouter.delete("/:id", requireAuth, async (req, res) => {
  await prisma.medicalDocument.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
