# Request contracts

All POST endpoints are handled by `index.php`. All require a valid CSRF token in the `csrf` form field.

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
