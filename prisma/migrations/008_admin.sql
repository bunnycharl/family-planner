-- Add isAdmin flag to User
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT 0;

-- The first user (by creation date) in the default family becomes admin
UPDATE "User" SET "isAdmin" = 1
WHERE id = (
  SELECT id FROM "User"
  WHERE "familyId" = 'default-family-id'
  ORDER BY "createdAt" ASC
  LIMIT 1
);
