<?php
declare(strict_types=1);

/**
 * Schema compatibility check.
 *
 * Returns an array of human-readable error strings.
 * Empty array = schema is compatible with current code.
 *
 * This runs bounded queries (SHOW TABLES / SHOW COLUMNS) rather than
 * a full information_schema crawl, so it stays fast.
 */
function checkSchemaCompatibility(PDO $pdo): array {
    $errors = [];

    // ── Required tables ──────────────────────────────────────────────
    $requiredTables = [
        'messages',
        'users',
        'comments',
        'communities',
        'message_topics',
        'community_trends',
        'user_activity',
        'reports',
        'moderation_log',
        'rate_limits',
        'accounts',
    ];

    $stmt = $pdo->query('SHOW TABLES');
    $existing = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $existing[$row[0]] = true;
    }

    foreach ($requiredTables as $table) {
        if (!isset($existing[$table])) {
            $errors[] = "Missing table: {$table}";
        }
    }

    // ── Required columns (only check if parent table exists) ─────────
    $requiredColumns = [
        'messages' => ['status', 'account_id', 'owner_token'],
        'comments' => ['status', 'account_id'],
    ];

    foreach ($requiredColumns as $table => $columns) {
        if (!isset($existing[$table])) {
            continue; // Already reported as missing table
        }
        try {
            $colStmt = $pdo->query("SHOW COLUMNS FROM `{$table}`");
            $existingCols = [];
            while ($col = $colStmt->fetch()) {
                $existingCols[$col['Field']] = true;
            }
            foreach ($columns as $colName) {
                if (!isset($existingCols[$colName])) {
                    $errors[] = "Missing column: {$table}.{$colName}";
                }
            }
        } catch (PDOException $e) {
            $errors[] = "Cannot inspect columns on {$table}: " . $e->getMessage();
        }
    }

    return $errors;
}
