<?php
declare(strict_types=1);

/**
 * Cave of Conspiracies — local dev doctor
 *
 * Checks PHP version, required extensions, DB connectivity, all required
 * tables and columns, migration status, and env var hints.
 *
 * Run from CLI:  php tools/dev_doctor.php
 */

$pass = 0;
$fail = 0;
$warn = 0;

function check(string $label, bool $ok, string $detail = ''): void {
    global $pass, $fail;
    if ($ok) {
        $pass++;
        echo "  [PASS] {$label}\n";
    } else {
        $fail++;
        echo "  [FAIL] {$label}";
        if ($detail !== '') {
            echo " — {$detail}";
        }
        echo "\n";
    }
}

function warn(string $label, string $detail = ''): void {
    global $warn;
    $warn++;
    echo "  [WARN] {$label}";
    if ($detail !== '') {
        echo " — {$detail}";
    }
    echo "\n";
}

echo "=== Cave of Conspiracies — Dev Doctor ===\n\n";

// 1. PHP version
echo "--- PHP ---\n";
$phpVersion = PHP_VERSION;
$phpOk = version_compare($phpVersion, '8.2.0', '>=');
check("PHP >= 8.2 (found {$phpVersion})", $phpOk, 'Upgrade to PHP 8.2+');

// 2. pdo_mysql extension
$pdoMysql = extension_loaded('pdo_mysql');
check('pdo_mysql extension loaded', $pdoMysql, 'Enable pdo_mysql in php.ini');

// 3. DB connection
echo "\n--- Database ---\n";

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'playground';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

$pdo = null;
try {
    $pdo = new PDO(
        "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    check("Connect to MySQL ({$dbHost}/{$dbName})", true);
} catch (PDOException $e) {
    check("Connect to MySQL ({$dbHost}/{$dbName})", false, $e->getMessage());
    echo "\n  NOTE: If MySQL/phpMyAdmin is not loading at all, that is an\n";
    echo "  environment/XAMPP issue. Make sure MySQL is running in the\n";
    echo "  XAMPP Control Panel before re-running this check.\n";
}

// 4. Required tables
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

if ($pdo) {
    echo "\n--- Tables ---\n";

    // Gather existing tables in one query
    $stmt = $pdo->query('SHOW TABLES');
    $existing = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $existing[$row[0]] = true;
    }

    foreach ($requiredTables as $table) {
        $hint = 'Run: php tools/migrate.php';
        check("Table '{$table}' exists", isset($existing[$table]), $hint);
    }

    // 5. Required columns
    echo "\n--- Required columns ---\n";
    $requiredColumns = [
        'messages' => [
            'status'     => '2025_10_30_moderation.sql',
            'owner_token'=> '2025_10_27_messages.sql',
            'account_id' => '2025_10_31_accounts.sql',
        ],
        'comments' => [
            'status'     => '2025_10_30_moderation.sql',
            'account_id' => '2025_10_31_accounts.sql',
        ],
    ];

    foreach ($requiredColumns as $table => $columns) {
        if (!isset($existing[$table])) {
            continue;
        }
        $colStmt = $pdo->query("SHOW COLUMNS FROM `{$table}`");
        $existingCols = [];
        while ($col = $colStmt->fetch()) {
            $existingCols[$col['Field']] = true;
        }
        foreach ($columns as $colName => $migration) {
            check(
                "{$table}.{$colName} column exists",
                isset($existingCols[$colName]),
                "Run migration: {$migration}"
            );
        }
    }

    // 6. Migration runner status
    echo "\n--- Migration status ---\n";
    $hasTracker = isset($existing['schema_migrations']);
    if ($hasTracker) {
        $applied = $pdo->query('SELECT filename FROM schema_migrations ORDER BY filename')->fetchAll(PDO::FETCH_COLUMN);
        $migrationFiles = glob(__DIR__ . '/../migrations/*.sql');
        sort($migrationFiles, SORT_STRING);
        $allApplied = true;
        foreach ($migrationFiles as $fp) {
            $bn = basename($fp);
            $done = in_array($bn, $applied, true);
            check("Migration {$bn}", $done, 'Run: php tools/migrate.php');
            if (!$done) {
                $allApplied = false;
            }
        }
        if ($allApplied) {
            echo "  All migrations applied.\n";
        }
    } else {
        warn('schema_migrations table not found', 'Run: php tools/migrate.php (creates tracking table on first run)');
    }
}

// 7. Environment hints
echo "\n--- Environment ---\n";
$adminHash = getenv('ADMIN_PASSWORD_HASH');
check('ADMIN_PASSWORD_HASH set', $adminHash !== false && $adminHash !== '', 'Admin panel will be inaccessible without this');

$appEnv = getenv('APP_ENV') ?: 'development';
check("APP_ENV = {$appEnv}", true);
if ($appEnv !== 'production') {
    warn('APP_ENV is not production', 'Set APP_ENV=production before deploying publicly');
}

// 8. Summary
echo "\n=== Summary: {$pass} passed, {$fail} failed, {$warn} warnings ===\n";
if ($fail > 0) {
    echo "\nFix the failures above. Most can be resolved by running:\n";
    echo "  php tools/migrate.php\n\n";
}
exit($fail > 0 ? 1 : 0);
