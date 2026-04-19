<?php
declare(strict_types=1);

function render(string $view, array $data = []): void {
  // Explicit variable assignment — avoids extract() injection risk
  foreach ($data as $__key => $__val) {
    $$__key = $__val;
  }
  unset($__key, $__val);
  include __DIR__ . "/../views/{$view}.php";
}

function csrf_token(): string {
  if (session_status() !== PHP_SESSION_ACTIVE) session_start();
  if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
  }
  return $_SESSION['csrf'];
}

function csrf_field(): string {
  return '<input type="hidden" name="csrf" value="'.htmlspecialchars(csrf_token()).'">';
}

function csrf_verify(string $token): bool {
  if (session_status() !== PHP_SESSION_ACTIVE) session_start();
  return hash_equals($_SESSION['csrf'] ?? '', $token);
}
