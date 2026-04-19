# AGENTS.md — Cave of Conspiracies (PHP)

## Source of truth

The current code is the source of truth. Do not trust docs over code if they conflict.

Key source-of-truth files:
- `views/home.php` — the DOM contract. Button labels, theme options, form fields, and CSS classes are defined here.
- `assets/app.js` — the canonical client behavior layer. `renderMessage()` and `renderComment()` must stay aligned with `views/home.php`.
- `index.php` — entry point, routing, POST action handlers.
- `lib/db.php` — all database functions (PDO prepared statements only).
- `config.php` — PDO connection; reads `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` from env.

Reference documentation:
- [docs/architecture.md](docs/architecture.md) — request flow, runtime responsibilities, table schemas.
- [docs/developer-setup.md](docs/developer-setup.md) — prerequisites, env vars, migration steps.
- [docs/request-contracts.md](docs/request-contracts.md) — POST endpoint specifications.
- [docs/manual-smoke-test.md](docs/manual-smoke-test.md) — 10-step QA checklist.

## Project layout

```
index.php           Entry point
config.php          PDO connection
lib/                Functions (db.php, utils.php)
views/              PHP templates (home.php, about.php, etc.)
assets/             JS + CSS (app.js, styles.css, etc.)
migrations/         SQL migrations (apply in filename order)
tools/              Dev utilities (dev_doctor.php, activity_ingest.py)
data/               Sample data for tooling
docs/               Project documentation
```

## Setup

No Composer, no Node, no Docker required. PHP 8.2+ with `pdo_mysql` and MySQL 8.

```bash
php -S 0.0.0.0:8080 -t .
```

`setup.sh` is a lightweight convenience script that verifies PHP and starts the dev server. It does **not** create databases, apply migrations, or install dependencies. See [docs/developer-setup.md](docs/developer-setup.md) for full setup.

Verify local readiness: `php tools/dev_doctor.php`

## Coding rules

1. **All DB queries use PDO prepared statements.** No string interpolation in SQL.
2. **Every schema change ships with a migration** in `migrations/`. Use `IF NOT EXISTS` or `ON DUPLICATE KEY` for idempotency.
3. **DOM changes in `views/home.php` must be mirrored** in `renderMessage()` / `renderComment()` in `assets/app.js`.
4. **New POST actions** follow the existing CSRF → action → JSON-or-PRG pattern in `index.php`.
5. **Functions go in `lib/`.** Views go in `views/`. No globals in views.
6. **JS behavior goes in `assets/app.js`.** Visual-only polish in `assets/dynamic-interface.js`.

## Tasks agents may do

- Fix bugs, add feature flags, write unit tests, refactor.
- For DB migrations: create SQL in `migrations/`, idempotent.
- Update docs when code changes — docs must match code, not the other way around.

## Done criteria

- Code runs without errors; core flows manually verifiable via [docs/manual-smoke-test.md](docs/manual-smoke-test.md).
- If tests exist, they pass.
- Docs remain aligned with code after every change.

