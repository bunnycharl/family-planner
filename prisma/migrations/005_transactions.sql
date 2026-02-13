-- Migration 005: Add Transaction tracking tables

CREATE TABLE IF NOT EXISTS "TransactionCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#a78bfa',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "expenseCategoryId" TEXT,
    CONSTRAINT "TransactionCategory_budgetYearId_fkey" FOREIGN KEY ("budgetYearId") REFERENCES "BudgetYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransactionCategory_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "BudgetExpenseCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "TransactionCategory_budgetYearId_name_key" ON "TransactionCategory"("budgetYearId", "name");
CREATE INDEX IF NOT EXISTS "TransactionCategory_budgetYearId_idx" ON "TransactionCategory"("budgetYearId");
CREATE INDEX IF NOT EXISTS "Transaction_categoryId_idx" ON "Transaction"("categoryId");
CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"("date");
