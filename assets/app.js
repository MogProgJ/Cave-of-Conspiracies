// assets/app.js — single coherent interaction layer for Cave of Conspiracies
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -- Helpers --

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function nl2br(s) {
    if (!s) return '';
    return s.replace(/\n/g, '<br>');
  }

  function showToast(text, danger) {
    var t = document.createElement('div');
    t.className = 'toast' + (danger ? ' toast--danger' : '');
    t.textContent = text;
    t.style.cssText =
      'position:fixed;left:50%;top:18px;transform:translateX(-50%);' +
      'background:' + (danger ? 'rgba(255,107,107,.95)' : 'rgba(61,220,151,.95)') + ';' +
      'color:#0b0d12;padding:10px 14px;border-radius:10px;z-index:9999;' +
      'box-shadow:0 10px 30px rgba(0,0,0,.35);';
    document.body.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .4s';
      t.style.opacity = '0';
      setTimeout(function () { t.remove(); }, 400);
    }, 1800);
  }

  function csrfValue() {
    var el = document.querySelector('input[name="csrf"]');
    return el ? el.value : '';
  }

  function renderMessage(m) {
    var cs = (m.comments || []).map(renderComment).join('');
    var emptyNote = cs ? '' : '<p class="comment-empty muted">No comments yet.</p>';
    var csrf = csrfValue();
    return (
      '<article class="msg reveal show" id="msg_' + m.id + '" data-community="' + escapeHtml(m.community_slug || 'general') + '">' +
        '<div class="msg-head">' +
          '<span class="badge">' + escapeHtml(m.nickname) + '</span>' +
          '<span class="community-tag">r/' + escapeHtml(m.community_name || 'General') + '</span>' +
          '<span class="time">' + escapeHtml(m.created_at) + '</span>' +
          '<form method="post" action="" class="actions" style="margin-left:auto;">' +
            '<input type="hidden" name="id" value="' + m.id + '">' +
            '<input type="hidden" name="type" value="up">' +
            '<input type="hidden" name="action" value="react">' +
            '<input type="hidden" name="csrf" value="' + csrf + '">' +
            '<button class="btn-outline" data-react="up" data-id="' + m.id + '">&#9650; <span id="up_' + m.id + '">' + (m.upvotes || 0) + '</span></button>' +
          '</form>' +
          '<form method="post" action="" class="actions">' +
            '<input type="hidden" name="id" value="' + m.id + '">' +
            '<input type="hidden" name="type" value="down">' +
            '<input type="hidden" name="action" value="react">' +
            '<input type="hidden" name="csrf" value="' + csrf + '">' +
            '<button class="btn-outline" data-react="down" data-id="' + m.id + '">&#9660; <span id="down_' + m.id + '">' + (m.downvotes || 0) + '</span></button>' +
          '</form>' +
          (m.is_owner
            ? '<button class="btn-danger" data-delete data-id="' + m.id + '" data-snippet="' + escapeHtml((m.body || '').substring(0, 60)) + '">Delete</button>'
            : '') +
        '</div>' +
        '<p>' + nl2br(escapeHtml(m.body)) + '</p>' +
        '<section class="comments" data-message="' + m.id + '">' +
          '<h3 class="comments-title">Comments</h3>' +
          '<div class="comments-list" id="comments_' + m.id + '">' + emptyNote + cs + '</div>' +
          '<form method="post" action="" class="comment-form" data-message-id="' + m.id + '">' +
            '<div class="row">' +
              '<input type="text" name="nick" placeholder="Alias" maxlength="60" required>' +
              '<button class="btn-outline">Comment</button>' +
            '</div>' +
            '<textarea name="body" placeholder="Share your take..." maxlength="240" required rows="3"></textarea>' +
            '<input type="hidden" name="csrf" value="' + csrf + '">' +
            '<input type="hidden" name="message_id" value="' + m.id + '">' +
            '<input type="hidden" name="action" value="comment">' +
          '</form>' +
        '</section>' +
      '</article>'
    );
  }

  function renderComment(c) {
    return (
      '<article class="comment" data-comment-id="' + c.id + '">' +
        '<header class="comment-head">' +
          '<span class="badge badge-comment">' + escapeHtml(c.nickname) + '</span>' +
          '<span class="time">' + escapeHtml(c.created_at) + '</span>' +
        '</header>' +
        '<p>' + nl2br(escapeHtml(c.body)) + '</p>' +
      '</article>'
    );
  }

  function hydrateCommentList(listEl, commentHtml) {
    var empty = listEl.querySelector('.comment-empty');
    if (empty) empty.remove();
    listEl.insertAdjacentHTML('beforeend', commentHtml);
  }

  // -- Theme --

  var picker = document.getElementById('themePicker');
  var savedTheme = (function () {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  })() || 'dark';

  function setTheme(t) {
    document.body.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) { /* noop */ }
  }

  setTheme(savedTheme);
  if (picker) {
    picker.value = savedTheme;
    picker.addEventListener('change', function () { setTheme(picker.value); });
  }

  // -- Button ripple --

  if (!prefersReducedMotion) {
    document.addEventListener('pointerdown', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      btn.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
      btn.style.setProperty('--ry', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  }

  // -- Composer AJAX submit --

  var composerForm = document.getElementById('composerForm');
  if (composerForm) {
    composerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(composerForm);
      fetch(location.pathname + location.search, {
        method: 'POST',
        headers: { 'X-Requested-With': 'fetch' },
        body: data
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error ' + res.status);
        return res.json();
      })
      .then(function (json) {
        if (!json.ok || !json.message) {
          showToast(json.error || 'Could not post', true);
          return;
        }
        var messageList = document.getElementById('messageList');
        if (messageList) {
          var empty = messageList.querySelector('.msg-empty');
          if (empty) empty.remove();
          messageList.insertAdjacentHTML('afterbegin', renderMessage(json.message));
        }
        composerForm.reset();
        var hint = document.getElementById('countHint');
        if (hint) hint.textContent = '0 / 240';
        showToast('Posted!');
      })
      .catch(function (err) {
        console.error('Add failed:', err);
        showToast('Could not post', true);
      });
    });
  }

  // -- Comment submission (delegated) --

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('comment-form')) return;
    e.preventDefault();

    var data = new FormData(form);
    var body = (data.get('body') || '').toString().trim();
    if (!body) {
      showToast('Comment cannot be empty', true);
      return;
    }

    var btn = form.querySelector('button');
    if (btn) btn.disabled = true;

    fetch(location.pathname + location.search, {
      method: 'POST',
      headers: { 'X-Requested-With': 'fetch' },
      body: data
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Server error ' + res.status);
      return res.json();
    })
    .then(function (json) {
      if (!json.ok || !json.comment) throw new Error(json.error || 'Unable to save comment');
      var list = form.closest('.comments');
      var listEl = list ? list.querySelector('.comments-list') : null;
      if (listEl) hydrateCommentList(listEl, renderComment(json.comment));
      var ta = form.querySelector('textarea[name="body"]');
      if (ta) ta.value = '';
      showToast('Comment posted!');
    })
    .catch(function (err) {
      console.error('Comment failed:', err);
      showToast('Could not post comment', true);
    })
    .finally(function () {
      if (btn) btn.disabled = false;
    });
  });

  // -- Voting (delegated) --

  document.addEventListener('click', function (e) {
    var button = e.target.closest('button[data-react]');
    if (!button) return;
    e.preventDefault();
    var form = button.closest('form');
    if (!form) return;
    var data = new FormData(form);
    var id = button.dataset.id;

    fetch(location.pathname + location.search, {
      method: 'POST',
      headers: { 'X-Requested-With': 'fetch' },
      body: data
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Server error ' + res.status);
      return res.json();
    })
    .then(function (json) {
      if (!json.ok) return;
      var upEl = document.getElementById('up_' + id);
      var downEl = document.getElementById('down_' + id);
      if (upEl) upEl.textContent = json.upvotes;
      if (downEl) downEl.textContent = json.downvotes;
      if (!prefersReducedMotion) {
        button.animate(
          [{ transform: 'scale(0.94)' }, { transform: 'scale(1)' }],
          { duration: 160, easing: 'ease-out' }
        );
      }
    })
    .catch(function (err) {
      console.error('Vote failed:', err);
    });
  });

  // -- Delete modal --

  var modal = document.getElementById('deleteModal');
  var modalForm = document.getElementById('deleteForm');
  var modalMsg = document.getElementById('deletePreview');

  document.addEventListener('click', function (e) {
    var openBtn = e.target.closest('[data-delete]');
    if (openBtn && modal && modalForm && modalMsg) {
      e.preventDefault();
      modalMsg.textContent = openBtn.dataset.snippet || '';
      var hidden = modalForm.querySelector('input[name="id"]');
      if (hidden) hidden.value = openBtn.dataset.id || '';
      modal.classList.add('open');
      return;
    }
    if (e.target.closest('[data-close]') && modal) {
      modal.classList.remove('open');
    }
  });

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(modalForm);
      var id = data.get('id');

      fetch(location.pathname + location.search, {
        method: 'POST',
        headers: { 'X-Requested-With': 'fetch' },
        body: data
      })
      .then(function (res) {
        return res.json().then(function (json) { return { status: res.status, body: json }; });
      })
      .then(function (result) {
        if (modal) modal.classList.remove('open');
        if (result.status === 403 || !result.body.ok) {
          showToast(result.body.error || 'Not allowed', true);
          return;
        }
        var article = document.getElementById('msg_' + id);
        if (article) {
          article.style.transition = 'opacity .3s';
          article.style.opacity = '0';
          setTimeout(function () { article.remove(); }, 300);
        }
        showToast('Deleted');
      })
      .catch(function (err) {
        if (modal) modal.classList.remove('open');
        console.error('Delete failed:', err);
        showToast('Could not delete', true);
      });
    });
  }

  // -- Flash auto-hide --

  var flash = document.querySelector('.flash');
  if (flash) setTimeout(function () { flash.style.display = 'none'; }, 2500);

  // -- Search clear helper --

  var searchInput = document.querySelector('input[name="q"]');
  if (searchInput) {
    var basePath = location.pathname || '';
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        searchInput.value = '';
        location.href = basePath;
      }
    });
  }
});
