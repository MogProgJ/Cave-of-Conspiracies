<?php
declare(strict_types=1);

// ── Environment ──────────────────────────────────────────────────────
$APP_ENV = getenv('APP_ENV') ?: 'development';

if ($APP_ENV === 'production') {
  ini_set('display_errors', '0');
  ini_set('log_errors', '1');
  error_reporting(E_ALL);
} else {
  ini_set('display_errors', '1');
  error_reporting(E_ALL);
}

// ── Database ─────────────────────────────────────────────────────────
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_NAME = getenv('DB_NAME') ?: 'playground';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

$pdo = null;
$DB_ERROR = null;
try {
    $pdo = new PDO(
      "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
      $DB_USER,
      $DB_PASS,
      [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      ]
    );
} catch (PDOException $e) {
    $DB_ERROR = $e->getMessage();
}

// ── Admin auth ───────────────────────────────────────────────────────
$ADMIN_PASSWORD_HASH = getenv('ADMIN_PASSWORD_HASH') ?: '';

// ── Rate-limit config (per 10 minutes) ──────────────────────────────
$RATE_LIMIT_POSTS    = (int)(getenv('RATE_LIMIT_POSTS_PER_10M')    ?: 10);
$RATE_LIMIT_COMMENTS = (int)(getenv('RATE_LIMIT_COMMENTS_PER_10M') ?: 30);
$RATE_LIMIT_REPORTS  = (int)(getenv('RATE_LIMIT_REPORTS_PER_10M')  ?: 5);
$RATE_LIMIT_VOTES    = (int)(getenv('RATE_LIMIT_VOTES_PER_10M')    ?: 60);
