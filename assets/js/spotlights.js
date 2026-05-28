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

  function getInitials(item) {
    const source = item.category || item.title || 'DS';
    return source
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function renderPreviewCard(item, totalCount, isNext = false) {
    if (!item) return '';

    return `
      <article class="spotlight-preview-card ${isNext ? 'spotlight-preview-card--next' : ''}">
        <div class="spotlight-preview-header">
          <span class="spotlight-badge">Data Spotlight</span>
          ${item.category ? `<span class="spotlight-chip">${escapeHtml(item.category)}</span>` : ''}
        </div>

        <div class="spotlight-preview-body">
          <div class="spotlight-icon" aria-hidden="true">${escapeHtml(getInitials(item))}</div>

          <div class="spotlight-copy">
            <h3 class="spotlight-title">${escapeHtml(item.title)}</h3>
            <p class="spotlight-summary">${escapeHtml(item.summary || item.detail || '')}</p>

            <div class="spotlight-meta">
              ${item.audience ? `<span>${escapeHtml(item.audience)}</span>` : ''}
              ${formatDate(item.expiration_date) ? `<span>Expires ${escapeHtml(formatDate(item.expiration_date))}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="spotlight-preview-footer">
          ${item.link_url ? `<a class="spotlight-action" href="${escapeHtml(item.link_url)}">${escapeHtml(item.action_text || item.link_label || 'View more')}</a>` : ''}
          <span class="spotlight-count">${totalCount} active item${totalCount === 1 ? '' : 's'}</span>
        </div>
      </article>
    `;
  }

  function renderPreview(target, item, allItems, nextItem = null) {
    if (!target || !item) return;

    const totalCount = allItems.length;
    target.innerHTML = `
      <div class="spotlight-current">
        ${renderPreviewCard(item, totalCount, false)}
      </div>
      ${
        nextItem
          ? `
            <div class="spotlight-divider"></div>
            <div class="spotlight-next-label">Next up</div>
            <div class="spotlight-next">
              ${renderPreviewCard(nextItem, totalCount, true)}
            </div>
          `
          : ''
      }
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
          <p class="spotlight-summary">${escapeHtml(item.detail || item.summary || '')}</p>
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

  function fadeSwap(target, currentItem, nextItem, allItems) {
    if (!target || !currentItem || !nextItem) return;

    target.classList.add('spotlight-is-fading');
    window.setTimeout(() => {
      renderPreview(target, nextItem, allItems, allItems[(allItems.indexOf(nextItem) + 1) % allItems.length]);
      target.classList.remove('spotlight-is-fading');
    }, 250);
  }

  function startRotation(target, items) {
    if (!target || items.length < 2) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let index = 0;
    window.setInterval(() => {
      const current = items[index];
      index = (index + 1) % items.length;
      const next = items[index];
      fadeSwap(target, current, next, items);
    }, 9000);
  }

  async function init() {
    const previewTarget = document.querySelector('#spotlight-preview');
    const nextTarget = document.querySelector('#spotlight-next');
    const listTarget = document.querySelector('[data-spotlight-list]') || document.querySelector('#spotlightList');

    if (!previewTarget && !listTarget) return;

    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load spotlight data (${response.status})`);

      const payload = await response.json();
      const allItems = Array.isArray(payload.items) ? payload.items : [];
      const activeItems = sortItems(allItems.filter((item) => isActiveItem(item)));

      if (previewTarget) {
        const first = activeItems[0] || null;
        const second = activeItems[1] || null;
        renderPreview(previewTarget, first, activeItems, second);
        startRotation(previewTarget, activeItems.slice(0, 3));
      }

      if (nextTarget) {
        const nextItem = activeItems[1] || activeItems[0] || null;
        nextTarget.innerHTML = nextItem
          ? `<div class="spotlight-next-teaser"><strong>Next up:</strong> ${escapeHtml(nextItem.title)}</div>`
          : '';
      }

      if (listTarget) {
        renderDetailList(listTarget, activeItems);
      }
    } catch (error) {
      console.error(error);
      if (previewTarget) {
        previewTarget.innerHTML = '<div class="spotlight-empty">Spotlight content could not be loaded.</div>';
      }
      if (nextTarget) {
        nextTarget.innerHTML = '';
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
