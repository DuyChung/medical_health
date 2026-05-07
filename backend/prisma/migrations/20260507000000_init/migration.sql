CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'EDITOR');

CREATE TABLE "Admin" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CaseReport" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "imageUrl" TEXT,
  "location" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "severity" "Severity" NOT NULL,
  "urgent" BOOLEAN NOT NULL DEFAULT false,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "adminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CaseReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attachment" (
  "id" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "caseReportId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MedicalDocument" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "issuedBy" TEXT NOT NULL,
  "issuedAt" TIMESTAMP(3) NOT NULL,
  "originalName" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "adminId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MedicalDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteVisit" (
  "id" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PostView" (
  "id" TEXT NOT NULL,
  "caseReportId" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE INDEX "CaseReport_severity_idx" ON "CaseReport"("severity");
CREATE INDEX "CaseReport_occurredAt_idx" ON "CaseReport"("occurredAt");
CREATE INDEX "CaseReport_urgent_idx" ON "CaseReport"("urgent");
CREATE INDEX "MedicalDocument_category_idx" ON "MedicalDocument"("category");
CREATE INDEX "MedicalDocument_issuedAt_idx" ON "MedicalDocument"("issuedAt");
CREATE INDEX "SiteVisit_createdAt_idx" ON "SiteVisit"("createdAt");
CREATE INDEX "PostView_createdAt_idx" ON "PostView"("createdAt");

ALTER TABLE "CaseReport" ADD CONSTRAINT "CaseReport_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_caseReportId_fkey" FOREIGN KEY ("caseReportId") REFERENCES "CaseReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MedicalDocument" ADD CONSTRAINT "MedicalDocument_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_caseReportId_fkey" FOREIGN KEY ("caseReportId") REFERENCES "CaseReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
