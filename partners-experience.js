(() => {
  const showcase = document.getElementById('sponsorShowcase');
  if (!showcase) return;

  const tabs = [...showcase.querySelectorAll('[data-sponsor-format]')];
  const panels = [...showcase.querySelectorAll('[data-sponsor-panel]')];
  const current = document.getElementById('sponsorCurrent');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const activate = (key, moveFocus = false) => {
    const activeIndex = tabs.findIndex((tab) => tab.dataset.sponsorFormat === key);
    if (activeIndex < 0) return;

    tabs.forEach((tab, index) => {
      const selected = index === activeIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const selected = panel.dataset.sponsorPanel === key;
      panel.hidden = !selected;
      panel.classList.toggle('is-active', selected);
    });

    if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');
    if (moveFocus) tabs[activeIndex].focus({ preventScroll: true });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.sponsorFormat));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activate(tabs[nextIndex].dataset.sponsorFormat, true);
    });

    if (!reducedMotion) {
      tab.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch') return;
        const rect = tab.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        tab.style.setProperty('--rx', `${((.5 - y) * 3).toFixed(2)}deg`);
        tab.style.setProperty('--ry', `${((x - .5) * 4).toFixed(2)}deg`);
        tab.style.setProperty('--px', `${(x * 100).toFixed(1)}%`);
        tab.style.setProperty('--py', `${(y * 100).toFixed(1)}%`);
      }, { passive: true });
      tab.addEventListener('pointerleave', () => {
        tab.style.setProperty('--rx', '0deg');
        tab.style.setProperty('--ry', '0deg');
        tab.style.setProperty('--px', '50%');
        tab.style.setProperty('--py', '50%');
      });
    }
  });
})();
