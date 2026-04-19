# Strategic Plan — Cave of Conspiracies

## Vision

A fully functional community forum deployable to a real domain, where anonymous visitors
can browse and registered members can build a persistent identity, own their content, and
participate in moderated conspiracy-themed discussions — 24/7 on the public internet.

## Current state (after Phase 3 — Hardening)

| Layer | Status |
|-------|--------|
| Core CRUD (post, comment, vote, delete) | ✅ Done |
| Session-based anonymous ownership | ✅ Done |
| CSRF + XSS protection | ✅ Done |
| Rate limiting (IP-based) | ✅ Done |
| Moderation (admin panel, reports, soft delete) | ✅ Done |
| 5-theme system | ✅ Done |
| Communities & trending sidebar | ✅ Done |
| Pagination, search, sort | ✅ Done |
| Responsive CSS, accessibility | ✅ Done |

## What's missing for a real public website

### Tier 1 — Must-have for launch

| Feature | Why |
|---------|-----|
| **User accounts (register/login/logout)** | Persistent identity. Content ownership survives browser changes. Users can build reputation. |
| **User profiles** | Public page per account (display name, bio, post history). Makes the community feel real. |
| **Account-linked ownership** | Posts/comments linked to accounts. Owners can delete from any device. |
| **Error pages (404)** | Professional UX for bad URLs. |
| **HTTPS enforcement** | Required for session cookies to be secure in production. |
| **Deployment guide** | How to actually put this on a VPS with a domain. |

### Tier 2 — Soon after launch

| Feature | Why |
|---------|-----|
| Migration runner (CLI) | One-command schema setup. |
| Email verification (optional) | Prevents throwaway spam accounts. |
| Password reset flow | Users will forget passwords. |
| Account-based admin role | Promote accounts to admin in DB instead of env-only hash. |
| Per-user rate limiting | Rate limit by account_id when logged in (stronger than IP-only). |
| Notification badges | "Someone replied to your post." |

### Tier 3 — Growth features

| Feature | Why |
|---------|-----|
| Nested/threaded comment replies | Deeper conversations. |
| User avatars (upload or Gravatar) | Visual identity. |
| Community creation by users | Let the community self-organize. |
| SSE/polling real-time feed | Live updates without refresh. |
| Media attachments (images) | Richer content. |
| Bookmarks / saved posts | User engagement stickiness. |
| Follow users | Social graph. |
| Dark/light auto-detect | System preference respected. |

### Tier 4 — Scale & compliance

| Feature | Why |
|---------|-----|
| Docker containerization | Consistent deployment. |
| CI/CD pipeline | Automated lint + smoke tests on push. |
| Database backups | Disaster recovery. |
| GDPR data export/delete | Legal compliance for EU users. |
| CDN for static assets | Performance at scale. |
| Search indexing (fulltext) | Better search than LIKE. |
| Abuse ML / spam filter | Scale moderation beyond manual. |

## Phase 4 implementation plan (this commit)

### User accounts system

**New table: `accounts`**
- id, email (unique), password_hash (bcrypt), display_name, bio, role, created_at, updated_at
- Separate from existing `users` table (which is nickname-to-id mapping)
- `messages.account_id` and `comments.account_id` for logged-in ownership

**Auth flows:**
- `POST action=register` → validate → create account → auto-login → redirect home
- `POST action=login` → verify password → session → redirect home
- `POST action=logout` → destroy auth session → redirect home
- `GET ?page=register` → registration form
- `GET ?page=login` → login form
- `GET ?page=profile` → own profile (edit display_name, bio)
- `GET ?page=user&id=N` → public profile

**Session model:**
- `$_SESSION['account_id']` — logged-in account ID (null when anonymous)
- `$_SESSION['account']` — cached display_name + role
- `$_SESSION['author_token']` — kept for anonymous ownership (backward compat)
- Login calls `session_regenerate_id(true)` to prevent fixation

**Ownership model (hybrid):**
- Anonymous posts: owned via `messages.owner_token` (session-only, as before)
- Logged-in posts: owned via `messages.account_id` (persistent across sessions)
- `deleteMessage()` checks: `owner_token match OR account_id match`
- Logged-in users can always manage their content from any device

**Composer behavior:**
- Logged in: nickname field pre-filled and locked to display_name
- Anonymous: nickname field editable (current behavior)

**Navigation:**
- Not logged in: Login / Register buttons in header
- Logged in: "Hi, DisplayName" + Profile + Logout in header

### Error pages

- 404 view with themed styling
- Invalid `?page=` values routed to 404 instead of silently falling through

## Architecture principles

1. **No external dependencies** — no Composer, no npm, no Docker required for dev
2. **Progressive enhancement** — works without JS, enhanced with AJAX
3. **PDO prepared statements only** — zero SQL injection surface
4. **Session-first auth** — no JWT, no OAuth (keep it simple)
5. **bcrypt passwords** — via `password_hash()` / `password_verify()`
6. **Soft deletes** — audit trail preserved
7. **Env-driven config** — secrets never in source code

## Deployment target

- Any VPS with PHP 8.2+ and MySQL 8 (e.g., DigitalOcean, Hetzner, Linode)
- Apache or nginx as reverse proxy
- Let's Encrypt for HTTPS
- Systemd or supervisor for PHP-FPM
- MySQL with daily cron backup
