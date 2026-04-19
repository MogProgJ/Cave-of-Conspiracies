<?php
$pageTitle = ($account['display_name'] ?? 'Profile') . ' — Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<?php if (!empty($_SESSION['flash'])): ?>
  <div class="flash"><?= htmlspecialchars($_SESSION['flash']) ?></div>
  <?php $_SESSION['flash'] = null; ?>
<?php endif; ?>

<div class="page-content">
  <div class="profile-grid">
    <div class="profile-main">
      <!-- Profile header -->
      <div class="profile-header">
        <div class="profile-avatar"><?= strtoupper(mb_substr($account['display_name'] ?? '?', 0, 1)) ?></div>
        <div>
          <h2 class="profile-name"><?= htmlspecialchars($account['display_name'] ?? 'Unknown') ?></h2>
          <span class="muted" style="font-size:0.8125rem;">Joined <?= htmlspecialchars($account['created_at'] ?? '') ?></span>
          <?php if (!empty($account['role']) && $account['role'] !== 'user'): ?>
            <span class="tag" style="margin-left:8px;"><?= htmlspecialchars($account['role']) ?></span>
          <?php endif; ?>
        </div>
      </div>

      <?php if (!empty($account['bio'])): ?>
        <div class="profile-bio"><?= nl2br(htmlspecialchars($account['bio'])) ?></div>
      <?php endif; ?>

      <div class="profile-stats">
        <div class="profile-stat">
          <span class="stat-value"><?= (int)($account['post_count'] ?? count($posts ?? [])) ?></span>
          <span class="stat-label">Posts</span>
        </div>
        <div class="profile-stat">
          <span class="stat-value"><?= (int)($account['comment_count'] ?? 0) ?></span>
          <span class="stat-label">Comments</span>
        </div>
      </div>

      <!-- Recent posts -->
      <div class="card">
        <h2>Recent Posts</h2>
        <?php if (empty($posts)): ?>
          <p class="muted">No posts yet.</p>
        <?php else: foreach ($posts as $p): ?>
          <div class="msg" style="margin-bottom: var(--space-sm);">
            <div class="msg-head">
              <span class="badge"><?= htmlspecialchars($p['nickname']) ?></span>
              <span class="community-tag">r/<?= htmlspecialchars($p['community_name'] ?? 'General') ?></span>
              <span class="time"><?= htmlspecialchars($p['created_at']) ?></span>
            </div>
            <div class="msg-body">
              <p><?= nl2br(htmlspecialchars($p['body'])) ?></p>
            </div>
          </div>
        <?php endforeach; endif; ?>
      </div>

      <!-- Recent comments -->
      <?php if (!empty($recentComments)): ?>
      <div class="card" style="margin-top: var(--space-md);">
        <h2>Recent Comments</h2>
        <?php foreach ($recentComments as $c): ?>
          <div class="comment" style="margin-bottom: var(--space-sm);">
            <p class="muted" style="font-size:0.8125rem; margin-bottom:4px;">
              On: &ldquo;<?= htmlspecialchars(mb_strimwidth($c['message_body'] ?? '', 0, 80, '...')) ?>&rdquo;
            </p>
            <p style="margin:0;"><?= nl2br(htmlspecialchars($c['body'])) ?></p>
            <span class="time"><?= htmlspecialchars($c['created_at']) ?></span>
          </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div>

    <!-- Sidebar (own profile only) -->
    <?php if (!empty($is_own)): ?>
    <aside class="sidebar">
      <!-- Edit profile -->
      <div class="sidebar-card">
        <h2>Edit Profile</h2>
        <form method="post" action="" class="auth-form">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="update_profile">
          <div>
            <label for="edit-name">Display name</label>
            <input type="text" id="edit-name" name="display_name" value="<?= htmlspecialchars($account['display_name'] ?? '') ?>" required>
          </div>
          <div>
            <label for="edit-bio">Bio</label>
            <textarea id="edit-bio" name="bio" rows="3" maxlength="500" placeholder="A sentence or two about you..."><?= htmlspecialchars($account['bio'] ?? '') ?></textarea>
          </div>
          <button class="btn btn-sm">Save</button>
        </form>
      </div>

      <!-- Change password -->
      <div class="sidebar-card">
        <h2>Change Password</h2>
        <form method="post" action="" class="auth-form">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="change_password">
          <div>
            <label for="cur-pw">Current password</label>
            <input type="password" id="cur-pw" name="current_password" required>
          </div>
          <div>
            <label for="new-pw">New password</label>
            <input type="password" id="new-pw" name="new_password" required minlength="8">
          </div>
          <button class="btn btn-sm">Update</button>
        </form>
      </div>
    </aside>
    <?php endif; ?>
  </div>
</div>

<?php
$pageScripts = [];
include __DIR__ . '/partials/footer.php';
?>
