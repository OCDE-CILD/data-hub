(() => {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const viewport = root.querySelector('.carousel-viewport');
  const track = root.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const toggleBtn = root.querySelector('[data-carousel-toggle]');
  const dotsWrap = root.querySelector('[data-carousel-dots]');

  const AUTOPLAY_MS = 4000;
  const SWIPE_PX = 40;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0;
  let perView = 4;
  let maxIndex = 0;
  let timer = null;
  let userPaused = reduceMotion.matches;
  let hoverPaused = false;
  let focusPaused = false;

  // ---------- Missing preview images fall back to a labeled placeholder ----------
  root.querySelectorAll('.feature-preview img').forEach((img) => {
    const markMissing = () => img.closest('.feature-preview')?.classList.add('is-missing');
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener('error', markMissing);
  });

  // ---------- Layout helpers ----------
  function getPerView() {
    const value = parseInt(getComputedStyle(root).getPropertyValue('--per-view'), 10);
    return value > 0 ? value : 1;
  }

  function getStep() {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  function buildDots() {
    const count = maxIndex + 1;
    if (dotsWrap.children.length === count) return;

    dotsWrap.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
    }
  }

  function render() {
    track.style.transform = `translateX(${-index * getStep()}px)`;

    slides.forEach((slide, i) => {
      const visible = i >= index && i < index + perView;
      slide.inert = !visible;
      slide.setAttribute('aria-hidden', visible ? 'false' : 'true');
    });

    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.setAttribute('aria-current', i === index ? 'true' : 'false');
    });
  }

  function layout() {
    perView = getPerView();
    maxIndex = Math.max(0, slides.length - perView);
    index = Math.min(index, maxIndex);
    buildDots();

    // Jump without animating when the layout changes
    track.style.transition = 'none';
    render();
    void track.offsetWidth;
    track.style.transition = '';

    const multiple = maxIndex > 0;
    [prevBtn, nextBtn, toggleBtn, dotsWrap].forEach((el) => {
      if (el) el.hidden = !multiple;
    });
    syncAutoplay();
  }

  // ---------- Navigation ----------
  function goTo(i, manual = false) {
    index = i > maxIndex ? 0 : i < 0 ? maxIndex : i;
    render();
    if (manual) syncAutoplay();
  }

  const next = (manual = false) => goTo(index + 1, manual);
  const prev = (manual = false) => goTo(index - 1, manual);

  // ---------- Autoplay ----------
  function shouldPlay() {
    return !userPaused && !hoverPaused && !focusPaused && !document.hidden && maxIndex > 0;
  }

  function syncAutoplay() {
    window.clearInterval(timer);
    timer = null;

    const playing = shouldPlay();
    if (playing) timer = window.setInterval(() => next(false), AUTOPLAY_MS);

    toggleBtn?.setAttribute('data-playing', String(!userPaused));
    toggleBtn?.setAttribute('aria-label', userPaused ? 'Start automatic rotation' : 'Pause automatic rotation');
    track.setAttribute('aria-live', playing ? 'off' : 'polite');
  }

  // ---------- Events ----------
  prevBtn?.addEventListener('click', () => prev(true));
  nextBtn?.addEventListener('click', () => next(true));

  toggleBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    syncAutoplay();
  });

  root.addEventListener('mouseenter', () => {
    hoverPaused = true;
    syncAutoplay();
  });

  root.addEventListener('mouseleave', () => {
    hoverPaused = false;
    syncAutoplay();
  });

  root.addEventListener('focusin', () => {
    focusPaused = true;
    syncAutoplay();
  });

  root.addEventListener('focusout', (event) => {
    if (root.contains(event.relatedTarget)) return;
    focusPaused = false;
    syncAutoplay();
  });

  document.addEventListener('visibilitychange', syncAutoplay);

  reduceMotion.addEventListener?.('change', (event) => {
    userPaused = event.matches;
    syncAutoplay();
  });

  // Swipe support
  let touchStartX = null;
  viewport.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', (event) => {
    if (touchStartX === null) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx < 0) next(true);
    else prev(true);
  }, { passive: true });

  // Keep everything aligned on resize
  let resizeFrame = null;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(layout);
  });

  layout();
})();