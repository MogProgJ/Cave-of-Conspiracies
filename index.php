<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

// ── Session bootstrap (before session_start) ────────────────────────
$isSecure = ($APP_ENV === 'production') || (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
ini_set('session.use_strict_mode', '1');
session_set_cookie_params([
    'httponly'  => true,
    'samesite'  => 'Strict',
    'secure'    => $isSecure,
]);
session_start();

require __DIR__ . '/lib/db.php';
require __DIR__ . '/lib/utils.php';

// -- Anonymous ownership token (stable per session) --
if (empty($_SESSION['author_token'])) {
    $_SESSION['author_token'] = bin2hex(random_bytes(32));
}
$authorToken = $_SESSION['author_token'];

// -- Logged-in account (null when anonymous) --
$currentAccount = $_SESSION['account'] ?? null;
$currentAccountId = $_SESSION['account_id'] ?? null;

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

// -- Auth pages --
if ($pageName === 'register') {
    if ($currentAccountId) {
        header('Location: /', true, 303);
        exit;
    }
    render('register', []);
    exit;
}
if ($pageName === 'login') {
    if ($currentAccountId) {
        header('Location: /', true, 303);
        exit;
    }
    render('login', []);
    exit;
}

// -- Profile page (own) --
if ($pageName === 'profile') {
    if (!$currentAccountId) {
        $_SESSION['flash'] = 'Please log in to view your profile.';
        header('Location: ?page=login', true, 303);
        exit;
    }
    $profileAccount = getAccountById($pdo, $currentAccountId);
    $profilePosts   = getRecentPostsByAccount($pdo, $currentAccountId, 20);
    render('profile', [
        'account'   => $profileAccount,
        'posts'     => $profilePosts,
        'is_own'    => true,
    ]);
    exit;
}

// -- Public user profile --
if ($pageName === 'user') {
    $userId = (int)($_GET['id'] ?? 0);
    if ($userId <= 0) {
        http_response_code(404);
        render('404', []);
        exit;
    }
    $profileData = getPublicProfile($pdo, $userId);
    if (!$profileData) {
        http_response_code(404);
        render('404', []);
        exit;
    }
    $profilePosts = getRecentPostsByAccount($pdo, $userId, 20);
    render('profile', [
        'account'   => $profileData,
        'posts'     => $profilePosts,
        'is_own'    => ($currentAccountId === $userId),
    ]);
    exit;
}

// -- Admin page --
if ($pageName === 'admin') {
    $isAdmin = !empty($_SESSION['is_admin']);
    if (!$isAdmin) {
        render('admin', ['logged_in' => false]);
        exit;
    }
    $reportStatus = $_GET['report_status'] ?? 'open';
    $reports = listReports($pdo, $reportStatus);
    $openCount = countReports($pdo, 'open');
    render('admin', [
        'logged_in' => true,
        'reports' => $reports,
        'report_status' => $reportStatus,
        'open_count' => $openCount,
    ]);
    exit;
}

// -- Unknown page → 404 --
if ($pageName !== '' && $pageName !== 'home') {
    http_response_code(404);
    render('404', []);
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

    /** Check rate limit; abort with 429 if exceeded. */
    $rateLimitMap = [
        'add'     => ['post',    $RATE_LIMIT_POSTS],
        'comment' => ['comment', $RATE_LIMIT_COMMENTS],
        'react'   => ['vote',    $RATE_LIMIT_VOTES],
        'report'  => ['report',  $RATE_LIMIT_REPORTS],
    ];
    if (isset($rateLimitMap[$action])) {
        [$rlAction, $rlMax] = $rateLimitMap[$action];
        if (checkRateLimit($pdo, clientIpHash(), $rlAction, $rlMax, 600)) {
            recordRateEvent($pdo, clientIpHash(), $rlAction);
        } else {
            http_response_code(429);
            if ($xhr) {
                header('Content-Type: application/json');
                echo json_encode(['ok' => false, 'error' => 'Rate limit exceeded. Please slow down.']);
            } else {
                echo 'Rate limit exceeded. Please slow down.';
            }
            exit;
        }
    }

    // -- Create post --
    if ($action === 'add') {
        $nick          = $currentAccount ? $currentAccount['display_name'] : ($_POST['nick'] ?? 'Anon');
        $msg           = $_POST['msg'] ?? '';
        $communitySlug = $_POST['community'] ?? null;
        $uid           = findOrCreateUser($pdo, $nick);
        $messageId     = addMessage($pdo, $uid, $msg, $communitySlug, $authorToken, $currentAccountId);

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
        $deleted = deleteMessage($pdo, $id, $authorToken, $currentAccountId);

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

    // -- Report content --
    } elseif ($action === 'report') {
        $targetType = $_POST['target_type'] ?? '';
        $targetId   = (int)($_POST['target_id'] ?? 0);
        $reason     = $_POST['reason'] ?? '';
        $note       = $_POST['note'] ?? '';
        $ok = submitReport($pdo, $targetType, $targetId, $reason, $note, $authorToken);

        if ($xhr) {
            header('Content-Type: application/json');
            if ($ok) {
                echo json_encode(['ok' => true]);
            } else {
                http_response_code(422);
                echo json_encode(['ok' => false, 'error' => 'Unable to submit report.']);
            }
            exit;
        }
        if ($ok) {
            $_SESSION['flash'] = 'Report submitted. Thank you.';
        }
        prg_redirect();

    // -- Admin login --
    } elseif ($action === 'admin_login') {
        $password = $_POST['password'] ?? '';
        if ($ADMIN_PASSWORD_HASH !== '' && password_verify($password, $ADMIN_PASSWORD_HASH)) {
            $_SESSION['is_admin'] = true;
            $_SESSION['flash'] = 'Logged in as admin.';
        } else {
            $_SESSION['flash'] = 'Invalid admin password.';
        }
        header('Location: ?page=admin', true, 303);
        exit;

    // -- Admin logout --
    } elseif ($action === 'admin_logout') {
        unset($_SESSION['is_admin']);
        $_SESSION['flash'] = 'Logged out.';
        header('Location: ?page=admin', true, 303);
        exit;

    // -- Admin moderation action --
    } elseif ($action === 'mod_action') {
        if (empty($_SESSION['is_admin'])) {
            http_response_code(403);
            echo 'Forbidden';
            exit;
        }
        $targetType = $_POST['target_type'] ?? '';
        $targetId   = (int)($_POST['target_id'] ?? 0);
        $modAction  = $_POST['mod_action'] ?? '';
        $reason     = $_POST['reason'] ?? '';
        $reportId   = (int)($_POST['report_id'] ?? 0);

        if ($modAction === 'dismiss' && $reportId > 0) {
            resolveReport($pdo, $reportId, 'dismissed');
            logModerationAction($pdo, $targetType, $targetId, 'dismiss_report', $reason);
        } else {
            $statusMap = ['hide' => 'hidden', 'remove' => 'removed_by_mod', 'restore' => 'visible'];
            $newStatus = $statusMap[$modAction] ?? '';
            if ($newStatus !== '') {
                moderateContent($pdo, $targetType, $targetId, $newStatus, $reason);
                if ($reportId > 0) {
                    resolveReport($pdo, $reportId, 'reviewed');
                }
            }
        }

        $_SESSION['flash'] = 'Moderation action applied.';
        header('Location: ?page=admin', true, 303);
        exit;

    // -- Register account --
    } elseif ($action === 'register') {
        $email       = $_POST['email'] ?? '';
        $password    = $_POST['password'] ?? '';
        $confirm     = $_POST['password_confirm'] ?? '';
        $displayName = $_POST['display_name'] ?? '';

        if ($password !== $confirm) {
            $_SESSION['flash'] = 'Passwords do not match.';
            header('Location: ?page=register', true, 303);
            exit;
        }
        if (mb_strlen($password) < 8) {
            $_SESSION['flash'] = 'Password must be at least 8 characters.';
            header('Location: ?page=register', true, 303);
            exit;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['flash'] = 'Invalid email address.';
            header('Location: ?page=register', true, 303);
            exit;
        }
        if (mb_strlen(trim($displayName)) < 1 || mb_strlen(trim($displayName)) > 60) {
            $_SESSION['flash'] = 'Display name is required (max 60 chars).';
            header('Location: ?page=register', true, 303);
            exit;
        }

        $accountId = registerAccount($pdo, $email, $password, $displayName);
        if (!$accountId) {
            $_SESSION['flash'] = 'Email is already registered.';
            header('Location: ?page=register', true, 303);
            exit;
        }

        // Auto-login after registration
        session_regenerate_id(true);
        $_SESSION['account_id'] = $accountId;
        $_SESSION['account']    = [
            'display_name' => trim($displayName),
            'role'         => 'user',
        ];
        $_SESSION['flash'] = 'Welcome to the Cave, ' . htmlspecialchars(trim($displayName)) . '!';
        header('Location: /', true, 303);
        exit;

    // -- Login --
    } elseif ($action === 'login') {
        $email    = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $account  = authenticateAccount($pdo, $email, $password);

        if (!$account) {
            $_SESSION['flash'] = 'Invalid email or password.';
            header('Location: ?page=login', true, 303);
            exit;
        }

        session_regenerate_id(true);
        $_SESSION['account_id'] = (int)$account['id'];
        $_SESSION['account']    = [
            'display_name' => $account['display_name'],
            'role'         => $account['role'],
        ];
        // Promote to admin session if account role is admin
        if ($account['role'] === 'admin') {
            $_SESSION['is_admin'] = true;
        }
        $_SESSION['flash'] = 'Welcome back, ' . htmlspecialchars($account['display_name']) . '!';
        header('Location: /', true, 303);
        exit;

    // -- Logout --
    } elseif ($action === 'logout') {
        unset($_SESSION['account_id'], $_SESSION['account'], $_SESSION['is_admin']);
        session_regenerate_id(true);
        $_SESSION['flash'] = 'You have been logged out.';
        header('Location: /', true, 303);
        exit;

    // -- Update profile --
    } elseif ($action === 'update_profile') {
        if (!$currentAccountId) {
            http_response_code(403);
            echo 'Not logged in';
            exit;
        }
        $displayName = $_POST['display_name'] ?? '';
        $bio         = $_POST['bio'] ?? '';
        $updated = updateAccountProfile($pdo, $currentAccountId, $displayName, $bio);
        if ($updated) {
            $_SESSION['account']['display_name'] = mb_substr(trim($displayName), 0, 60);
            $_SESSION['flash'] = 'Profile updated.';
        } else {
            $_SESSION['flash'] = 'Display name is required.';
        }
        header('Location: ?page=profile', true, 303);
        exit;

    // -- Change password --
    } elseif ($action === 'change_password') {
        if (!$currentAccountId) {
            http_response_code(403);
            echo 'Not logged in';
            exit;
        }
        $currentPw = $_POST['current_password'] ?? '';
        $newPw     = $_POST['new_password'] ?? '';
        $confirmPw = $_POST['new_password_confirm'] ?? '';
        if ($newPw !== $confirmPw) {
            $_SESSION['flash'] = 'New passwords do not match.';
            header('Location: ?page=profile', true, 303);
            exit;
        }
        if (updateAccountPassword($pdo, $currentAccountId, $currentPw, $newPw)) {
            $_SESSION['flash'] = 'Password changed.';
        } else {
            $_SESSION['flash'] = 'Current password is incorrect or new password is too short (min 8 chars).';
        }
        header('Location: ?page=profile', true, 303);
        exit;

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
$isAdmin = !empty($_SESSION['is_admin']);

render('home', compact('messages', 'q', 'page', 'pages', 'total', 'sort', 'communities', 'activeUsers', 'flash', 'isAdmin', 'currentAccount', 'currentAccountId'));
