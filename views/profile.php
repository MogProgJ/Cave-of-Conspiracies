<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($account['display_name'] ?? 'Profile') ?> — Cave of Conspiracies</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="assets/styles.css" rel="stylesheet">
  <link href="assets/animations.css" rel="stylesheet">
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <a href="/" class="brand-link">
          <div class="brand-badge">CoC</div>
          <div>
            <h1>Cave of Conspiracies</h1>
            <span class="tag">Post. Ponder. Poke holes.</span>
          </div>
        </a>
      </div>
      <div class="header-right">
        <a href="/" class="btn-outline">Home</a>
        <?php if (!empty($_SESSION['account_id'])): ?>
          <a href="?page=profile" class="btn-outline">Profile</a>
        <?php endif; ?>
      </div>
    </header>

    <?php if (!empty($_SESSION['flash'])): ?>
      <div class="flash"><?= htmlspecialchars($_SESSION['flash']) ?></div>
      <?php $_SESSION['flash'] = null; ?>
    <?php endif; ?>

    <section class="grid">
      <div class="col">
        <!-- Profile info card -->
        <div class="card reveal">
          <div class="profile-header">
            <div class="profile-avatar"><?= strtoupper(mb_substr($account['display_name'] ?? '?', 0, 1)) ?></div>
            <div>
              <h2 class="profile-name"><?= htmlspecialchars($account['display_name'] ?? 'Unknown') ?></h2>
              <span class="muted">Member since <?= htmlspecialchars($account['created_at'] ?? '') ?></span>
            </div>
          </div>

          <?php if (!empty($account['bio'])): ?>
            <p class="profile-bio"><?= nl2br(htmlspecialchars($account['bio'])) ?></p>
          <?php elseif (!empty($is_own)): ?>
            <p class="profile-bio muted">No bio yet. Edit your profile to add one.</p>
          <?php endif; ?>

          <?php if (isset($account['post_count'])): ?>
          <div class="profile-stats">
            <span><strong><?= (int)$account['post_count'] ?></strong> posts</span>
            <span><strong><?= (int)$account['comment_count'] ?></strong> comments</span>
          </div>
          <?php endif; ?>
        </div>

        <!-- Recent posts -->
        <div class="card reveal" style="margin-top:16px;">
          <h2>Recent posts</h2>
          <?php if (empty($posts)): ?>
            <p class="muted">No posts yet.</p>
          <?php else: foreach ($posts as $p): ?>
            <article class="msg">
              <div class="msg-head">
                <span class="badge"><?= htmlspecialchars($p['nickname'] ?? $account['display_name']) ?></span>
                <span class="community-tag">r/<?= htmlspecialchars($p['community_name'] ?? 'General') ?></span>
                <span class="time"><?= htmlspecialchars($p['created_at']) ?></span>
                <span class="muted" style="margin-left:auto;">&#9650; <?= (int)($p['upvotes'] ?? 0) ?> &#9660; <?= (int)($p['downvotes'] ?? 0) ?></span>
              </div>
              <p><?= nl2br(htmlspecialchars($p['body'])) ?></p>
            </article>
          <?php endforeach; endif; ?>
        </div>
      </div>

      <!-- Sidebar: edit profile (own profile only) -->
      <aside class="col">
        <?php if (!empty($is_own)): ?>
        <div class="card reveal">
          <h2>Edit profile</h2>
          <form method="post" action="" class="auth-form">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="update_profile">

            <label for="edit-name">Display name</label>
            <input type="text" id="edit-name" name="display_name" value="<?= htmlspecialchars($account['display_name'] ?? '') ?>" maxlength="60" required>

            <label for="edit-bio">Bio</label>
            <textarea id="edit-bio" name="bio" maxlength="500" rows="4" placeholder="Tell the cave about yourself..."><?= htmlspecialchars($account['bio'] ?? '') ?></textarea>

            <button class="btn" style="margin-top:8px; width:100%;">Save</button>
          </form>
        </div>

        <div class="card reveal" style="margin-top:16px;">
          <h2>Change password</h2>
          <form method="post" action="" class="auth-form">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="change_password">

            <label for="cur-pw">Current password</label>
            <input type="password" id="cur-pw" name="current_password" required>

            <label for="new-pw">New password</label>
            <input type="password" id="new-pw" name="new_password" minlength="8" required>

            <label for="new-pw2">Confirm new password</label>
            <input type="password" id="new-pw2" name="new_password_confirm" minlength="8" required>

            <button class="btn" style="margin-top:8px; width:100%;">Change password</button>
          </form>
        </div>

        <div class="card reveal" style="margin-top:16px;">
          <form method="post" action="">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="logout">
            <button class="btn-danger" style="width:100%;">Log out</button>
          </form>
        </div>
        <?php endif; ?>
      </aside>
    </section>
  </div>
  <script src="assets/dynamic-interface.js" defer></script>
</body>
</html>
