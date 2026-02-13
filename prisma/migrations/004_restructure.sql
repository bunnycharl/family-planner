-- Migration 004: Restructure entities
-- Task: remove priority/dueDate, add startDate/endDate/phaseId
-- Event: simplify (single date, single assignee, remove many fields)
-- Milestone: delete entirely

-- 1. Recreate Task table
CREATE TABLE "Task_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "position" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "phaseId" TEXT,
    CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "RoadmapPhase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Task_new" ("id", "title", "description", "status", "position",
    "startDate", "endDate", "createdAt", "updatedAt", "categoryId", "createdById", "assigneeId")
SELECT "id", "title", "description", "status", "position",
    COALESCE("dueDate", "createdAt"), COALESCE("dueDate", "createdAt"),
    "createdAt", "updatedAt", "categoryId", "createdById", "assigneeId"
FROM "Task";

DROP TABLE "Task";
ALTER TABLE "Task_new" RENAME TO "Task";

CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE INDEX "Task_phaseId_idx" ON "Task"("phaseId");
CREATE INDEX "Task_endDate_idx" ON "Task"("endDate");

-- 2. Recreate Event table (simplified)
CREATE TABLE "Event_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "Event_new" ("id", "title", "description", "date", "createdAt", "updatedAt",
    "categoryId", "createdById", "assigneeId")
SELECT e."id", e."title", e."description", e."startDate", e."createdAt", e."updatedAt",
    e."categoryId", e."createdById",
    (SELECT ea."B" FROM "_EventAssignees" ea WHERE ea."A" = e."id" LIMIT 1)
FROM "Event" e;

DROP TABLE "_EventAssignees";
DROP TABLE "Event";
ALTER TABLE "Event_new" RENAME TO "Event";

CREATE INDEX "Event_date_idx" ON "Event"("date");
CREATE INDEX "Event_categoryId_idx" ON "Event"("categoryId");
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");
CREATE INDEX "Event_assigneeId_idx" ON "Event"("assigneeId");

-- 3. Drop Milestone table
DROP TABLE IF EXISTS "Milestone";
