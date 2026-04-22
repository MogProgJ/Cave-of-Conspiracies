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
require_once __DIR__ . '/../lib/api_helpers.php';
require_once __DIR__ . '/../lib/api_serializers.php';

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
        api_ok(api_session_state());
        break;

    default:
        api_error('Not found', 404);
        break;
}
