#!/bin/sh
set -e

DB_PATH="/app/data/prod.db"
MIGRATION_DIR="/app/prisma/migrations"
APPLIED_FILE="/app/data/.migrations_applied"

# Create database if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
  echo "Initializing database..."
  sqlite3 "$DB_PATH" < "$MIGRATION_DIR/init.sql"
  # Mark all migrations as applied for fresh databases
  ls "$MIGRATION_DIR"/[0-9]*.sql 2>/dev/null | sort > "$APPLIED_FILE"
  echo "Database initialized successfully"
fi

# Apply pending migrations (numbered .sql files like 002_budget_v2.sql)
touch "$APPLIED_FILE"
for migration in $(ls "$MIGRATION_DIR"/[0-9]*.sql 2>/dev/null | sort); do
  if ! grep -qxF "$migration" "$APPLIED_FILE"; then
    echo "Applying migration: $(basename "$migration")..."
    sqlite3 "$DB_PATH" < "$migration"
    echo "$migration" >> "$APPLIED_FILE"
    echo "Migration applied successfully"
  fi
done

exec node server.js
