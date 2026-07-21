(() => {
  // ─── Route config ────────────────────────────────────────────────────────────
  // Add or rename nav items here. Keys are used as the `data-nav-active` value
  // on each page's <nav> element.
  //
  // Each page entry needs:
  //   label      – display text
  //   file       – filename inside /pages/ (omit for index)
  //   parent     – key of the dropdown this lives under (optional)
  //
  // Each dropdown entry needs:
  //   label      – button text
  //   isDropdown – true

  const NAV_ITEMS = [
    { key: 'home',                    label: 'Home' },
    { key: 'dashboards',              label: 'Dashboards',              isDropdown: true },
    { key: 'chronic-absenteeism',     label: 'Chronic Absenteeism',     file: 'chronic-absenteeism.html',      parent: 'dashboards', subParent: 'attendance' },
    { key: 'suspension',              label: 'Suspension',              file: 'suspension.html',              parent: 'dashboards', subParent: 'attendance' },
    { key: 'grad-dropout',            label: 'Graduation & Dropout',    file: 'grad-dropout.html',            parent: 'dashboards', subParent: 'attendance' },
    { key: 'college-career',          label: 'College &amp; Career',    file: 'college-career.html',          parent: 'dashboards' },
    { key: 'math',                    label: 'Math Assessment',         file: 'math.html',                    parent: 'dashboards', subParent: 'academics' },
    { key: 'ela',                    label: 'English Language Arts Assessment',         file: 'ela.html',                    parent: 'dashboards', subParent: 'academics' },
    { key: 'science',                    label: 'Science Assessment',         file: 'science.html',                    parent: 'dashboards', subParent: 'academics' },
    { key: 'english-learners',        label: 'English Learners',        file: 'english-learners.html',        parent: 'dashboards' },
    { key: 'differentiated-assistance', label: 'Differentiated Assistance', file: 'differentiated-assistance.html', parent: 'dashboards' },
    { key: 'spotlight',               label: 'Spotlight',               file: 'spotlight.html',               parent: 'dashboards' },
    { key: 'resources',               label: 'Resources',               isDropdown: true },
    { key: 'methodology',             label: 'Methodology &amp; Notes', file: 'methodology.html',                            parent: 'resources' },
    { key: 'downloads',               label: 'Downloads',               file: 'downloads.html',                            parent: 'resources' },
    { key: 'about',                   label: 'About',                   isDropdown: true },
    { key: 'purpose',                 label: 'Purpose',                 file: 'purpose.html',                 parent: 'about' },
    { key: 'faq',                     label: 'FAQ',                     file: 'faq.html',                     parent: 'about' },
    { key: 'contact',                 label: 'Contact Us',              href: 'mailto:redi@ocde.us' },
  ];

  // ─── Path helper ─────────────────────────────────────────────────────────────
  // Figures out whether we're on the index page (root) or a subpage (pages/)
  // and returns the correct prefix for links.

  function getPrefix() {
    const path = window.location.pathname;
    // If the path ends with /index.html or just / or the repo root, we're at root
    if (/\/(index\.html)?$/.test(path) || path.endsWith('/data-hub/')) {
      return { pages: 'pages/', home: 'index.html' };
    }
    return { pages: '../pages/', home: '/data-hub/index.html' };
  }

  function resolveHref(item, prefix) {
    if (item.href !== undefined) return item.href;
    if (item.key === 'home') return prefix.home;
    if (item.file) return prefix.pages + item.file;
    return '#';
  }

  // ─── Build nav HTML ──────────────────────────────────────────────────────────

  function buildNav(activeKey) {
    const prefix = getPrefix();

    // Group items into top-level structure
    const topLevel = NAV_ITEMS.filter(i => !i.parent && !i.isDropdown || i.key === 'home');
    const dropdowns = NAV_ITEMS.filter(i => i.isDropdown);

    let html = '';

    // Home link
    const homeActive = activeKey === 'home' ? ' class="active"' : '';
    html += `<a href="${prefix.home}"${homeActive}>Home</a>\n`;

    // Dashboards dropdown
    html += buildDashboardsDropdown(activeKey, prefix);

    // Resources dropdown
    html += buildSimpleDropdown('resources', 'Resources', activeKey, prefix);

    // About dropdown
    html += buildSimpleDropdown('about', 'About', activeKey, prefix);

    // Contact Us
    const contactItem = NAV_ITEMS.find(i => i.key === 'contact');
    html += `<a href="${contactItem.href || '#'}" class="nav-trigger" style="border:0;background:transparent;cursor:pointer;font-size:14px;font-weight:600;color:#fff;padding:9px 0 7px;">Contact Us</a>\n`;

    return html;
  }

  function buildDashboardsDropdown(activeKey, prefix) {
    const dashItems = NAV_ITEMS.filter(i => i.parent === 'dashboards');
    const attendanceItems = dashItems.filter(i => i.subParent === 'attendance');
    const academicsItems = dashItems.filter(i => i.subParent === 'academics');
    const otherItems = dashItems.filter(i => !i.subParent);

    const isDashboardActive = dashItems.some(i => i.key === activeKey);

    let inner = '';

    // Attendance & Engagement section label + sub-links
    inner += `<span class="dropdown-section-label">Attendance &amp; Engagement <span style="float:right">▾</span></span>\n`;
    for (const item of attendanceItems) {
      const isActive = item.key === activeKey;
      const cls = ['dropdown-sub-link', isActive ? 'active' : ''].filter(Boolean).join(' ');
      inner += `<a href="${resolveHref(item, prefix)}" class="${cls}">${item.label}</a>\n`;
    }

    // Academics section label + sub-links
    inner += `<span class="dropdown-section-label">Academics <span style="float:right">▾</span></span>\n`;
    for (const item of academicsItems) {
      const isActive = item.key === activeKey;
      const cls = ['dropdown-sub-link', isActive ? 'active' : ''].filter(Boolean).join(' ');
      inner += `<a href="${resolveHref(item, prefix)}" class="${cls}">${item.label}</a>\n`;
    }

    // Other dashboard items
    for (const item of otherItems) {
      const isActive = item.key === activeKey;
      const cls = isActive ? ' class="active"' : '';
      inner += `<a href="${resolveHref(item, prefix)}"${cls}>${item.label}</a>\n`;
    }

    return `<div class="nav-menu">
  <button class="nav-trigger" type="button">Dashboards ▾</button>
  <div class="dropdown">
    ${inner.trim()}
  </div>
</div>\n`;
  }

  function buildSimpleDropdown(key, label, activeKey, prefix) {
    const items = NAV_ITEMS.filter(i => i.parent === key);

    let inner = '';
    for (const item of items) {
      const isActive = item.key === activeKey;
      const cls = isActive ? ' class="active"' : '';
      inner += `<a href="${resolveHref(item, prefix)}"${cls}>${item.label}</a>\n`;
    }

    return `<div class="nav-menu">
  <button class="nav-trigger" type="button">${label} ▾</button>
  <div class="dropdown">
    ${inner.trim()}
  </div>
</div>\n`;
  }

  // ─── Mobile hamburger toggle ─────────────────────────────────────────────────
  // Inserts a hamburger button right before the <nav> element (once per page)
  // and wires it up to show/hide the whole nav on small screens via the
  // `.is-open` class that styles.css keys off of.

  function ensureMobileToggle(navEl) {
    const parent = navEl.parentElement;
    if (!parent || parent.querySelector('.mobile-nav-toggle')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="mobile-nav-toggle__bars" aria-hidden="true"></span>';

    toggle.addEventListener('click', () => {
      const isOpen = navEl.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));

      // Closing the whole menu should also close any open dropdown inside it.
      if (!isOpen) {
        navEl.querySelectorAll('.nav-menu.is-open').forEach((menu) => {
          menu.classList.remove('is-open');
        });
      }
    });

    navEl.insertAdjacentElement('beforebegin', toggle);
  }

  // ─── Inject ──────────────────────────────────────────────────────────────────

  function init() {
  const navEl = document.querySelector('[data-nav]');
  if (!navEl) return;

  const activeKey = navEl.dataset.navActive || '';
  navEl.innerHTML = buildNav(activeKey);
  ensureMobileToggle(navEl);

  navEl.addEventListener('click', (event) => {
    const trigger = event.target.closest('.nav-menu > .nav-trigger');
    if (!trigger) return;
    if (!window.matchMedia('(max-width: 900px)').matches) return;

    event.preventDefault();

    const menu = trigger.closest('.nav-menu');
    const isOpen = menu.classList.contains('is-open');

    navEl.querySelectorAll('.nav-menu.is-open').forEach((openMenu) => {
      openMenu.classList.remove('is-open');
    });

    if (!isOpen) {
      menu.classList.add('is-open');
    } else {
      trigger.blur();
    }
  });
}

init();
})();
