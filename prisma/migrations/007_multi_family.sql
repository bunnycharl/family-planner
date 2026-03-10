-- Migration 007: Multi-family support
-- Add Family model, familyId to all resource tables, fix BudgetYear unique constraint

-- Step 1: Create Family table
CREATE TABLE "Family" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert default family for all existing data
INSERT INTO "Family" ("id", "name") VALUES ('default-family-id', 'Наша семья');

-- Step 3: Add familyId to User
ALTER TABLE "User" ADD COLUMN "familyId" TEXT NOT NULL DEFAULT 'default-family-id'
    REFERENCES "Family"("id");
CREATE INDEX "User_familyId_idx" ON "User"("familyId");

-- Step 4: Add familyId to Event
ALTER TABLE "Event" ADD COLUMN "familyId" TEXT NOT NULL DEFAULT 'default-family-id'
    REFERENCES "Family"("id");
CREATE INDEX "Event_familyId_idx" ON "Event"("familyId");

-- Step 5: Add familyId to Task
ALTER TABLE "Task" ADD COLUMN "familyId" TEXT NOT NULL DEFAULT 'default-family-id'
    REFERENCES "Family"("id");
CREATE INDEX "Task_familyId_idx" ON "Task"("familyId");

-- Step 6: Add familyId to Category, change unique constraint to per-family
ALTER TABLE "Category" ADD COLUMN "familyId" TEXT NOT NULL DEFAULT 'default-family-id'
    REFERENCES "Family"("id");
DROP INDEX IF EXISTS "Category_name_key";
CREATE UNIQUE INDEX "Category_name_familyId_key" ON "Category"("name", "familyId");
CREATE INDEX "Category_familyId_idx" ON "Category"("familyId");

-- Step 7: Add familyId to RoadmapPhase
ALTER TABLE "RoadmapPhase" ADD COLUMN "familyId" TEXT NOT NULL DEFAULT 'default-family-id'
    REFERENCES "Family"("id");
CREATE INDEX "RoadmapPhase_familyId_idx" ON "RoadmapPhase"("familyId");

-- Step 8: Recreate BudgetYear to change unique constraint from (year) to (year, familyId)
CREATE TABLE "BudgetYear_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "familyId" TEXT NOT NULL DEFAULT 'default-family-id',
    "baseCurrency" TEXT NOT NULL DEFAULT 'RUB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetYear_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id")
);
INSERT INTO "BudgetYear_new" ("id", "year", "familyId", "baseCurrency", "createdAt", "updatedAt")
SELECT "id", "year", 'default-family-id', "baseCurrency", "createdAt", "updatedAt"
FROM "BudgetYear";
DROP TABLE "BudgetYear";
ALTER TABLE "BudgetYear_new" RENAME TO "BudgetYear";
CREATE UNIQUE INDEX "BudgetYear_year_familyId_key" ON "BudgetYear"("year", "familyId");
CREATE INDEX "BudgetYear_familyId_idx" ON "BudgetYear"("familyId");
