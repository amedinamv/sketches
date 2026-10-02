/* Sketch frame.
   Include once, at the end of <body>:
     <script src="/shared/frame.js"></script>
   The sketch picks a variant on <html data-frame="light|dark">.
   Optional controls live in [data-frame-controls] (kept hidden until this runs).
   The bar is "NNN · title · job · Notes · ← index", plus a notes drawer.
   Styles for the bar stay in a shadow root. Control styles are injected for
   the light-DOM dock so sketch scripts can keep their element references.
   Add ?poster=1 to skip the bar and leave the controls hidden. */
(() => {
  const script = document.currentScript;
  if (!script) return;
  if (new URLSearchParams(location.search).has('poster')) return;
  if (document.getElementById('sketch-frame')) return;

  const THEMES = {
    light: {
      ground: '#f3efe6',
      ink: '#1c1a17',
      muted: '#5c5852',
      line: '#c9bfb0',
      scheme: 'light',
    },
    dark: {
      ground: '#141311',
      ink: '#f3efe6',
      muted: '#a8a298',
      line: '#3a372f',
      scheme: 'dark',
    },
  };

  const parts = location.pathname.split('/').filter(Boolean);
  const folder = parts.indexOf('sketches');
  const slug = (script.dataset.slug || (folder >= 0 ? parts[folder + 1] : '') || '').replace(/\.html$/i, '');
  const rawNum = (slug.split('-')[0] || '').replace(/\D/g, '');
  const num = rawNum ? rawNum.padStart(3, '0') : '—';
  const asked = (script.dataset.frame || document.documentElement.dataset.frame || 'light').toLowerCase();
  const variant = asked === 'dark' ? 'dark' : 'light';
  const theme = THEMES[variant];

  installFonts(script);
  applyFrameTokens(theme);

  const host = document.createElement('div');
  host.id = 'sketch-frame';
  host.setAttribute('data-variant', variant);
  const shadow = host.attachShadow({ mode: 'open' });

  const bar = el('div', 'bar');
  const numEl = el('span', 'num', num);
  const titleSep = el('span', 'sep title-sep', '·');
  const titleEl = el('span', 'title');
  titleSep.hidden = true;
  titleEl.hidden = true;

  const jobSep = el('span', 'sep job-sep', '·');
  const jobEl = el('span', 'job');
  jobSep.hidden = true;
  jobEl.hidden = true;

  const controlsSep = el('span', 'sep controls-sep', '·');
  const controlsBtn = el('button', 'controls-toggle', 'Controls');
  controlsBtn.type = 'button';
  controlsBtn.setAttribute('aria-expanded', 'false');
  controlsBtn.setAttribute('aria-controls', 'frame-controls');

  const notesSep = el('span', 'sep', '·');
  const notesBtn = el('button', 'notes', 'Notes');
  notesBtn.type = 'button';
  notesBtn.setAttribute('aria-expanded', 'false');
  notesBtn.setAttribute('aria-controls', 'notes');
  notesSep.hidden = true;
  notesBtn.hidden = true;

  const backSep = el('span', 'sep', '·');
  const back = el('a', 'back', '← index');
  back.href = '/';

  bar.append(numEl, titleSep, titleEl, jobSep, jobEl, controlsSep, controlsBtn, notesSep, notesBtn, backSep, back);

  const drawer = el('div', 'drawer');
  drawer.id = 'notes';
  drawer.hidden = true;
  drawer.setAttribute('role', 'region');
  drawer.setAttribute('aria-label', 'Notes');

  const style = document.createElement('style');
  style.textContent = fallbackCss(theme);
  shadow.append(style, bar, drawer);

  const controls = document.querySelector('[data-frame-controls]');
  const hasFields = !!(controls && controls.querySelector('.fields input, .fields select, .fields textarea, .fields button'));
  if (hasFields) host.setAttribute('data-has-fields', '');

  let notesOpen = false;
  let controlsOpen = false;
  let touchRestore = null;

  function setNotes(next) {
    notesOpen = next;
    drawer.hidden = !notesOpen;
    notesBtn.setAttribute('aria-expanded', notesOpen ? 'true' : 'false');
    document.documentElement.toggleAttribute('data-frame-notes', notesOpen);
    if (notesOpen) {
      if (touchRestore == null) touchRestore = document.body.style.touchAction;
      document.body.style.touchAction = 'manipulation';
      if (controlsOpen) setControls(false);
    } else if (touchRestore != null) {
      document.body.style.touchAction = touchRestore;
      touchRestore = null;
    }
    syncOffset();
  }

  function setControls(next) {
    if (!controls || !hasFields) return;
    controlsOpen = next;
    controls.toggleAttribute('data-open', next);
    controlsBtn.setAttribute('aria-expanded', next ? 'true' : 'false');
    if (next && notesOpen) setNotes(false);
    else syncOffset();
  }

  notesBtn.addEventListener('click', () => setNotes(!notesOpen));
  controlsBtn.addEventListener('click', () => setControls(!controlsOpen));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (notesOpen) {
      setNotes(false);
      notesBtn.focus();
    } else if (controlsOpen) {
      setControls(false);
      controlsBtn.focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!notesOpen && !controlsOpen) return;
    if (fromFrame(event)) return;
    if (notesOpen) setNotes(false);
    if (controlsOpen) setControls(false);
  });

  function fromFrame(event) {
    if (event.composedPath().includes(host)) return true;
    const target = event.target;
    return !!(target && target.closest && target.closest('[data-frame-controls]'));
  }

  const controlsStyle = document.createElement('style');
  controlsStyle.id = 'sketch-frame-controls';
  controlsStyle.textContent = controlsCss();
  document.head.append(controlsStyle);

  const mount = () => {
    if (!host.isConnected) document.body.append(host);
    adoptControls();
    syncOffset();
  };
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  window.addEventListener('resize', syncOffset);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncOffset);
    window.visualViewport.addEventListener('scroll', syncOffset);
  }

  fetch(new URL('frame.css', script.src))
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
    .then((css) => { style.textContent = css; syncOffset(); })
    .catch(() => { /* fallback style above stays */ });

  if (slug) {
    fetch('/sketches.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!Array.isArray(data)) return;
        const entry = data.find((item) => item && item.slug === slug);
        if (!entry) return;
        if (entry.title) {
          titleEl.textContent = entry.title;
          titleEl.hidden = false;
          titleSep.hidden = false;
        }
        if (entry.job) {
          jobEl.textContent = entry.job;
          jobEl.hidden = false;
          jobSep.hidden = false;
        }
        const fields = [
          ['Problem', entry.problem],
          ['Idea', entry.interaction],
          ['Technique', entry.technique],
          ['What I\u2019d ship', entry.ship],
        ].filter(([, value]) => typeof value === 'string' && value.trim());
        if (!fields.length) return;
        for (const [label, value] of fields) {
          const h = document.createElement('h2');
          h.textContent = label;
          const p = document.createElement('p');
          p.textContent = value.trim();
          drawer.append(h, p);
        }
        notesSep.hidden = false;
        notesBtn.hidden = false;
      })
      .catch(() => { /* bar still shows the number and the way back */ });
  }

  function adoptControls() {
    if (!controls) return;
    if (!controls.id) controls.id = 'frame-controls';
    controls.setAttribute('role', 'region');
    if (!controls.getAttribute('aria-label')) controls.setAttribute('aria-label', 'Sketch controls');
    if (hasFields) controls.setAttribute('data-has-fields', '');
    controls.hidden = false;
    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(() => syncOffset());
      observer.observe(controls);
    }
    syncOffset();
  }

  function syncOffset() {
    const barBottom = Math.ceil(bar.getBoundingClientRect().bottom);
    let bottom = barBottom;
    if (controls && !controls.hidden && getComputedStyle(controls).display !== 'none') {
      const nextTop = barBottom + 'px';
      if (controls.style.top !== nextTop) controls.style.top = nextTop;
      bottom = Math.max(bottom, Math.ceil(controls.getBoundingClientRect().bottom));
    }
    document.documentElement.style.setProperty('--frame-offset', Math.max(0, bottom) + 'px');
  }

  function applyFrameTokens(next) {
    const root = document.documentElement;
    root.dataset.frame = variant;
    root.style.setProperty('--frame-ground', next.ground);
    root.style.setProperty('--frame-ink', next.ink);
    root.style.setProperty('--frame-muted', next.muted);
    root.style.setProperty('--frame-line', next.line);
    root.style.setProperty('--frame-mono', '"Geist Mono", ui-monospace, "SF Mono", Menlo, monospace');
    root.style.setProperty('--frame-sans', '"Geist", ui-sans-serif, system-ui, sans-serif');
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function installFonts(from) {
    if (document.getElementById('sketch-frame-fonts')) return;
    const face = document.createElement('style');
    face.id = 'sketch-frame-fonts';
    const sans = new URL('fonts/geist-latin.woff2', from.src).href;
    const mono = new URL('fonts/geist-mono-latin.woff2', from.src).href;
    face.textContent = `
      @font-face {
        font-family: "Geist";
        src: url("${sans}") format("woff2");
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: "Geist Mono";
        src: url("${mono}") format("woff2");
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.append(face);
  }

  function fallbackCss(next) {
    return `
      .bar, .drawer { pointer-events: auto; box-sizing: border-box; cursor: default; }
      .bar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 1;
        display: flex; align-items: center; gap: .5em;
        height: calc(36px + env(safe-area-inset-top, 0px));
        padding-top: env(safe-area-inset-top, 0px);
        padding-left: max(14px, env(safe-area-inset-left, 0px));
        padding-right: max(14px, env(safe-area-inset-right, 0px));
        background: ${next.ground}; color: ${next.ink};
        border-bottom: 1px solid ${next.line};
        font: 11px/1 ${'ui-monospace, monospace'};
        white-space: nowrap;
      }
      .title, .job { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .job { color: ${next.muted}; }
      .drawer {
        position: fixed; top: calc(36px + env(safe-area-inset-top, 0px)); left: 0; right: 0;
        background: ${next.ground}; color: ${next.ink}; padding: 16px;
        border-bottom: 1px solid ${next.line};
      }
      .controls-sep, .controls-toggle { display: none; }
      [hidden] { display: none !important; }
    `;
  }

  function controlsCss() {
    return `
      [data-frame-controls][hidden] { display: none !important; }
      html[data-frame-notes] [data-frame-controls] { display: none !important; }
      [data-frame-controls] {
        position: fixed;
        z-index: 39;
        top: calc(36px + env(safe-area-inset-top, 0px));
        left: 0;
        right: 0;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 28px;
        max-height: min(52dvh, calc(100dvh - 36px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 8px));
        overflow: auto;
        overscroll-behavior: contain;
        padding: 8px max(14px, env(safe-area-inset-right, 0px)) 10px max(14px, env(safe-area-inset-left, 0px));
        border-bottom: 1px solid var(--frame-line);
        background: var(--frame-ground);
        color: var(--frame-ink);
        color-scheme: light;
        font-family: var(--frame-mono);
        font-size: 11px;
        font-weight: 400;
        line-height: 1.45;
        letter-spacing: 0.01em;
        cursor: default;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
        -webkit-tap-highlight-color: transparent;
        touch-action: auto;
        -webkit-user-select: auto;
        user-select: auto;
      }
      html[data-frame="dark"] [data-frame-controls] { color-scheme: dark; }
      [data-frame-controls] * { touch-action: auto; }
      [data-frame-controls] [hidden] { display: none !important; }
      [data-frame-controls] [data-frame-hint] {
        flex: 1 1 200px;
        min-width: 0;
        margin: 0;
        max-width: 68ch;
        color: var(--frame-muted);
      }
      [data-frame-controls] .fields {
        flex: 2 1 440px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px 22px;
        margin: 0;
        min-width: 0;
      }
      [data-frame-controls] label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        color: var(--frame-muted);
        font: inherit;
        cursor: default;
      }
      [data-frame-controls] label span {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
      }
      [data-frame-controls] output {
        color: var(--frame-ink);
        font-variant-numeric: tabular-nums;
      }
      [data-frame-controls] input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        display: block;
        width: 100%;
        height: 24px;
        margin: 0;
        background: transparent;
        cursor: pointer;
        touch-action: none;
      }
      [data-frame-controls] input[type="range"]:focus { outline: none; }
      [data-frame-controls] input[type="range"]:focus-visible {
        outline: 1px solid var(--frame-ink);
        outline-offset: 3px;
      }
      [data-frame-controls] input[type="range"]::-webkit-slider-runnable-track {
        height: 2px;
        background: var(--frame-line);
      }
      [data-frame-controls] input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        margin-top: -5px;
        border: 0;
        border-radius: 50%;
        background: var(--frame-ink);
      }
      [data-frame-controls] input[type="range"]::-moz-range-track {
        height: 2px;
        background: var(--frame-line);
        border: 0;
      }
      [data-frame-controls] input[type="range"]::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border: 0;
        border-radius: 50%;
        background: var(--frame-ink);
      }
      [data-frame-controls] :focus { outline: none; }
      [data-frame-controls] :focus-visible {
        outline: 1px solid var(--frame-ink);
        outline-offset: 3px;
      }
      @media (hover: hover) and (pointer: fine) {
        [data-frame-controls] [data-when="coarse"] { display: none; }
      }
      @media (hover: none), (pointer: coarse) {
        [data-frame-controls] [data-when="fine"] { display: none; }
      }
      @media (max-width: 720px) {
        [data-frame-controls][data-has-fields]:not([data-open]) .fields { display: none; }
        [data-frame-controls] .fields { grid-template-columns: 1fr; }
      }
      @media (prefers-reduced-motion: reduce) {
        [data-frame-controls] { scroll-behavior: auto; }
      }
    `;
  }
})();
