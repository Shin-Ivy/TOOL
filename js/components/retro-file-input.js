/**
 * retro-file-input.js — Shared 8-bit file picker (hidden native input + custom UI).
 * Styles live in css/pixel.css (.px-file-picker*).
 */

class RetroFileInput {
  /**
   * @param {object} options
   * @param {string} options.id — Unique base id (native input becomes `${id}`)
   * @param {string} [options.label] — Section label above the picker
   * @param {string} options.accept — Native accept attribute
   * @param {string} [options.ariaLabel] — Accessibility label for the input
   * @param {string} [options.placeholder='NO FILE SELECTED'] — Empty-state filename text
   * @param {string} [options.buttonText='CHOOSE FILE'] — Retro button label
   * @param {'blue'|'green'|'orange'|'pink'} [options.variant='green'] — Neon accent
   * @param {string[]} [options.extensions] — Allowed extensions (lowercase, no dot)
   * @param {string} [options.invalidMessage] — Toast when extension check fails
   * @param {(file: File, picker: RetroFileInput) => void|Promise<void>} [options.onFileSelect]
   */
  constructor(options) {
    if (!options?.id) throw new Error('RetroFileInput: id is required');
    this.id = options.id;
    this.label = options.label || '';
    this.accept = options.accept || '';
    this.ariaLabel = options.ariaLabel || this.label || 'Choose file';
    this.placeholder = options.placeholder || 'NO FILE SELECTED';
    this.buttonText = options.buttonText || 'CHOOSE FILE';
    this.variant = options.variant || 'green';
    this.extensions = options.extensions || null;
    this.invalidMessage = options.invalidMessage || 'INVALID FILE TYPE';
    this.onFileSelect = options.onFileSelect || null;
    this._bound = false;
  }

  static create(options) {
    return new RetroFileInput(options);
  }

  _variantClass() {
    return this.variant === 'green' ? '' : ` px-file-picker-${this.variant}`;
  }

  /**
   * HTML fragment for embedding in tool mountUI templates.
   */
  renderHTML() {
    const labelHtml = this.label
      ? `<span class="px-label">${this.label}</span>`
      : '';
    return `
      ${labelHtml}
      <div class="px-file-picker${this._variantClass()}" id="${this.id}-picker" data-retro-file-picker>
        <input type="file" id="${this.id}" class="px-file-input"
          accept="${this.accept}"
          aria-label="${this._escAttr(this.ariaLabel)}">
        <label for="${this.id}" class="px-file-picker-trigger" id="${this.id}-trigger" tabindex="0">
          <svg class="px-file-picker-icon" viewBox="0 0 16 14" aria-hidden="true" focusable="false">
            <rect x="1" y="4" width="14" height="9" fill="currentColor"/>
            <polygon points="1,4 6,4 8,2 16,2 16,4 14,4" fill="currentColor"/>
          </svg>
          <span class="px-file-picker-btn">${this.buttonText}</span>
          <span class="px-file-picker-name" id="${this.id}-filename">${this.placeholder}</span>
        </label>
      </div>
    `;
  }

  mount(container) {
    if (typeof container === 'string') {
      const el = document.getElementById(container);
      if (!el) throw new Error(`RetroFileInput: container #${container} not found`);
      container = el;
    }
    container.insertAdjacentHTML('beforeend', this.renderHTML());
    this.bind();
    return this;
  }

  bind() {
    if (this._bound) return this;
    this._bound = true;

    this.input = document.getElementById(this.id);
    this.trigger = document.getElementById(`${this.id}-trigger`);
    this.filenameEl = document.getElementById(`${this.id}-filename`);

    this.trigger?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.input?.click();
      }
    });

    this.input?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (this.extensions?.length) {
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!this.extensions.includes(ext)) {
          if (typeof Toast !== 'undefined') Toast.show(this.invalidMessage, 'error');
          e.target.value = '';
          return;
        }
      }

      this.setFileName(file.name, true);

      if (!this.onFileSelect) return;

      try {
        await this.onFileSelect(file, this);
      } catch (_) {
        this.reset();
        e.target.value = '';
      }
    });

    return this;
  }

  setFileName(name, loaded = true) {
    if (!this.filenameEl) this.filenameEl = document.getElementById(`${this.id}-filename`);
    if (!this.filenameEl) return;
    this.filenameEl.textContent = name;
    this.filenameEl.classList.toggle('is-loaded', loaded);
    if (loaded && name) this.filenameEl.title = name;
    else this.filenameEl.removeAttribute('title');
  }

  reset() {
    if (this.input) this.input.value = '';
    this.setFileName(this.placeholder, false);
  }

  _escAttr(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  }
}

if (typeof window !== 'undefined') {
  window.RetroFileInput = RetroFileInput;
}
