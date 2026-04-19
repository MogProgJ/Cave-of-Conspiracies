# Developer setup

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| PHP | 8.2+ | CLI with `pdo_mysql` extension |
| MySQL | 8.x | Or MariaDB 10.6+ |
| OS | Any | Tested on Windows. Linux/macOS also work. |

No Composer, no Node, no Docker required.

Verify PHP:

```bash
php -v
php -m | grep pdo_mysql
```

## Environment variables

`config.php` reads these from the environment. If unset, local dev defaults apply.

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_NAME` | `playground` | Database name |
| `DB_USER` | `root` | MySQL user |
| `DB_PASS` | *(empty)* | MySQL password |
| `APP_ENV` | `development` | `production` hides errors, enforces secure cookies |
| `ADMIN_PASSWORD_HASH` | *(empty)* | bcrypt hash for admin panel login (generate with `php -r "echo password_hash('yourpass', PASSWORD_DEFAULT);"`) |
| `RATE_LIMIT_POSTS_PER_10M` | `10` | Max posts per 10 min per IP |
| `RATE_LIMIT_COMMENTS_PER_10M` | `30` | Max comments per 10 min per IP |
| `RATE_LIMIT_REPORTS_PER_10M` | `5` | Max reports per 10 min per IP |
| `RATE_LIMIT_VOTES_PER_10M` | `60` | Max votes per 10 min per IP |

Set them before starting the server:

```bash
# Linux / macOS
export DB_HOST=127.0.0.1 DB_NAME=playground DB_USER=root DB_PASS=

# Windows PowerShell
$env:DB_HOST="127.0.0.1"; $env:DB_NAME="playground"; $env:DB_USER="root"; $env:DB_PASS=""
```

## Create the database

```sql
CREATE DATABASE IF NOT EXISTS playground
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

## Apply migrations

Migrations must be applied in filename order. Each is idempotent (`IF NOT EXISTS`, `ON DUPLICATE KEY`).

```bash
mysql -u root playground < migrations/2025_10_27_messages.sql
mysql -u root playground < migrations/2025_10_28_comments.sql
mysql -u root playground < migrations/2025_10_29_social_tables.sql
mysql -u root playground < migrations/2025_10_30_moderation.sql
mysql -u root playground < migrations/2025_10_31_accounts.sql
```

There is no migration runner script yet. Apply manually.

## Start the dev server

```bash
php -S 0.0.0.0:8080 -t .
```

Open `http://localhost:8080`.

The `setup.sh` script does the same thing but is only a convenience wrapper — it does **not** create the database or apply migrations. See [setup.sh](../setup.sh).

## Expected behavior

### With JS enabled (default)

- Posting, commenting, and voting happen via AJAX (no page reload).
- Delete opens a modal, sends AJAX, animates removal.
- Theme persists in localStorage.

### Without JS

- All forms submit normally via POST.
- Server responds with 303 redirects (PRG pattern).
- Flash messages display in a `<div class="flash">` block.
- Theme defaults to dark (no localStorage).
- Delete still works but redirects instead of using a modal.

## Developer rules

1. **All DB queries use PDO prepared statements.** No string interpolation in SQL.
2. **Every schema change ships with a migration** in `migrations/`. Use `IF NOT EXISTS` or `ON DUPLICATE KEY`.
3. **DOM changes in `views/home.php`** must be mirrored in `renderMessage()` / `renderComment()` in `assets/app.js`.
4. **New POST actions** follow the CSRF → action → JSON-or-PRG pattern in `index.php`.
5. **Functions go in `lib/`.** Views go in `views/`. No globals in views.
6. **JS behavior goes in `assets/app.js`.** Visual-only polish in `assets/dynamic-interface.js`.

## Known setup gaps

- No migration runner. Apply files manually in order.
- No seed data script. First post must be created through the UI.
- PHP must have `pdo_mysql` compiled in. Check with `php -m`.
- If the database doesn't exist, the app will crash on load with a PDO connection error.
- `setup.sh` does not install PHP or MySQL.
