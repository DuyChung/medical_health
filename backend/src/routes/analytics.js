import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const analyticsRouter = express.Router();

analyticsRouter.post("/visit", async (req, res) => {
  await prisma.siteVisit.create({
    data: { path: req.body.path || "/", ip: req.ip, userAgent: req.headers["user-agent"] || "" }
  });
  res.status(204).send();
});

analyticsRouter.get("/summary", requireAuth, async (_req, res) => {
  const [caseCount, documentCount, totalViews, visits, topPosts] = await Promise.all([
    prisma.caseReport.count(),
    prisma.medicalDocument.count(),
    prisma.caseReport.aggregate({ _sum: { viewCount: true } }),
    prisma.siteVisit.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.caseReport.findMany({ orderBy: { viewCount: "desc" }, take: 5 })
  ]);

  const byDay = visits.reduce((acc, visit) => {
    const day = visit.createdAt.toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totals: {
      cases: caseCount,
      documents: documentCount,
      postViews: totalViews._sum.viewCount || 0,
      visits: visits.length
    },
    visitsByDay: Object.entries(byDay).map(([date, visits]) => ({ date, visits })).reverse(),
    topPosts
  });
});
