<?php
declare(strict_types=1);

// ── Helpers ──────────────────────────────────────────────────────────

/** SHA-256 hash an IP for privacy-conscious storage. */
function hashIp(string $ip): string {
  return hash('sha256', $ip);
}

/** Return hashed client IP using conservative header handling. */
function clientIpHash(): string {
  $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
  return hashIp($ip);
}

// ── Rate Limiting ────────────────────────────────────────────────────

function checkRateLimit(PDO $pdo, string $identifier, string $action, int $maxPerWindow = 10, int $windowSeconds = 600): bool {
  $stmt = $pdo->prepare(
    'SELECT COUNT(*) AS c FROM rate_limits
     WHERE identifier = :id AND action = :action
       AND created_at >= DATE_SUB(NOW(), INTERVAL :window SECOND)'
  );
  $stmt->execute([':id' => $identifier, ':action' => $action, ':window' => $windowSeconds]);
  return (int)$stmt->fetch()['c'] < $maxPerWindow;
}

function recordRateEvent(PDO $pdo, string $identifier, string $action): void {
  $stmt = $pdo->prepare('INSERT INTO rate_limits (identifier, action) VALUES (?, ?)');
  $stmt->execute([$identifier, $action]);
}

function pruneOldRateEvents(PDO $pdo, int $olderThanMinutes = 60): void {
  $pdo->prepare('DELETE FROM rate_limits WHERE created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)')
      ->execute([$olderThanMinutes]);
}

// ── Users ────────────────────────────────────────────────────────────

function findOrCreateUser(PDO $pdo, string $nickname): int {
  $nickname = trim($nickname) ?: 'Anon';
  $stmt = $pdo->prepare('SELECT id FROM users WHERE nickname = ?');
  $stmt->execute([$nickname]);
  $row = $stmt->fetch();
  if ($row) {
    return (int)$row['id'];
  }
  $stmt = $pdo->prepare('INSERT INTO users(nickname) VALUES (?)');
  $stmt->execute([$nickname]);
  return (int)$pdo->lastInsertId();
}

// ── User Activity ────────────────────────────────────────────────────

function recordUserActivity(PDO $pdo, int $userId, string $kind): void {
  if ($userId <= 0) {
    return;
  }
  $messages = $kind === 'message' ? 1 : 0;
  $comments = $kind === 'comment' ? 1 : 0;
  $sql = 'INSERT INTO user_activity (user_id, last_seen, messages, comments)
          VALUES (:user_id, NOW(), :messages, :comments)
          ON DUPLICATE KEY UPDATE
            last_seen = VALUES(last_seen),
            messages = messages + VALUES(messages),
            comments = comments + VALUES(comments)';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':user_id' => $userId,
    ':messages' => $messages,
    ':comments' => $comments,
  ]);
}

function ensureCommunity(PDO $pdo, string $slug, string $name = '', string $tagline = ''): int {
  $slug = strtolower(trim($slug));
  if ($slug === '') {
    return 0;
  }
  $stmt = $pdo->prepare('SELECT id FROM communities WHERE slug = ?');
  $stmt->execute([$slug]);
  $id = $stmt->fetchColumn();
  if ($id) {
    return (int)$id;
  }
  $name = $name !== '' ? $name : ucfirst($slug);
  $insert = $pdo->prepare('INSERT INTO communities(slug, name, tagline) VALUES (?, ?, ?)');
  $insert->execute([$slug, $name, $tagline]);
  return (int)$pdo->lastInsertId();
}

function assignMessageToCommunity(PDO $pdo, int $messageId, ?string $slug = null): void {
  if ($messageId <= 0) {
    return;
  }
  $slug = $slug !== null ? strtolower(trim($slug)) : 'general';
  if ($slug === '') {
    $slug = 'general';
  }
  $defaults = [
    'general' => ['General', 'Open discussion for any conspiracy angle.'],
    'deepstate' => ['Deep State', 'Shadow governments, cover-ups, geopolitics.'],
    'cryptids' => ['Cryptids', 'Strange creatures and unexplained sightings.'],
  ];
  $meta = $defaults[$slug] ?? [ucfirst($slug), ''];
  $communityId = ensureCommunity($pdo, $slug, $meta[0], $meta[1]);
  if ($communityId <= 0) {
    return;
  }
  $sql = 'INSERT INTO message_topics (message_id, community_id)
          VALUES (:message_id, :community_id)
          ON DUPLICATE KEY UPDATE community_id = VALUES(community_id)';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':message_id' => $messageId,
    ':community_id' => $communityId,
  ]);
  recordCommunityActivity($pdo, $communityId, 'message');
}

function findCommunityIdForMessage(PDO $pdo, int $messageId): ?int {
  if ($messageId <= 0) {
    return null;
  }
  $stmt = $pdo->prepare('SELECT community_id FROM message_topics WHERE message_id = ?');
  $stmt->execute([$messageId]);
  $id = $stmt->fetchColumn();
  return $id ? (int)$id : null;
}

function recordCommunityActivity(PDO $pdo, int $communityId, string $kind): void {
  if ($communityId <= 0) {
    return;
  }
  $posts = $kind === 'message' ? 1 : 0;
  $comments = $kind === 'comment' ? 1 : 0;
  $sql = 'INSERT INTO community_trends(community_id, day, posts, comments)
          VALUES (:community_id, CURRENT_DATE(), :posts, :comments)
          ON DUPLICATE KEY UPDATE
            posts = posts + VALUES(posts),
            comments = comments + VALUES(comments)';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':community_id' => $communityId,
    ':posts' => $posts,
    ':comments' => $comments,
  ]);
}

function addMessage(PDO $pdo, int $userId, string $body, ?string $communitySlug = null, string $ownerToken = '', ?int $accountId = null): ?int {
  $body = mb_substr(trim($body), 0, 240);
  if ($body === '') {
    return null;
  }
  $stmt = $pdo->prepare('INSERT INTO messages(user_id, body, owner_token, account_id) VALUES (?, ?, ?, ?)');
  $stmt->execute([$userId, $body, $ownerToken, $accountId]);
  $messageId = (int)$pdo->lastInsertId();
  recordUserActivity($pdo, $userId, 'message');
  assignMessageToCommunity($pdo, $messageId, $communitySlug);
  return $messageId;
}

function countMessages(PDO $pdo, string $q): int {
  $q = trim($q);
  if ($q === '') {
    return (int)$pdo->query("SELECT COUNT(*) AS c FROM messages WHERE status = 'visible'")->fetch()['c'];
  }
  $stmt = $pdo->prepare("SELECT COUNT(*) AS c FROM messages WHERE status = 'visible' AND body LIKE ?");
  $stmt->execute(['%' . $q . '%']);
  return (int)$stmt->fetch()['c'];
}

function deleteMessage(PDO $pdo, int $id, string $ownerToken = '', ?int $accountId = null): bool {
  if ($id <= 0) {
    return false;
  }
  // Account-based ownership (persistent)
  if ($accountId !== null && $accountId > 0) {
    $stmt = $pdo->prepare("UPDATE messages SET status = 'removed_by_owner' WHERE id = ? AND account_id = ? AND status = 'visible'");
    $stmt->execute([$id, $accountId]);
    if ($stmt->rowCount() > 0) {
      return true;
    }
  }
  // Session-token ownership (anonymous fallback)
  if ($ownerToken !== '') {
    $stmt = $pdo->prepare("UPDATE messages SET status = 'removed_by_owner' WHERE id = ? AND owner_token = ? AND status = 'visible'");
    $stmt->execute([$id, $ownerToken]);
    return $stmt->rowCount() > 0;
  }
  return false;
}

function reactMessage(PDO $pdo, int $id, string $type): void {
  if ($id <= 0) {
    return;
  }
  if ($type === 'up') {
    $pdo->prepare("UPDATE messages SET upvotes = upvotes + 1 WHERE id = ? AND status = 'visible'")->execute([$id]);
  }
  if ($type === 'down') {
    $pdo->prepare("UPDATE messages SET downvotes = downvotes + 1 WHERE id = ? AND status = 'visible'")->execute([$id]);
  }
}

function listMessages(PDO $pdo, string $q, int $limit, int $offset, string $sort = 'new'): array {
  $order = 'm.id DESC';
  if ($sort === 'old') {
    $order = 'm.id ASC';
  } elseif ($sort === 'top') {
    $order = ' (CAST(m.upvotes AS SIGNED) - CAST(m.downvotes AS SIGNED)) DESC, m.id DESC';
  }
  $base = "SELECT m.id, m.body, m.created_at, m.upvotes, m.downvotes, m.owner_token, m.account_id,
                  u.nickname,
                  c.name AS community_name, c.slug AS community_slug
           FROM messages m
           JOIN users u ON u.id = m.user_id
           LEFT JOIN message_topics mt ON mt.message_id = m.id
           LEFT JOIN communities c ON c.id = mt.community_id
           WHERE m.status = 'visible'";
  if (trim($q) === '') {
    $sql = $base . " ORDER BY $order LIMIT :limit OFFSET :offset";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();
    return hydrateComments($pdo, $rows);
  }
  $sql = $base . ' AND m.body LIKE :like ORDER BY ' . $order . ' LIMIT :limit OFFSET :offset';
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':like', '%' . trim($q) . '%', PDO::PARAM_STR);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();
  return hydrateComments($pdo, $rows);
}

function getMessage(PDO $pdo, int $id): ?array {
  $sql = "SELECT m.id, m.body, m.created_at, m.upvotes, m.downvotes, m.owner_token, m.account_id, m.status,
                 u.nickname,
                 c.name AS community_name, c.slug AS community_slug
          FROM messages m
          JOIN users u ON u.id = m.user_id
          LEFT JOIN message_topics mt ON mt.message_id = m.id
          LEFT JOIN communities c ON c.id = mt.community_id
          WHERE m.id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    return null;
  }
  $with = hydrateComments($pdo, [$row]);
  return $with[0] ?? $row;
}

function addComment(PDO $pdo, int $messageId, string $nickname, string $body): ?array {
  $messageId = max(0, $messageId);
  $body = mb_substr(trim($body), 0, 240);
  $nickname = mb_substr(trim($nickname), 0, 60) ?: 'Anon';
  if ($messageId === 0 || $body === '') {
    return null;
  }

  $stmt = $pdo->prepare("SELECT user_id FROM messages WHERE id = ? AND status = 'visible'");
  $stmt->execute([$messageId]);
  $messageOwner = $stmt->fetch();
  if (!$messageOwner) {
    return null;
  }

  $commenterId = findOrCreateUser($pdo, $nickname);
  recordUserActivity($pdo, $commenterId, 'comment');
  $communityId = findCommunityIdForMessage($pdo, $messageId);
  if ($communityId) {
    recordCommunityActivity($pdo, $communityId, 'comment');
  }

  $acctId = $_SESSION['account_id'] ?? null;
  $insert = $pdo->prepare('INSERT INTO comments(message_id, nickname, body, account_id) VALUES (?, ?, ?, ?)');
  $insert->execute([$messageId, $nickname, $body, $acctId]);
  $commentId = (int)$pdo->lastInsertId();

  return getComment($pdo, $commentId);
}

function getComment(PDO $pdo, int $id): ?array {
  $stmt = $pdo->prepare('SELECT id, message_id, nickname, body, created_at FROM comments WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch();
  if (!$row) {
    return null;
  }
  $row['id'] = (int)$row['id'];
  $row['message_id'] = (int)$row['message_id'];
  return $row;
}

function listCommentsForMessages(PDO $pdo, array $messageIds): array {
  $ids = array_values(array_unique(array_filter(array_map('intval', $messageIds), fn ($v) => $v > 0)));
  if (!$ids) {
    return [];
  }
  $placeholders = implode(',', array_fill(0, count($ids), '?'));
  $sql = "SELECT id, message_id, nickname, body, created_at
          FROM comments
          WHERE message_id IN ($placeholders) AND status = 'visible'
          ORDER BY created_at ASC, id ASC";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($ids);
  $grouped = [];
  while ($row = $stmt->fetch()) {
    $mid = (int)$row['message_id'];
    $grouped[$mid][] = [
      'id' => (int)$row['id'],
      'message_id' => $mid,
      'nickname' => $row['nickname'],
      'body' => $row['body'],
      'created_at' => $row['created_at'],
    ];
  }
  return $grouped;
}

function hydrateComments(PDO $pdo, array $messages): array {
  if (!$messages) {
    return [];
  }
  $ids = array_map(fn ($row) => (int)($row['id'] ?? 0), $messages);
  $comments = listCommentsForMessages($pdo, $ids);
  foreach ($messages as &$row) {
    $id = (int)($row['id'] ?? 0);
    $row['comments'] = $comments[$id] ?? [];
  }
  unset($row);
  return $messages;
}

function listCommunities(PDO $pdo, int $limit = 6): array {
  $sql = 'SELECT c.id, c.slug, c.name, c.tagline,
                 COALESCE(SUM(ct.posts), 0) AS posts_7d,
                 COALESCE(SUM(ct.comments), 0) AS comments_7d
          FROM communities c
          LEFT JOIN community_trends ct
            ON ct.community_id = c.id AND ct.day >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY)
          GROUP BY c.id, c.slug, c.name, c.tagline
          ORDER BY posts_7d DESC, comments_7d DESC, c.created_at DESC
          LIMIT :limit';
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();
  return array_map(static function ($row) {
    return [
      'slug' => $row['slug'],
      'name' => $row['name'],
      'tagline' => $row['tagline'],
      'posts_7d' => (int)$row['posts_7d'],
      'comments_7d' => (int)$row['comments_7d'],
    ];
  }, $rows ?: []);
}

function listActiveUsers(PDO $pdo, int $limit = 5): array {
  $sql = 'SELECT u.nickname, ua.messages, ua.comments, ua.last_seen
          FROM user_activity ua
          JOIN users u ON u.id = ua.user_id
          ORDER BY (ua.messages + ua.comments) DESC, ua.last_seen DESC
          LIMIT :limit';
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->execute();
  $rows = $stmt->fetchAll();
  return array_map(static function ($row) {
    return [
      'nickname' => $row['nickname'],
      'messages' => (int)$row['messages'],
      'comments' => (int)$row['comments'],
      'last_seen' => $row['last_seen'],
    ];
  }, $rows ?: []);
}

// ── Reporting ────────────────────────────────────────────────────────

function submitReport(PDO $pdo, string $targetType, int $targetId, string $reason, string $note, string $sessionToken): bool {
  $allowed = ['message', 'comment'];
  if (!in_array($targetType, $allowed, true) || $targetId <= 0) {
    return false;
  }
  $allowedReasons = ['spam', 'abuse', 'illegal', 'misinfo', 'other'];
  if (!in_array($reason, $allowedReasons, true)) {
    return false;
  }
  $note = mb_substr(trim($note), 0, 500);
  $ipHash = clientIpHash();
  $stmt = $pdo->prepare(
    'INSERT INTO reports(target_type, target_id, reason, note, ip_hash, session_token)
     VALUES (?, ?, ?, ?, ?, ?)'
  );
  $stmt->execute([$targetType, $targetId, $reason, $note, $ipHash, $sessionToken]);
  return true;
}

function listReports(PDO $pdo, string $status = 'open', int $limit = 50, int $offset = 0): array {
  $sql = 'SELECT r.*, 
                 CASE r.target_type
                   WHEN \'message\' THEN (SELECT body FROM messages WHERE id = r.target_id)
                   WHEN \'comment\' THEN (SELECT body FROM comments WHERE id = r.target_id)
                 END AS target_body
          FROM reports r
          WHERE r.status = :status
          ORDER BY r.created_at DESC
          LIMIT :limit OFFSET :offset';
  $stmt = $pdo->prepare($sql);
  $stmt->bindValue(':status', $status, PDO::PARAM_STR);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  return $stmt->fetchAll();
}

function countReports(PDO $pdo, string $status = 'open'): int {
  $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM reports WHERE status = ?');
  $stmt->execute([$status]);
  return (int)$stmt->fetch()['c'];
}

// ── Moderation ───────────────────────────────────────────────────────

function moderateContent(PDO $pdo, string $targetType, int $targetId, string $newStatus, string $adminReason = ''): bool {
  $allowedTypes = ['message', 'comment'];
  $allowedStatuses = ['visible', 'hidden', 'removed_by_mod'];
  if (!in_array($targetType, $allowedTypes, true) || !in_array($newStatus, $allowedStatuses, true)) {
    return false;
  }
  $table = $targetType === 'message' ? 'messages' : 'comments';
  $stmt = $pdo->prepare("UPDATE $table SET status = ? WHERE id = ?");
  $stmt->execute([$newStatus, $targetId]);
  if ($stmt->rowCount() > 0) {
    $action = match ($newStatus) {
      'hidden' => 'hide',
      'removed_by_mod' => 'remove',
      'visible' => 'restore',
    };
    logModerationAction($pdo, $targetType, $targetId, $action, $adminReason);
    return true;
  }
  return false;
}

function resolveReport(PDO $pdo, int $reportId, string $newStatus): bool {
  $allowed = ['reviewed', 'dismissed'];
  if (!in_array($newStatus, $allowed, true)) {
    return false;
  }
  $stmt = $pdo->prepare('UPDATE reports SET status = ? WHERE id = ?');
  $stmt->execute([$newStatus, $reportId]);
  return $stmt->rowCount() > 0;
}

function logModerationAction(PDO $pdo, string $targetType, int $targetId, string $action, string $reason): void {
  $stmt = $pdo->prepare(
    'INSERT INTO moderation_log(target_type, target_id, action, reason, admin_ip_hash)
     VALUES (?, ?, ?, ?, ?)'
  );
  $stmt->execute([$targetType, $targetId, $action, mb_substr(trim($reason), 0, 500), clientIpHash()]);
}

function getMessageForAdmin(PDO $pdo, int $id): ?array {
  $sql = "SELECT m.id, m.body, m.created_at, m.upvotes, m.downvotes, m.owner_token, m.status,
                 u.nickname
          FROM messages m
          JOIN users u ON u.id = m.user_id
          WHERE m.id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$id]);
  return $stmt->fetch() ?: null;
}

function getCommentForAdmin(PDO $pdo, int $id): ?array {
  $sql = "SELECT id, message_id, nickname, body, created_at, status FROM comments WHERE id = ?";
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$id]);
  return $stmt->fetch() ?: null;
}

// ── Accounts ─────────────────────────────────────────────────────────

function registerAccount(PDO $pdo, string $email, string $password, string $displayName): ?int {
  $email = strtolower(trim($email));
  $displayName = mb_substr(trim($displayName), 0, 60);
  if ($email === '' || $displayName === '' || mb_strlen($password) < 8) {
    return null;
  }
  // Check uniqueness
  $stmt = $pdo->prepare('SELECT id FROM accounts WHERE email = ?');
  $stmt->execute([$email]);
  if ($stmt->fetch()) {
    return null; // email already taken
  }
  $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
  $stmt = $pdo->prepare('INSERT INTO accounts(email, password_hash, display_name) VALUES (?, ?, ?)');
  $stmt->execute([$email, $hash, $displayName]);
  return (int)$pdo->lastInsertId();
}

function authenticateAccount(PDO $pdo, string $email, string $password): ?array {
  $email = strtolower(trim($email));
  $stmt = $pdo->prepare('SELECT id, email, password_hash, display_name, bio, role FROM accounts WHERE email = ?');
  $stmt->execute([$email]);
  $row = $stmt->fetch();
  if (!$row || !password_verify($password, $row['password_hash'])) {
    return null;
  }
  unset($row['password_hash']);
  return $row;
}

function getAccountById(PDO $pdo, int $id): ?array {
  $stmt = $pdo->prepare('SELECT id, email, display_name, bio, role, created_at FROM accounts WHERE id = ?');
  $stmt->execute([$id]);
  return $stmt->fetch() ?: null;
}

function getPublicProfile(PDO $pdo, int $accountId): ?array {
  $stmt = $pdo->prepare('SELECT id, display_name, bio, created_at FROM accounts WHERE id = ?');
  $stmt->execute([$accountId]);
  $account = $stmt->fetch();
  if (!$account) {
    return null;
  }
  // Count posts
  $stmt = $pdo->prepare("SELECT COUNT(*) AS c FROM messages WHERE account_id = ? AND status = 'visible'");
  $stmt->execute([$accountId]);
  $account['post_count'] = (int)$stmt->fetch()['c'];
  // Count comments
  $stmt = $pdo->prepare("SELECT COUNT(*) AS c FROM comments WHERE account_id = ? AND status = 'visible'");
  $stmt->execute([$accountId]);
  $account['comment_count'] = (int)$stmt->fetch()['c'];
  return $account;
}

function getRecentCommentsByAccount(PDO $pdo, int $accountId, int $limit = 10): array {
  $stmt = $pdo->prepare(
    "SELECT c.id, c.body, c.created_at, c.message_id,
            m.body AS message_body
     FROM comments c
     LEFT JOIN messages m ON m.id = c.message_id
     WHERE c.account_id = ? AND c.status = 'visible'
     ORDER BY c.created_at DESC
     LIMIT ?"
  );
  $stmt->execute([$accountId, $limit]);
  return $stmt->fetchAll();
}

function getRecentPostsByAccount(PDO $pdo, int $accountId, int $limit = 10): array {
  $stmt = $pdo->prepare(
    "SELECT m.id, m.body, m.created_at, m.upvotes, m.downvotes,
            u.nickname, c.name AS community_name, c.slug AS community_slug
     FROM messages m
     JOIN users u ON u.id = m.user_id
     LEFT JOIN message_topics mt ON mt.message_id = m.id
     LEFT JOIN communities c ON c.id = mt.community_id
     WHERE m.account_id = ? AND m.status = 'visible'
     ORDER BY m.created_at DESC
     LIMIT ?"
  );
  $stmt->execute([$accountId, $limit]);
  return $stmt->fetchAll();
}

function updateAccountProfile(PDO $pdo, int $accountId, string $displayName, string $bio): bool {
  $displayName = mb_substr(trim($displayName), 0, 60);
  $bio = mb_substr(trim($bio), 0, 500);
  if ($displayName === '') {
    return false;
  }
  $stmt = $pdo->prepare('UPDATE accounts SET display_name = ?, bio = ? WHERE id = ?');
  $stmt->execute([$displayName, $bio, $accountId]);
  return $stmt->rowCount() >= 0; // 0 rows is OK if nothing changed
}

function updateAccountPassword(PDO $pdo, int $accountId, string $currentPassword, string $newPassword): bool {
  if (mb_strlen($newPassword) < 8) {
    return false;
  }
  $stmt = $pdo->prepare('SELECT password_hash FROM accounts WHERE id = ?');
  $stmt->execute([$accountId]);
  $row = $stmt->fetch();
  if (!$row || !password_verify($currentPassword, $row['password_hash'])) {
    return false;
  }
  $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
  $stmt = $pdo->prepare('UPDATE accounts SET password_hash = ? WHERE id = ?');
  $stmt->execute([$hash, $accountId]);
  return true;
}

function isEmailTaken(PDO $pdo, string $email): bool {
  $stmt = $pdo->prepare('SELECT 1 FROM accounts WHERE email = ?');
  $stmt->execute([strtolower(trim($email))]);
  return (bool)$stmt->fetch();
}
