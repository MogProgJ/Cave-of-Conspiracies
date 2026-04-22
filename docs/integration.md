# Integration Architecture — PHP + React Coexistence

## Overview

Cave of Conspiracies hosts two separate frontends from the same repository
and the same Apache process:

| Layer | Technology | Location | Served at |
|-------|-----------|----------|-----------|
| Legacy PHP app | PHP 8.2 + vanilla JS | repo root | `/` |
| React SPA | React 19 + Vite 6 + TypeScript | `frontend/app/` | `/app/` (built) |
| PHP JSON API | PHP 8.2 | `api/index.php` | `/api/` |

The PHP app is the **product truth**. The React app is the **design truth** —
it is the direction the UI is heading. Neither replaces the other yet.
Only the health and session endpoints exist so far; full API integration
is a later phase.

---

## Repository layout

```
Cave-of-Conspiracies/
  index.php             Legacy PHP router / entry point
  config.php            PDO connection + session_start()
  lib/
    db.php              Database queries (PDO prepared statements only)
    utils.php           Shared helpers
    api_helpers.php     JSON response primitives (api_ok, api_error, ...)
    api_serializers.php Safe data shapes for JSON output
  api/
    index.php           PHP JSON API entry point — all /api/* routes here
  views/                PHP server-rendered templates
  assets/               Legacy CSS + JS
  frontend/
    app/                React/Vite SPA source (do not serve directly)
      src/
        lib/
          api.ts        Typed PHP API client for the React app
      vite.config.ts    Build config: base=/app/, outDir=../../public/app
      .env.example      Frontend env template
  public/
    app/                Vite production build output (git-ignored)
  .htaccess             Apache routing rules
  migrations/           SQL migration files
  docs/                 Documentation
```

---

## Running locally (dual-server dev mode)

### Start the PHP backend

```bash
# From repo root
php -S 0.0.0.0:8080 -t .
```

PHP now serves:
- The legacy app at `http://localhost:8080/`
- The API at `http://localhost:8080/api/health` and `.../api/session`

### Start the React dev server

```bash
cd frontend/app
cp .env.example .env
npm install
npm run dev
```

Vite starts at `http://localhost:5173/app/`.
All `/api/*` requests from the React app proxy to `http://localhost:8080`
(configured in `vite.config.ts` via `server.proxy`).

### XAMPP (alternative — serves both from one port)

With XAMPP running Apache on port 80:
- Legacy PHP: `http://localhost/Cave-of-Conspiracies/`
- API: `http://localhost/Cave-of-Conspiracies/api/health`
- SPA (after build): `http://localhost/Cave-of-Conspiracies/app/`

For XAMPP you need `RewriteBase /Cave-of-Conspiracies/` in `.htaccess`
if mod_rewrite is not configured with `AllowOverride All` on the root
virtual host. See `.htaccess` comments.

---

## Building the React app for production

```bash
cd frontend/app
npm run build
```

Output goes to `public/app/` at the repo root.
Apache then serves `/app/*` from that directory (see `.htaccess`).
`public/app/` is git-ignored — the build artifact is not committed.

---

## API contract

All API responses follow a consistent envelope:

```json
// Success
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": "Human-readable message" }
```

### Currently implemented endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness check — returns PHP version and timestamp |
| GET | `/api/session` | Current session state — authenticated, account, is_admin |

New endpoints go in `api/index.php`. Use `api_ok()` / `api_error()` from
`lib/api_helpers.php` and `api_require_method()` to guard HTTP methods.

---

## Frontend API client

`frontend/app/src/lib/api.ts` is the only file that should call `fetch()`
against the PHP backend. Import typed helpers from there:

```typescript
import { getSession, getHealth } from '@/src/lib/api';

const result = await getSession();
if (result.ok) {
  console.log(result.data.authenticated);
}
```

The base URL is controlled by `VITE_API_BASE_URL` in `frontend/app/.env`
(defaults to `/api`).

---

## Routing rules (.htaccess)

1. Real files/directories — served directly (Vite asset hashes, etc.)
2. `/api/*` → `api/index.php`
3. `/app/assets/*` → `public/app/assets/*` (Vite static build assets)
4. `/app` or `/app/*` → `public/app/index.html` (React SPA catch-all)
5. Everything else → falls through to PHP (`index.php`)

---

## What is NOT wired yet

- Only 2 API endpoints exist (health + session)
- No React page talks to the PHP backend yet
- No login/register from the React app
- No communities, threads, or messages via the API
- No production deployment pipeline

Full per-feature API integration is a later phase. The scaffold here
establishes the routing strategy and shared data contract so new endpoints
and React pages can be added incrementally without re-architecting.

---

## Adding a new API endpoint

1. Add the route case in `api/index.php`:
   ```php
   case 'communities':
       api_require_method('GET');
       $rows = getCommunities($pdo);
       api_ok(['communities' => array_map('api_community', $rows)]);
   ```
2. Add the serializer in `lib/api_serializers.php`:
   ```php
   function api_community(array $row): array {
       return ['id' => (int)$row['id'], 'name' => $row['name'], ...];
   }
   ```
3. Add the typed call in `frontend/app/src/lib/api.ts`.
4. Ship a migration if the endpoint touches new DB columns.
