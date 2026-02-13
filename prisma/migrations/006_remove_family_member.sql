-- Migration 006: Remove FamilyMember, link BudgetIncomeCategory directly to User
-- 1. Add budgetYearId and userId columns to BudgetIncomeCategory
-- 2. Migrate data from FamilyMember
-- 3. Recreate BudgetIncomeCategory with new schema
-- 4. Drop FamilyMember table

-- Step 1: Create new BudgetIncomeCategory table
CREATE TABLE "BudgetIncomeCategory_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FIXED',
    "taxRateId" TEXT,
    "formula" TEXT,
    "budgetYearId" TEXT NOT NULL,
    CONSTRAINT "BudgetIncomeCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetIncomeCategory_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BudgetIncomeCategory_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "BudgetYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 2: Migrate data — match FamilyMember.name to User.name
INSERT INTO "BudgetIncomeCategory_new" ("id", "userId", "name", "type", "taxRateId", "formula", "budgetYearId")
SELECT
    bic."id",
    u."id",
    bic."name",
    bic."type",
    bic."taxRateId",
    bic."formula",
    fm."budgetYearId"
FROM "BudgetIncomeCategory" bic
JOIN "FamilyMember" fm ON bic."familyMemberId" = fm."id"
JOIN "User" u ON LOWER(u."name") = LOWER(fm."name");

-- Step 3: Drop old table and rename new one
DROP TABLE "BudgetIncomeCategory";
ALTER TABLE "BudgetIncomeCategory_new" RENAME TO "BudgetIncomeCategory";

-- Step 4: Recreate indexes
CREATE INDEX "BudgetIncomeCategory_userId_idx" ON "BudgetIncomeCategory"("userId");
CREATE INDEX "BudgetIncomeCategory_budgetYearId_idx" ON "BudgetIncomeCategory"("budgetYearId");

-- Step 5: Drop FamilyMember table and its index
DROP INDEX IF EXISTS "FamilyMember_budgetYearId_idx";
DROP TABLE "FamilyMember";
