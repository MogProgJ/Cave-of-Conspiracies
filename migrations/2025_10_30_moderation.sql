-- Cave of Conspiracies migration: moderation, reporting, rate limiting
-- Apply AFTER the social_tables migration:
--   mysql -u root playground < migrations/2025_10_30_moderation.sql

-- 1. Add status column to messages for visibility control
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS status ENUM('visible','hidden','removed_by_mod','removed_by_owner')
  NOT NULL DEFAULT 'visible'
  AFTER owner_token;

ALTER TABLE messages
  ADD INDEX IF NOT EXISTS idx_messages_status (status);

-- 2. Add status column to comments for visibility control
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS status ENUM('visible','hidden','removed_by_mod','removed_by_owner')
  NOT NULL DEFAULT 'visible'
  AFTER body;

ALTER TABLE comments
  ADD INDEX IF NOT EXISTS idx_comments_status (status);

-- 3. Reports table — users can report messages or comments
CREATE TABLE IF NOT EXISTS reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  target_type ENUM('message','comment') NOT NULL,
  target_id INT UNSIGNED NOT NULL,
  reason ENUM('spam','abuse','illegal','misinfo','other') NOT NULL,
  note VARCHAR(240) DEFAULT NULL,
  ip_hash VARCHAR(64) NOT NULL DEFAULT '',
  session_token VARCHAR(64) NOT NULL DEFAULT '',
  status ENUM('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reports_target (target_type, target_id),
  INDEX idx_reports_status (status),
  INDEX idx_reports_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Moderation audit log
CREATE TABLE IF NOT EXISTS moderation_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  target_type ENUM('message','comment') NOT NULL,
  target_id INT UNSIGNED NOT NULL,
  action ENUM('hide','remove','restore','dismiss_report') NOT NULL,
  reason VARCHAR(240) DEFAULT NULL,
  admin_ip_hash VARCHAR(64) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_modlog_target (target_type, target_id),
  INDEX idx_modlog_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Rate limit tracking table
CREATE TABLE IF NOT EXISTS rate_limits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(64) NOT NULL,
  action VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rate_identifier_action (identifier, action),
  INDEX idx_rate_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
