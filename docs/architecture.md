# Architecture

This document describes the Cave of Conspiracies architecture as actually implemented. It does not describe planned or aspirational systems.

## Request flow

```
Browser
  │
  ├─ GET /                      → index.php → render('home', ...) → views/home.php
  ├─ GET /?page=about           → index.php → render('about', []) → views/about.php
  ├─ GET /?page=admin           → index.php → render('admin', ...) → views/admin.php
  ├─ GET /?page=register        → index.php → render('register', ...) → views/register.php
  ├─ GET /?page=login           → index.php → render('login', ...) → views/login.php
  ├─ GET /?page=profile         → index.php → render('profile', ...) → views/profile.php (own)
  ├─ GET /?page=user&id=N       → index.php → render('profile', ...) → views/profile.php (public)
  ├─ GET /?page=*               → index.php → render('404', []) → views/404.php
  │
  ├─ POST action=add            → index.php → rate limit → addMessage() → JSON or PRG redirect
  ├─ POST action=comment        → index.php → rate limit → addComment() → JSON or PRG redirect
  ├─ POST action=react          → index.php → rate limit → reactMessage() → JSON or PRG redirect
  ├─ POST action=delete         → index.php → deleteMessage() → JSON or PRG redirect
  ├─ POST action=report         → index.php → rate limit → submitReport() → JSON or PRG redirect
  ├─ POST action=register       → index.php → registerAccount() → session → redirect
  ├─ POST action=login          → index.php → authenticateAccount() → session → redirect
  ├─ POST action=logout         → index.php → session_destroy() → redirect
  ├─ POST action=update_profile → index.php → updateAccountProfile() → redirect
  ├─ POST action=change_password→ index.php → updateAccountPassword() → redirect
  ├─ POST action=admin_login    → index.php → session admin flag → redirect
  ├─ POST action=admin_logout   → index.php → clear admin flag → redirect
  └─ POST action=mod_action     → index.php → admin check → moderateContent() → redirect
```

All POST actions check for the `X-Requested-With: fetch` header. If present, they return JSON. If absent, they use Post-Redirect-Get (303).

## Runtime responsibilities

### index.php

- Entry point and request router.
- **Schema guard:** requires `lib/schema_check.php`, verifies DB connection and schema compatibility. If DB is unreachable or tables/columns are missing, renders `views/setup_error.php` with HTTP 503 and exits before any data queries.
- Starts session. Generates `$_SESSION['author_token']` (64-char hex) on first visit.
- Tracks logged-in account state: `$_SESSION['account_id']`, `$_SESSION['account']`.
- Ensures the `general` community exists.
- Routes static pages: about, creator, links, privacy.
- Routes auth pages: register, login, profile, user (public profile).
- Routes admin page: `?page=admin` (requires `$_SESSION['is_admin']`).
- Routes unknown pages to `views/404.php`.
- Handles all POST actions: add, comment, react, delete, report, register, login, logout, update_profile, change_password, admin_login, admin_logout, mod_action.
- CSRF verification on every POST.
- DB-backed rate limiting on add, comment, react, report (per hashed IP, configurable).
- Renders the home page via `render()` with data from `lib/db.php`.

### config.php

- Creates the `$pdo` PDO connection.
- Reads `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` from environment variables.
- Falls back to local dev defaults (`127.0.0.1`, `playground`, `root`, empty password).
- `APP_ENV` controls error display (production hides, development shows).
- Session cookie hardening: httponly, samesite=Strict, strict mode, secure in production.
- `ADMIN_PASSWORD_HASH` for admin authentication.
- Rate limit thresholds: `RATE_LIMIT_POSTS_PER_10M`, `RATE_LIMIT_COMMENTS_PER_10M`, `RATE_LIMIT_REPORTS_PER_10M`, `RATE_LIMIT_VOTES_PER_10M`.

### lib/db.php

Core data-access layer. All queries use PDO prepared statements.

Key functions:

| Function | Purpose |
|----------|---------|
| `hashIp($ip)` | SHA-256 hash an IP string for privacy |
| `clientIpHash()` | Get hashed IP of current request |
| `checkRateLimit($pdo, $identifier, $action, $max, $window)` | Check if action is within rate limit |
| `recordRateEvent($pdo, $identifier, $action)` | Log a rate-limit event |
| `pruneOldRateEvents($pdo, $window)` | Cleanup old rate-limit entries |
| `findOrCreateUser($pdo, $nickname)` | Get or insert user by nickname, returns user ID |
| `addMessage($pdo, $userId, $body, $communitySlug, $ownerToken)` | Insert message with ownership token |
| `getMessage($pdo, $id)` | Fetch single message with joins + hydrated comments (includes status) |
| `listMessages($pdo, $q, $limit, $offset, $sort)` | Paginated message list (status='visible' only) |
| `countMessages($pdo, $q)` | Count visible messages for pagination |
| `deleteMessage($pdo, $id, $ownerToken)` | Soft-delete: sets status to 'removed_by_owner' |
| `reactMessage($pdo, $id, $type)` | Increment upvotes/downvotes (visible messages only) |
| `addComment($pdo, $messageId, $nickname, $body)` | Insert comment (validates parent message is visible) |
| `hydrateComments($pdo, $messages)` | Batch-load visible comments for a set of messages |
| `submitReport($pdo, $targetType, $targetId, $reason, $note, $sessionToken)` | Insert abuse report |
| `listReports($pdo, $status, $limit, $offset)` | Admin: list reports by status |
| `countReports($pdo, $status)` | Admin: count reports |
| `moderateContent($pdo, $targetType, $targetId, $newStatus, $adminReason)` | Admin: change content status |
| `resolveReport($pdo, $reportId, $newStatus)` | Admin: mark report reviewed/dismissed |
| `logModerationAction($pdo, ...)` | Insert moderation audit log entry |
| `getMessageForAdmin($pdo, $id)` | Fetch message regardless of status |
| `getCommentForAdmin($pdo, $id)` | Fetch comment regardless of status |
| `listCommunities($pdo, $limit)` | Trending communities (7-day window) |
| `listActiveUsers($pdo, $limit)` | Top users by activity |
| `ensureCommunity($pdo, $slug, $name, $tagline)` | Idempotent community creation |
| `recordUserActivity($pdo, $userId, $kind)` | Upsert user activity counters |
| `recordCommunityActivity($pdo, $communityId, $kind)` | Upsert daily community trend |
| `registerAccount($pdo, $email, $password, $displayName)` | Create account (bcrypt cost 12), returns account array |
| `authenticateAccount($pdo, $email, $password)` | Verify credentials, returns account or null |
| `getAccountById($pdo, $id)` | Fetch account by ID |
| `getPublicProfile($pdo, $id)` | Public profile + post/comment counts |
| `getRecentPostsByAccount($pdo, $accountId, $limit)` | Recent visible messages by account |
| `updateAccountProfile($pdo, $id, $displayName, $bio)` | Update display name and bio |
| `updateAccountPassword($pdo, $id, $newPassword)` | Change password (bcrypt) |
| `isEmailTaken($pdo, $email)` | Check email uniqueness |

### lib/utils.php

- `render($view, $data)` — assigns `$data` keys as local variables, includes the view file. Uses explicit `foreach` assignment (not `extract()`).
- `csrf_token()` — generates/returns session CSRF token.
- `csrf_field()` — returns hidden input HTML.
- `csrf_verify($token)` — timing-safe comparison via `hash_equals()`.

### lib/schema_check.php

- `checkSchemaCompatibility(PDO $pdo): array` — returns an empty array if all required tables and columns exist, or an array of human-readable error strings if schema is incomplete.
- Checks 11 required tables and critical columns (`messages.status`, `messages.account_id`, `messages.owner_token`, `comments.status`, `comments.account_id`).
- Called once during startup in `index.php`.

### views/setup_error.php

- Standalone error page rendered when the schema guard in `index.php` detects a problem.
- Expects `$errors` (array of missing-schema strings), `$pdo` (PDO|null), `$DB_HOST`, `$DB_NAME`.
- Shows connection status, missing schema list, migration runner command, manual migration commands, and link to `docs/developer-setup.md`.

### tools/migrate.php

- CLI migration runner. Scans `migrations/*.sql` in filename order.
- Maintains a `schema_migrations` tracking table.
- Applies only pending migrations. Prints pass/fail per file.
- Flags: `--status` (show status only, no changes), `--fresh` (re-apply all migrations).
- Exits with code 1 on any failure.

### views/home.php

The DOM source of truth. Contains:

- **Composer form** (`#composerForm`) — alias input, community select, textarea, CSRF field, `action=add`.
- **Search/sort form** — GET form with `q` and `sort` parameters.
- **Message list** (`#messageList`) — `<article class="msg" id="msg_{id}">` cards.
- **Vote forms** — per-message forms with `data-react="up|down"` and `data-id="{id}"` on buttons. Counter spans: `#up_{id}`, `#down_{id}`.
- **Delete button** — only rendered when `$isOwner` is true. Uses `data-delete`, `data-id`, `data-snippet`.
- **Report button** — always rendered on each message. Uses `data-report`, `data-target-type`, `data-target-id`.
- **Comment section** — per-message `<section class="comments" data-message="{id}">` with `.comments-list` container and `.comment-form`.
- **Pagination** — `<nav class="pager">`.
- **Sidebar** — trending communities, active conspirators, community ticker.
- **Delete modal** — `#deleteModal` with `#deleteForm` and `#deletePreview`.
- **Report modal** — `#reportModal` with `#reportForm`, reason radio buttons, optional note textarea.
- **Admin link** — shown in header when `$isAdmin` is true.

### views/admin.php

Admin moderation interface. Contains:

- **Login form** — shown when `$logged_in` is false. Password field, `action=admin_login`.
- **Report queue** — shown when logged in. Filterable by status (open/reviewed/dismissed).
- **Report cards** — display target content preview, reason badge, timestamp, reporter note.
- **Action buttons** — Hide, Remove, Dismiss per open report. Each is a separate form with `action=mod_action`.
- **Logout button** — `action=admin_logout`.

### views/register.php

Registration form with display name, email, password, and confirm password fields. CSRF-protected. Validates password length (min 8) and match client-side. Themed with auth-page/auth-card styles.

### views/login.php

Login form with email and password fields. CSRF-protected. Links to register page. Displays flash error on bad credentials.

### views/profile.php

Dual-purpose: own profile (editable) and public profile (read-only). Shows avatar initial, display name, member-since date, bio, post/comment counts, recent posts list. Own profile includes sidebar with edit profile form, change password form, and logout button.

### views/404.php

Themed 404 error page with conspiracy humor. Back-to-home link.

### assets/app.js

The canonical client behavior layer. Self-contained with all helpers defined locally.

Responsibilities:
- Theme restore/apply from localStorage → `data-theme` attribute.
- AJAX composer submission → prepend rendered message to `#messageList`.
- Delegated vote handling → update `#up_{id}` / `#down_{id}` counters.
- Delegated comment submission → append rendered comment to `.comments-list`.
- Delete modal open/close/submit → AJAX delete with 403 error handling.
- Report modal open/close/submit → AJAX report with reason validation.
- 429 rate-limit error handling on all AJAX calls (toast notification).
- Flash auto-hide, search escape-key clear, button ripple animation.

Defines: `escapeHtml()`, `nl2br()`, `showToast()`, `csrfValue()`, `renderMessage()`, `renderComment()`, `hydrateCommentList()`.

### assets/dynamic-interface.js

Visual polish only. No overlap with app.js behavior.

- Intersection Observer `.reveal` → `.show` animations.
- Ambient floating bubble background.
- Message hover focus effect.
- Community ticker rotation.

### assets/composer.js

Single responsibility: textarea character counter for `#msgBox` / `#countHint`.

## Persistence model

### Tables

| Table | Purpose |
|-------|---------|
| `accounts` | User accounts: id, email (UNIQUE), password_hash, display_name, bio, role, created_at, updated_at |
| `messages` | Posts: id, user_id, body(240), owner_token(64), account_id (nullable FK→accounts), upvotes, downvotes, status, created_at |
| `comments` | Comments: id, message_id (FK→messages CASCADE), nickname(60), body(240), account_id (nullable FK→accounts), status, created_at |
| `users` | Unique nicknames: id, nickname (UNIQUE), created_at |
| `communities` | Slug-based: id, slug (UNIQUE), name, tagline, created_at |
| `message_topics` | Message→community mapping: message_id (PK, FK→messages), community_id (FK→communities) |
| `community_trends` | Daily activity snapshots: community_id + day (UNIQUE), posts, comments |
| `user_activity` | Cumulative: user_id (PK, FK→users), last_seen, messages count, comments count |
| `user_profiles` | Created but unused: user_id, location, bio, avatar_url |
| `reports` | Abuse reports: target_type, target_id, reason, note, ip_hash, session_token, status |
| `moderation_log` | Audit trail: target_type, target_id, action, reason, admin_ip_hash |
| `rate_limits` | Per-IP rate tracking: identifier (hashed IP), action, created_at |

### Migration order

1. `2025_10_27_messages.sql` — base messages table
2. `2025_10_28_comments.sql` — comments with FK to messages
3. `2025_10_29_social_tables.sql` — users, communities, topics, trends, profiles, activity; seeds default communities; idempotent `owner_token` backfill
4. `2025_10_30_moderation.sql` — adds status columns to messages/comments, creates reports, moderation_log, and rate_limits tables
5. `2025_10_31_accounts.sql` — accounts table, adds account_id to messages and comments

## Ownership model

### Anonymous (session-based)

- On session start, `index.php` generates `$_SESSION['author_token']` (64-char hex via `random_bytes(32)`).
- When a message is created anonymously, the token is stored in `messages.owner_token`.
- `views/home.php` compares `$m['owner_token']` to `$_SESSION['author_token']` to decide whether to show the Delete button.
- `deleteMessage()` checks the token match: soft-deletes by setting `status = 'removed_by_owner'`.
- Session loss = ownership loss. Pre-existing posts with empty `owner_token` are undeletable.

### Logged-in (account-based)

- When logged in, `$_SESSION['account_id']` is set and `messages.account_id` is populated on new posts.
- Ownership check: `views/home.php` checks both `owner_token` match AND `account_id` match.
- `deleteMessage()` accepts both `$ownerToken` and `$currentAccountId` — matches either.
- Account-linked posts survive session loss: the user can always manage their posts after re-login.
- Comments by logged-in users also store `account_id` for attribution.

## Current strengths

- All DB queries use prepared statements.
- CSRF protection on all POST actions with `hash_equals()`.
- Clean separation: data layer in `lib/db.php`, rendering in `views/`, behavior in `assets/app.js`.
- PRG pattern prevents double-submit on non-AJAX fallback.
- XSS protection: all output uses `htmlspecialchars()`, JS uses `escapeHtml()`.
- No external dependencies.
- DB-backed rate limiting (configurable per-action thresholds).
- Content moderation: status-based visibility (visible/hidden/removed_by_mod/removed_by_owner).
- Public reporting system with reason taxonomy.
- Admin moderation panel with audit logging.
- Session hardening (httponly, samesite, strict mode, secure in production).
- IP privacy: all IPs are SHA-256 hashed before storage.
- Soft deletes preserve audit trail.

## Current limits

- No email verification on registration.
- No password reset flow.
- No FK from `messages.user_id` → `users.id`.
- Nickname is globally unique — collisions prevent aliases.
- No automated tests.
- No migration runner; manual apply required.
- `user_profiles` table exists but is unused (superseded by `accounts.bio`).

## Future change guidance

- **Schema changes** must ship with a migration in `migrations/`. Use `IF NOT EXISTS` / `ON DUPLICATE KEY` for idempotency.
- **DOM changes** to `views/home.php` must be mirrored in `renderMessage()` / `renderComment()` in `assets/app.js`.
- **New POST actions** must follow the existing pattern: CSRF check → action → JSON for AJAX / PRG for browser.
- **New JS behavior** goes in `assets/app.js`. Visual-only polish goes in `assets/dynamic-interface.js`.
