(() => {
  const scriptUrl = document.currentScript?.src;
  const DATA_URL = scriptUrl
    ? new URL('../data/spotlights.json', scriptUrl).href
    : '/data-hub/assets/data/spotlights.json';

  const SPOTLIGHT_PAGE_URL = '/data-hub/pages/spotlight.html';
  const ROTATION_MS = 9000;
  const TRANSITION_MS = 480;

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function isValidDate(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
  }

  function formatDate(value) {
    if (!isValidDate(value)) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  }

  function toDate(value) {
    return isValidDate(value) ? new Date(value) : null;
  }

  function normalizeItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
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

      const aPriority = Number.isFinite(Number(a.priority)) ? Number(a.priority) : 9999;
      const bPriority = Number.isFinite(Number(b.priority)) ? Number(b.priority) : 9999;
      if (aPriority !== bPriority) return aPriority - bPriority;

      const aPublish = isValidDate(a.publish_date) ? Date.parse(a.publish_date) : 0;
      const bPublish = isValidDate(b.publish_date) ? Date.parse(b.publish_date) : 0;
      return bPublish - aPublish;
    });
  }

  function getSummary(item) {
    return item.summary || item.detail || '';
  }

  function renderPreviewCard(item) {
    const title = escapeHtml(item.title || '');
    const summary = escapeHtml(getSummary(item));
    const expires = formatDate(item.expiration_date);

    return `
      <article class="spotlight-card">
        <div class="spotlight-card__body">
          <h3 class="spotlight-card__title">${title}</h3>
          <p class="spotlight-card__summary">${summary}</p>

          ${
            expires
              ? `<div class="spotlight-card__meta">Expires ${escapeHtml(expires)}</div>`
              : ''
          }
        </div>
      </article>
    `;
  }

  function renderDetailCard(item) {
    const title = escapeHtml(item.title || '');
    const detail = escapeHtml(item.detail || item.summary || '');
    const published = formatDate(item.publish_date);
    const expires = formatDate(item.expiration_date);

    return `
      <article class="spotlight-detail-card">
        <h3 class="spotlight-detail-card__title">${title}</h3>
        <p class="spotlight-detail-card__summary">${detail}</p>

        <div class="spotlight-detail-card__meta">
          ${published ? `<span>Published ${escapeHtml(published)}</span>` : ''}
          ${expires ? `<span>Expires ${escapeHtml(expires)}</span>` : ''}
        </div>

        ${
          item.link_url
            ? `<a class="spotlight-detail-card__link" href="${escapeHtml(item.link_url)}">${
                escapeHtml(item.link_label || 'Open resource')
              }</a>`
            : ''
        }
      </article>
    `;
  }

  function renderList(target, items) {
    if (!target) return;

    if (!items.length) {
      target.innerHTML = `
        <div class="spotlight-empty">
          No active spotlight items are available right now.
        </div>
      `;
      return;
    }

    target.innerHTML = items.map(renderDetailCard).join('');
  }

  function renderSteadyPreview(target, item) {
    if (!target || !item) return;

    target.innerHTML = `
      <div class="spotlight-viewport">
        ${renderPreviewCard(item)}
      </div>
    `;
  }

  function renderAnimatedPreview(target, currentItem, nextItem) {
    if (!target || !currentItem || !nextItem) return;

    target.innerHTML = `
      <div class="spotlight-viewport spotlight-viewport--animating">
        <div class="spotlight-slide spotlight-slide--leave">
          ${renderPreviewCard(currentItem)}
        </div>
        <div class="spotlight-slide spotlight-slide--enter">
          ${renderPreviewCard(nextItem)}
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      const viewport = target.querySelector('.spotlight-viewport');
      if (viewport) viewport.classList.add('is-animating');
    });

    window.setTimeout(() => {
      renderSteadyPreview(target, nextItem);
    }, TRANSITION_MS);
  }

  function initPreviewRotation(target, items) {
    if (!target || items.length === 0) return;

    let currentIndex = 0;
    let paused = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    renderSteadyPreview(target, items[currentIndex]);

    if (items.length === 1 || reduceMotion) return;

    target.addEventListener('mouseenter', () => {
      paused = true;
    });

    target.addEventListener('mouseleave', () => {
      paused = false;
    });

    window.setInterval(() => {
      if (paused) return;

      const currentItem = items[currentIndex];
      const nextIndex = (currentIndex + 1) % items.length;
      const nextItem = items[nextIndex];

      renderAnimatedPreview(target, currentItem, nextItem);
      currentIndex = nextIndex;
    }, ROTATION_MS);
  }

  async function init() {
    const previewTarget = document.querySelector('#spotlight-preview');
    const listTarget = document.querySelector('[data-spotlight-list]') || document.querySelector('#spotlightList');

    if (!previewTarget && !listTarget) return;

    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load spotlight data (${response.status})`);
      }

      const payload = await response.json();
      const activeItems = sortItems(normalizeItems(payload).filter((item) => isActiveItem(item)));

      if (previewTarget) {
        initPreviewRotation(previewTarget, activeItems.slice(0, 3));
      }

      if (listTarget) {
        renderList(listTarget, activeItems);
      }
    } catch (error) {
      console.error(error);

      if (previewTarget) {
        previewTarget.innerHTML = `
          <div class="spotlight-empty">
            Spotlight content could not be loaded.
          </div>
        `;
      }

      if (listTarget) {
        listTarget.innerHTML = `
          <div class="spotlight-empty">
            Spotlight content could not be loaded.
          </div>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
