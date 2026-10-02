/* Thin sketch frame.
   Include once, at the end of <body>:
     <script src="/shared/frame.js"></script>
   Draws "NNN · job · ← index" and an optional notes drawer from /sketches.json.
   Styles stay inside a shadow root, so the sketch keeps its own fonts and colors.
   Add ?poster=1 to skip the bar (used when shooting poster.png). */
(() => {
  const script = document.currentScript;
  if (!script) return;
  if (new URLSearchParams(location.search).has('poster')) return;
  if (document.getElementById('sketch-frame')) return;

  const parts = location.pathname.split('/').filter(Boolean);
  const folder = parts.indexOf('sketches');
  const slug = (script.dataset.slug || (folder >= 0 ? parts[folder + 1] : '') || '').replace(/\.html$/i, '');
  const rawNum = (slug.split('-')[0] || '').replace(/\D/g, '');
  const num = rawNum ? rawNum.padStart(3, '0') : '—';

  installFonts(script);

  const host = document.createElement('div');
  host.id = 'sketch-frame';
  const shadow = host.attachShadow({ mode: 'open' });

  const bar = el('div', 'bar');
  const numEl = el('span', 'num', num);
  const jobSep = el('span', 'sep', '·');
  const jobEl = el('span', 'job');
  jobSep.hidden = true;
  jobEl.hidden = true;

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

  bar.append(numEl, jobSep, jobEl, notesSep, notesBtn, backSep, back);

  const drawer = el('div', 'drawer');
  drawer.id = 'notes';
  drawer.hidden = true;
  drawer.setAttribute('role', 'region');
  drawer.setAttribute('aria-label', 'Notes');

  const fallback = `
    .bar, .drawer { pointer-events: auto; box-sizing: border-box; }
    .bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1;
      display: flex; align-items: center; gap: .5em;
      height: 36px; padding: 0 14px;
      background: #f3efe6; color: #1c1a17;
      border-bottom: 1px solid #c9bfb0;
      font: 11px/1 ui-monospace, monospace;
    }
    .drawer { position: fixed; top: 36px; left: 0; right: 0; background: #f3efe6; color: #1c1a17; padding: 16px; }
    [hidden] { display: none !important; }
  `;

  const style = document.createElement('style');
  style.textContent = fallback;
  shadow.append(style, bar, drawer);

  let open = false;
  let touchRestore = null;

  function setOpen(next) {
    open = next;
    drawer.hidden = !open;
    notesBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (touchRestore == null) touchRestore = document.body.style.touchAction;
      document.body.style.touchAction = 'manipulation';
    } else if (touchRestore != null) {
      document.body.style.touchAction = touchRestore;
      touchRestore = null;
    }
  }

  notesBtn.addEventListener('click', () => setOpen(!open));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      notesBtn.focus();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!open || event.target === host) return;
    setOpen(false);
  });

  const mount = () => {
    if (!host.isConnected) document.body.append(host);
  };
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  fetch(new URL('frame.css', script.src))
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
    .then((css) => { style.textContent = css; })
    .catch(() => { /* fallback style above stays */ });

  if (!slug) return;

  fetch('/sketches.json', { cache: 'no-cache' })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data) => {
      if (!Array.isArray(data)) return;
      const entry = data.find((item) => item && item.slug === slug);
      if (!entry) return;
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
})();
