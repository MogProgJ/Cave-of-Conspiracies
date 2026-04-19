<?php // Shared footer — set $pageScripts array before including ?>
</div><!-- .site-shell -->
<script src="assets/dynamic-interface.js" defer></script>
<?php foreach (($pageScripts ?? []) as $__script): ?>
<script src="assets/<?= htmlspecialchars($__script) ?>" defer></script>
<?php endforeach; unset($__script); ?>
</body>
</html>
