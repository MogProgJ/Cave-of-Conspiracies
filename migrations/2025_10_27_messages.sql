-- Cave of Conspiracies migration: base messages table
-- This MUST be applied before comments or social tables.
-- Apply with:
--   mysql -u <user> -p <database> < migrations/2025_10_27_messages.sql

CREATE TABLE IF NOT EXISTS messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  body        VARCHAR(240) NOT NULL,
  owner_token VARCHAR(64)  NOT NULL DEFAULT '',
  upvotes     INT UNSIGNED NOT NULL DEFAULT 0,
  downvotes   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_created (created_at),
  INDEX idx_messages_owner   (owner_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
