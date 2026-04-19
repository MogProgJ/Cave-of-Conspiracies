<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Log in — Cave of Conspiracies</title>
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
        <a href="?page=register" class="btn-outline">Register</a>
      </div>
    </header>

    <?php if (!empty($_SESSION['flash'])): ?>
      <div class="flash flash--danger"><?= htmlspecialchars($_SESSION['flash']) ?></div>
      <?php $_SESSION['flash'] = null; ?>
    <?php endif; ?>

    <section class="auth-page">
      <div class="card auth-card">
        <h2>Welcome back</h2>
        <p class="helper">Log in to access your posts and profile.</p>

        <form method="post" action="" class="auth-form">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="login">

          <label for="login-email">Email</label>
          <input type="email" id="login-email" name="email" placeholder="you@example.com" required autofocus>

          <label for="login-pw">Password</label>
          <input type="password" id="login-pw" name="password" placeholder="Your password" required>

          <button class="btn" style="margin-top:12px; width:100%;">Log in</button>
        </form>

        <p class="auth-alt">Don't have an account? <a href="?page=register">Register</a></p>
      </div>
    </section>
  </div>
  <script src="assets/dynamic-interface.js" defer></script>
</body>
</html>
