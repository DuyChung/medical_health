import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing access token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, active: true }
    });

    if (!admin || !admin.active) return res.status(401).json({ message: "Invalid admin account" });
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
