<?php
$pageTitle = 'Privacy — Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<div class="static-page">
  <div class="card reveal">
    <h2>Privacy Policy</h2>
    <p>Cave of Conspiracies respects your privacy. Here is what we collect and why:</p>
    <ul>
      <li><strong>Session data</strong> &mdash; We use server-side sessions to track anonymous ownership of posts and manage logins. No third-party cookies.</li>
      <li><strong>Account data</strong> &mdash; If you register, we store your email (hashed password) and display name. This is never shared.</li>
      <li><strong>Posts and comments</strong> &mdash; Content you submit is stored in our database and visible to other users. You can delete your own posts.</li>
      <li><strong>IP addresses</strong> &mdash; We may log IP addresses for rate limiting and abuse prevention. These are not shared publicly.</li>
    </ul>
    <p>We do not run analytics, sell data, or use tracking pixels. This is a simple community board, not an ad platform.</p>
    <p><a href="/">Back to the cave</a></p>
  </div>
</div>

<?php
$pageScripts = [];
include __DIR__ . '/partials/footer.php';
?>
