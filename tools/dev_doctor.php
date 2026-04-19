<?php
declare(strict_types=1);

/**
 * Cave of Conspiracies — local dev doctor
 *
 * Checks PHP version, required extensions, DB connectivity, and table existence.
 * Run from CLI:  php tools/dev_doctor.php
 */

$pass = 0;
$fail = 0;

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

echo "=== Cave of Conspiracies — Dev Doctor ===\n\n";

// 1. PHP version
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
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    check("Connect to MySQL ({$dbHost}/{$dbName})", true);
} catch (PDOException $e) {
    check("Connect to MySQL ({$dbHost}/{$dbName})", false, $e->getMessage());
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
];

if ($pdo) {
    echo "\n--- Tables ---\n";
    foreach ($requiredTables as $table) {
        try {
            $stmt = $pdo->query("SELECT 1 FROM `{$table}` LIMIT 1");
            check("Table '{$table}' exists", true);
        } catch (PDOException $e) {
            check("Table '{$table}' exists", false, 'Run migrations in order');
        }
    }
}

// Summary
echo "\n=== Results: {$pass} passed, {$fail} failed ===\n";

if ($fail > 0) {
    echo "\nSee docs/developer-setup.md for setup instructions.\n";
    exit(1);
}

echo "\nAll checks passed. Ready to develop.\n";
exit(0);
