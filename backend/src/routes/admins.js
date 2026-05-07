import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const adminsRouter = express.Router();

const adminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["SUPER_ADMIN", "EDITOR"]).default("EDITOR")
});

adminsRouter.get("/", requireAuth, async (_req, res) => {
  const items = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ items });
});

adminsRouter.post("/", requireAuth, async (req, res) => {
  if (req.admin.role !== "SUPER_ADMIN") return res.status(403).json({ message: "Super admin only" });
  const parsed = adminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid admin data", errors: parsed.error.flatten() });

  const item = await prisma.admin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true }
  });
  res.status(201).json({ item });
});
