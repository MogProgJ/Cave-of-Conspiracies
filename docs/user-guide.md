# User guide

## What is Cave of Conspiracies?

An anonymous message board for posting short conspiracy theories. No account required. Pick an alias, post a theory, vote on others, and comment.

## Posting

1. At the top of the page, enter a **nickname** (alias) in the first field.
2. Select a **community** from the dropdown (e.g., General, Deep State, Cryptids) or leave it on the default.
3. Type your message in the text area (max 240 characters). The counter updates as you type.
4. Click **Transmit**.

Your post appears at the top of the feed. With JS enabled, it appears instantly without page reload.

## Voting

Each post has an upvote (▲) and downvote (▼) button.

- Click ▲ to upvote.
- Click ▼ to downvote.
- Counts update immediately with JS. Without JS, the page reloads.

There is no limit on how many times you can vote. Votes are not deduplicated per session.

## Commenting

Below each post is a comments section.

1. Enter an alias in the **Alias** field.
2. Type your comment (max 240 characters).
3. Click **Comment**.

The comment appears below the post. With JS, it appends without reload.

## Deleting your own post

If you posted a message during your current browser session, a **Delete** button appears on that post.

1. Click **Delete**.
2. A confirmation modal appears showing a preview of the post.
3. Confirm deletion.

The post is removed. With JS, it fades out. Without JS, the page reloads.

**Important:** Deletion is tied to your browser session. If you close the browser or clear cookies, you lose the ability to delete your posts. There is no way to recover ownership.

## Theme switching

In the sidebar (or header area), there is a theme picker dropdown with 5 options:

- Dark (default)
- Light
- Midnight
- Forest
- Sunset

Select a theme and the page updates immediately. Your choice is saved in the browser and persists across reloads.

## Communities

Posts belong to a community. The default is **General**.

Communities appear in the sidebar under **Trending Communities** with recent activity counts. The community tag (e.g., `r/General`) is shown on each post.

Communities are created automatically when a post is assigned to a new slug.

## Sidebar panels

The right sidebar shows:

- **Trending Communities** — communities with the most activity in the last 7 days.
- **Active Conspirators** — users with the most recent posts and comments.
- **Community Ticker** — a rotating display of community names.

## Search and sort

- Use the search bar to filter posts by body text.
- Sort by: **Newest**, **Oldest**, or **Top** (highest net vote score).
- Press **Escape** in the search field to clear the filter.

## Pagination

Posts are displayed 10 per page. Navigation links appear at the bottom of the message list.

## Current limitations

- No persistent identity — session only.
- Aliases are globally unique. If someone already used a name, you must pick another.
- No way to edit posts after creation.
- No reply threading — comments are flat.
- No content moderation or reporting.
- Votes are not limited per user.
