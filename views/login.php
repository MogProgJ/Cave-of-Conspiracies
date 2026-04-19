<?php
$pageTitle = 'Log in — Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<?php if (!empty($_SESSION['flash'])): ?>
  <div class="flash flash--danger"><?= htmlspecialchars($_SESSION['flash']) ?></div>
  <?php $_SESSION['flash'] = null; ?>
<?php endif; ?>

<section class="auth-page">
  <div class="auth-card">
    <h2>Welcome back</h2>
    <p class="helper">Log in to access your posts and profile.</p>
    <form method="post" action="" class="auth-form">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="login">
      <div>
        <label for="login-email">Email</label>
        <input type="email" id="login-email" name="email" placeholder="you@example.com" required autofocus>
      </div>
      <div>
        <label for="login-pw">Password</label>
        <input type="password" id="login-pw" name="password" placeholder="Your password" required>
      </div>
      <button class="btn" style="width:100%;">Log in</button>
    </form>
    <p class="auth-alt">Don't have an account? <a href="?page=register">Register</a></p>
  </div>
</section>

<?php
$pageScripts = [];
include __DIR__ . '/partials/footer.php';
?>
