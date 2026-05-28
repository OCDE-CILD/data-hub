(function () {
  const DATA_URL = '/data-hub/assets/data/spotlights.json';

  function isValidDate(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
  }

  function toDate(value) {
    return value ? new Date(value) : null;
  }

  function isActiveItem(item, now = new Date()) {
    if (!item || item.status !== 'active') return false;

    const publishDate = toDate(item.publish_date);
    const expirationDate = toDate(item.expiration_date);

    if (publishDate && publishDate > now) return false;
    if (expirationDate && expirationDate < now) return false;

    return true;
  }

  function sortItems(items) {
    return [...items].sort((a, b) => {
      const aPinned = a.pinned ? 0 : 1;
      const bPinned = b.pinned ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;

      const aOrder = Number.isFinite(Number(a.priority)) ? Number(a.priority) : 9999;
      const bOrder = Number.isFinite(Number(b.priority)) ? Number(b.priority) : 9999;
      if (aOrder !== bOrder) return aOrder - bOrder;

      const aPublish = isValidDate(a.publish_date) ? Date.parse(a.publish_date) : 0;
      const bPublish = isValidDate(b.publish_date) ? Date.parse(b.publish_date) : 0;
      return bPublish - aPublish;
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    if (!isValidDate(value)) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  }

  function renderPreview(target, item, allItems) {
    if (!target || !item) return;

    const initials = (item.category || 'Spotlight')
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    target.innerHTML = `
      <article class="spotlight-preview-card spotlight-fade-in" aria-live="polite">
        <div class="spotlight-preview-header">
          <span class="spotlight-badge">Data Spotlight</span>
          ${item.category ? `<span class="spotlight-chip">${escapeHtml(item.category)}</span>` : ''}
        </div>
        <div class="spotlight-preview-body">
          <div class="spotlight-icon" aria-hidden="true">${escapeHtml(initials)}</div>
          <div class="spotlight-copy">
            <h3 class="spotlight-title">${escapeHtml(item.title)}</h3>
            <p class="spotlight-summary">${escapeHtml(item.summary)}</p>
            <div class="spotlight-meta">
              ${item.audience ? `<span>${escapeHtml(item.audience)}</span>` : ''}
              ${formatDate(item.expiration_date) ? `<span>Expires ${escapeHtml(formatDate(item.expiration_date))}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="spotlight-preview-footer">
          ${item.link_url ? `<a class="spotlight-action" href="${escapeHtml(item.link_url)}">${escapeHtml(item.action_text || 'View more')}</a>` : ''}
          <span class="spotlight-count">${allItems.length} active item${allItems.length === 1 ? '' : 's'}</span>
        </div>
      </article>
    `;
  }

  function renderDetailList(target, items) {
    if (!target) return;

    if (!items.length) {
      target.innerHTML = '<div class="spotlight-empty">No active spotlight items are available right now.</div>';
      return;
    }

    target.innerHTML = items.map((item) => {
      return `
        <article class="spotlight-item">
          <div class="spotlight-item-head">
            <div>
              <span class="spotlight-badge">Data Spotlight</span>
              ${item.category ? `<span class="spotlight-chip">${escapeHtml(item.category)}</span>` : ''}
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            ${formatDate(item.publish_date) ? `<div class="spotlight-dates">Published ${escapeHtml(formatDate(item.publish_date))}</div>` : ''}
          </div>
          <p class="spotlight-summary">${escapeHtml(item.detail || item.summary)}</p>
          <div class="spotlight-item-footer">
            <div class="spotlight-meta">
              ${item.audience ? `<span>${escapeHtml(item.audience)}</span>` : ''}
              ${formatDate(item.expiration_date) ? `<span>Expires ${escapeHtml(formatDate(item.expiration_date))}</span>` : ''}
            </div>
            ${item.link_url ? `<a class="spotlight-action secondary" href="${escapeHtml(item.link_url)}">${escapeHtml(item.link_label || 'Open link')}</a>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function startRotation(target, items) {
    if (!target || items.length < 2) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % items.length;
      target.classList.remove('spotlight-fade-in');
      void target.offsetWidth;
      renderPreview(target, items[index], items);
      target.classList.add('spotlight-fade-in');
    }, 9000);
  }

  async function init() {
    const previewTarget = document.querySelector('[data-spotlight-preview]') || document.querySelector('#spotlightPreview') || document.querySelector('.spotlight-panel');
    const listTarget = document.querySelector('[data-spotlight-list]') || document.querySelector('#spotlightList');

    if (!previewTarget && !listTarget) return;

    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load spotlight data (${response.status})`);

      const payload = await response.json();
      const allItems = Array.isArray(payload.items) ? payload.items : [];
      const activeItems = sortItems(allItems.filter((item) => isActiveItem(item)));

      if (previewTarget) {
        renderPreview(previewTarget, activeItems[0] || allItems[0] || null, activeItems);
        startRotation(previewTarget, activeItems.slice(0, 3));
      }

      if (listTarget) {
        renderDetailList(listTarget, activeItems);
      }
    } catch (error) {
      console.error(error);
      if (previewTarget) {
        previewTarget.innerHTML = '<div class="spotlight-empty">Spotlight content could not be loaded.</div>';
      }
      if (listTarget) {
        listTarget.innerHTML = '<div class="spotlight-empty">Spotlight content could not be loaded.</div>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
