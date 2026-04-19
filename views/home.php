<?php
$pageTitle = 'Cave of Conspiracies';
include __DIR__ . '/partials/head.php';
include __DIR__ . '/partials/site_header.php';
?>

<?php if (!empty($flash)): ?>
  <div class="flash"><?= htmlspecialchars($flash) ?></div>
<?php endif; ?>

<!-- Hero + Composer -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-text">
      <h2>Uncover the truth.<br>Or bury it deeper.</h2>
      <p>A community for theories, mysteries, and the unexplained. Post anonymously, challenge narratives, and explore what lies beneath the surface.</p>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-stat-value"><?= isset($total) ? (int)$total : 0 ?></span>
          <span class="hero-stat-label">Theories</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value"><?= count($communities ?? []) ?></span>
          <span class="hero-stat-label">Communities</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value"><?= count($activeUsers ?? []) ?></span>
          <span class="hero-stat-label">Conspirators</span>
        </div>
      </div>
    </div>

    <div class="hero-composer">
      <h3>Share a conspiracy</h3>
      <p class="helper">Max 240 chars. Keep it wild yet civil.</p>
      <?php $composerCommunities = $communities ?? []; ?>
      <form method="post" action="" id="composerForm">
        <div class="composer-row">
          <?php if (!empty($currentAccountId)): ?>
            <input type="text" name="nick" value="<?= htmlspecialchars($currentAccount['display_name'] ?? '') ?>" readonly class="input-locked" title="Posting as your account name">
          <?php else: ?>
            <input type="text" name="nick" placeholder="Alias (e.g. MoonWatcher)" required>
          <?php endif; ?>
          <select name="community">
            <?php
              $seen = [];
              foreach ($composerCommunities as $community):
                $slug  = htmlspecialchars($community['slug']);
                if (isset($seen[$slug])) continue;
                $seen[$slug] = true;
                $label = htmlspecialchars($community['name']);
                $sel   = $slug === 'general' ? 'selected' : '';
            ?>
            <option value="<?= $slug ?>" <?= $sel ?>>r/<?= $label ?></option>
            <?php endforeach; ?>
            <?php if (empty($seen['general'])): ?>
              <option value="general" selected>r/General</option>
            <?php endif; ?>
          </select>
        </div>
        <textarea name="msg" id="msgBox" placeholder="Type your theory..." maxlength="240" required></textarea>
        <div class="composer-footer">
          <small class="muted" id="countHint">0 / 240</small>
          <button class="btn">Post</button>
        </div>
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="add">
      </form>
    </div>
  </div>
</section>

<!-- Main grid: Feed + Sidebar -->
<section class="page-grid">
  <main class="feed-column">
    <div class="feed-header">
      <h2>Threads</h2>
      <span class="feed-meta">
        <?= isset($total) ? (int)$total : 0 ?> total<?= !empty($q) ? ' &middot; filtering for "' . htmlspecialchars($q) . '"' : '' ?>
      </span>
    </div>

    <form method="get" action="" class="search-bar">
      <input type="text" name="q" value="<?= htmlspecialchars($q ?? '') ?>" placeholder="Search conspiracies...">
      <select name="sort" onchange="this.form.submit()">
        <option value="new" <?= ($sort ?? 'new') === 'new' ? 'selected' : '' ?>>Newest</option>
        <option value="old" <?= ($sort ?? '') === 'old' ? 'selected' : '' ?>>Oldest</option>
        <option value="top" <?= ($sort ?? '') === 'top' ? 'selected' : '' ?>>Top</option>
      </select>
      <button class="btn-outline btn-sm">Search</button>
    </form>

    <div id="messageList">
      <?php if (empty($messages)): ?>
        <div class="msg msg-empty"><p>No posts<?= !empty($q) ? ' for "' . htmlspecialchars($q) . '"' : '' ?> yet. Be the first to share a conspiracy.</p></div>
      <?php else: foreach ($messages as $m): ?>
        <?php
          $comments = $m['comments'] ?? [];
          $isOwner  = (isset($m['owner_token'], $_SESSION['author_token'])
                       && hash_equals($m['owner_token'], $_SESSION['author_token']))
                    || (!empty($m['account_id']) && !empty($_SESSION['account_id'])
                       && (int)$m['account_id'] === (int)$_SESSION['account_id']);
        ?>
        <article class="msg reveal" id="msg_<?= (int)$m['id'] ?>" data-community="<?= htmlspecialchars($m['community_slug'] ?? 'general') ?>">
          <div class="msg-head">
            <span class="badge"><?= htmlspecialchars($m['nickname']) ?></span>
            <span class="community-tag">r/<?= htmlspecialchars($m['community_name'] ?? 'General') ?></span>
            <span class="time"><?= htmlspecialchars($m['created_at']) ?></span>
          </div>
          <div class="msg-body">
            <p><?= nl2br(htmlspecialchars($m['body'])) ?></p>
          </div>

          <div class="msg-actions">
            <div class="msg-votes">
              <form method="post" action="" class="actions">
                <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
                <input type="hidden" name="type" value="up">
                <input type="hidden" name="action" value="react">
                <?= csrf_field() ?>
                <button data-react="up" data-id="<?= (int)$m['id'] ?>">&#9650; <span id="up_<?= (int)$m['id'] ?>"><?= (int)($m['upvotes'] ?? 0) ?></span></button>
              </form>
              <form method="post" action="" class="actions">
                <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
                <input type="hidden" name="type" value="down">
                <input type="hidden" name="action" value="react">
                <?= csrf_field() ?>
                <button data-react="down" data-id="<?= (int)$m['id'] ?>">&#9660; <span id="down_<?= (int)$m['id'] ?>"><?= (int)($m['downvotes'] ?? 0) ?></span></button>
              </form>
            </div>
            <div class="msg-controls">
              <?php if ($isOwner): ?>
              <button class="btn-danger" data-delete
                      data-id="<?= (int)$m['id'] ?>"
                      data-snippet="<?= htmlspecialchars(mb_strimwidth($m['body'], 0, 60, '...')) ?>">
                Delete
              </button>
              <?php endif; ?>
              <button class="btn-report" data-report
                      data-target-type="message"
                      data-target-id="<?= (int)$m['id'] ?>"
                      title="Report this post">&#9873; Report</button>
            </div>
          </div>

          <section class="comments" data-message="<?= (int)$m['id'] ?>">
            <h3 class="comments-title">Comments</h3>
            <div class="comments-list" id="comments_<?= (int)$m['id'] ?>">
              <?php if (empty($comments)): ?>
                <p class="comment-empty muted">No comments yet.</p>
              <?php else: foreach ($comments as $c): ?>
                <article class="comment" data-comment-id="<?= (int)$c['id'] ?>">
                  <header class="comment-head">
                    <span class="badge badge-comment"><?= htmlspecialchars($c['nickname']) ?></span>
                    <span class="time"><?= htmlspecialchars($c['created_at']) ?></span>
                  </header>
                  <p><?= nl2br(htmlspecialchars($c['body'])) ?></p>
                </article>
              <?php endforeach; endif; ?>
            </div>
            <form method="post" action="" class="comment-form" data-message-id="<?= (int)$m['id'] ?>">
              <div class="row">
                <?php if (!empty($currentAccountId)): ?>
                  <input type="text" name="nick" value="<?= htmlspecialchars($currentAccount['display_name'] ?? '') ?>" readonly class="input-locked" maxlength="60">
                <?php else: ?>
                  <input type="text" name="nick" placeholder="Alias" maxlength="60" required>
                <?php endif; ?>
                <button class="btn-outline btn-sm">Comment</button>
              </div>
              <textarea name="body" placeholder="Share your take..." maxlength="240" required rows="2"></textarea>
              <?= csrf_field() ?>
              <input type="hidden" name="message_id" value="<?= (int)$m['id'] ?>">
              <input type="hidden" name="action" value="comment">
            </form>
          </section>
        </article>
      <?php endforeach; endif; ?>
    </div>

    <?php if (($pages ?? 1) > 1): ?>
      <nav class="pager">
        <?php
          $qs = function ($p) use ($q, $sort) {
            $parts = ['page=' . $p];
            if (!empty($q)) $parts[] = 'q=' . urlencode($q);
            if (!empty($sort)) $parts[] = 'sort=' . urlencode($sort);
            return '?' . implode('&amp;', $parts);
          };
        ?>
        <?php for ($p = 1; $p <= $pages; $p++): ?>
          <?php if ($p === ($page ?? 1)): ?>
            <span class="active"><?= $p ?></span>
          <?php else: ?>
            <a href="<?= $qs($p) ?>"><?= $p ?></a>
          <?php endif; ?>
        <?php endfor; ?>
      </nav>
    <?php endif; ?>
  </main>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-card reveal">
      <h2>Trending Communities</h2>
      <p class="helper">Where the hive mind is buzzing this week.</p>
      <ul class="stats-list">
        <?php if (!empty($communities)): foreach ($communities as $community): ?>
          <li>
            <strong>r/<?= htmlspecialchars($community['name']) ?></strong>
            <span><?= htmlspecialchars($community['tagline'] ?: 'No tagline yet.') ?></span>
            <span class="muted"><?= (int)$community['posts_7d'] ?> posts &middot; <?= (int)$community['comments_7d'] ?> comments (7d)</span>
          </li>
        <?php endforeach; else: ?>
          <li><strong>r/General</strong><span class="muted">We just launched. Start the first thread!</span></li>
        <?php endif; ?>
      </ul>
    </div>

    <div class="sidebar-card reveal">
      <h2>Active Conspirators</h2>
      <p class="helper">Fresh voices keeping the cave alive.</p>
      <ul class="stats-list">
        <?php if (!empty($activeUsers)): foreach ($activeUsers as $user): ?>
          <li>
            <strong><?= htmlspecialchars($user['nickname']) ?></strong>
            <span><?= (int)$user['messages'] ?> posts &middot; <?= (int)$user['comments'] ?> comments</span>
            <span class="muted">Last seen <?= htmlspecialchars($user['last_seen']) ?></span>
          </li>
        <?php endforeach; else: ?>
          <li><strong>Be the first conspirator!</strong><span class="muted">Post a theory to appear here.</span></li>
        <?php endif; ?>
      </ul>
    </div>

    <div class="ticker-card reveal">
      <h2>Global Pulse</h2>
      <p class="helper">Communities lighting up right now.</p>
      <ul data-community-ticker>
        <?php $tickerCommunities = array_slice($communities ?? [], 0, 5); ?>
        <?php if (!empty($tickerCommunities)): foreach ($tickerCommunities as $community): ?>
          <li>
            <span class="community-pill">
              r/<?= htmlspecialchars($community['name']) ?>
              <small><?= (int)$community['posts_7d'] ?> posts</small>
            </span>
          </li>
        <?php endforeach; else: ?>
          <li><span class="community-pill">r/General <small>Start something intriguing!</small></span></li>
        <?php endif; ?>
      </ul>
    </div>
  </aside>
</section>

<!-- Delete confirmation modal -->
<div id="deleteModal" class="modal" aria-hidden="true">
  <div class="modal-panel">
    <h2>Delete message?</h2>
    <p class="helper">You are about to delete:</p>
    <div id="deletePreview" class="msg" style="margin-bottom: var(--space-md);"></div>
    <form id="deleteForm" method="post" action="" class="row" style="justify-content:flex-end;">
      <input type="hidden" name="id" value="">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="delete">
      <button type="button" class="btn-outline" data-close>Cancel</button>
      <button class="btn-danger">Delete</button>
    </form>
  </div>
</div>

<!-- Report modal -->
<div id="reportModal" class="modal" aria-hidden="true">
  <div class="modal-panel">
    <h2>Report content</h2>
    <p class="helper">Help us keep the cave civil. Select a reason:</p>
    <form id="reportForm" method="post" action="">
      <input type="hidden" name="target_type" value="">
      <input type="hidden" name="target_id" value="">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="report">
      <div style="margin-bottom: var(--space-md); display:flex; flex-direction:column; gap:var(--space-sm);">
        <label><input type="radio" name="reason" value="spam" required> Spam</label>
        <label><input type="radio" name="reason" value="abuse"> Abuse / Harassment</label>
        <label><input type="radio" name="reason" value="illegal"> Illegal content</label>
        <label><input type="radio" name="reason" value="misinfo"> Dangerous misinformation</label>
        <label><input type="radio" name="reason" value="other"> Other</label>
      </div>
      <textarea name="note" placeholder="Optional details..." maxlength="500" rows="2"></textarea>
      <div class="row" style="margin-top: var(--space-md); justify-content:flex-end;">
        <button type="button" class="btn-outline" data-close>Cancel</button>
        <button class="btn-danger">Submit report</button>
      </div>
    </form>
  </div>
</div>

<footer class="site-footer">
  <p>Cave of Conspiracies &mdash; A community for the curious and the skeptical.</p>
</footer>

<?php
$pageScripts = ['app.js', 'composer.js'];
include __DIR__ . '/partials/footer.php';
?>
