<?php // Shared site header — reads auth state from $_SESSION ?>
<header class="site-header">
  <div class="site-header-inner">
    <a href="/" class="brand">
      <div class="brand-badge">CoC</div>
      <div class="brand-text">
        <span class="brand-name">Cave of Conspiracies</span>
        <span class="brand-tag">Post. Ponder. Poke holes.</span>
      </div>
    </a>

    <nav class="site-nav">
      <a href="/" class="nav-link">Home</a>
      <a href="?page=about" class="nav-link">About</a>
      <a href="?page=creator" class="nav-link">Creator</a>
      <a href="?page=links" class="nav-link">Socials</a>
    </nav>

    <div class="header-actions">
      <select id="themePicker" class="theme-picker">
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="blue">Blue</option>
        <option value="midnight">Midnight</option>
        <option value="dusk">Dusk</option>
      </select>

      <?php if (!empty($_SESSION['account_id'])): ?>
        <div class="header-user">
          <a href="?page=profile" class="user-avatar-sm"><?= strtoupper(mb_substr($_SESSION['account']['display_name'] ?? '?', 0, 1)) ?></a>
          <span class="user-greeting"><?= htmlspecialchars($_SESSION['account']['display_name'] ?? 'User') ?></span>
          <a href="?page=profile" class="btn-ghost btn-sm">Profile</a>
          <form method="post" action="" class="inline-form">
            <?= csrf_field() ?>
            <input type="hidden" name="action" value="logout">
            <button class="btn-ghost btn-sm">Log out</button>
          </form>
        </div>
      <?php else: ?>
        <a href="?page=login" class="btn-ghost btn-sm">Log in</a>
        <a href="?page=register" class="btn-accent btn-sm">Register</a>
      <?php endif; ?>

      <?php if (!empty($_SESSION['is_admin'])): ?>
        <a href="?page=admin" class="btn-ghost btn-sm btn-admin">Admin</a>
      <?php endif; ?>
    </div>
  </div>
</header>
