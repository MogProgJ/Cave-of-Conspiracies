-- Cave of Conspiracies: content schema upgrade
-- Introduces messages.title, widens messages.body and comments.body to TEXT.
-- Safe to run on existing installs (all operations are idempotent).
-- Apply with:
--   mysql -u <user> -p <database> < migrations/2026_04_22_content_schema_upgrade.sql

-- ── 1. Add title column to messages ─────────────────────────────────
-- Nullable so existing anonymous posts require no backfill obligation.
-- Position: immediately after id, before user_id.
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS title VARCHAR(200) NULL DEFAULT NULL AFTER id;

-- ── 2. Widen body columns to TEXT ────────────────────────────────────
-- TEXT is a safe superset of VARCHAR(240); all existing content is preserved.
-- Removes the 240-character hard cap so threads can carry real content.
ALTER TABLE messages
  MODIFY COLUMN body TEXT NOT NULL;

ALTER TABLE comments
  MODIFY COLUMN body TEXT NOT NULL;

-- ── 3. Backfill titles for existing posts ────────────────────────────
-- Any post that has body content but no title gets a stub title derived
-- from the first 77 characters of the body (with trailing ellipsis if truncated).
-- This lets existing threads appear correctly in the React thread list.
UPDATE messages
  SET title = CONCAT(
    LEFT(body, 77),
    IF(CHAR_LENGTH(body) > 77, '…', '')
  )
  WHERE title IS NULL AND TRIM(body) != '';
