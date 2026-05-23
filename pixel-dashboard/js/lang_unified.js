/**
 * lang_unified.js — PIXEL.TOOLS Unified Language & Settings System
 * ═══════════════════════════════════════════════════════════════
 * Works on BOTH index.html (login) and dashboard.html.
 * Persists language choice to localStorage under 'pixel_lang'.
 *
 * Public API:
 *   PixelSettings.open()   — open the settings modal
 *   PixelSettings.close()  — close the settings modal
 *   PixelSettings.toggle() — toggle the settings modal
 *   PixelLang.t(key)       — get translated string for current locale
 *   PixelLang.current()    — returns 'id' | 'en'
 */

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE DICTIONARY
   ═══════════════════════════════════════════════════════════════ */
const PIXEL_DICT = {
  en: {
    /* Settings modal */
    settings_title:      '▸ SETTINGS',
    settings_lang_label: 'LANGUAGE / BAHASA',
    settings_close:      'CLOSE',
    settings_saved:      'SETTINGS SAVED',

    /* Login page */
    sign_in_btn:         'SIGN IN WITH GOOGLE',
    loading_ready:       'READY — PRESS START ▶',
    system_status:       'SYSTEM STATUS',

    /* Dashboard header */
    logout_btn:          'LOGOUT',

    /* Generic */
    welcome:             'WELCOME BACK',
    tools_available:     'TOOLS AVAILABLE',
    todays_date:         "TODAY'S DATE",
    todo_streak:         'TODO STREAK',
    days:                'DAYS',
  },

  id: {
    /* Settings modal */
    settings_title:      '▸ PENGATURAN',
    settings_lang_label: 'BAHASA / LANGUAGE',
    settings_close:      'TUTUP',
    settings_saved:      'PENGATURAN DISIMPAN',

    /* Login page */
    sign_in_btn:         'MASUK DENGAN GOOGLE',
    loading_ready:       'SIAP — TEKAN MULAI ▶',
    system_status:       'STATUS SISTEM',

    /* Dashboard header */
    logout_btn:          'KELUAR',

    /* Generic */
    welcome:             'SELAMAT DATANG',
    tools_available:     'ALAT TERSEDIA',
    todays_date:         'TANGGAL HARI INI',
    todo_streak:         'STREAK TODO',
    days:                'HARI',
  }
};

const PIXEL_LANG_KEY  = 'pixel_lang';
const PIXEL_MODAL_ID  = 'px-settings-modal';

/* ═══════════════════════════════════════════════════════════════
   PixelLang — translation helper
   ═══════════════════════════════════════════════════════════════ */
const PixelLang = (function () {
  function current() {
    return localStorage.getItem(PIXEL_LANG_KEY) || 'en';
  }

  function set(lang) {
    if (!PIXEL_DICT[lang]) return;
    localStorage.setItem(PIXEL_LANG_KEY, lang);
    _applyTranslations(lang);
    _updateLangButtons(lang);
  }

  function t(key) {
    const lang = current();
    return (PIXEL_DICT[lang] && PIXEL_DICT[lang][key]) || PIXEL_DICT['en'][key] || key;
  }

  /* Apply [data-i18n] attributes across the page */
  function _applyTranslations(lang) {
    const dict = PIXEL_DICT[lang] || PIXEL_DICT['en'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    /* Special: placeholder attributes */
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });
  }

  function _updateLangButtons(lang) {
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const active = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('px-lang-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  return { current, set, t, apply: _applyTranslations };
})();


/* ═══════════════════════════════════════════════════════════════
   MODAL HTML — injected once into <body>
   ═══════════════════════════════════════════════════════════════ */
const SETTINGS_MODAL_HTML = `
<div id="${PIXEL_MODAL_ID}" class="px-settings-modal hidden"
     role="dialog" aria-modal="true"
     aria-labelledby="px-settings-modal-title" aria-hidden="true">
  <div class="px-settings-modal__backdrop" id="px-settings-backdrop"></div>
  <div class="px-settings-modal__panel">

    <header class="px-settings-modal__head">
      <span id="px-settings-modal-title" data-i18n="settings_title">▸ SETTINGS</span>
      <button class="px-settings-modal__x" id="px-settings-x"
              aria-label="Close settings">✕</button>
    </header>

    <div class="px-settings-modal__body">

      <!-- ── LANGUAGE ── -->
      <div class="px-settings-section">
        <div class="px-settings-label" data-i18n="settings_lang_label">LANGUAGE / BAHASA</div>
        <div class="px-lang-row">
          <button class="px-lang-btn" data-lang-btn="en"
                  aria-pressed="false"
                  onclick="PixelLang.set('en')">
            🇺🇸 EN
          </button>
          <button class="px-lang-btn" data-lang-btn="id"
                  aria-pressed="false"
                  onclick="PixelLang.set('id')">
            🇮🇩 ID
          </button>
        </div>
      </div>

    </div>

    <footer class="px-settings-modal__foot">
      <button type="button" class="px-btn px-btn-sm"
              id="px-settings-close-btn"
              data-i18n="settings_close">CLOSE</button>
    </footer>
  </div>
</div>
`;

/* ═══════════════════════════════════════════════════════════════
   SETTINGS MODAL CSS — injected once into <head>
   ═══════════════════════════════════════════════════════════════ */
const SETTINGS_MODAL_CSS = `
/* ── Backdrop ── */
.px-settings-modal {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.px-settings-modal.hidden {
  display: none !important;
}
.px-settings-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.72);
  cursor: pointer;
}

/* ── Panel ── */
.px-settings-modal__panel {
  position: relative;
  background: #060e06;
  border: 4px solid var(--green, #39ff14);
  box-shadow:
    8px 8px 0 var(--green-dim, #1a8a00),
    0 0 40px rgba(57,255,20,0.18),
    0 0 80px rgba(57,255,20,0.08);
  min-width: 300px;
  max-width: 420px;
  width: 90%;
  font-family: var(--font-pixel, 'Press Start 2P', monospace);
  image-rendering: pixelated;
  z-index: 1;
}

/* ── Header ── */
.px-settings-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 3px solid var(--green, #39ff14);
  font-size: 9px;
  color: var(--green, #39ff14);
  letter-spacing: 1px;
  background: #0a1a0a;
}
.px-settings-modal__x {
  background: none;
  border: 2px solid var(--green, #39ff14);
  color: var(--green, #39ff14);
  font-family: var(--font-pixel, monospace);
  font-size: 8px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 2px 2px 0 var(--green-dim, #1a8a00);
  flex-shrink: 0;
}
.px-settings-modal__x:hover  { background: var(--green, #39ff14); color: #000; }
.px-settings-modal__x:active { transform: translate(2px,2px); box-shadow: none; }

/* ── Body ── */
.px-settings-modal__body {
  padding: 20px 16px;
}

/* ── Section ── */
.px-settings-section {
  margin-bottom: 20px;
}
.px-settings-section:last-child { margin-bottom: 0; }
.px-settings-label {
  font-family: var(--font-pixel, monospace);
  font-size: 7px;
  color: var(--gray-light, #666);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

/* ── Language buttons ── */
.px-lang-row {
  display: flex;
  gap: 10px;
}
.px-lang-btn {
  flex: 1;
  padding: 10px 8px;
  background: #0a1a0a;
  border: 3px solid var(--gray, #444);
  color: var(--gray-light, #666);
  font-family: var(--font-pixel, monospace);
  font-size: 8px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 3px 3px 0 #1a2a1a;
  image-rendering: pixelated;
}
.px-lang-btn:hover {
  border-color: var(--green, #39ff14);
  color: var(--green, #39ff14);
  box-shadow: 3px 3px 0 var(--green-dim, #1a8a00);
}
.px-lang-btn:active {
  transform: translate(3px,3px);
  box-shadow: none;
}
.px-lang-btn--active {
  border-color: var(--green, #39ff14) !important;
  color: var(--green, #39ff14) !important;
  background: var(--green-dark, #0d4400) !important;
  box-shadow: 3px 3px 0 var(--green-dim, #1a8a00) !important;
}

/* ── Footer ── */
.px-settings-modal__foot {
  padding: 12px 16px;
  border-top: 3px solid var(--green-dark, #0d4400);
  display: flex;
  justify-content: flex-end;
  background: #040c04;
}
`;


/* ═══════════════════════════════════════════════════════════════
   PixelSettings — modal controller
   ═══════════════════════════════════════════════════════════════ */
const PixelSettings = (function () {
  let _injected = false;

  function _inject() {
    if (_injected) return;
    _injected = true;

    /* Inject CSS */
    const style = document.createElement('style');
    style.id = 'px-settings-style';
    style.textContent = SETTINGS_MODAL_CSS;
    document.head.appendChild(style);

    /* Inject HTML */
    const wrap = document.createElement('div');
    wrap.innerHTML = SETTINGS_MODAL_HTML;
    document.body.appendChild(wrap.firstElementChild);

    /* Wire close buttons */
    document.getElementById('px-settings-backdrop').addEventListener('click', close);
    document.getElementById('px-settings-x').addEventListener('click', close);
    document.getElementById('px-settings-close-btn').addEventListener('click', close);

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    /* Apply current language to modal strings */
    PixelLang.apply(PixelLang.current());
    _updateActive();
  }

  function _updateActive() {
    const lang = PixelLang.current();
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
      const active = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('px-lang-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function open() {
    _inject();
    const modal = document.getElementById(PIXEL_MODAL_ID);
    if (!modal) return;
    /* Re-apply translations each open in case lang changed externally */
    PixelLang.apply(PixelLang.current());
    _updateActive();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    /* Trap focus on close button */
    const closeBtn = document.getElementById('px-settings-close-btn');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function close() {
    const modal = document.getElementById(PIXEL_MODAL_ID);
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    /* Return focus to whatever triggered open */
    const fab = document.getElementById('px-settings-fab') ||
                document.getElementById('login-settings-btn');
    if (fab) fab.focus();
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function toggle() {
    const modal = document.getElementById(PIXEL_MODAL_ID);
    if (modal && !modal.classList.contains('hidden')) close();
    else open();
  }

  return { open, close, toggle };
})();


/* ═══════════════════════════════════════════════════════════════
   AUTO-INIT: apply saved language on every page load
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  PixelLang.apply(PixelLang.current());
});
