<?php
$pageTitle = 'Admin — Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<div class="page-content">
  <?php if (!empty($flash)): ?>
    <div class="flash"><?= htmlspecialchars($flash) ?></div>
  <?php endif; ?>

  <?php if (empty($logged_in)): ?>
    <!-- Admin login -->
    <section class="auth-page" style="min-height:50vh;">
      <div class="auth-card">
        <h2>Admin Login</h2>
        <p class="helper">Enter the admin password to access the moderation panel.</p>
        <form method="post" action="" class="auth-form">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="admin_login">
          <div>
            <label for="admin-pw">Password</label>
            <input type="password" id="admin-pw" name="password" placeholder="Admin password" required>
          </div>
          <button class="btn" style="width:100%;">Login</button>
        </form>
      </div>
    </section>
  <?php else: ?>
    <!-- Moderation queue -->
    <div class="card" style="margin-top:var(--space-md);">
      <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:var(--space-md);">
        <h2 style="margin:0;">Reports (<?= htmlspecialchars($report_status ?? 'open') ?>)
          <?php if (!empty($open_count)): ?>
            <span class="badge" style="background:var(--success);color:#fff;margin-left:8px;"><?= (int)$open_count ?> open</span>
          <?php endif; ?>
        </h2>
        <form method="post" action="" class="inline-form">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="admin_logout">
          <button class="btn-outline btn-sm">Logout</button>
        </form>
      </div>

      <div class="row" style="gap:8px;margin-bottom:var(--space-md);">
        <a href="?page=admin&report_status=open" class="btn-outline btn-sm <?= ($report_status ?? 'open') === 'open' ? 'active' : '' ?>">Open</a>
        <a href="?page=admin&report_status=reviewed" class="btn-outline btn-sm <?= ($report_status ?? '') === 'reviewed' ? 'active' : '' ?>">Reviewed</a>
        <a href="?page=admin&report_status=dismissed" class="btn-outline btn-sm <?= ($report_status ?? '') === 'dismissed' ? 'active' : '' ?>">Dismissed</a>
      </div>

      <?php if (empty($reports)): ?>
        <p class="muted">No <?= htmlspecialchars($report_status ?? 'open') ?> reports.</p>
      <?php else: ?>
        <?php foreach ($reports as $r): ?>
          <div class="admin-report card" style="margin-bottom:12px;padding:var(--space-md);">
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
              <blockquote class="msg" style="margin:8px 0;padding:12px;"><?= nl2br(htmlspecialchars(mb_strimwidth($r['target_body'], 0, 200, '...'))) ?></blockquote>
            <?php endif; ?>
            <?php if (($report_status ?? 'open') === 'open'): ?>
              <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap;">
                <form method="post" action="" class="inline-form">
                  <?= csrf_field() ?>
                  <input type="hidden" name="action" value="mod_action">
                  <input type="hidden" name="target_type" value="<?= htmlspecialchars($r['target_type']) ?>">
                  <input type="hidden" name="target_id" value="<?= (int)$r['target_id'] ?>">
                  <input type="hidden" name="report_id" value="<?= (int)$r['id'] ?>">
                  <input type="hidden" name="mod_action" value="hide">
                  <button class="btn-outline btn-sm">Hide</button>
                </form>
                <form method="post" action="" class="inline-form">
                  <?= csrf_field() ?>
                  <input type="hidden" name="action" value="mod_action">
                  <input type="hidden" name="target_type" value="<?= htmlspecialchars($r['target_type']) ?>">
                  <input type="hidden" name="target_id" value="<?= (int)$r['target_id'] ?>">
                  <input type="hidden" name="report_id" value="<?= (int)$r['id'] ?>">
                  <input type="hidden" name="mod_action" value="remove">
                  <button class="btn-danger btn-sm">Remove</button>
                </form>
                <form method="post" action="" class="inline-form">
                  <?= csrf_field() ?>
                  <input type="hidden" name="action" value="mod_action">
                  <input type="hidden" name="target_type" value="<?= htmlspecialchars($r['target_type']) ?>">
                  <input type="hidden" name="target_id" value="<?= (int)$r['target_id'] ?>">
                  <input type="hidden" name="report_id" value="<?= (int)$r['id'] ?>">
                  <input type="hidden" name="mod_action" value="dismiss">
                  <button class="btn-outline btn-sm">Dismiss</button>
                </form>
              </div>
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  <?php endif; ?>
</div>

<?php
$pageScripts = [];
include __DIR__ . '/partials/footer.php';
?>
