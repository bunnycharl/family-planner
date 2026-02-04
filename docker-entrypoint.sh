#!/bin/sh
set -e

DB_PATH="/app/data/prod.db"

# Create database if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
  echo "Initializing database..."
  sqlite3 "$DB_PATH" < /app/prisma/migrations/init.sql
  echo "Database initialized successfully"
fi

exec node server.js
