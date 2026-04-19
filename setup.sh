#!/usr/bin/env bash
set -e

# Convenience script: verify PHP and start the dev server.
# This does NOT create databases, apply migrations, or install dependencies.
# See docs/developer-setup.md for full setup instructions.

echo "=== Cave of Conspiracies — dev server ==="

if ! command -v php &>/dev/null; then
  echo "ERROR: php not found on PATH." >&2
  exit 1
fi

php -v

echo ""
echo "NOTE: Before first run, make sure you have:"
echo "  1. MySQL running with a 'playground' database created"
echo "  2. Migrations applied in order:"
echo "       mysql -u root playground < migrations/2025_10_27_messages.sql"
echo "       mysql -u root playground < migrations/2025_10_28_comments.sql"
echo "       mysql -u root playground < migrations/2025_10_29_social_tables.sql"
echo "  3. (Optional) Run: php tools/dev_doctor.php"
echo ""
echo "Starting PHP dev server on http://localhost:8080 ..."
php -S 0.0.0.0:8080 -t .
