# Roadmap

## Current status

Phase 4 (user accounts) is complete. Schema safety hardening is complete. Next focus is automated tests.

## Landed

These were delivered in Phase 1:

- **Merge conflict cleanup** — `views/home.php` purged of conflict markers, deduplicated.
- **Canonical JS layer** — `assets/app.js` fully rewritten. All helpers self-contained. No undefined references.
- **Base messages migration** — `migrations/2025_10_27_messages.sql` created (was previously implicit).
- **Ownership-aware delete** — `$_SESSION['author_token']` stored in `messages.owner_token`. Delete gated on match.
- **Env-driven config** — `config.php` reads `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` from environment.
- **Safe render** — `lib/utils.php` uses explicit `foreach` assignment instead of `extract()`.
- **DOM/JS alignment** — `renderMessage()` and `renderComment()` in `app.js` match `views/home.php` contract.
- **Repo cleanup** — removed dead files (`Untitled-1.py`, `app/messages.json`, empty `app/` directory).

## Stable enough to close

- Thread rendering (server + client).
- Voting (server-side increment, client-side counter update).
- Comment creation and display.
- CSRF protection on all POST endpoints.
- 5-theme switcher with localStorage persistence.
- Community assignment on post creation.
- Sidebar: trending communities, active users, community ticker.
- Pagination with search and sort.

## Next phase: repository truth and reproducibility

This is where we are now. Goals:

- [x] Add project documentation (`README.md`, `docs/`)
- [x] Document actual architecture
- [x] Document request/response contracts
- [x] Define manual smoke-test workflow
- [x] Align `AGENTS.md` and `setup.sh` with reality
- [x] Remove accidental vendor/XAMPP/PEAR artifacts
- [x] Add local dev doctor script (`tools/dev_doctor.php`)
- [x] Migration runner script (`tools/migrate.php` — applies pending migrations, tracks in `schema_migrations` table)
- [x] Schema compatibility check on startup (`lib/schema_check.php` — graceful error page instead of fatal crash)
- [ ] PHPUnit bootstrap and tests for the 5 core flows

## After that: hardening

- CSRF token rotation after successful POST.
- [x] Rate limiting on post/comment/vote.
- FK constraint: `messages.user_id` → `users.id`.
- Input sanitization audit (body length already enforced at 240).
- Persistent anonymous identity via long-lived cookie (not sessions).
- [x] Error page for 404 / 500.

## Phase 4: User accounts (landed)

- [x] `accounts` table (email, password_hash, display_name, bio, role, timestamps).
- [x] Registration with bcrypt (cost 12), min 8 char passwords.
- [x] Login/logout with session regeneration (fixation prevention).
- [x] Hybrid ownership: anonymous via `owner_token`, logged-in via `account_id`.
- [x] User profiles (own + public).
- [x] Auth-aware header navigation (login/register/profile/logout).
- [x] Auth-aware composer (nickname locked to display_name when logged in).
- [x] Account-linked comments (account_id stored).
- [x] 404 themed error page.
- [x] Auth + profile CSS styles.

## Later: product expansion

- Moderation tools (report, ban, content filter).
- Nested/threaded comment replies.
- ~~User profiles~~ (landed in Phase 4).
- Community management (create/edit by users).
- Real-time updates (SSE or polling, not WebSockets).
- Image/media attachments.
- ~~Admin panel~~ (landed in Phase 3 — moderation).
- Email verification on registration.
- Password reset flow.
- Notification system.

## Explicitly deferred for now

| Item | Reason |
|------|--------|
| ~~Authentication / login~~ | **Landed in Phase 4.** |
| Docker | Not needed for local dev. PHP built-in server suffices. |
| CI/CD | No automated tests yet — nothing to run in a pipeline. |
| WebSockets / SSE | Premature. Polling or SSE can be added later. |
| UI redesign | Current CSS/theme system works. Visual changes are out of scope. |
| Composer dependencies | No external packages needed yet. |
| TypeScript / bundler | Vanilla JS is sufficient at this scale. |
