/**
 * pixel-theme.js — Global theme provider (login + dashboard).
 * Persists preset in `pixel_theme` and custom colors in `pixel_theme_custom`.
 */

const PIXEL_THEME_KEY = 'pixel_theme';
const PIXEL_THEME_CUSTOM_KEY = 'pixel_theme_custom';

const THEME_PRESETS = ['dark', 'light', 'custom'];

const DEFAULT_CUSTOM = {
  bg: '#0a0a0a',
  accent: '#39ff14',
  border: '#39ff14',
  glow: '#39ff14',
};

const CUSTOM_VAR_KEYS = [
  '--black', '--dark', '--dark2', '--dark3',
  '--green', '--green-dim', '--green-dark',
  '--border-green', '--px-shadow-green', '--px-text-glow',
  '--page-bg', '--tool-area-bg',
];

function _hexToRgb(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function _mixHex(hex, pct) {
  const rgb = _hexToRgb(hex);
  if (!rgb) return hex;
  const p = Math.max(-1, Math.min(1, pct));
  const f = p < 0 ? 0 : 255;
  const t = Math.abs(p);
  const ch = (n) => {
    const v = Math.round(rgb[n] + (f - rgb[n]) * t);
    const s = v.toString(16);
    return s.length === 1 ? '0' + s : s;
  };
  return `#${ch('r')}${ch('g')}${ch('b')}`;
}

function _normalizeGlow(glow, accent) {
  if (!glow) return `0 0 8px ${accent}66`;
  if (glow.includes('px') || glow.includes('rgb')) return glow;
  if (glow.startsWith('#')) return `0 0 10px ${glow}`;
  return glow;
}

const PixelTheme = (function () {
  const _subscribers = new Set();

  function _parseCustom(raw) {
    try {
      const o = raw ? JSON.parse(raw) : null;
      return o && typeof o === 'object' ? { ...DEFAULT_CUSTOM, ...o } : { ...DEFAULT_CUSTOM };
    } catch (_) {
      return { ...DEFAULT_CUSTOM };
    }
  }

  function getCustom() {
    return _parseCustom(localStorage.getItem(PIXEL_THEME_CUSTOM_KEY));
  }

  function saveCustom(custom) {
    const merged = { ...DEFAULT_CUSTOM, ...custom };
    localStorage.setItem(PIXEL_THEME_CUSTOM_KEY, JSON.stringify(merged));
    return merged;
  }

  function _clearCustomInline() {
    const root = document.documentElement;
    CUSTOM_VAR_KEYS.forEach((key) => root.style.removeProperty(key));
  }

  function _applyCustomInline(custom) {
    const root = document.documentElement;
    const c = { ...DEFAULT_CUSTOM, ...custom };
    const bg = c.bg;
    const accent = c.accent || c.border;
    const border = c.border || accent;
    const glow = _normalizeGlow(c.glow, accent);

    root.style.setProperty('--black', bg);
    root.style.setProperty('--dark', _mixHex(bg, -0.08));
    root.style.setProperty('--dark2', _mixHex(bg, -0.14));
    root.style.setProperty('--dark3', _mixHex(bg, 0.1));
    root.style.setProperty('--green', accent);
    root.style.setProperty('--green-dim', _mixHex(accent, -0.35));
    root.style.setProperty('--green-dark', _mixHex(accent, -0.55));
    root.style.setProperty('--border-green', `3px solid ${border}`);
    root.style.setProperty('--px-shadow-green', `4px 4px 0 ${_mixHex(accent, -0.35)}`);
    root.style.setProperty('--px-text-glow', glow);
    root.style.setProperty(
      '--page-bg',
      `linear-gradient(158deg, ${bg} 0%, ${_mixHex(bg, -0.06)} 50%, ${_mixHex(bg, 0.04)} 100%)`
    );
    root.style.setProperty(
      '--tool-area-bg',
      `linear-gradient(180deg, ${_mixHex(bg, -0.04)} 0%, ${bg} 100%)`
    );
  }

  function _syncDom(preset) {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', preset);
    if (body) body.setAttribute('data-theme', preset);
  }

  function _notify(preset) {
    document.dispatchEvent(new CustomEvent('pixel:themechange', { detail: { theme: preset } }));
    _subscribers.forEach((fn) => {
      try { fn(preset); } catch (err) { console.warn('[PixelTheme]', err); }
    });
  }

  function current() {
    const t = localStorage.getItem(PIXEL_THEME_KEY) || 'dark';
    return THEME_PRESETS.includes(t) ? t : 'dark';
  }

  function apply(preset) {
    const mode = THEME_PRESETS.includes(preset) ? preset : 'dark';
    localStorage.setItem(PIXEL_THEME_KEY, mode);
    _syncDom(mode);

    if (mode === 'custom') {
      _applyCustomInline(getCustom());
    } else {
      _clearCustomInline();
    }

    _updatePresetButtons(mode);
    _syncCustomInputs();
    _notify(mode);
  }

  function setPreset(preset) {
    apply(preset);
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
    if (typeof Toast !== 'undefined') {
      const msg = preset === 'light'
        ? (typeof PixelLang !== 'undefined' ? PixelLang.t('theme_toast_light') : 'LIGHT MODE')
        : preset === 'dark'
          ? (typeof PixelLang !== 'undefined' ? PixelLang.t('theme_toast_dark') : 'DARK MODE')
          : (typeof PixelLang !== 'undefined' ? PixelLang.t('theme_toast_custom') : 'CUSTOM THEME');
      Toast.show(msg, 'info', 1400);
    }
  }

  function setCustomColors(partial, options) {
    const opts = options || {};
    const merged = saveCustom({ ...getCustom(), ...partial });
    if (opts.apply !== false) {
      apply('custom');
    } else {
      _syncCustomInputs();
    }
    return merged;
  }

  function togglePreset() {
    const next = current() === 'light' ? 'dark' : 'light';
    setPreset(next);
    return next;
  }

  function _updatePresetButtons(active) {
    document.querySelectorAll('[data-theme-preset]').forEach((btn) => {
      const on = btn.getAttribute('data-theme-preset') === active;
      btn.classList.toggle('px-theme-preset-btn--active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    const customPanel = document.getElementById('px-theme-custom-panel');
    if (customPanel) customPanel.open = active === 'custom';
  }

  function _syncCustomInputs() {
    const c = getCustom();
    document.querySelectorAll('[data-theme-color]').forEach((input) => {
      const key = input.getAttribute('data-theme-color');
      if (key === 'glow') {
        input.value = c.glow && String(c.glow).startsWith('#') ? c.glow : c.accent;
        return;
      }
      if (c[key]) input.value = c[key];
    });
  }

  function _wireSettingsTheme() {
    document.querySelectorAll('[data-theme-preset]').forEach((btn) => {
      if (btn.dataset.pixelThemeBound === '1') return;
      btn.dataset.pixelThemeBound = '1';
      btn.addEventListener('click', () => {
        setPreset(btn.getAttribute('data-theme-preset'));
      });
    });

    const panel = document.querySelector('.px-theme-custom');
    if (panel && panel.dataset.pixelThemePanelBound !== '1') {
      panel.dataset.pixelThemePanelBound = '1';
      ['mousedown', 'click', 'pointerdown'].forEach((ev) => {
        panel.addEventListener(ev, (e) => e.stopPropagation());
      });
    }

    document.querySelectorAll('[data-theme-color]').forEach((input) => {
      if (input.dataset.pixelThemeColorBound === '1') return;
      input.dataset.pixelThemeColorBound = '1';
      input.style.pointerEvents = 'auto';
      ['mousedown', 'click', 'pointerdown'].forEach((ev) => {
        input.addEventListener(ev, (e) => e.stopPropagation());
      });
      input.addEventListener('input', () => {
        const key = input.getAttribute('data-theme-color');
        let value = input.value;
        if (key === 'glow') value = input.value;
        setCustomColors({ [key]: value });
      });
    });

    const resetBtn = document.getElementById('px-theme-reset-custom');
    if (resetBtn && resetBtn.dataset.pixelThemeResetBound !== '1') {
      resetBtn.dataset.pixelThemeResetBound = '1';
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem(PIXEL_THEME_CUSTOM_KEY);
        setPreset('dark');
      });
    }

    const modalPanel = document.querySelector('.px-settings-modal__panel');
    if (modalPanel && modalPanel.dataset.pixelThemeModalBound !== '1') {
      modalPanel.dataset.pixelThemeModalBound = '1';
      modalPanel.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  function init() {
    apply(current());
    _wireSettingsTheme();
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    _subscribers.add(fn);
    return () => _subscribers.delete(fn);
  }

  return {
    current,
    apply,
    setPreset,
    setCustomColors,
    getCustom,
    saveCustom,
    togglePreset,
    init,
    subscribe,
    presets: THEME_PRESETS,
    DEFAULT_CUSTOM,
  };
})();

/** Global theme facade — mirrors PixelI18n. */
const PixelThemeProvider = {
  current: () => PixelTheme.current(),
  apply: (preset) => PixelTheme.apply(preset),
  setPreset: (preset) => PixelTheme.setPreset(preset),
  setCustomColors: (partial, opts) => PixelTheme.setCustomColors(partial, opts),
  getCustom: () => PixelTheme.getCustom(),
  subscribe: (fn) => PixelTheme.subscribe(fn),
};

if (typeof window !== 'undefined') {
  window.PixelTheme = PixelTheme;
  window.PixelThemeProvider = PixelThemeProvider;
  window.toggleTheme = () => PixelTheme.togglePreset();
}
