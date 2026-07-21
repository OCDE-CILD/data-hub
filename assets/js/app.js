(() => {
  document.addEventListener('click', (event) => {
    if (event.target.closest('.mobile-nav-toggle')) return;

    // Clicks inside a nav menu are handled by nav.js itself — don't interfere.
    if (event.target.closest('.nav-menu')) return;

    // Click outside: close any open dropdown
    document.querySelectorAll('.nav-menu.is-open').forEach((menu) => {
      menu.classList.remove('is-open');
    });

    // And collapse the whole mobile menu if the click was outside it
    const navEl = document.querySelector('[data-nav]');
    if (navEl && !event.target.closest('[data-nav]') && navEl.classList.contains('is-open')) {
      navEl.classList.remove('is-open');
      const toggle = document.querySelector('.mobile-nav-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();