document.querySelectorAll('.nav-menu > .nav-trigger').forEach((button) => {
  button.addEventListener('click', (event) => {
    if (!window.matchMedia('(max-width: 900px)').matches) return;

    event.preventDefault();

    const menu = button.closest('.nav-menu');

    if (menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      return;
    }

    document.querySelectorAll('.nav-menu.is-open').forEach((openMenu) => {
      openMenu.classList.remove('is-open');
    });

    menu.classList.add('is-open');
  });
});

document.addEventListener('click', (event) => {
  if (event.target.closest('.nav-menu')) return;

  document.querySelectorAll('.nav-menu.is-open').forEach((menu) => {
    menu.classList.remove('is-open');
  });
});
