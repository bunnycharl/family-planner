-- Migration: rename RoadmapTask to Milestone, drop RoadmapTaskType

-- 1. Create new Milestone table
CREATE TABLE IF NOT EXISTS "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "phaseId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Milestone_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "RoadmapPhase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Milestone_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 2. Copy data from RoadmapTask to Milestone
INSERT INTO "Milestone" ("id", "name", "details", "startDate", "endDate", "isCompleted", "position", "phaseId", "categoryId", "createdAt", "updatedAt")
SELECT "id", "name", "details", "startDate", "endDate", "isCompleted", "position", "phaseId", NULL, "createdAt", "updatedAt"
FROM "RoadmapTask";

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS "Milestone_phaseId_idx" ON "Milestone"("phaseId");
CREATE INDEX IF NOT EXISTS "Milestone_startDate_idx" ON "Milestone"("startDate");
CREATE INDEX IF NOT EXISTS "Milestone_categoryId_idx" ON "Milestone"("categoryId");

-- 4. Drop old tables
DROP TABLE IF EXISTS "RoadmapTask";
DROP TABLE IF EXISTS "RoadmapTaskType";
