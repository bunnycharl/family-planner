-- Remove auto-promotion from migration 008.
-- Admin account is now created exclusively via ADMIN_EMAIL / ADMIN_PASSWORD env vars in seed.
UPDATE "User" SET "isAdmin" = 0;
