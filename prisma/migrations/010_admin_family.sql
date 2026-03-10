-- Create a system family for admin accounts (invisible to regular users)
INSERT OR IGNORE INTO "Family" ("id", "name", "createdAt", "updatedAt")
VALUES ('admin-system-id', 'System', datetime('now'), datetime('now'));

-- Move all admin users out of regular families into the system family
UPDATE "User" SET "familyId" = 'admin-system-id' WHERE "isAdmin" = 1;
