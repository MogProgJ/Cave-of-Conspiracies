# Manual smoke test

Run this checklist after any change to core flows. Each step includes what to verify.

## Prerequisites

- PHP dev server running: `php -S 0.0.0.0:8080 -t .`
- MySQL running with migrations applied (in order)
- Browser with DevTools open (Console + Network tabs)

---

## 1. Fresh load

1. Open `http://localhost:8080` in a fresh browser tab (or incognito).
2. Page loads without PHP errors or blank screen.
3. Composer form is visible at the top.
4. Sidebar shows Trending Communities (at least "General") and Active Conspirators.
5. Theme defaults to dark.
6. No JS console errors.

**Pass:** page renders completely, no errors in console or network.

---

## 2. Create post

1. Enter a nickname (e.g., `SmokeTest`).
2. Select a community (or leave on General).
3. Type a message (e.g., `Smoke test post`).
4. Click **Post**.

**With JS:** post appears at top of feed without reload. Toast says "Posted!". Character counter resets. Network tab shows POST returning `200` with `{ "ok": true, "message": { ... } }`.

**Without JS:** page redirects, flash message "Posted!" appears, post visible in feed.

**Pass:** post is visible with correct nickname, community tag, 0 votes, empty comments section.

---

## 3. Vote

1. Click ▲ on the post you just created.
2. Upvote count increments by 1.
3. Click ▼ on the same post.
4. Downvote count increments by 1.

**With JS:** counters update in-place. No page reload. Network shows `{ "ok": true, "upvotes": 1, "downvotes": 1 }`.

**Pass:** both counters reflect the votes.

---

## 4. Comment

1. Scroll to the post's comment section.
2. Enter an alias (e.g., `Commenter1`).
3. Type a comment (e.g., `Test comment`).
4. Click **Comment**.

**With JS:** comment appears below the post. "No comments yet" text disappears. Toast says "Comment posted!".

**Without JS:** page reloads, comment is visible.

**Pass:** comment is displayed with correct alias and body.

---

## 5. Delete ownership

1. The post you created in step 2 should have a **Delete** button (red).
2. Click **Delete**. Modal opens showing a preview of the post.
3. Confirm deletion.

**With JS:** modal closes, post fades out and is removed from DOM. Toast says "Deleted".

**Without JS:** page reloads, post is gone.

4. Open a new incognito window and load the page. Posts from the other session should **not** have Delete buttons.

**Pass:** only your own posts show Delete. Deletion works. Other sessions cannot delete your posts.

---

## 6. Delete forbidden test

1. In the incognito window (different session), use DevTools to manually submit a DELETE request:

```js
fetch('/', {
  method: 'POST',
  headers: { 'X-Requested-With': 'fetch' },
  body: new URLSearchParams({
    action: 'delete',
    id: '<some_id_from_another_session>',
    csrf: document.querySelector('input[name="csrf"]').value
  })
}).then(r => r.json()).then(console.log);
```

2. Response should be `403` with `{ "ok": false, "error": "You can only delete your own posts." }`.

**Pass:** server rejects unauthorized delete.

---

## 7. Reload truth test

1. Create a post and a comment.
2. Reload the page (Ctrl+R).
3. Post and comment are still visible.
4. Vote counts are preserved.
5. If you haven't closed the browser, your Delete button is still present on your posts.

**Pass:** all data persists across reloads. Session ownership survives refresh.

---

## 8. Static page verification

1. Navigate to `/?page=about` — about page renders.
2. Navigate to `/?page=creator` — creator page renders.
3. Navigate to `/?page=links` — links page renders.
4. Navigate to `/?page=privacy` — privacy page renders.

**Pass:** all four static pages render without errors.

---

## 9. Theme switching

1. Select each theme from the dropdown: Dark, Light, Blue, Midnight, Dusk.
2. Page colors update immediately.
3. Reload the page — theme persists.

**Pass:** all 5 themes apply correctly and survive reload.

---

## 10. Search and sort

1. Type a keyword from an existing post into the search bar.
2. Results filter to matching posts.
3. Change sort to "Oldest" — order reverses.
4. Change sort to "Top" — highest-voted posts appear first.
5. Press Escape in the search field — filter clears.

**Pass:** search filters correctly, sort changes order, escape clears search.

---

## 11. Report content

1. On any post, click the ⚑ report button.
2. Report modal opens with reason radio buttons and optional note textarea.
3. Select a reason (e.g., "Spam"). Optionally add a note.
4. Click **Submit report**.

**With JS:** modal closes. Toast says "Report submitted. Thank you."

5. Try submitting without selecting a reason — toast says "Please select a reason" and modal stays open.

**Pass:** report submits successfully with valid reason. Validation prevents empty submissions.

---

## 12. Rate limiting

1. Rapidly submit 11+ posts in under 10 minutes (or set `RATE_LIMIT_POSTS_PER_10M=2` for easier testing).
2. After the limit is exceeded, submission returns HTTP 429.

**With JS:** Toast says "Rate limit exceeded. Please slow down."

**Pass:** rate limiting engages and provides clear feedback.

---

## 13. Admin panel

1. Navigate to `/?page=admin`.
2. Login form is displayed.
3. Enter an incorrect password — flash says "Invalid admin password."
4. Set `ADMIN_PASSWORD_HASH` env var (generate with `php -r "echo password_hash('testpass', PASSWORD_DEFAULT);"`) and enter the correct password.
5. Admin panel loads showing report queue.
6. Reports from step 11 appear with "Hide", "Remove", "Dismiss" buttons.
7. Click **Hide** on a report — content becomes invisible to public, report status changes.
8. Click **Dismiss** on another report — report moved to dismissed tab.
9. Navigate back to main site — hidden content is not shown.
10. Click **Logout** — returns to login form.

**Pass:** admin auth works, moderation actions affect content visibility, audit trail logged.

---

## 14. Soft delete verification

1. Create a post. Delete it using the Delete button.
2. Check the database: `SELECT status FROM messages WHERE id = <id>` should show `removed_by_owner`.
3. The post is no longer visible on the public feed.
4. As admin, the post can be restored via mod_action with `restore`.

**Pass:** deletes are soft (status change), not hard (row removal).

---

## 15. Registration

1. Navigate to `/?page=register`.
2. Registration form shows display name, email, password, confirm password fields.
3. Submit with mismatched passwords — client-side validation prevents submit.
4. Submit with a password under 8 characters — client-side validation prevents submit.
5. Submit with valid data — redirected to home page.
6. Header shows "Hi, [DisplayName]" with Profile and Log out buttons.
7. Login/Register buttons are no longer shown.

**Pass:** registration creates account, logs in automatically, header reflects auth state.

---

## 16. Login / Logout

1. Click **Log out** — session is destroyed, redirected to home.
2. Header shows Login and Register buttons again.
3. Navigate to `/?page=login`.
4. Enter wrong password — flash shows "Invalid email or password."
5. Enter correct credentials — redirected to home, header shows authenticated state.

**Pass:** login/logout cycle works correctly with proper flash feedback.

---

## 17. Account-linked posting

1. While logged in, open the composer form.
2. Nickname field is pre-filled with your display name and is read-only.
3. Create a post — post appears with your display name.
4. Log out and back in — the post still shows the Delete button (account-linked ownership).
5. Open a different browser/incognito — the post does NOT show a Delete button (different account).

**Pass:** logged-in posts are linked to account_id, ownership persists across sessions.

---

## 18. User profile

1. While logged in, click **Profile** in the header.
2. Profile page shows avatar initial, display name, member-since date, bio, stats (posts/comments).
3. Edit display name and bio in the sidebar form — changes save and reflect immediately.
4. Change password in the sidebar form — confirms "Password updated."
5. Navigate to `/?page=user&id=N` (another user's ID) — public profile shows, no edit forms.

**Pass:** own profile is editable, public profiles are read-only.

---

## 19. 404 page

1. Navigate to `/?page=nonexistent`.
2. Themed 404 page renders with "Page Not Found" message and a link back to home.

**Pass:** unknown pages show 404, not a blank screen or PHP error.

---

## 20. Schema safety (graceful startup failure)

1. Temporarily break the schema — e.g., rename the `accounts` table: `ALTER TABLE accounts RENAME TO accounts_bak;`
2. Reload the home page.
3. A **Setup Required** page appears (HTTP 503) with:
   - Database connection status (connected).
   - List of missing tables/columns (e.g., "Missing table: accounts").
   - Instructions to run `php tools/migrate.php`.
4. Restore the table: `ALTER TABLE accounts_bak RENAME TO accounts;`
5. Reload — normal page loads again.

**Pass:** missing schema produces a helpful error page, not a blank screen or raw PHP fatal.

---

## 21. Migration runner

1. Run `php tools/migrate.php --status` from CLI.
2. All 5 migrations show as "applied" (or "pending" if not yet run).
3. Run `php tools/migrate.php` — only pending migrations are applied, already-applied ones are skipped.
4. Run `php tools/dev_doctor.php` — all checks pass.

**Pass:** migration runner reports status correctly and applies only what's needed.
