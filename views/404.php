<?php
$pageTitle = '404 — Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<section class="error-page">
  <div class="error-card">
    <p class="error-code">404</p>
    <h2>Page not found</h2>
    <p>The conspiracy you're looking for doesn't exist &mdash; or someone buried it.</p>
    <a href="/" class="btn">Return to the cave</a>
  </div>
</section>

<?php
$pageScripts = [];
include __DIR__ . '/partials/footer.php';
?>
