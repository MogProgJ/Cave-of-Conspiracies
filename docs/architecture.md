# Architecture

This document describes the Cave of Conspiracies architecture as actually implemented. It does not describe planned or aspirational systems.

## Request flow

```
Browser
  │
  ├─ GET /                      → index.php → render('home', ...) → views/home.php
  ├─ GET /?page=about           → index.php → render('about', []) → views/about.php
  │
  ├─ POST action=add            → index.php → addMessage() → JSON or PRG redirect
  ├─ POST action=comment        → index.php → addComment() → JSON or PRG redirect
  ├─ POST action=react          → index.php → reactMessage() → JSON or PRG redirect
  └─ POST action=delete         → index.php → deleteMessage() → JSON or PRG redirect
```

All POST actions check for the `X-Requested-With: fetch` header. If present, they return JSON. If absent, they use Post-Redirect-Get (303).

## Runtime responsibilities

### index.php

- Entry point and request router.
- Starts session. Generates `$_SESSION['author_token']` (64-char hex) on first visit.
- Ensures the `general` community exists.
- Routes static pages: about, creator, links, privacy.
- Handles all POST actions: add, comment, react, delete.
- CSRF verification on every POST.
- Renders the home page via `render()` with data from `lib/db.php`.

### config.php

- Creates the `$pdo` PDO connection.
- Reads `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` from environment variables.
- Falls back to local dev defaults (`127.0.0.1`, `playground`, `root`, empty password).

### lib/db.php

Core data-access layer. All queries use PDO prepared statements.

Key functions:

| Function | Purpose |
|----------|---------|
| `findOrCreateUser($pdo, $nickname)` | Get or insert user by nickname, returns user ID |
| `addMessage($pdo, $userId, $body, $communitySlug, $ownerToken)` | Insert message with ownership token |
| `getMessage($pdo, $id)` | Fetch single message with joins + hydrated comments |
| `listMessages($pdo, $q, $limit, $offset, $sort)` | Paginated message list with search, sorting, comments |
| `countMessages($pdo, $q)` | Count for pagination |
| `deleteMessage($pdo, $id, $ownerToken)` | Delete only if `owner_token` matches |
| `reactMessage($pdo, $id, $type)` | Increment upvotes or downvotes |
| `addComment($pdo, $messageId, $nickname, $body)` | Insert comment, validate message exists first |
| `hydrateComments($pdo, $messages)` | Batch-load comments for a set of messages |
| `listCommunities($pdo, $limit)` | Trending communities (7-day window) |
| `listActiveUsers($pdo, $limit)` | Top users by activity |
| `ensureCommunity($pdo, $slug, $name, $tagline)` | Idempotent community creation |
| `recordUserActivity($pdo, $userId, $kind)` | Upsert user activity counters |
| `recordCommunityActivity($pdo, $communityId, $kind)` | Upsert daily community trend |

### lib/utils.php

- `render($view, $data)` — assigns `$data` keys as local variables, includes the view file. Uses explicit `foreach` assignment (not `extract()`).
- `csrf_token()` — generates/returns session CSRF token.
- `csrf_field()` — returns hidden input HTML.
- `csrf_verify($token)` — timing-safe comparison via `hash_equals()`.

### views/home.php

The DOM source of truth. Contains:

- **Composer form** (`#composerForm`) — alias input, community select, textarea, CSRF field, `action=add`.
- **Search/sort form** — GET form with `q` and `sort` parameters.
- **Message list** (`#messageList`) — `<article class="msg" id="msg_{id}">` cards.
- **Vote forms** — per-message forms with `data-react="up|down"` and `data-id="{id}"` on buttons. Counter spans: `#up_{id}`, `#down_{id}`.
- **Delete button** — only rendered when `$isOwner` is true. Uses `data-delete`, `data-id`, `data-snippet`.
- **Comment section** — per-message `<section class="comments" data-message="{id}">` with `.comments-list` container and `.comment-form`.
- **Pagination** — `<nav class="pager">`.
- **Sidebar** — trending communities, active conspirators, community ticker.
- **Delete modal** — `#deleteModal` with `#deleteForm` and `#deletePreview`.

### assets/app.js

The canonical client behavior layer. Self-contained with all helpers defined locally.

Responsibilities:
- Theme restore/apply from localStorage → `data-theme` attribute.
- AJAX composer submission → prepend rendered message to `#messageList`.
- Delegated vote handling → update `#up_{id}` / `#down_{id}` counters.
- Delegated comment submission → append rendered comment to `.comments-list`.
- Delete modal open/close/submit → AJAX delete with 403 error handling.
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
| `messages` | Posts: id, user_id, body(240), owner_token(64), upvotes, downvotes, created_at |
| `comments` | Comments: id, message_id (FK→messages CASCADE), nickname(60), body(240), created_at |
| `users` | Unique nicknames: id, nickname (UNIQUE), created_at |
| `communities` | Slug-based: id, slug (UNIQUE), name, tagline, created_at |
| `message_topics` | Message→community mapping: message_id (PK, FK→messages), community_id (FK→communities) |
| `community_trends` | Daily activity snapshots: community_id + day (UNIQUE), posts, comments |
| `user_activity` | Cumulative: user_id (PK, FK→users), last_seen, messages count, comments count |
| `user_profiles` | Created but unused: user_id, location, bio, avatar_url |

### Migration order

1. `2025_10_27_messages.sql` — base messages table
2. `2025_10_28_comments.sql` — comments with FK to messages
3. `2025_10_29_social_tables.sql` — users, communities, topics, trends, profiles, activity; seeds default communities; idempotent `owner_token` backfill

## Ownership model

- On session start, `index.php` generates `$_SESSION['author_token']` (64-char hex via `random_bytes(32)`).
- When a message is created, the token is stored in `messages.owner_token`.
- `views/home.php` compares `$m['owner_token']` to `$_SESSION['author_token']` to decide whether to show the Delete button.
- `deleteMessage()` requires the token to match: `DELETE ... WHERE id = ? AND owner_token = ?`.
- This is **not authentication**. Session loss = ownership loss. Pre-existing posts with empty `owner_token` are undeletable.

## Current strengths

- All DB queries use prepared statements.
- CSRF protection on all POST actions with `hash_equals()`.
- Clean separation: data layer in `lib/db.php`, rendering in `views/`, behavior in `assets/app.js`.
- PRG pattern prevents double-submit on non-AJAX fallback.
- XSS protection: all output uses `htmlspecialchars()`, JS uses `escapeHtml()`.
- No external dependencies.

## Current limits

- No persistent identity across sessions.
- No rate limiting or spam protection.
- No FK from `messages.user_id` → `users.id`.
- Nickname is globally unique — collisions prevent aliases.
- No automated tests.
- No migration runner; manual apply required.
- `user_profiles` table exists but is unused.

## Future change guidance

- **Schema changes** must ship with a migration in `migrations/`. Use `IF NOT EXISTS` / `ON DUPLICATE KEY` for idempotency.
- **DOM changes** to `views/home.php` must be mirrored in `renderMessage()` / `renderComment()` in `assets/app.js`.
- **New POST actions** must follow the existing pattern: CSRF check → action → JSON for AJAX / PRG for browser.
- **New JS behavior** goes in `assets/app.js`. Visual-only polish goes in `assets/dynamic-interface.js`.
