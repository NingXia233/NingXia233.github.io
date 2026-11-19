(() => {
  const dialog = document.querySelector('#chapter-atlas');
  const trigger = document.querySelector('[data-menu-trigger]');
  const panel = dialog?.querySelector('.atlas-panel');
  const closeButton = dialog?.querySelector('.atlas-close');
  if (typeof dialog?.showModal !== 'function' || !trigger || !panel || !closeButton) return;

  const root = document.documentElement;
  const links = [...dialog.querySelectorAll('.atlas-link')];
  const chapterLinks = links.filter(link => !link.closest('.atlas-resources'));
  const title = dialog.querySelector('.atlas-title');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const timing = 'cubic-bezier(.24,.78,.24,1)';
  const canAnimate = () => !media.matches && typeof panel.animate === 'function' &&
    CSS.supports('clip-path', 'circle(0px at 0px 0px)');
  let phase = 'closed';
  let version = 0;
  let iris = null;
  let entrances = [];
  let queued = null;
  let returnScroll = 0;

  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.setAttribute('aria-expanded', 'false');

  function chapterRoute(link) {
    if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return null;
    const url = new URL(link.href, document.baseURI);
    if (url.origin !== location.origin || url.pathname !== location.pathname ||
        url.search !== location.search || !url.hash) return null;

    let id = url.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Fragment IDs can contain literal percent characters.
    }
    const destination = document.getElementById(id);
    return destination ? { link, destination, hash: url.hash } : null;
  }

  function center(element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { x: left + width / 2, y: top + height / 2 };
  }

  function aperture({ x, y }, open) {
    const { width, height } = dialog.getBoundingClientRect();
    const radius = open ? Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2 : 0;
    return 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)';
  }

  function runIris(from, to, duration) {
    iris?.cancel();
    panel.style.clipPath = from;
    iris = panel.animate([{ clipPath: from }, { clipPath: to }], {
      duration,
      easing: timing,
      fill: 'both'
    });
    return iris.finished.catch(() => {});
  }

  function clearIris() {
    iris?.cancel();
    iris = null;
    panel.style.clipPath = '';
  }

  function cancelEntrances() {
    entrances.forEach(animation => animation.cancel());
    entrances = [];
  }

  function updateActiveLink() {
    const routes = chapterLinks.map(chapterRoute).filter(Boolean);
    if (!routes.length) return;

    let active = routes[0].link;
    let closestTop = -Infinity;
    routes.forEach(({ link, destination }) => {
      const top = destination.getBoundingClientRect().top;
      link.removeAttribute('aria-current');
      if (top < innerHeight * .35 && top > closestTop) {
        active = link;
        closestTop = top;
      }
    });
    active.setAttribute('aria-current', 'location');
  }

  function resetAtlas() {
    ++version;
    phase = 'closed';
    queued = null;
    clearIris();
    cancelEntrances();
    if (dialog.open) dialog.close();
    root.classList.remove('atlas-open');
    trigger.setAttribute('aria-expanded', 'false');
    delete panel.dataset.phase;
  }

  async function open() {
    if (phase !== 'closed') return;
    const thisVersion = ++version;
    const origin = center(trigger);
    returnScroll = scrollY;
    phase = 'opening';
    updateActiveLink();
    dialog.showModal();
    panel.scrollTop = 0;
    root.classList.add('atlas-open');
    trigger.setAttribute('aria-expanded', 'true');
    closeButton.focus({ preventScroll: true });
    if (scrollY !== returnScroll) scrollTo({ top: returnScroll, behavior: 'instant' });

    if (canAnimate()) {
      entrances = [title, ...links].filter(Boolean).map((element, index) =>
        element.animate(
          [{ opacity: 0, transform: 'translateY(17px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 490, delay: 90 + index * 43, fill: 'backwards', easing: timing }
        )
      );
      await runIris(aperture(origin, false), aperture(origin, true), 640);
    }
    if (thisVersion !== version) return;
    clearIris();
    phase = 'open';
    if (queued) close(queued);
  }

  function scrollToChapter({ destination, hash }) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    destination.scrollIntoView({ block: 'start', behavior: 'instant' });
    window.dispatchEvent(new CustomEvent('chapter-jump', {
      detail: { phase: 'prepare', sourceY: returnScroll, destination: destination.id }
    }));
  }

  async function close(route = null) {
    if (phase === 'closed' || phase === 'closing') return;
    if (route && phase === 'opening') {
      queued = route;
      return;
    }

    const thisVersion = ++version;
    phase = 'closing';
    queued = null;
    panel.dataset.phase = phase;
    const origin = center(route?.link ?? trigger);
    const full = aperture(origin, true);
    const from = getComputedStyle(panel).clipPath;
    if (route) scrollToChapter(route);

    if (canAnimate()) {
      await runIris(from === 'none' ? full : from, aperture(origin, false), route ? 620 : 465);
    }
    if (thisVersion !== version) return;
    resetAtlas();

    if (route) {
      const { destination } = route;
      if (!destination.hasAttribute('tabindex')) {
        destination.setAttribute('tabindex', '-1');
        destination.addEventListener('blur', () => destination.removeAttribute('tabindex'), { once: true });
      }
      destination.focus({ preventScroll: true });
      destination.scrollIntoView({ block: 'start', behavior: 'instant' });
      window.dispatchEvent(new CustomEvent('chapter-jump', { detail: { phase: 'arrive' } }));
    } else {
      trigger.focus({ preventScroll: true });
      scrollTo({ top: returnScroll, behavior: 'instant' });
    }
  }

  function plainClick(event) {
    return !event.defaultPrevented && event.button === 0 &&
      !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  trigger.addEventListener('click', event => {
    if (!plainClick(event)) return;
    event.preventDefault();
    open();
  });
  closeButton.addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    close();
  });
  chapterLinks.forEach(link => {
    link.addEventListener('click', event => {
      if (!plainClick(event)) return;
      const route = chapterRoute(link);
      if (!route) return;
      event.preventDefault();
      close(route);
    });
  });
  media.addEventListener('change', () => {
    if (media.matches) {
      iris?.finish();
      cancelEntrances();
    }
  });

  function closeOnNavigation() {
    if (phase !== 'closed') resetAtlas();
  }

  window.addEventListener('pageswap', closeOnNavigation);
  window.addEventListener('pagehide', closeOnNavigation);
})();
