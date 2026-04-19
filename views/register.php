<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Register — Cave of Conspiracies</title>
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
        <a href="?page=login" class="btn-outline">Log in</a>
      </div>
    </header>

    <?php if (!empty($_SESSION['flash'])): ?>
      <div class="flash flash--danger"><?= htmlspecialchars($_SESSION['flash']) ?></div>
      <?php $_SESSION['flash'] = null; ?>
    <?php endif; ?>

    <section class="auth-page">
      <div class="card auth-card">
        <h2>Join the Cave</h2>
        <p class="helper">Create an account to build your identity and own your posts forever.</p>

        <form method="post" action="" class="auth-form">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="register">

          <label for="reg-name">Display name</label>
          <input type="text" id="reg-name" name="display_name" placeholder="MoonWatcher42" maxlength="60" required autofocus>

          <label for="reg-email">Email</label>
          <input type="email" id="reg-email" name="email" placeholder="you@example.com" required>

          <label for="reg-pw">Password</label>
          <input type="password" id="reg-pw" name="password" placeholder="Min 8 characters" minlength="8" required>

          <label for="reg-pw2">Confirm password</label>
          <input type="password" id="reg-pw2" name="password_confirm" placeholder="Repeat password" minlength="8" required>

          <button class="btn" style="margin-top:12px; width:100%;">Create account</button>
        </form>

        <p class="auth-alt">Already have an account? <a href="?page=login">Log in</a></p>
      </div>
    </section>
  </div>
  <script src="assets/dynamic-interface.js" defer></script>
</body>
</html>
