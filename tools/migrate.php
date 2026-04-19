<?php
declare(strict_types=1);

/**
 * Cave of Conspiracies — Migration Runner
 *
 * Scans migrations/ in filename order, tracks applied migrations in
 * a `schema_migrations` table, and applies only pending ones.
 *
 * Usage:
 *   php tools/migrate.php              Apply pending migrations
 *   php tools/migrate.php --status     Show migration status only
 *   php tools/migrate.php --fresh      Drop tracking table and re-apply all (dev only)
 *
 * Uses the same DB env vars as config.php (DB_HOST, DB_NAME, DB_USER, DB_PASS).
 */

$migrationsDir = __DIR__ . '/../migrations';

// ── Database connection (mirrors config.php logic) ───────────────────
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbName = getenv('DB_NAME') ?: 'playground';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    fwrite(STDERR, "[FATAL] Cannot connect to MySQL ({$dbHost}/{$dbName}): " . $e->getMessage() . "\n");
    fwrite(STDERR, "Check that MySQL is running and DB_HOST/DB_NAME/DB_USER/DB_PASS are correct.\n");
    exit(1);
}

// ── Ensure tracking table ────────────────────────────────────────────
$pdo->exec('CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   VARCHAR(255) NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');

// ── Parse CLI flags ──────────────────────────────────────────────────
$args    = array_slice($argv ?? [], 1);
$statusOnly = in_array('--status', $args, true);
$fresh      = in_array('--fresh', $args, true);

if ($fresh) {
    $pdo->exec('DELETE FROM schema_migrations');
    echo "[INFO] Cleared migration tracking table (--fresh mode).\n\n";
}

// ── Gather migration files (sorted by filename) ──────────────────────
$files = glob($migrationsDir . '/*.sql');
if ($files === false || $files === []) {
    echo "[OK] No migration files found in migrations/.\n";
    exit(0);
}
sort($files, SORT_STRING);

// ── Gather already-applied migrations ────────────────────────────────
$applied = [];
$stmt = $pdo->query('SELECT filename FROM schema_migrations ORDER BY filename');
while ($row = $stmt->fetch()) {
    $applied[$row['filename']] = true;
}

// ── Show status / apply ──────────────────────────────────────────────
echo "=== Cave of Conspiracies — Migration Runner ===\n\n";
echo "Database: {$dbHost}/{$dbName}\n";
echo "Migrations directory: migrations/\n\n";

$pending = [];
foreach ($files as $filepath) {
    $basename = basename($filepath);
    $status   = isset($applied[$basename]) ? 'applied' : 'pending';
    $marker   = $status === 'applied' ? '[OK]' : '[--]';
    echo "  {$marker} {$basename}\n";
    if ($status === 'pending') {
        $pending[] = $filepath;
    }
}

echo "\n";

if ($statusOnly) {
    $n = count($pending);
    echo $n === 0
        ? "All migrations applied. Schema is up to date.\n"
        : "{$n} migration(s) pending. Run `php tools/migrate.php` to apply.\n";
    exit(0);
}

if ($pending === []) {
    echo "Nothing to apply. Schema is up to date.\n";
    exit(0);
}

echo "Applying " . count($pending) . " pending migration(s)...\n\n";

$errors = 0;
foreach ($pending as $filepath) {
    $basename = basename($filepath);
    $sql = file_get_contents($filepath);
    if ($sql === false) {
        fwrite(STDERR, "  [FAIL] {$basename} — cannot read file\n");
        $errors++;
        continue;
    }

    try {
        $pdo->exec($sql);
        $track = $pdo->prepare('INSERT IGNORE INTO schema_migrations (filename) VALUES (?)');
        $track->execute([$basename]);
        echo "  [DONE] {$basename}\n";
    } catch (PDOException $e) {
        fwrite(STDERR, "  [FAIL] {$basename} — " . $e->getMessage() . "\n");
        $errors++;
        // Continue to next migration; operator can fix and re-run.
    }
}

echo "\n";
if ($errors > 0) {
    fwrite(STDERR, "{$errors} migration(s) failed. Fix the errors above and re-run.\n");
    exit(1);
}
echo "All migrations applied successfully.\n";
exit(0);
