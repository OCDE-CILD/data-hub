(() => {
  function isMobile() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  // Delegated listener on document — works no matter when nav.js
  // injects the .nav-menu / .nav-trigger buttons into the DOM.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.nav-menu > .nav-trigger');

    if (trigger) {
      if (!isMobile()) return;

      event.preventDefault();

      const menu = trigger.closest('.nav-menu');
      const isOpen = menu.classList.contains('is-open');

      document.querySelectorAll('.nav-menu.is-open').forEach((openMenu) => {
        openMenu.classList.remove('is-open');
      });

      if (isOpen) {
        trigger.blur();
        return;
      }

      menu.classList.add('is-open');
      return;
    }

    // Click outside any nav menu closes whatever is open
    if (!event.target.closest('.nav-menu')) {
      document.querySelectorAll('.nav-menu.is-open').forEach((menu) => {
        menu.classList.remove('is-open');
      });
    }
  });
})();