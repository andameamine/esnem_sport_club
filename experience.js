/* ENSEM SPORT — premium interaction layer (dependency-free, progressive enhancement). */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;

  const rafThrottle = (fn) => {
    let queued = false;
    return (...args) => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        fn(...args);
        queued = false;
      });
    };
  };

  function forceIdentityTheme() {
    document.documentElement.classList.remove('dark', 'theme-orange');
    try { localStorage.removeItem('ens-theme'); } catch (_) {}
  }

  function installProgress() {
    const rail = document.createElement('div');
    rail.className = 'es-progress';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<span></span>';
    document.body.appendChild(rail);
    const bar = rail.firstElementChild;

    const update = rafThrottle(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, scrollY / max) : 0;
      bar.style.transform = `scaleX(${progress})`;
      document.querySelector('header.nav')?.classList.toggle('scrolled', scrollY > 24);
    });
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  function installCurtain() {
    if (reduced) return;
    const curtain = document.createElement('div');
    curtain.className = 'page-curtain entering';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
    curtain.addEventListener('animationend', () => curtain.classList.remove('entering'), { once: true });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname && url.hash) return;
      if (!url.pathname.endsWith('.html') && url.pathname !== '/' && !url.pathname.endsWith('/')) return;
      event.preventDefault();
      curtain.classList.add('leaving');
      setTimeout(() => { location.href = url.href; }, 320);
    });
  }

  function installReveal() {
    const targets = document.querySelectorAll(
      '.pagehead .wrap > *, .sec-head > *, .panel, .stat, .news-item, .plogo, .story, .shot, .field, .reveal, [data-es-reveal]'
    );
    targets.forEach((el, index) => {
      if (!el.hasAttribute('data-es-reveal')) el.setAttribute('data-es-reveal', '');
      el.style.setProperty('--delay', `${Math.min(index % 5, 4) * 70}ms`);
    });

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible', 'in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible', 'in');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => observer.observe(el));
    setTimeout(() => targets.forEach((el) => el.classList.add('is-visible', 'in')), 1800);
  }

  function installMagnetism() {
    if (reduced || !finePointer) return;
    document.querySelectorAll('.hero-actions .btn, .final-cta .btn').forEach((button) => {
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let frame = 0;

      const settle = () => {
        x += (tx - x) * .16;
        y += (ty - y) * .16;
        button.style.translate = `${x}px ${y}px`;
        if (Math.abs(tx - x) + Math.abs(ty - y) > .08) frame = requestAnimationFrame(settle);
      };
      const start = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(settle);
      };

      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        tx = Math.max(-14, Math.min(14, (event.clientX - rect.left - rect.width / 2) * .16));
        ty = Math.max(-10, Math.min(10, (event.clientY - rect.top - rect.height / 2) * .16));
        start();
      });
      button.addEventListener('pointerleave', () => { tx = 0; ty = 0; start(); });
    });
  }

  function installCursor() {
    if (reduced || !finePointer) return;
    const cursor = document.createElement('div');
    cursor.className = 'es-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    let targetX = -100;
    let targetY = -100;
    let x = targetX;
    let y = targetY;

    const render = () => {
      x += (targetX - x) * .22;
      y += (targetY - y) * .22;
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      requestAnimationFrame(render);
    };
    addEventListener('pointermove', (event) => { targetX = event.clientX; targetY = event.clientY; }, { passive: true });
    document.addEventListener('pointerover', (event) => {
      cursor.classList.toggle('hot', Boolean(event.target.closest('a,button,input,textarea,select,.shot')));
    }, { passive: true });
    render();
  }

  function installHeroDepth() {
    const stage = document.querySelector('.hero-emblem');
    const image = stage?.querySelector('img');
    if (!stage || !image || reduced || !finePointer) return;
    stage.addEventListener('pointermove', rafThrottle((event) => {
      const rect = stage.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      image.style.setProperty('--ry', `${px * 12}deg`);
      image.style.setProperty('--rx', `${py * -10}deg`);
    }));
    stage.addEventListener('pointerleave', () => {
      image.style.setProperty('--ry', '0deg');
      image.style.setProperty('--rx', '0deg');
    });
  }

  function installParallax() {
    if (reduced || innerWidth < 821) return;
    const elements = [...document.querySelectorAll('[data-parallax]')];
    if (!elements.length) return;
    const update = rafThrottle(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const speed = Number(element.dataset.parallax || .12);
        const center = rect.top + rect.height / 2 - innerHeight / 2;
        element.style.transform = `translate3d(0,${center * -speed}px,0)`;
      });
    });
    addEventListener('scroll', update, { passive: true });
    update();
  }

  function installMenuA11y() {
    const burger = document.getElementById('burger');
    const links = document.getElementById('links');
    if (!burger || !links) return;
    burger.addEventListener('click', () => {
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !links.classList.contains('open')) return;
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    });
  }

  function enhanceDynamicContent() {
    const roots = ['eventsGrid', 'newsList', 'galleryGrid', 'partnersGrid', 'teamRow']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!roots.length) return;
    const observer = new MutationObserver(() => {
      installReveal();
      observer.disconnect();
    });
    roots.forEach((root) => observer.observe(root, { childList: true, subtree: true }));
    setTimeout(() => observer.disconnect(), 5000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    forceIdentityTheme();
    installProgress();
    installCurtain();
    installReveal();
    installMagnetism();
    installCursor();
    installHeroDepth();
    installParallax();
    installMenuA11y();
    enhanceDynamicContent();
  });
})();
