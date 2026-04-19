-- Cave of Conspiracies migration: social scaffolding tables
-- Apply with:
--   mysql -u <user> -p <database> < migrations/2025_10_29_social_tables.sql
-- Replace <user> and <database> with your credentials before running.

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nickname VARCHAR(60) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS communities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  tagline VARCHAR(240) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_topics (
  message_id INT UNSIGNED NOT NULL,
  community_id INT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id),
  KEY idx_message_topics_community (community_id),
  CONSTRAINT fk_message_topics_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_topics_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_trends (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  community_id INT UNSIGNED NOT NULL,
  day DATE NOT NULL,
  posts INT UNSIGNED NOT NULL DEFAULT 0,
  comments INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_trend (community_id, day),
  CONSTRAINT fk_trends_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  location VARCHAR(120) DEFAULT NULL,
  bio VARCHAR(240) DEFAULT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_activity (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  messages INT UNSIGNED NOT NULL DEFAULT 0,
  comments INT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure owner_token column exists on messages (idempotent for existing installs)
-- This is a no-op on fresh databases where 2025_10_27_messages.sql already includes the column.
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'messages' AND column_name = 'owner_token');
SET @ddl = IF(@col_exists = 0,
  'ALTER TABLE messages ADD COLUMN owner_token VARCHAR(64) NOT NULL DEFAULT \'\', ADD INDEX idx_messages_owner (owner_token)',
  'SELECT 1');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO communities (slug, name, tagline)
VALUES
  ('general', 'General', 'Open discussion for any conspiracy angle.'),
  ('deepstate', 'Deep State', 'Shadow governments, cover-ups, geopolitics.'),
  ('cryptids', 'Cryptids', 'Strange creatures and unexplained sightings.'),
  ('outerworld', 'Outer World', 'Aliens, space anomalies, cosmic mysteries.'),
  ('technomyth', 'TechnoMyth', 'AI plots, simulation theory, digital folklore.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  tagline = VALUES(tagline);
