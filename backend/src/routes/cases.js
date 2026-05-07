import express from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const casesRouter = express.Router();

const formBoolean = z.preprocess((value) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false || value === "" || value == null) return false;
  return value;
}, z.boolean());

const optionalText = z.preprocess((value) => {
  if (value == null) return "";
  return String(value).trim();
}, z.string());

const caseSchema = z.object({
  title: optionalText.pipe(z.string().min(1, "Tiêu đề là bắt buộc")),
  summary: optionalText.pipe(z.string().min(1, "Mô tả là bắt buộc")),
  content: optionalText.pipe(z.string().min(1, "Nội dung là bắt buộc")),
  location: optionalText.pipe(z.string().min(1, "Địa điểm là bắt buộc")),
  occurredAt: z.string().datetime(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  imageUrl: optionalText.optional().default(""),
  urgent: formBoolean.default(false),
  published: formBoolean.default(true)
});

casesRouter.get("/", async (req, res) => {
  const q = String(req.query.q || "");
  const severity = req.query.severity ? String(req.query.severity) : undefined;
  const take = Math.min(Number(req.query.take || 20), 100);

  const items = await prisma.caseReport.findMany({
    where: {
      published: true,
      ...(severity ? { severity } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: { attachments: true },
    orderBy: [{ urgent: "desc" }, { occurredAt: "desc" }],
    take
  });
  res.json({ items });
});

casesRouter.get("/admin", requireAuth, async (_req, res) => {
  const items = await prisma.caseReport.findMany({
    include: { attachments: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ items });
});

casesRouter.get("/:id", async (req, res) => {
  const item = await prisma.caseReport.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
    include: { attachments: true }
  }).catch(() => null);
  if (!item || !item.published) return res.status(404).json({ message: "Case report not found" });
  await prisma.postView.create({ data: { caseReportId: item.id, ip: req.ip, userAgent: req.headers["user-agent"] || "" } });
  res.json({ item });
});

casesRouter.post("/", requireAuth, upload.array("files", 6), async (req, res) => {
  const parsed = caseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid case data", errors: parsed.error.flatten() });

  const item = await prisma.caseReport.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl?.startsWith("http") ? parsed.data.imageUrl : null,
      adminId: req.admin.id,
      attachments: {
        create: (req.files || []).map((file) => ({
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`
        }))
      }
    },
    include: { attachments: true }
  });

  req.app.get("io").emit("case:new", item);
  res.status(201).json({ item });
});

casesRouter.put("/:id", requireAuth, upload.array("files", 6), async (req, res) => {
  const parsed = caseSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid case data", errors: parsed.error.flatten() });

  const item = await prisma.caseReport.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl?.startsWith("http") ? parsed.data.imageUrl : null,
      attachments: {
        create: (req.files || []).map((file) => ({
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`
        }))
      }
    },
    include: { attachments: true }
  });
  res.json({ item });
});

casesRouter.delete("/:id", requireAuth, async (req, res) => {
  await prisma.caseReport.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
