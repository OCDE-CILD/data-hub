document.querySelectorAll('.nav-menu > .nav-trigger').forEach((button) => {
  button.addEventListener('click', (event) => {
    if (!window.matchMedia('(max-width: 900px)').matches) return;

    event.preventDefault();

    const menu = button.closest('.nav-menu');
    const isOpen = menu.classList.contains('is-open');

    document.querySelectorAll('.nav-menu.is-open').forEach((openMenu) => {
      openMenu.classList.remove('is-open');
    });

    if (isOpen) {
      button.blur();
      return;
    }

    menu.classList.add('is-open');
  });
});

document.addEventListener('click', (event) => {
  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('.mobile-nav-toggle');

  if (event.target.closest('.nav-menu')) return;

  document.querySelectorAll('.nav-menu.is-open').forEach((menu) => {
    menu.classList.remove('is-open');
  });

  // Clicking outside the whole mobile nav (and not on its toggle button)
  // closes it too.
  if (nav && !event.target.closest('[data-nav]') && !event.target.closest('.mobile-nav-toggle')) {
    nav.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
});

// Closing the mobile nav after a link inside it is tapped (the page will
// navigate away, but this avoids a flash of the open menu on same-page links).
document.addEventListener('click', (event) => {
  if (!window.matchMedia('(max-width: 900px)').matches) return;

  const nav = document.querySelector('[data-nav]');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const link = event.target.closest('[data-nav] a');

  if (nav && link) {
    nav.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
});