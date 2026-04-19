<?php
declare(strict_types=1);
ini_set('display_errors', '1');
error_reporting(E_ALL);

session_start();

require __DIR__ . '/config.php';
require __DIR__ . '/lib/db.php';
require __DIR__ . '/lib/utils.php';

// -- Anonymous ownership token (stable per session) --
if (empty($_SESSION['author_token'])) {
    $_SESSION['author_token'] = bin2hex(random_bytes(32));
}
$authorToken = $_SESSION['author_token'];

// Ensure the primary community exists so UI lists never come back empty.
ensureCommunity($pdo, 'general', 'General', 'Open discussion for any conspiracy angle.');

/** Safe PRG (redirect only after non-AJAX POST) */
function prg_redirect(): void {
    $xhr = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '');
    if ($xhr) {
        return;
    }
    $base = rtrim(dirname($_SERVER['PHP_SELF'] ?? '/'), '/\\');
    if ($base === '' || $base === '.') {
        $base = '';
    }
    $home = $base . '/';
    $qs   = $_GET;
    $target = $home . ($qs ? ('?' . http_build_query($qs)) : '');
    header('Location: ' . $target, true, 303);
    exit;
}

// -- Simple page router --
$pageName = $_GET['page'] ?? '';
if (in_array($pageName, ['about', 'creator', 'links', 'privacy'], true)) {
    render($pageName, []);
    exit;
}

// -- POST actions --
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $csrf = $_POST['csrf'] ?? '';
    if (!csrf_verify($csrf)) {
        http_response_code(403);
        $xhr = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '');
        if ($xhr) {
            header('Content-Type: application/json');
            echo json_encode(['ok' => false, 'error' => 'Invalid CSRF token']);
        } else {
            echo 'Invalid CSRF token';
        }
        exit;
    }

    $action = $_POST['action'] ?? null;
    $xhr    = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '');

    // -- Create post --
    if ($action === 'add') {
        $nick          = $_POST['nick'] ?? 'Anon';
        $msg           = $_POST['msg'] ?? '';
        $communitySlug = $_POST['community'] ?? null;
        $uid           = findOrCreateUser($pdo, $nick);
        $messageId     = addMessage($pdo, $uid, $msg, $communitySlug, $authorToken);

        if ($xhr) {
            header('Content-Type: application/json');
            if ($messageId) {
                $row = getMessage($pdo, $messageId);
                if ($row) {
                    $row['is_owner'] = true;
                    unset($row['owner_token']);
                }
                echo json_encode(['ok' => true, 'message' => $row]);
            } else {
                http_response_code(422);
                echo json_encode(['ok' => false, 'error' => 'Unable to save message.']);
            }
            exit;
        }

        if ($messageId) {
            $_SESSION['flash'] = 'Posted!';
            prg_redirect();
        }
        http_response_code(400);
        exit('Unable to save message.');

    // -- Comment --
    } elseif ($action === 'comment') {
        $messageId = (int)($_POST['message_id'] ?? 0);
        $nick      = $_POST['nick'] ?? 'Anon';
        $body      = $_POST['body'] ?? '';
        $comment   = addComment($pdo, $messageId, $nick, $body);

        if ($xhr) {
            header('Content-Type: application/json');
            if ($comment) {
                echo json_encode(['ok' => true, 'comment' => $comment]);
            } else {
                http_response_code(422);
                echo json_encode(['ok' => false, 'error' => 'Unable to save comment.']);
            }
            exit;
        }

        if ($comment) {
            prg_redirect();
        }
        http_response_code(400);
        exit('Unable to save comment.');

    // -- Delete (ownership-aware) --
    } elseif ($action === 'delete') {
        $id      = (int)($_POST['id'] ?? 0);
        $deleted = deleteMessage($pdo, $id, $authorToken);

        if ($xhr) {
            header('Content-Type: application/json');
            if ($deleted) {
                echo json_encode(['ok' => true, 'deleted' => $id]);
            } else {
                http_response_code(403);
                echo json_encode(['ok' => false, 'error' => 'You can only delete your own posts.']);
            }
            exit;
        }

        if (!$deleted) {
            $_SESSION['flash'] = 'You can only delete your own posts.';
        }
        prg_redirect();

    // -- Vote --
    } elseif ($action === 'react') {
        $id   = (int)($_POST['id'] ?? 0);
        $type = $_POST['type'] ?? 'up';
        reactMessage($pdo, $id, $type === 'down' ? 'down' : 'up');

        if ($xhr) {
            $stmt = $pdo->prepare('SELECT upvotes, downvotes FROM messages WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch() ?: ['upvotes' => 0, 'downvotes' => 0];
            header('Content-Type: application/json');
            echo json_encode([
                'ok'        => true,
                'id'        => $id,
                'upvotes'   => (int)$row['upvotes'],
                'downvotes' => (int)$row['downvotes'],
            ]);
            exit;
        }
        prg_redirect();

    } else {
        prg_redirect();
    }
}

// -- GET render --
$q    = trim($_GET['q'] ?? '');
$sort = $_GET['sort'] ?? 'new';
$page = max(1, (int)($_GET['page'] ?? 1));
$size = 10;

$total  = countMessages($pdo, $q);
$pages  = max(1, (int)ceil($total / $size));
$page   = min($page, $pages);
$offset = ($page - 1) * $size;

$messages    = listMessages($pdo, $q, $size, $offset, $sort);
$communities = listCommunities($pdo, 8);
$activeUsers = listActiveUsers($pdo, 6);

// Flash message
$flash = $_SESSION['flash'] ?? null;
$_SESSION['flash'] = null;

render('home', compact('messages', 'q', 'page', 'pages', 'total', 'sort', 'communities', 'activeUsers', 'flash'));
