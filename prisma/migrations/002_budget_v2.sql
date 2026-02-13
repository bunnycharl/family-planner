-- Migration: budget_v2_rewrite
-- Drops old finance tables, creates new budget tables

-- 1. Drop old finance tables (order matters due to foreign keys)
DROP TABLE IF EXISTS "IncomeParam";
DROP TABLE IF EXISTS "IncomeEntry";
DROP TABLE IF EXISTS "ExpenseEntry";
DROP TABLE IF EXISTS "ExchangeRate";
DROP TABLE IF EXISTS "ExpenseGroupCategory";
DROP TABLE IF EXISTS "ExpenseGroup";
DROP TABLE IF EXISTS "FinanceIncomeCategory";
DROP TABLE IF EXISTS "FinanceTaxRule";
DROP TABLE IF EXISTS "FinancePerson";

-- 2. Create new budget tables
CREATE TABLE IF NOT EXISTS "BudgetYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'RUB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "FamilyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FamilyMember_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "BudgetYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BudgetIncomeCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "familyMemberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FIXED',
    "taxRateId" TEXT,
    "formula" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetIncomeCategory_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BudgetIncomeCategory_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "TaxRate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FormulaParam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incomeCategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "paramKey" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FormulaParam_incomeCategoryId_fkey" FOREIGN KEY ("incomeCategoryId") REFERENCES "BudgetIncomeCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BudgetIncomeEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incomeCategoryId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetIncomeEntry_incomeCategoryId_fkey" FOREIGN KEY ("incomeCategoryId") REFERENCES "BudgetIncomeCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "FormulaParamValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formulaParamId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "value" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "FormulaParamValue_formulaParamId_fkey" FOREIGN KEY ("formulaParamId") REFERENCES "FormulaParam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TaxRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "TaxRate_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "BudgetYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BudgetExpenseGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetExpenseGroup_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "BudgetYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BudgetExpenseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetExpenseCategory_expenseGroupId_fkey" FOREIGN KEY ("expenseGroupId") REFERENCES "BudgetExpenseGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BudgetExpenseEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseCategoryId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "BudgetExpenseEntry_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "BudgetExpenseCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CurrencyRate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetYearId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "rate" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "CurrencyRate_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "BudgetYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "BudgetYear_year_key" ON "BudgetYear"("year");
CREATE INDEX IF NOT EXISTS "FamilyMember_budgetYearId_idx" ON "FamilyMember"("budgetYearId");
CREATE INDEX IF NOT EXISTS "BudgetIncomeCategory_familyMemberId_idx" ON "BudgetIncomeCategory"("familyMemberId");
CREATE INDEX IF NOT EXISTS "FormulaParam_incomeCategoryId_idx" ON "FormulaParam"("incomeCategoryId");
CREATE UNIQUE INDEX IF NOT EXISTS "FormulaParam_incomeCategoryId_paramKey_key" ON "FormulaParam"("incomeCategoryId", "paramKey");
CREATE INDEX IF NOT EXISTS "BudgetIncomeEntry_incomeCategoryId_idx" ON "BudgetIncomeEntry"("incomeCategoryId");
CREATE UNIQUE INDEX IF NOT EXISTS "BudgetIncomeEntry_incomeCategoryId_month_key" ON "BudgetIncomeEntry"("incomeCategoryId", "month");
CREATE INDEX IF NOT EXISTS "FormulaParamValue_formulaParamId_idx" ON "FormulaParamValue"("formulaParamId");
CREATE UNIQUE INDEX IF NOT EXISTS "FormulaParamValue_formulaParamId_month_key" ON "FormulaParamValue"("formulaParamId", "month");
CREATE INDEX IF NOT EXISTS "TaxRate_budgetYearId_idx" ON "TaxRate"("budgetYearId");
CREATE INDEX IF NOT EXISTS "BudgetExpenseGroup_budgetYearId_idx" ON "BudgetExpenseGroup"("budgetYearId");
CREATE INDEX IF NOT EXISTS "BudgetExpenseCategory_expenseGroupId_idx" ON "BudgetExpenseCategory"("expenseGroupId");
CREATE INDEX IF NOT EXISTS "BudgetExpenseEntry_expenseCategoryId_idx" ON "BudgetExpenseEntry"("expenseCategoryId");
CREATE UNIQUE INDEX IF NOT EXISTS "BudgetExpenseEntry_expenseCategoryId_month_key" ON "BudgetExpenseEntry"("expenseCategoryId", "month");
CREATE INDEX IF NOT EXISTS "CurrencyRate_budgetYearId_idx" ON "CurrencyRate"("budgetYearId");
CREATE UNIQUE INDEX IF NOT EXISTS "CurrencyRate_budgetYearId_currency_month_key" ON "CurrencyRate"("budgetYearId", "currency", "month");
