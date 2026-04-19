-- Phase 4: User accounts, account-linked ownership
-- Apply after all previous migrations.

-- ── Accounts table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    display_name  VARCHAR(60)   NOT NULL,
    bio           TEXT          DEFAULT NULL,
    role          ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_accounts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Link messages to accounts (nullable — anonymous posts have NULL) ─
ALTER TABLE messages
    ADD COLUMN IF NOT EXISTS account_id INT UNSIGNED DEFAULT NULL AFTER user_id;

ALTER TABLE messages
    ADD INDEX IF NOT EXISTS idx_messages_account_id (account_id);

-- ── Link comments to accounts ────────────────────────────────────────
ALTER TABLE comments
    ADD COLUMN IF NOT EXISTS account_id INT UNSIGNED DEFAULT NULL AFTER message_id;

ALTER TABLE comments
    ADD INDEX IF NOT EXISTS idx_comments_account_id (account_id);
