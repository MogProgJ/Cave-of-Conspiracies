// assets/dynamic-interface.js
// Visual polish, theme handler, and ambient motion — separate from core logic.

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -- Theme picker handler --

  function initTheme() {
    const picker = document.getElementById('themePicker');
    const saved = (() => {
      try { return localStorage.getItem('theme'); } catch (e) { return null; }
    })() || 'dark';

    document.body.setAttribute('data-theme', saved);

    if (picker) {
      picker.value = saved;
      picker.addEventListener('change', () => {
        const t = picker.value;
        document.body.setAttribute('data-theme', t);
        try { localStorage.setItem('theme', t); } catch (e) { /* noop */ }
      });
    }
  }

  // -- Reveal on scroll --

  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach(el => el.classList.add('show'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  // -- Ambient glow particles --

  function initAmbient() {
    if (prefersReducedMotion) return;

    const host = document.createElement('div');
    host.id = 'ambientCanvas';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);

    const particles = Array.from({ length: 4 }, (_, i) => {
      const el = document.createElement('span');
      el.className = `ambient-bubble ambient-bubble--${i % 3}`;
      host.appendChild(el);
      return {
        el,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 80 + Math.random() * 200,
        dx: (Math.random() * 0.2 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
        dy: (Math.random() * 0.2 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
      };
    });

    function tick() {
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -p.r || p.x > window.innerWidth + p.r) p.dx *= -1;
        if (p.y < -p.r || p.y > window.innerHeight + p.r) p.dy *= -1;
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        p.el.style.width = `${p.r}px`;
        p.el.style.height = `${p.r}px`;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    window.addEventListener('resize', () => {
      particles.forEach(p => {
        p.x = Math.min(Math.max(p.x, 0), window.innerWidth);
        p.y = Math.min(Math.max(p.y, 0), window.innerHeight);
      });
    });
  }

  // -- Message hover glow --

  function initHoverFocus() {
    const list = document.getElementById('messageList');
    if (!list) return;
    list.addEventListener('pointerenter', (e) => {
      const msg = e.target.closest('.msg');
      if (msg) msg.classList.add('msg--focused');
    }, true);
    list.addEventListener('pointerleave', (e) => {
      const msg = e.target.closest('.msg');
      if (msg) msg.classList.remove('msg--focused');
    }, true);
  }

  // -- Community ticker rotation --

  function initTicker() {
    const ticker = document.querySelector('[data-community-ticker]');
    if (!ticker || prefersReducedMotion) return;
    const items = ticker.querySelectorAll('li');
    if (!items.length) return;
    let index = 0;

    items.forEach(item => item.classList.add('is-active'));
    setInterval(() => {
      items.forEach((item, i) => {
        item.style.opacity = i === index ? '1' : '0.5';
      });
      index = (index + 1) % items.length;
    }, 3000);
  }

  initTheme();
  initReveal();
  initAmbient();
  initHoverFocus();
  initTicker();
});
