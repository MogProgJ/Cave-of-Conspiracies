<?php
/**
 * /api/index.php — PHP JSON API entry point
 *
 * All requests to /api/* are routed here via .htaccess.
 * This file bootstraps the PHP app (session, config, helpers),
 * then dispatches on the resolved route segment.
 *
 * Route format: /api/{endpoint}
 * e.g. GET /api/health  →  $route === 'health'
 *      GET /api/session →  $route === 'session'
 */

declare(strict_types=1);

// -- Bootstrap --
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/api_helpers.php';
require_once __DIR__ . '/../lib/api_serializers.php';

// Align API session behaviour with main app bootstrap.
if (session_status() !== PHP_SESSION_ACTIVE) {
    $isSecure = ($APP_ENV === 'production') || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => $isSecure,
    ]);
    session_start();
}

if (empty($_SESSION['author_token'])) {
    $_SESSION['author_token'] = bin2hex(random_bytes(32));
}

if ($pdo === null) {
    api_error('Database unavailable', 503);
}

// Apply CORS headers for same-origin use; extend if needed for future dev server proxy.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// -- Resolve route segment from PATH_INFO or REQUEST_URI --
// Handles both mod_rewrite (PATH_INFO empty) and path-info style.
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
// Strip query string
$path = parse_url($requestUri, PHP_URL_PATH) ?? '/';
// Strip leading /api prefix (works with or without sub-directory base)
$route = preg_replace('#^.*?/api/?#', '', $path);
$route = trim($route, '/');

// Normalise empty → 'index'
if ($route === '') {
    $route = 'index';
}

$parts = array_values(array_filter(explode('/', $route), static fn ($p) => $p !== ''));
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

/** @return array<string,mixed> */
function api_current_account_payload(PDO $pdo): array {
    $session = api_session_state();
    $accountId = (int)($session['account']['id'] ?? 0);
    if ($accountId <= 0) {
        return $session;
    }

    $account = getAccountById($pdo, $accountId);
    if (!$account) {
        return $session;
    }

    return [
        'authenticated' => true,
        'account' => [
            'id' => (int)$account['id'],
            'display_name' => (string)$account['display_name'],
            'role' => (string)$account['role'],
            'bio' => $account['bio'] ?? null,
            'email' => (string)$account['email'],
            'created_at' => (string)$account['created_at'],
        ],
        'is_admin' => !empty($_SESSION['is_admin']),
    ];
}

// -- Dispatch --
switch ($route) {

    case 'health':
        api_require_method('GET');
        api_ok([
            'status'    => 'ok',
            'timestamp' => date('c'),
            'php'       => PHP_VERSION,
        ]);
        break;

    case 'session':
        api_require_method('GET');
        api_ok(api_current_account_payload($pdo));
        break;

    default:
        // POST /api/auth/login
        if ($method === 'POST' && $parts === ['auth', 'login']) {
            $payload = api_request_data();
            $email = (string)($payload['email'] ?? '');
            $password = (string)($payload['password'] ?? '');
            $account = authenticateAccount($pdo, $email, $password);
            if (!$account) {
                api_error('Invalid email or password', 401);
            }

            session_regenerate_id(true);
            $_SESSION['account_id'] = (int)$account['id'];
            $_SESSION['account'] = [
                'display_name' => $account['display_name'],
                'role' => $account['role'],
            ];
            if (($account['role'] ?? 'user') === 'admin') {
                $_SESSION['is_admin'] = true;
            }

            api_ok(api_current_account_payload($pdo));
        }

        // POST /api/auth/register
        if ($method === 'POST' && $parts === ['auth', 'register']) {
            $payload = api_request_data();
            $email = (string)($payload['email'] ?? '');
            $password = (string)($payload['password'] ?? '');
            $passwordConfirm = (string)($payload['password_confirm'] ?? '');
            $displayName = (string)($payload['display_name'] ?? '');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                api_error('Invalid email address', 422);
            }
            if (mb_strlen($password) < 8) {
                api_error('Password must be at least 8 characters', 422);
            }
            if ($password !== $passwordConfirm) {
                api_error('Passwords do not match', 422);
            }
            if (mb_strlen(trim($displayName)) < 1 || mb_strlen(trim($displayName)) > 60) {
                api_error('Display name is required (max 60 chars)', 422);
            }

            $accountId = registerAccount($pdo, $email, $password, $displayName);
            if (!$accountId) {
                api_error('Email is already registered', 409);
            }

            session_regenerate_id(true);
            $_SESSION['account_id'] = $accountId;
            $_SESSION['account'] = [
                'display_name' => trim($displayName),
                'role' => 'user',
            ];

            api_ok(api_current_account_payload($pdo));
        }

        // POST /api/auth/logout
        if ($method === 'POST' && $parts === ['auth', 'logout']) {
            unset($_SESSION['account_id'], $_SESSION['account'], $_SESSION['is_admin']);
            session_regenerate_id(true);
            api_ok(['authenticated' => false]);
        }

        // GET /api/feed
        if ($method === 'GET' && $parts === ['feed']) {
            $q = trim((string)($_GET['q'] ?? ''));
            $sort = (string)($_GET['sort'] ?? 'new');
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = max(1, min(50, (int)($_GET['limit'] ?? 20)));
            $community = strtolower(trim((string)($_GET['community'] ?? '')));
            $offset = ($page - 1) * $limit;

            if ($community !== '') {
                $total = countMessagesByCommunity($pdo, $community, $q);
                $rows = listMessagesByCommunity($pdo, $community, $q, $limit, $offset, $sort);
            } else {
                $total = countMessages($pdo, $q);
                $rows = listMessages($pdo, $q, $limit, $offset, $sort);
            }

            $pages = max(1, (int)ceil($total / $limit));
            api_ok([
                'threads' => array_values(array_map('api_thread_card', $rows)),
                'total' => $total,
                'page' => min($page, $pages),
                'pages' => $pages,
            ]);
        }

        // GET /api/threads/{id}
        if ($method === 'GET' && count($parts) === 2 && $parts[0] === 'threads' && ctype_digit($parts[1])) {
            $threadId = (int)$parts[1];
            $row = getMessage($pdo, $threadId);
            if (!$row || ($row['status'] ?? 'visible') !== 'visible') {
                api_error('Thread not found', 404);
            }
            api_ok(api_thread_detail($row));
        }

        // POST /api/threads
        if ($method === 'POST' && $parts === ['threads']) {
            $accountId = api_require_auth();
            $payload = api_request_data();
            $title = (string)($payload['title'] ?? '');
            $body = (string)($payload['body'] ?? '');
            $communitySlug = strtolower(trim((string)($payload['community_slug'] ?? 'general')));
            $displayName = (string)($_SESSION['account']['display_name'] ?? 'Anon');
            $userId = findOrCreateUser($pdo, $displayName);
            $messageId = addMessage($pdo, $userId, $body, $communitySlug, (string)$_SESSION['author_token'], $accountId, $title);
            if (!$messageId) {
                api_error('Unable to save message', 422);
            }

            $row = getMessage($pdo, $messageId);
            if (!$row) {
                api_error('Unable to fetch created thread', 500);
            }
            api_ok(api_thread_detail($row));
        }

        // POST /api/threads/{id}/comments
        if ($method === 'POST' && count($parts) === 3 && $parts[0] === 'threads' && ctype_digit($parts[1]) && $parts[2] === 'comments') {
            api_require_auth();
            $payload = api_request_data();
            $messageId = (int)$parts[1];
            $body = (string)($payload['body'] ?? '');
            $nick = (string)($_SESSION['account']['display_name'] ?? 'Anon');
            $comment = addComment($pdo, $messageId, $nick, $body);
            if (!$comment) {
                api_error('Unable to save comment', 422);
            }
            api_ok(['comment' => api_comment_item($comment)]);
        }

        // POST /api/threads/{id}/vote
        if ($method === 'POST' && count($parts) === 3 && $parts[0] === 'threads' && ctype_digit($parts[1]) && $parts[2] === 'vote') {
            $payload = api_request_data();
            $type = ((string)($payload['type'] ?? 'up')) === 'down' ? 'down' : 'up';
            $threadId = (int)$parts[1];
            reactMessage($pdo, $threadId, $type);

            $stmt = $pdo->prepare('SELECT upvotes, downvotes FROM messages WHERE id = ?');
            $stmt->execute([$threadId]);
            $row = $stmt->fetch();
            if (!$row) {
                api_error('Thread not found', 404);
            }

            api_ok([
                'id' => $threadId,
                'upvotes' => (int)$row['upvotes'],
                'downvotes' => (int)$row['downvotes'],
            ]);
        }

        // POST /api/reports
        if ($method === 'POST' && $parts === ['reports']) {
            $payload = api_request_data();
            $targetType = (string)($payload['target_type'] ?? '');
            $targetId = (int)($payload['target_id'] ?? 0);
            $reason = (string)($payload['reason'] ?? 'other');
            $note = (string)($payload['note'] ?? '');
            $ok = submitReport($pdo, $targetType, $targetId, $reason, $note, (string)$_SESSION['author_token']);
            if (!$ok) {
                api_error('Unable to submit report', 422);
            }
            api_ok(['reported' => true]);
        }

        // GET /api/communities
        if ($method === 'GET' && $parts === ['communities']) {
            $limit = max(1, min(50, (int)($_GET['limit'] ?? 20)));
            $rows = listCommunities($pdo, $limit);
            api_ok(['communities' => array_values(array_map('api_community_card', $rows))]);
        }

        // GET /api/communities/{slug}
        if ($method === 'GET' && count($parts) === 2 && $parts[0] === 'communities') {
            $slug = strtolower(trim($parts[1]));
            $community = getCommunityBySlug($pdo, $slug);
            if (!$community) {
                api_error('Community not found', 404);
            }

            $sort = (string)($_GET['sort'] ?? 'top');
            $limit = max(1, min(50, (int)($_GET['limit'] ?? 20)));
            $page = max(1, (int)($_GET['page'] ?? 1));
            $offset = ($page - 1) * $limit;
            $total = countMessagesByCommunity($pdo, $slug);
            $rows = listMessagesByCommunity($pdo, $slug, '', $limit, $offset, $sort);

            api_ok([
                'community' => api_community_card($community),
                'threads' => array_values(array_map('api_thread_card', $rows)),
                'total' => $total,
            ]);
        }

        // GET /api/profile/me
        if ($method === 'GET' && $parts === ['profile', 'me']) {
            $accountId = api_require_auth();
            $account = getAccountById($pdo, $accountId);
            if (!$account) {
                api_error('Account not found', 404);
            }

            $stats = getAccountStats($pdo, $accountId);
            $posts = getRecentPostsByAccount($pdo, $accountId, 20);
            $comments = getRecentCommentsByAccount($pdo, $accountId, 20);

            api_ok([
                'profile' => api_profile_summary($account, $stats),
                'threads' => array_values(array_map('api_thread_card', $posts)),
                'comments' => array_values(array_map('api_comment_item', $comments)),
            ]);
        }

        // GET /api/profile/{id}
        if ($method === 'GET' && count($parts) === 2 && $parts[0] === 'profile' && ctype_digit($parts[1])) {
            $accountId = (int)$parts[1];
            $account = getPublicProfile($pdo, $accountId);
            if (!$account) {
                api_error('Profile not found', 404);
            }

            $stats = [
                'post_count' => (int)($account['post_count'] ?? 0),
                'comment_count' => (int)($account['comment_count'] ?? 0),
            ];
            $posts = getRecentPostsByAccount($pdo, $accountId, 20);
            $comments = getRecentCommentsByAccount($pdo, $accountId, 20);

            api_ok([
                'profile' => api_profile_summary($account, $stats),
                'threads' => array_values(array_map('api_thread_card', $posts)),
                'comments' => array_values(array_map('api_comment_item', $comments)),
            ]);
        }

        api_error('Not found', 404);
        break;
}
