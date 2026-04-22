<?php
/**
 * lib/api_serializers.php — Safe data shapes for the PHP API layer.
 *
 * These functions transform internal PHP/session/DB data into clean,
 * intentionally-shaped arrays suitable for JSON serialisation.
 * Never expose raw DB rows directly; always go through a serializer.
 *
 * Sections:
 *   1. Session state
 *   2. Community presentation config (slug → icon/category metadata)
 *   3. Thread card     — compact shape for listing pages
 *   4. Thread detail   — full shape for single-thread page
 *   5. Community card  — enriched with presentation metadata
 *   6. Profile summary — public profile + stats
 */

declare(strict_types=1);

// ── 2. Community presentation config ────────────────────────────────────────
//
// The DB is the source of truth for slug/name/tagline and activity counts.
// Icon, category label, and hero colour come from this static config keyed by
// slug so the DB schema stays lean.  Unknown slugs get safe defaults.
//
// icon      — Lucide icon component name used by the React frontend.
// category  — Display label for the community "type" badge.
// color     — Tailwind background token for community hero/badge tinting.
//
/** @var array<string, array{icon: string, category: string, color: string}> */
const COMMUNITY_PRESENTATION = [
    'general'    => ['icon' => 'MessageSquare', 'category' => 'General',     'color' => 'slate'],
    'deepstate'  => ['icon' => 'Eye',           'category' => 'Politics',    'color' => 'red'],
    'cryptids'   => ['icon' => 'Footprints',    'category' => 'Creatures',   'color' => 'green'],
    'outerworld' => ['icon' => 'Telescope',     'category' => 'Space',       'color' => 'indigo'],
    'technomyth' => ['icon' => 'Cpu',           'category' => 'Technology',  'color' => 'cyan'],
];

/**
 * Return a safe representation of the current session state.
 *
 * Shape emitted:
 * {
 *   "authenticated": bool,
 *   "account": null | { id, display_name, role },
 *   "is_admin": bool
 * }
 *
 * @return array<string, mixed>
 */
function api_session_state(): array {
    $account = $_SESSION['account'] ?? null;
    $id      = $_SESSION['account_id'] ?? null;

    return [
        'authenticated' => $id !== null,
        'account'       => $id !== null ? [
            'id'           => (int) $id,
            'display_name' => (string) ($account['display_name'] ?? ''),
            'role'         => (string) ($account['role'] ?? 'user'),
        ] : null,
        'is_admin'      => !empty($_SESSION['is_admin']),
    ];
}

// ── 3. Thread card ───────────────────────────────────────────────────────────

/**
 * Compact thread shape for listing pages (explore, community feed, search).
 *
 * Shape:
 * {
 *   id, title, body_preview,
 *   author,
 *   community: { slug, name } | null,
 *   upvotes, downvotes, comment_count,
 *   created_at
 * }
 *
 * @param array<string, mixed> $row  A row from listMessages() (already hydrated with comments).
 * @return array<string, mixed>
 */
function api_thread_card(array $row): array {
    $body    = (string) ($row['body'] ?? '');
    $preview = mb_strlen($body) > 200
        ? mb_substr($body, 0, 197) . '…'
        : $body;

    $communitySlug = $row['community_slug'] ?? null;
    $community     = $communitySlug !== null ? [
        'slug' => $communitySlug,
        'name' => (string) ($row['community_name'] ?? $communitySlug),
    ] : null;

    $comments     = $row['comments'] ?? [];
    $commentCount = is_array($comments) ? count($comments) : 0;

    return [
        'id'            => (int) $row['id'],
        'title'         => (string) ($row['title'] ?? $preview),
        'body_preview'  => $preview,
        'author'        => ($row['nickname'] ?? null) ?: null,
        'community'     => $community,
        'upvotes'       => (int) ($row['upvotes'] ?? 0),
        'downvotes'     => (int) ($row['downvotes'] ?? 0),
        'comment_count' => $commentCount,
        'created_at'    => (string) ($row['created_at'] ?? ''),
    ];
}

// ── 4. Thread detail ─────────────────────────────────────────────────────────

/**
 * Single-comment shape used inside api_thread_detail().
 *
 * @param array<string, mixed> $comment
 * @return array<string, mixed>
 */
function api_comment_item(array $comment): array {
    return [
        'id'         => (int) $comment['id'],
        'body'       => (string) ($comment['body'] ?? ''),
        'author'     => ($comment['nickname'] ?? null) ?: null,
        'created_at' => (string) ($comment['created_at'] ?? ''),
    ];
}

/**
 * Full thread shape for the single-thread detail page.
 *
 * Shape:
 * {
 *   id, title, body,
 *   author,
 *   community: { slug, name } | null,
 *   upvotes, downvotes,
 *   created_at,
 *   comments: [ { id, body, author, created_at } ]
 * }
 *
 * @param array<string, mixed> $row  A row from getMessage() (hydrated with comments).
 * @return array<string, mixed>
 */
function api_thread_detail(array $row): array {
    $communitySlug = $row['community_slug'] ?? null;
    $community     = $communitySlug !== null ? [
        'slug' => $communitySlug,
        'name' => (string) ($row['community_name'] ?? $communitySlug),
    ] : null;

    $rawComments = $row['comments'] ?? [];
    $comments    = is_array($rawComments)
        ? array_values(array_map('api_comment_item', $rawComments))
        : [];

    $body = (string) ($row['body'] ?? '');

    return [
        'id'         => (int) $row['id'],
        'title'      => (string) ($row['title'] ?? mb_substr($body, 0, 77)),
        'body'       => $body,
        'author'     => ($row['nickname'] ?? null) ?: null,
        'community'  => $community,
        'upvotes'    => (int) ($row['upvotes'] ?? 0),
        'downvotes'  => (int) ($row['downvotes'] ?? 0),
        'created_at' => (string) ($row['created_at'] ?? ''),
        'comments'   => $comments,
    ];
}

// ── 5. Community card ────────────────────────────────────────────────────────

/**
 * Community card shape enriched with presentation metadata.
 *
 * Shape:
 * {
 *   slug, name, tagline,
 *   icon, category, color,
 *   posts_7d, comments_7d
 * }
 *
 * @param array<string, mixed> $row  A row from listCommunities().
 * @return array<string, mixed>
 */
function api_community_card(array $row): array {
    $slug = (string) ($row['slug'] ?? '');
    $meta = COMMUNITY_PRESENTATION[$slug] ?? [
        'icon'     => 'Hash',
        'category' => 'Community',
        'color'    => 'slate',
    ];

    return [
        'slug'         => $slug,
        'name'         => (string) ($row['name'] ?? $slug),
        'tagline'      => ($row['tagline'] ?? null) !== null ? (string) $row['tagline'] : null,
        'icon'         => $meta['icon'],
        'category'     => $meta['category'],
        'color'        => $meta['color'],
        'posts_7d'     => (int) ($row['posts_7d'] ?? 0),
        'comments_7d'  => (int) ($row['comments_7d'] ?? 0),
    ];
}

// ── 6. Profile summary ───────────────────────────────────────────────────────

/**
 * Public profile summary for the React profile page.
 *
 * Shape:
 * {
 *   id, display_name, bio | null, role,
 *   joined_at,
 *   stats: { post_count, comment_count }
 * }
 *
 * @param array<string, mixed> $account  Row from getAccountById() or getPublicProfile().
 * @param array{post_count: int, comment_count: int} $stats  From getAccountStats().
 * @return array<string, mixed>
 */
function api_profile_summary(array $account, array $stats): array {
    return [
        'id'           => (int) $account['id'],
        'display_name' => (string) ($account['display_name'] ?? ''),
        'bio'          => ($account['bio'] ?? null) !== null ? (string) $account['bio'] : null,
        'role'         => (string) ($account['role'] ?? 'user'),
        'joined_at'    => (string) ($account['created_at'] ?? ''),
        'stats'        => [
            'post_count'    => (int) ($stats['post_count'] ?? 0),
            'comment_count' => (int) ($stats['comment_count'] ?? 0),
        ],
    ];
}
