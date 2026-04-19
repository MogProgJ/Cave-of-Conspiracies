# Roadmap

## Current status

Phase 1 stabilization is complete. The core slice works: create a post, render threads, vote, comment, delete only your own post.

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
- [ ] Migration runner script (bash or PHP, applies in filename order)
- [ ] PHPUnit bootstrap and tests for the 5 core flows

## After that: hardening

- CSRF token rotation after successful POST.
- Rate limiting on post/comment/vote.
- FK constraint: `messages.user_id` → `users.id`.
- Input sanitization audit (body length already enforced at 240).
- Persistent anonymous identity via long-lived cookie (not sessions).
- Error page for 404 / 500.

## Later: product expansion

- Moderation tools (report, ban, content filter).
- Nested/threaded comment replies.
- User profiles (the `user_profiles` table exists but is unused).
- Community management (create/edit by users).
- Real-time updates (SSE or polling, not WebSockets).
- Image/media attachments.
- Admin panel.

## Explicitly deferred for now

| Item | Reason |
|------|--------|
| Authentication / login | Design decision pending. Current anonymous model is intentional. |
| Docker | Not needed for local dev. PHP built-in server suffices. |
| CI/CD | No automated tests yet — nothing to run in a pipeline. |
| WebSockets / SSE | Premature. Polling or SSE can be added later. |
| UI redesign | Current CSS/theme system works. Visual changes are out of scope. |
| Composer dependencies | No external packages needed yet. |
| TypeScript / bundler | Vanilla JS is sufficient at this scale. |
