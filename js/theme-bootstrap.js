/**
 * theme-bootstrap.js — Apply saved theme before first paint (anti-FOUC).
 * Load synchronously in <head> before pixel.css.
 */
(function (global) {
  var THEME_KEY = 'pixel_theme';
  var CUSTOM_KEY = 'pixel_theme_custom';
  var LANG_KEY = 'pixel_lang';
  var LEGACY_LANG = 'savedLanguage';

  var CUSTOM_VARS = [
    '--black', '--dark', '--dark2', '--dark3',
    '--green', '--green-dim', '--green-dark',
    '--border-green', '--px-shadow-green', '--px-text-glow',
    '--page-bg', '--tool-area-bg'
  ];

  function parseCustom(raw) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function hexToRgb(hex) {
    var h = String(hex || '').replace('#', '').trim();
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (h.length !== 6) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function mixHex(hex, pct) {
    var rgb = hexToRgb(hex);
    if (!rgb) return hex;
    var p = Math.max(-1, Math.min(1, pct));
    var f = p < 0 ? 0 : 255;
    var t = Math.abs(p);
    var r = Math.round(rgb.r + (f - rgb.r) * t);
    var g = Math.round(rgb.g + (f - rgb.g) * t);
    var b = Math.round(rgb.b + (f - rgb.b) * t);
    return '#' + [r, g, b].map(function (n) {
      var s = n.toString(16);
      return s.length === 1 ? '0' + s : s;
    }).join('');
  }

  function clearCustomInline(root) {
    for (var i = 0; i < CUSTOM_VARS.length; i++) {
      root.style.removeProperty(CUSTOM_VARS[i]);
    }
  }

  function applyCustomInline(root, custom) {
    if (!custom) return;
    var bg = custom.bg || '#0a0a0a';
    var accent = custom.accent || custom.border || '#39ff14';
    var border = custom.border || accent;
    var glow = custom.glow || (accent + '66');

    root.style.setProperty('--black', bg);
    root.style.setProperty('--dark', mixHex(bg, -0.08));
    root.style.setProperty('--dark2', mixHex(bg, -0.14));
    root.style.setProperty('--dark3', mixHex(bg, 0.1));
    root.style.setProperty('--green', accent);
    root.style.setProperty('--green-dim', mixHex(accent, -0.35));
    root.style.setProperty('--green-dark', mixHex(accent, -0.55));
    root.style.setProperty('--border-green', '3px solid ' + border);
    root.style.setProperty('--px-shadow-green', '4px 4px 0 ' + mixHex(accent, -0.35));
    root.style.setProperty('--px-text-glow', glow);
    root.style.setProperty('--page-bg', 'linear-gradient(158deg, ' + bg + ' 0%, ' + mixHex(bg, -0.06) + ' 50%, ' + mixHex(bg, 0.04) + ' 100%)');
    root.style.setProperty('--tool-area-bg', 'linear-gradient(180deg, ' + mixHex(bg, -0.04) + ' 0%, ' + bg + ' 100%)');
  }

  var root = global.document && global.document.documentElement;
  if (!root) return;

  var preset = global.localStorage.getItem(THEME_KEY) || 'dark';
  if (preset !== 'dark' && preset !== 'light' && preset !== 'custom') preset = 'dark';

  root.setAttribute('data-theme', preset);

  if (preset === 'custom') {
    applyCustomInline(root, parseCustom(global.localStorage.getItem(CUSTOM_KEY)));
  } else {
    clearCustomInline(root);
  }

  var lang = global.localStorage.getItem(LANG_KEY) || global.localStorage.getItem(LEGACY_LANG);
  if (lang === 'jp') lang = 'ja';
  if (lang === 'id' || lang === 'es' || lang === 'fr' || lang === 'ja') {
    root.lang = lang;
  }
})(typeof window !== 'undefined' ? window : globalThis);
