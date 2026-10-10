/**
 * <pressed-field>
 * A form control whose type carries validity: faint while the value is
 * unfinished, heavier and lightly debossed once it is valid. An error
 * wobbles once and is written out. It does not use color as the signal.
 *
 * Drop this file next to pressed-field.css. No build step.
 * The input stays in light DOM so a native <form> can submit it.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+[0-9\s().-]+$/;

let seq = 0;

/**
 * @param {string} value
 * @param {{
 *   validate?: string,
 *   required?: boolean,
 *   minlength?: number,
 *   pattern?: string,
 *   error?: string,
 *   validator?: ((value: string) => boolean | string) | null,
 * }} [options]
 * @returns {{ ok: boolean, empty: boolean, message: string }}
 */
export function assess(value, options = {}) {
  const text = String(value ?? '').trim();
  const kind = normalizeKind(options.validate);
  const required = Boolean(options.required);
  const minlength = Number(options.minlength) || 0;
  const error = typeof options.error === 'string' ? options.error.trim() : '';
  const fail = (empty, fallback) => ({
    ok: false,
    empty,
    message: error || fallback,
  });

  if (!text) {
    if (!required) return { ok: true, empty: true, message: '' };
    return fail(true, emptyMessage(kind, minlength));
  }

  let ok = true;
  let message = '';

  if (kind === 'email') {
    ok = EMAIL.test(text);
    if (!ok) message = error || 'Enter a complete email address, such as name@studio.com.';
  } else if (kind === 'phone') {
    ok = phoneOk(text);
    if (!ok) message = error || 'Enter a full number with a country code, such as +34 612 345 678.';
  } else if (kind === 'pattern') {
    const matched = patternOk(text, options.pattern);
    ok = matched.ok;
    if (!ok) message = error || matched.message || 'Enter a value in the expected format.';
  } else if (minlength && [...text].length < minlength) {
    ok = false;
    message = error || `Enter at least ${minlength} characters.`;
  }

  if (ok && kind !== 'pattern' && options.pattern) {
    const matched = patternOk(text, options.pattern);
    ok = matched.ok;
    if (!ok)         message = error || matched.message || 'Enter a value in the expected format.';
  }

  if (ok && typeof options.validator === 'function') {
    try {
      const result = options.validator(text);
      if (result === false) {
        ok = false;
        message = error || 'Enter a value that fits this field.';
      } else if (typeof result === 'string' && result) {
        ok = false;
        message = result;
      }
    } catch {
      ok = false;
      message = error || 'Enter a value that fits this field.';
    }
  }

  return { ok, empty: false, message: ok ? '' : message };
}

function normalizeKind(value) {
  const kind = String(value || 'text').toLowerCase();
  if (kind === 'whatsapp') return 'phone';
  if (kind === 'email' || kind === 'phone' || kind === 'pattern' || kind === 'text') return kind;
  return 'text';
}

function emptyMessage(kind, minlength) {
  if (kind === 'email') return 'Enter an email address, such as name@studio.com.';
  if (kind === 'phone') return 'Enter a phone number with a country code, such as +34 612 345 678.';
  if (kind === 'pattern') return 'Enter a value.';
  if (minlength > 1) return `Enter at least ${minlength} characters.`;
  return 'Enter a value.';
}

function phoneOk(text) {
  let normalized = text.trim();
  if (normalized.startsWith('00')) normalized = `+${normalized.slice(2)}`;
  if (!PHONE_CHARS.test(normalized)) return false;
  const digits = normalized.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function patternOk(text, source) {
  if (!source) return { ok: false, message: 'Add a pattern, or choose another validator.' };
  try {
    return { ok: new RegExp(source).test(text), message: '' };
  } catch {
    return { ok: false, message: 'The pattern is not a valid regular expression.' };
  }
}

function ensureStyles() {
  const href = new URL('./pressed-field.css', import.meta.url).href;
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    if (link.href === href) return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

function registerAxes() {
  if (!globalThis.CSS || typeof CSS.registerProperty !== 'function') return;
  const defs = [
    ['--pp-live-wght', '<number>', '360'],
    ['--pp-live-soft', '<number>', '60'],
  ];
  for (const [name, syntax, initialValue] of defs) {
    try {
      CSS.registerProperty({ name, syntax, inherits: true, initialValue });
    } catch {
      /* already registered, or the engine rejected the syntax */
    }
  }
}

const Base = globalThis.HTMLElement ?? class {};

export class PressedField extends Base {
  static get observedAttributes() {
    return [
      'label', 'helper', 'error', 'validate', 'when', 'pattern', 'placeholder',
      'required', 'disabled', 'name', 'type', 'autocomplete', 'minlength',
      'maxlength', 'inputmode', 'autocapitalize', 'enterkeyhint', 'spellcheck',
      'value', 'form', 'loading',
    ];
  }

  constructor() {
    super();
    this._validator = null;
    this._input = null;
    this._labelText = null;
    this._message = null;
    this._copy = null;
    this._sr = null;
    this._field = null;
    this._mounted = false;
    this._alive = false;
    this._ok = null;
    this._prevOk = null;
    this._state = 'idle';
    this._committed = false;
    this._fallbackLabel = '';
    this._form = null;
    this._reduce = null;
    this._wobbleTimer = 0;
    this._onInput = () => this._sync({ reason: 'input' });
    this._onBlur = () => this._sync({ reason: 'blur' });
    this._onInvalid = (event) => {
      event.preventDefault();
      this._sync({ reason: 'submit' });
    };
    this._onReset = () => {
      this._committed = false;
      requestAnimationFrame(() => this._sync({ silent: true }));
    };
    this._onReduce = () => {
      if (this._reduce?.matches) this.classList.remove('is-wobbling');
    };
  }

  get value() {
    return this._input ? this._input.value : (this.getAttribute('value') || '');
  }

  set value(next) {
    const text = next == null ? '' : String(next);
    if (!this._input) {
      this.setAttribute('value', text);
      return;
    }
    this._input.value = text;
    this._sync();
  }

  get validator() {
    return this._validator;
  }

  set validator(fn) {
    this._validator = typeof fn === 'function' ? fn : null;
    if (this._mounted) this._sync();
  }

  get state() {
    return this._state;
  }

  checkValidity() {
    this._sync({ silent: true });
    return this._input ? this._input.checkValidity() : true;
  }

  reportValidity() {
    this._sync({ reason: 'submit' });
    return this._input ? this._input.reportValidity() : true;
  }

  connectedCallback() {
    if (!this.isConnected) return;
    ensureStyles();
    registerAxes();
    if (!this._mounted) this._mount();
    else this._reduce?.addEventListener?.('change', this._onReduce);
    this._apply();
    this._bindForm();
    this._sync({ silent: true });
    this._alive = true;
  }

  disconnectedCallback() {
    this._alive = false;
    this._reduce?.removeEventListener?.('change', this._onReduce);
    this._unbindForm();
  }

  attributeChangedCallback() {
    if (!this._mounted) return;
    this._apply();
    this._sync();
  }

  _mount() {
    const input = this.querySelector('input') || document.createElement('input');
    const kept = input.value;
    if (!this.hasAttribute('label')) {
      const existing = this.querySelector('label');
      if (existing) {
        const copy = existing.cloneNode(true);
        copy.querySelector('input')?.remove();
        this._fallbackLabel = copy.textContent.replace(/\s+/g, ' ').trim();
      }
    }
    input.classList.add('pp-control');

    const label = document.createElement('label');
    label.className = 'pp-label';
    const labelText = document.createElement('span');
    labelText.className = 'pp-label-text';
    const field = document.createElement('span');
    field.className = 'pp-field';
    field.append(input);
    if (input.value !== kept) input.value = kept;

    const rule = document.createElement('span');
    rule.className = 'pp-rule';
    rule.setAttribute('aria-hidden', 'true');
    field.append(rule);
    label.append(labelText, field);

    const message = document.createElement('p');
    message.className = 'pp-message';
    message.id = `pp-msg-${++seq}`;
    message.setAttribute('aria-live', 'polite');
    const sr = document.createElement('span');
    sr.className = 'pp-sr';
    const copy = document.createElement('span');
    copy.className = 'pp-copy';
    message.append(sr, copy);

    this.replaceChildren(label, message);
    this._input = input;
    this._labelText = labelText;
    this._message = message;
    this._sr = sr;
    this._copy = copy;
    this._field = field;
    this._mounted = true;

    input.setAttribute('aria-describedby', message.id);
    input.addEventListener('input', this._onInput);
    input.addEventListener('change', this._onInput);
    input.addEventListener('blur', this._onBlur);
    input.addEventListener('invalid', this._onInvalid);
    field.addEventListener('animationend', () => this.classList.remove('is-wobbling'));

    this._reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._reduce.addEventListener?.('change', this._onReduce);
  }

  _kind() {
    return normalizeKind(this.getAttribute('validate') || this._inferKind());
  }

  _inferKind() {
    const type = (this.getAttribute('type') || this._input?.type || '').toLowerCase();
    if (type === 'email') return 'email';
    if (type === 'tel') return 'phone';
    return 'text';
  }

  _when() {
    return this.getAttribute('when') === 'input' ? 'input' : 'blur';
  }

  _apply() {
    const input = this._input;
    if (!input) return;
    const kind = this._kind();
    const label = this.getAttribute('label') || this._fallbackLabel || '';
    this._labelText.textContent = label;

    const name = this.getAttribute('name');
    if (name != null) input.name = name;

    const typeAttr = this.getAttribute('type');
    if (typeAttr) input.type = typeAttr;
    else if (kind === 'phone') input.type = 'tel';
    else input.type = 'text';

    if (this.hasAttribute('inputmode')) input.inputMode = this.getAttribute('inputmode');
    else if (kind === 'email') input.inputMode = 'email';
    else if (kind === 'phone') input.inputMode = 'tel';
    else input.inputMode = 'text';

    const autoCap = this.getAttribute('autocapitalize');
    if (autoCap != null) input.autocapitalize = autoCap;
    else input.autocapitalize = kind === 'text' ? 'sentences' : 'off';

    this._setOrRemove(input, 'placeholder', this.getAttribute('placeholder'));
    this._setOrRemove(input, 'autocomplete', this.getAttribute('autocomplete'));
    this._setOrRemove(input, 'minlength', this.getAttribute('minlength'));
    this._setOrRemove(input, 'maxlength', this.getAttribute('maxlength'));
    this._setOrRemove(input, 'enterkeyhint', this.getAttribute('enterkeyhint'));
    this._setOrRemove(input, 'form', this.getAttribute('form'));

    const spell = this.getAttribute('spellcheck');
    if (spell != null) input.spellcheck = spell !== 'false';
    else input.spellcheck = kind === 'text';

    input.required = this.hasAttribute('required');
    const disabled = this.hasAttribute('disabled') || this.disabled;
    const loading = this.hasAttribute('loading');
    input.disabled = Boolean(disabled);
    input.readOnly = Boolean(loading) && !disabled;
    if (this.hasAttribute('required')) input.setAttribute('aria-required', 'true');
    else input.removeAttribute('aria-required');

    if (loading) {
      this.dataset.loading = '';
      this.setAttribute('aria-busy', 'true');
      input.setAttribute('aria-busy', 'true');
    } else {
      delete this.dataset.loading;
      this.removeAttribute('aria-busy');
      input.removeAttribute('aria-busy');
    }

    if (!this._alive && this.hasAttribute('value')) input.value = this.getAttribute('value');
  }

  _setOrRemove(input, attr, value) {
    if (value == null || value === '') input.removeAttribute(attr);
    else input.setAttribute(attr, value);
  }

  _options() {
    return {
      validate: this._kind(),
      required: this.hasAttribute('required'),
      minlength: this.getAttribute('minlength'),
      pattern: this.getAttribute('pattern'),
      error: this.getAttribute('error') || '',
      validator: this._validator,
    };
  }

  _sync({ reason, silent = false } = {}) {
    const input = this._input;
    if (!input) return;

    if (reason === 'input' && this._when() === 'input') this._committed = true;
    if (reason === 'blur' || reason === 'submit') this._committed = true;

    const result = assess(input.value, this._options());
    const showError = !result.ok && this._committed;
    const prevState = this._state;
    const state = result.ok
      ? (result.empty ? 'idle' : 'inked')
      : (showError ? 'error' : (result.empty ? 'idle' : 'soft'));

    this._state = state;
    this._ok = result.ok;
    this.dataset.state = state;
    if (showError) this.dataset.invalid = '';
    else delete this.dataset.invalid;

    input.setAttribute('aria-invalid', showError ? 'true' : 'false');
    if (showError) input.setAttribute('aria-errormessage', this._message.id);
    else input.removeAttribute('aria-errormessage');

    const helper = this.getAttribute('helper') || '';
    const loading = this.hasAttribute('loading');
    const nextCopy = loading ? 'Checking…' : (showError ? result.message : helper);
    const nextPrefix = !loading && showError ? 'Error: ' : '';
    if (this._copy.textContent !== nextCopy) this._copy.textContent = nextCopy;
    if (this._sr.textContent !== nextPrefix) this._sr.textContent = nextPrefix;

    if (result.ok) input.setCustomValidity('');
    else input.setCustomValidity(result.message || 'Enter a value that fits this field.');

    const becameError = showError && prevState !== 'error' && !loading && !input.disabled;
    if (becameError) this._wobble();

    if (!silent && this._alive && this._prevOk !== result.ok) {
      const name = input.name || this.getAttribute('name') || '';
      this.dispatchEvent(new CustomEvent(result.ok ? 'pp:valid' : 'pp:invalid', {
        bubbles: true,
        composed: true,
        detail: {
          name,
          value: input.value,
          valid: result.ok,
          state,
          message: showError ? result.message : '',
        },
      }));
    }
    this._prevOk = result.ok;
    this._bindForm();
  }

  _wobble() {
    if (this._reduce?.matches) return;
    const amount = Number.parseFloat(getComputedStyle(this).getPropertyValue('--pp-wobble'));
    if (Number.isFinite(amount) && amount <= 0) return;
    this.classList.remove('is-wobbling');
    void this.offsetWidth;
    this.classList.add('is-wobbling');
    const raw = getComputedStyle(this).getPropertyValue('--pp-duration').trim();
    const ms = raw.endsWith('ms') ? parseFloat(raw) : raw.endsWith('s') ? parseFloat(raw) * 1000 : 280;
    clearTimeout(this._wobbleTimer);
    this._wobbleTimer = setTimeout(() => this.classList.remove('is-wobbling'), (Number.isFinite(ms) ? ms : 280) + 50);
  }

  _bindForm() {
    const form = this._input?.form || null;
    if (form === this._form) return;
    this._unbindForm();
    this._form = form;
    if (form) form.addEventListener('reset', this._onReset);
  }

  _unbindForm() {
    if (this._form) this._form.removeEventListener('reset', this._onReset);
    this._form = null;
  }
}

if (globalThis.customElements && !customElements.get('pressed-field')) {
  customElements.define('pressed-field', PressedField);
}
