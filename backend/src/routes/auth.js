import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid credentials format" });

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.active) return res.status(401).json({ message: "Email or password is incorrect" });

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: "Email or password is incorrect" });

  const token = jwt.sign({ sub: admin.id, role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});
