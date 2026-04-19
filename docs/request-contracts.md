# Request contracts

All POST endpoints are handled by `index.php`. All require a valid CSRF token in the `csrf` form field. Rate-limited actions return HTTP 429 when limits are exceeded.

## AJAX detection

`index.php` checks for the `X-Requested-With` header (any truthy value, typically `fetch`). If present, the response is JSON. If absent, the server uses Post-Redirect-Get (303 redirect).

`assets/app.js` sends this header on every `fetch()` call:

```js
headers: { 'X-Requested-With': 'fetch' }
```

## CSRF failure

Applies to all POST actions. Returns HTTP 403.

**AJAX response:**

```json
{ "ok": false, "error": "Invalid CSRF token" }
```

**Non-AJAX response:** plain text `Invalid CSRF token`.

---

## Create post

**Action:** `add`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"add"` |
| `csrf` | string | yes | CSRF token from session |
| `nick` | string | no | Defaults to `"Anon"` |
| `msg` | string | yes | Max 240 chars (truncated server-side) |
| `community` | string | no | Community slug, defaults to `"general"` |

Sent as `FormData` from `#composerForm`.

### Success (AJAX)

HTTP 200:

```json
{
  "ok": true,
  "message": {
    "id": 42,
    "body": "The moon is a hologram",
    "created_at": "2025-10-29 14:30:00",
    "upvotes": 0,
    "downvotes": 0,
    "nickname": "DarkSeeker",
    "community_name": "General",
    "community_slug": "general",
    "is_owner": true,
    "comments": []
  }
}
```

Notes:
- `owner_token` is stripped from the response (`unset($row['owner_token'])`).
- `is_owner` is always `true` for the poster's own new message.
- `comments` is an empty array for new posts.
- Rate limited: max `RATE_LIMIT_POSTS_PER_10M` (default 10) per 10 minutes per IP.

### Failure (AJAX)

HTTP 422:

```json
{ "ok": false, "error": "Unable to save message." }
```

### Non-AJAX success

Sets `$_SESSION['flash'] = 'Posted!'` and redirects 303.

---

## Comment

**Action:** `comment`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"comment"` |
| `csrf` | string | yes | CSRF token |
| `message_id` | int | yes | ID of the parent message |
| `nick` | string | no | Defaults to `"Anon"`, max 60 chars |
| `body` | string | yes | Max 240 chars (truncated server-side) |

Sent as `FormData` from `.comment-form[data-message-id]`.

### Success (AJAX)

HTTP 200:

```json
{
  "ok": true,
  "comment": {
    "id": 17,
    "message_id": 42,
    "nickname": "TruthHunter",
    "body": "I knew it!",
    "created_at": "2025-10-29 14:35:00"
  }
}
```

### Failure (AJAX)

HTTP 422:

```json
{ "ok": false, "error": "Unable to save comment." }
```

### Non-AJAX success

Redirects 303 (no flash message).

---

## Vote

**Action:** `react`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"react"` |
| `csrf` | string | yes | CSRF token |
| `id` | int | yes | Message ID |
| `type` | string | yes | `"up"` or `"down"` (anything else treated as `"up"`) |

Sent as `FormData` from the vote `<form>` elements. `app.js` intercepts via `button[data-react]` click delegation.

### Success (AJAX)

HTTP 200:

```json
{
  "ok": true,
  "id": 42,
  "upvotes": 7,
  "downvotes": 2
}
```

`upvotes` and `downvotes` are the updated totals after the vote.

### Non-AJAX success

Redirects 303.

---

## Delete

**Action:** `delete`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"delete"` |
| `csrf` | string | yes | CSRF token |
| `id` | int | yes | Message ID to delete |

Sent as `FormData` from `#deleteForm` inside the delete modal.

### Success (AJAX)

HTTP 200:

```json
{
  "ok": true,
  "deleted": 42
}
```

### Forbidden (AJAX)

HTTP 403 — returned when `owner_token` does not match:

```json
{ "ok": false, "error": "You can only delete your own posts." }
```

### Non-AJAX success

Redirects 303. If not authorized, sets `$_SESSION['flash'] = 'You can only delete your own posts.'` before redirect.

---

## PRG fallback

When `X-Requested-With` is absent, all successful POST actions redirect with HTTP 303 via the `prg_redirect()` function. This preserves query parameters (`q`, `sort`, `page`) in the redirect target.

Flash messages are stored in `$_SESSION['flash']` and displayed once by `views/home.php`.

---

## Report content

**Action:** `report`

Rate limited: max `RATE_LIMIT_REPORTS_PER_10M` (default 5) per 10 minutes per IP.

---

## Register

**Action:** `register`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"register"` |
| `csrf` | string | yes | CSRF token |
| `display_name` | string | yes | 1–60 chars |
| `email` | string | yes | Valid email, must be unique |
| `password` | string | yes | Min 8 chars |
| `password_confirm` | string | yes | Must match `password` |

### Success

Redirects 303 to home. Sets `$_SESSION['account_id']` and `$_SESSION['account']`. Session ID is regenerated (fixation prevention).

### Failure

Redirects 303 to `?page=register` with `$_SESSION['flash']` containing error (e.g., "Email is already registered", "Passwords do not match", "Password must be at least 8 characters").

---

## Login

**Action:** `login`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"login"` |
| `csrf` | string | yes | CSRF token |
| `email` | string | yes | Registered email |
| `password` | string | yes | Account password |

### Success

Redirects 303 to home. Sets `$_SESSION['account_id']` and `$_SESSION['account']`. Session ID is regenerated.

### Failure

Redirects 303 to `?page=login` with `$_SESSION['flash'] = 'Invalid email or password.'`

---

## Logout

**Action:** `logout`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"logout"` |
| `csrf` | string | yes | CSRF token |

### Success

Destroys session, redirects 303 to home.

---

## Update profile

**Action:** `update_profile`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"update_profile"` |
| `csrf` | string | yes | CSRF token |
| `display_name` | string | yes | 1–60 chars |
| `bio` | string | no | Free text, max 500 chars (truncated) |

### Success

Redirects 303 to `?page=profile` with `$_SESSION['flash'] = 'Profile updated.'`

### Failure

Requires login. Redirects 303 to `?page=login` if not authenticated.

---

## Change password

**Action:** `change_password`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"change_password"` |
| `csrf` | string | yes | CSRF token |
| `current_password` | string | yes | Current account password |
| `new_password` | string | yes | Min 8 chars |
| `new_password_confirm` | string | yes | Must match `new_password` |

### Success

Redirects 303 to `?page=profile` with `$_SESSION['flash'] = 'Password updated.'`

### Failure

Redirects with flash: "Current password is incorrect", "Passwords do not match", "New password must be at least 8 characters".

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"report"` |
| `csrf` | string | yes | CSRF token |
| `target_type` | string | yes | `"message"` or `"comment"` |
| `target_id` | int | yes | ID of the reported content |
| `reason` | string | yes | One of: `spam`, `abuse`, `illegal`, `misinfo`, `other` |
| `note` | string | no | Optional details, max 500 chars |

### Success (AJAX)

HTTP 200:

```json
{ "ok": true }
```

### Failure (AJAX)

HTTP 422:

```json
{ "ok": false, "error": "Unable to submit report." }
```

### Non-AJAX success

Sets `$_SESSION['flash'] = 'Report submitted. Thank you.'` and redirects 303.

---

## Admin login

**Action:** `admin_login`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"admin_login"` |
| `csrf` | string | yes | CSRF token |
| `password` | string | yes | Admin password (verified against `ADMIN_PASSWORD_HASH` env) |

### Response

Always redirects 303 to `?page=admin`. Sets `$_SESSION['is_admin'] = true` on success, or flash error on failure.

---

## Admin logout

**Action:** `admin_logout`

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"admin_logout"` |
| `csrf` | string | yes | CSRF token |

### Response

Clears `$_SESSION['is_admin']`, redirects 303 to `?page=admin`.

---

## Moderation action

**Action:** `mod_action`

Requires `$_SESSION['is_admin']` to be true. Returns HTTP 403 otherwise.

### Request

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `action` | string | yes | `"mod_action"` |
| `csrf` | string | yes | CSRF token |
| `target_type` | string | yes | `"message"` or `"comment"` |
| `target_id` | int | yes | ID of the content |
| `mod_action` | string | yes | `"hide"`, `"remove"`, `"restore"`, or `"dismiss"` |
| `reason` | string | no | Admin reason for the action |
| `report_id` | int | no | Report ID to resolve alongside the action |

### Response

Redirects 303 to `?page=admin` with flash message.

---

## Rate limiting

All rate-limited actions (add, comment, react, report) return HTTP 429 when limits are exceeded.

**AJAX response:**

```json
{ "ok": false, "error": "Rate limit exceeded. Please slow down." }
```

**Non-AJAX response:** plain text `Rate limit exceeded. Please slow down.`

Limits are configurable via environment variables (all per 10-minute window):

| Variable | Default | Action |
|----------|---------|--------|
| `RATE_LIMIT_POSTS_PER_10M` | 10 | Post creation |
| `RATE_LIMIT_COMMENTS_PER_10M` | 30 | Comment creation |
| `RATE_LIMIT_VOTES_PER_10M` | 60 | Voting |
| `RATE_LIMIT_REPORTS_PER_10M` | 5 | Report submission |
