CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "location" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "createdById" TEXT NOT NULL,
    "modifiedById" TEXT,
    CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_modifiedById_fkey" FOREIGN KEY ("modifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "position" INTEGER NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
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
CREATE TABLE IF NOT EXISTS "RoadmapPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
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
CREATE TABLE IF NOT EXISTS "_EventAssignees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EventAssignees_A_fkey" FOREIGN KEY ("A") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EventAssignees_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");
CREATE INDEX "Event_categoryId_idx" ON "Event"("categoryId");
CREATE INDEX "Event_createdById_idx" ON "Event"("createdById");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");
CREATE UNIQUE INDEX "BudgetYear_year_key" ON "BudgetYear"("year");
CREATE INDEX "FamilyMember_budgetYearId_idx" ON "FamilyMember"("budgetYearId");
CREATE INDEX "BudgetIncomeCategory_familyMemberId_idx" ON "BudgetIncomeCategory"("familyMemberId");
CREATE INDEX "FormulaParam_incomeCategoryId_idx" ON "FormulaParam"("incomeCategoryId");
CREATE UNIQUE INDEX "FormulaParam_incomeCategoryId_paramKey_key" ON "FormulaParam"("incomeCategoryId", "paramKey");
CREATE INDEX "BudgetIncomeEntry_incomeCategoryId_idx" ON "BudgetIncomeEntry"("incomeCategoryId");
CREATE UNIQUE INDEX "BudgetIncomeEntry_incomeCategoryId_month_key" ON "BudgetIncomeEntry"("incomeCategoryId", "month");
CREATE INDEX "FormulaParamValue_formulaParamId_idx" ON "FormulaParamValue"("formulaParamId");
CREATE UNIQUE INDEX "FormulaParamValue_formulaParamId_month_key" ON "FormulaParamValue"("formulaParamId", "month");
CREATE INDEX "TaxRate_budgetYearId_idx" ON "TaxRate"("budgetYearId");
CREATE INDEX "BudgetExpenseGroup_budgetYearId_idx" ON "BudgetExpenseGroup"("budgetYearId");
CREATE INDEX "BudgetExpenseCategory_expenseGroupId_idx" ON "BudgetExpenseCategory"("expenseGroupId");
CREATE INDEX "BudgetExpenseEntry_expenseCategoryId_idx" ON "BudgetExpenseEntry"("expenseCategoryId");
CREATE UNIQUE INDEX "BudgetExpenseEntry_expenseCategoryId_month_key" ON "BudgetExpenseEntry"("expenseCategoryId", "month");
CREATE INDEX "CurrencyRate_budgetYearId_idx" ON "CurrencyRate"("budgetYearId");
CREATE UNIQUE INDEX "CurrencyRate_budgetYearId_currency_month_key" ON "CurrencyRate"("budgetYearId", "currency", "month");
CREATE INDEX "RoadmapPhase_position_idx" ON "RoadmapPhase"("position");
CREATE INDEX "Milestone_phaseId_idx" ON "Milestone"("phaseId");
CREATE INDEX "Milestone_startDate_idx" ON "Milestone"("startDate");
CREATE INDEX "Milestone_categoryId_idx" ON "Milestone"("categoryId");
CREATE UNIQUE INDEX "_EventAssignees_AB_unique" ON "_EventAssignees"("A", "B");
CREATE INDEX "_EventAssignees_B_index" ON "_EventAssignees"("B");
