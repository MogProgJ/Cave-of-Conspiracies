<?php
/**
 * lib/api_helpers.php — JSON response primitives for the PHP API layer.
 *
 * These functions are the only way API endpoints should return data.
 * They set the HTTP status code, emit JSON, and exit.
 */

declare(strict_types=1);

/**
 * Send a 200 JSON success envelope and exit.
 *
 * @param array<string, mixed> $data  Payload to wrap.
 */
function api_ok(array $data): never {
    http_response_code(200);
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send a JSON error envelope with the given HTTP status and exit.
 *
 * @param string $message  Human-readable error description.
 * @param int    $status   HTTP status code (default 400).
 */
function api_error(string $message, int $status = 400): never {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Abort with 405 if the request method is not the expected one.
 *
 * @param string|string[] $allowed  One method or array of allowed methods.
 */
function api_require_method(string|array $allowed): void {
    $allowed  = array_map('strtoupper', (array) $allowed);
    $actual   = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($actual, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        api_error('Method not allowed', 405);
    }
}

/**
 * Abort with 401 if there is no active account session.
 * Returns the account_id so callers can use it immediately.
 */
function api_require_auth(): int {
    $id = $_SESSION['account_id'] ?? null;
    if (!$id) {
        api_error('Authentication required', 401);
    }
    return (int) $id;
}

/**
 * Abort with 403 when the current session is not admin-authorized.
 */
function api_require_admin(): void {
    if (empty($_SESSION['is_admin'])) {
        api_error('Admin privileges required', 403);
    }
}

/**
 * Read request data from JSON body or traditional form POST.
 *
 * @return array<string, mixed>
 */
function api_request_data(): array {
    if (!empty($_POST)) {
        return $_POST;
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        api_error('Invalid JSON payload', 422);
    }

    return $decoded;
}
