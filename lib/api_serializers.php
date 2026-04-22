<?php
/**
 * lib/api_serializers.php — Safe data shapes for the PHP API layer.
 *
 * These functions transform internal PHP/session/DB data into clean,
 * intentionally-shaped arrays suitable for JSON serialisation.
 * Never expose raw DB rows directly; always go through a serializer.
 */

declare(strict_types=1);

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
