<?php
$pageTitle = 'Register — Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<?php if (!empty($_SESSION['flash'])): ?>
  <div class="flash flash--danger"><?= htmlspecialchars($_SESSION['flash']) ?></div>
  <?php $_SESSION['flash'] = null; ?>
<?php endif; ?>

<section class="auth-page">
  <div class="auth-card">
    <h2>Create an account</h2>
    <p class="helper">Join the cave. Your posts will be tied to your display name.</p>
    <form method="post" action="" class="auth-form">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="register">
      <div>
        <label for="reg-name">Display name</label>
        <input type="text" id="reg-name" name="display_name" placeholder="MoonWatcher42" required autofocus>
      </div>
      <div>
        <label for="reg-email">Email</label>
        <input type="email" id="reg-email" name="email" placeholder="you@example.com" required>
      </div>
      <div>
        <label for="reg-pw">Password</label>
        <input type="password" id="reg-pw" name="password" placeholder="At least 8 characters" required minlength="8">
      </div>
      <button class="btn" style="width:100%;">Register</button>
    </form>
    <p class="auth-alt">Already have an account? <a href="?page=login">Log in</a></p>
  </div>
</section>

<?php
$pageScripts = [];
include __DIR__ . '/partials/footer.php';
?>
