# Cave of Conspiracies

An anonymous message board for posting short conspiracy theories. No account required — pick an alias, post a theory, vote on others, and comment.

## Current status

Phase 4 (user accounts) is complete. The app has full anonymous posting, voting, comments, moderation, rate limiting, user accounts with login/register/profiles, and a migration runner. It runs locally on PHP's built-in server with MySQL.

## Core features

- **Post** — 240-char messages assigned to a community (default: General).
- **Vote** — per-message upvote / downvote, no per-user deduplication yet.
- **Comment** — flat comments per message, 240-char limit.
- **Delete** — hybrid ownership: session-based for anonymous, persistent for logged-in users.
- **User accounts** — register/login with email + password (bcrypt). Optional — anonymous posting still works.
- **Profiles** — editable own profile (display name, bio); public profiles for other users.
- **Communities** — auto-created on first assignment; sidebar shows 7-day trending activity.
- **Moderation** — admin panel, content reporting, soft-delete status model, audit logging.
- **Rate limiting** — DB-backed per-IP rate limits on posts, comments, votes, reports.
- **Themes** — 5 themes (Dark, Light, Blue, Midnight, Dusk) persisted in localStorage.
- **Search & sort** — filter by body text, sort by Newest / Oldest / Top.
- **Pagination** — 10 posts per page.
- **Schema safety** — startup checks verify DB schema before serving pages; missing migrations show a helpful setup page.

## Stack

| Layer | Technology |
|-------|-----------|
| Server | PHP 8.2+ (built-in dev server or XAMPP/Apache) |
| Database | MySQL 8 (or MariaDB 10.6+) |
| Client | Vanilla JS, CSS (no build step) |
| Dependencies | None — no Composer, no Node |

## Repo structure

```
index.php               Entry point: routing, POST actions, GET render
config.php              PDO connection (reads DB_* env vars)
lib/
  db.php                All database functions (prepared statements)
  utils.php             render(), CSRF helpers
  schema_check.php      Startup schema compatibility verification
  schema_check.php      Startup schema compatibility verification
views/
  home.php              DOM source of truth (composer, threads, sidebar, modal)
  register.php          Registration page
  login.php             Login page
  profile.php           User profile (own + public)
  admin.php             Admin moderation panel
  setup_error.php       Startup schema-error page
  404.php               Themed 404 page
  about.php             Static page
  creator.php           Static page
  links.php             Static page
  privacy.php           Static page
assets/
  app.js                Canonical behavior layer (AJAX, voting, comments, delete, theme)
  dynamic-interface.js  Visual polish (reveal animations, bubbles, ticker)
  composer.js           Textarea character counter
  styles.css            Stylesheet with 5 theme definitions
  animations.css        Keyframe animations
migrations/
  2025_10_27_messages.sql
  2025_10_28_comments.sql
  2025_10_29_social_tables.sql
  2025_10_30_moderation.sql
  2025_10_31_accounts.sql
  2025_10_30_moderation.sql
  2025_10_31_accounts.sql
data/
  activity_feed.json    Sample community activity snapshot (used by tools/)
tools/
  dev_doctor.php        Local environment readiness check
  migrate.php           Migration runner (applies pending SQL in order)
  activity_ingest.py    Load activity snapshots into MySQL
  RealtimeBridge.java   Parse and rank community activity (standalone utility)
docs/
  architecture.md       Request flow, runtime responsibilities, table schemas
  developer-setup.md    Prerequisites, env vars, migration steps
  request-contracts.md  POST endpoint specs (add, comment, react, delete)
  manual-smoke-test.md  10-step QA checklist
  roadmap.md            Phase tracking and future plans
  user-guide.md         End-user instructions
```

## Running locally

### 1. Prerequisites

- PHP 8.2+ with `pdo_mysql` extension
- MySQL 8 (or MariaDB 10.6+) running locally

Verify:

```bash
php -v
php -m | grep pdo_mysql
```

### 2. Create the database

```sql
CREATE DATABASE IF NOT EXISTS playground
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 3. Apply migrations

Use the migration runner (recommended):

```bash
php tools/migrate.php
```

Or apply manually in order:

```bash
mysql -u root playground < migrations/2025_10_27_messages.sql
mysql -u root playground < migrations/2025_10_28_comments.sql
mysql -u root playground < migrations/2025_10_29_social_tables.sql
mysql -u root playground < migrations/2025_10_30_moderation.sql
mysql -u root playground < migrations/2025_10_31_accounts.sql
```

### 4. Set environment variables (optional)

`config.php` falls back to local dev defaults (`127.0.0.1`, `playground`, `root`, empty password). Override with:

```powershell
# Windows PowerShell
$env:DB_HOST="127.0.0.1"; $env:DB_NAME="playground"; $env:DB_USER="root"; $env:DB_PASS=""
```

```bash
# Linux / macOS
export DB_HOST=127.0.0.1 DB_NAME=playground DB_USER=root DB_PASS=
```

### 5. Start the server

```bash
php -S 0.0.0.0:8080 -t .
```

Open `http://localhost:8080`.

### 6. Verify local readiness

```bash
php tools/dev_doctor.php
```

This checks PHP version, required extensions, DB connectivity, and table existence.

## Migration order

Migrations must be applied in filename order. Each is idempotent. Use `php tools/migrate.php` to apply all pending migrations automatically.

| # | File | Creates |
|---|------|---------|
| 1 | `2025_10_27_messages.sql` | `messages` |
| 2 | `2025_10_28_comments.sql` | `comments` (FK → messages) |
| 3 | `2025_10_29_social_tables.sql` | `users`, `communities`, `message_topics`, `community_trends`, `user_profiles`, `user_activity` + seed communities |
| 4 | `2025_10_30_moderation.sql` | `reports`, `moderation_log`, `rate_limits` + status columns on messages/comments |
| 5 | `2025_10_31_accounts.sql` | `accounts` + `account_id` columns on messages/comments |

**All 5 migrations are required.** The app checks schema compatibility at startup and will show a setup error page if any tables or columns are missing.

## Current limitations

- No email verification on registration.
- No password reset flow.
- Aliases are globally unique (collisions block reuse).
- Votes are not deduplicated per user.
- No FK from `messages.user_id` → `users.id`.
- No automated tests.
- `user_profiles` table exists but is unused (superseded by `accounts.bio`).

## Documentation

- [docs/architecture.md](docs/architecture.md) — full architecture reference
- [docs/developer-setup.md](docs/developer-setup.md) — setup walkthrough
- [docs/request-contracts.md](docs/request-contracts.md) — POST endpoint specs
- [docs/manual-smoke-test.md](docs/manual-smoke-test.md) — QA checklist
- [docs/roadmap.md](docs/roadmap.md) — what's landed, what's next
- [docs/user-guide.md](docs/user-guide.md) — end-user instructions

## Next phase

- PHPUnit bootstrap and core flow tests
- Email verification on registration
- Password reset flow
- CSRF token rotation
- FK constraint on `messages.user_id`
- Vote deduplication per user

## Troubleshooting

**App shows "Setup Required" page:** Run `php tools/migrate.php` to apply pending migrations.

**phpMyAdmin is not loading:** This is a XAMPP/Apache/MySQL service issue, not a project code issue. Ensure MySQL and Apache are both running in the XAMPP Control Panel.

**Blank page or PHP fatal error:** Run `php tools/dev_doctor.php` from CLI to diagnose environment and schema issues.
