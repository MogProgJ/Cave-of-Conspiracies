<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cave of Conspiracies — Setup Required</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0b0d12; color: #e8ebf1; min-height: 100vh;
      display: grid; place-items: center; padding: 32px 16px;
    }
    .setup-card {
      max-width: 640px; width: 100%; background: #11141b;
      border: 1px solid #232a36; border-radius: 16px;
      padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    }
    h1 { font-size: 1.6rem; margin-bottom: 6px; }
    .subtitle { color: #9aa4b2; margin-bottom: 24px; font-size: 0.95rem; }
    h2 { font-size: 1.1rem; margin: 20px 0 10px; color: #72e6ff; }
    .status-ok { color: #3ddc97; }
    .status-fail { color: #ff6b6b; }
    ul { list-style: none; padding: 0; margin: 0 0 16px; }
    ul li { padding: 6px 0; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
    ul li:last-child { border-bottom: none; }
    code, pre {
      background: #1a1f29; padding: 2px 6px; border-radius: 4px;
      font-size: 0.85rem; color: #72e6ff;
    }
    pre { padding: 12px 16px; overflow-x: auto; margin: 8px 0 16px; white-space: pre-wrap; }
    .help-text { color: #9aa4b2; font-size: 0.85rem; line-height: 1.6; }
    a { color: #7c5cff; }
  </style>
</head>
<body>
  <div class="setup-card">
    <h1>⚙️ Setup Required</h1>
    <p class="subtitle">Cave of Conspiracies cannot start because the database schema is not up to date.</p>

    <h2>Database connection</h2>
    <?php if (!empty($dbConnected)): ?>
      <p class="status-ok">✓ Connected to <code><?= htmlspecialchars($dbHost ?? '?') ?>/<?= htmlspecialchars($dbName ?? '?') ?></code></p>
    <?php else: ?>
      <p class="status-fail">✗ Cannot connect to database — <?= htmlspecialchars($dbError ?? 'unknown error') ?></p>
    <?php endif; ?>

    <?php if (!empty($schemaErrors)): ?>
      <h2>Missing schema pieces</h2>
      <ul>
        <?php foreach ($schemaErrors as $err): ?>
          <li class="status-fail">✗ <?= htmlspecialchars($err) ?></li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>

    <h2>How to fix</h2>
    <p class="help-text">Run the migration runner from your project root:</p>
    <pre>php tools/migrate.php</pre>

    <p class="help-text">Or apply migrations manually in order:</p>
    <pre>mysql -u root playground &lt; migrations/2025_10_27_messages.sql
mysql -u root playground &lt; migrations/2025_10_28_comments.sql
mysql -u root playground &lt; migrations/2025_10_29_social_tables.sql
mysql -u root playground &lt; migrations/2025_10_30_moderation.sql
mysql -u root playground &lt; migrations/2025_10_31_accounts.sql</pre>

    <p class="help-text">Then reload this page.</p>

    <h2>Documentation</h2>
    <p class="help-text">
      See <a href="docs/developer-setup.md">docs/developer-setup.md</a> for full setup instructions.<br>
      Run <code>php tools/dev_doctor.php</code> from CLI for a detailed environment check.
    </p>

    <h2>Note on phpMyAdmin / XAMPP</h2>
    <p class="help-text">
      If phpMyAdmin itself is not loading, that is a XAMPP/Apache/MySQL service issue
      and is <strong>not</strong> controlled by this project. Make sure MySQL and Apache
      are both running in the XAMPP Control Panel before running migrations or loading the app.
    </p>
  </div>
</body>
</html>
