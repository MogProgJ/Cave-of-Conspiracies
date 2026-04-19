<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Admin — Cave of Conspiracies</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="assets/styles.css" rel="stylesheet">
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <div class="brand-badge">CoC</div>
        <div>
          <h1>Admin Panel</h1>
          <span class="tag">Moderation &amp; reports</span>
        </div>
      </div>
      <div class="header-right">
        <a href="?" class="btn-outline">Back to site</a>
        <?php if (!empty($logged_in)): ?>
          <form method="post" action="" style="display:inline">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="admin_logout">
            <button class="btn-outline">Logout</button>
          </form>
        <?php endif; ?>
      </div>
    </header>

    <?php if (!empty($flash)): ?>
      <div class="flash"><?= htmlspecialchars($flash) ?></div>
    <?php endif; ?>

    <?php if (empty($logged_in)): ?>
      <!-- Admin login -->
      <div class="card" style="max-width:400px;margin:40px auto;">
        <h2>Admin login</h2>
        <p class="helper">Enter the admin password to access the moderation panel.</p>
        <form method="post" action="">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="admin_login">
          <input type="password" name="password" placeholder="Admin password" required style="width:100%;margin-bottom:10px;">
          <button class="btn">Login</button>
        </form>
      </div>
    <?php else: ?>
      <!-- Moderation queue -->
      <div class="card" style="margin-top:16px;">
        <h2>Reports (<?= htmlspecialchars($report_status ?? 'open') ?>)
          <?php if (!empty($open_count)): ?>
            <span class="badge" style="background:var(--accent);color:#fff;margin-left:8px;"><?= (int)$open_count ?> open</span>
          <?php endif; ?>
        </h2>
        <div class="row" style="gap:8px;margin-bottom:16px;">
          <a href="?page=admin&report_status=open" class="btn-outline <?= ($report_status ?? 'open') === 'open' ? 'active' : '' ?>">Open</a>
          <a href="?page=admin&report_status=reviewed" class="btn-outline <?= ($report_status ?? '') === 'reviewed' ? 'active' : '' ?>">Reviewed</a>
          <a href="?page=admin&report_status=dismissed" class="btn-outline <?= ($report_status ?? '') === 'dismissed' ? 'active' : '' ?>">Dismissed</a>
        </div>

        <?php if (empty($reports)): ?>
          <p class="muted">No <?= htmlspecialchars($report_status ?? 'open') ?> reports.</p>
        <?php else: ?>
          <?php foreach ($reports as $r): ?>
            <div class="admin-report card" style="margin-bottom:12px;padding:12px;">
              <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <div>
                  <strong><?= htmlspecialchars($r['target_type']) ?> #<?= (int)$r['target_id'] ?></strong>
                  <span class="badge"><?= htmlspecialchars($r['reason']) ?></span>
                  <span class="time"><?= htmlspecialchars($r['created_at']) ?></span>
                </div>
              </div>
              <?php if (!empty($r['note'])): ?>
                <p class="muted" style="margin:4px 0;"><em><?= htmlspecialchars($r['note']) ?></em></p>
              <?php endif; ?>
              <?php if (!empty($r['target_body'])): ?>
                <blockquote class="msg" style="margin:8px 0;padding:8px;opacity:0.85;"><?= nl2br(htmlspecialchars(mb_strimwidth($r['target_body'], 0, 200, '...'))) ?></blockquote>
              <?php endif; ?>
              <?php if (($report_status ?? 'open') === 'open'): ?>
                <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap;">
                  <form method="post" action="" style="display:inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="mod_action">
                    <input type="hidden" name="target_type" value="<?= htmlspecialchars($r['target_type']) ?>">
                    <input type="hidden" name="target_id" value="<?= (int)$r['target_id'] ?>">
                    <input type="hidden" name="report_id" value="<?= (int)$r['id'] ?>">
                    <input type="hidden" name="mod_action" value="hide">
                    <button class="btn-outline">Hide</button>
                  </form>
                  <form method="post" action="" style="display:inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="mod_action">
                    <input type="hidden" name="target_type" value="<?= htmlspecialchars($r['target_type']) ?>">
                    <input type="hidden" name="target_id" value="<?= (int)$r['target_id'] ?>">
                    <input type="hidden" name="report_id" value="<?= (int)$r['id'] ?>">
                    <input type="hidden" name="mod_action" value="remove">
                    <button class="btn-danger">Remove</button>
                  </form>
                  <form method="post" action="" style="display:inline">
                    <?= csrf_field() ?>
                    <input type="hidden" name="action" value="mod_action">
                    <input type="hidden" name="target_type" value="<?= htmlspecialchars($r['target_type']) ?>">
                    <input type="hidden" name="target_id" value="<?= (int)$r['target_id'] ?>">
                    <input type="hidden" name="report_id" value="<?= (int)$r['id'] ?>">
                    <input type="hidden" name="mod_action" value="dismiss">
                    <button class="btn-outline">Dismiss</button>
                  </form>
                </div>
              <?php endif; ?>
            </div>
          <?php endforeach; ?>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
