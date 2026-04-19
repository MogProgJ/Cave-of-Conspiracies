<?php // Shared HTML <head> — set $pageTitle before including ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title><?= htmlspecialchars($pageTitle ?? 'Cave of Conspiracies') ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="assets/styles.css" rel="stylesheet">
  <link href="assets/animations.css" rel="stylesheet">
</head>
<body>
<script>
(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t)document.body.setAttribute('data-theme',t)})();
</script>
<div class="site-shell">
