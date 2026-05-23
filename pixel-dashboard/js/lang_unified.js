/**
 * lang_unified.js — PIXEL.TOOLS Unified Language & Settings System
 * Works on BOTH index.html (login) and dashboard.html.
 * Persists language choice to localStorage under 'pixel_lang'.
 *
 * Public API:
 *   PixelSettings.open()   — open the settings modal
 *   PixelSettings.close()  — close the settings modal
 *   PixelSettings.toggle() — toggle the settings modal
 *   PixelLang.t(key)       — get translated string for current locale
 *   PixelLang.current()    — returns 'id' | 'en'
 *   PixelLang.set(lang)    — switch locale and persist
 *   PixelLang.apply(lang)  — apply [data-i18n] to the page
 */

const PIXEL_DICT = {
  en: {
    settings_title:      '▸ SETTINGS',
    settings_lang_label: 'LANGUAGE / BAHASA',
    settings_close:      'CLOSE',
    settings_saved:      'SETTINGS SAVED',
    settings_btn:        'SETTINGS',
    settings_aria:       'Open settings',

    logo_sub:            'EVERYDAY WEB UTILITIES',
    stat_tools:          'TOOLS',
    stat_uses:           'USES',
    stat_style:          'STYLE',
    insert_coin:         '▶ INSERT COIN TO PLAY ◀',
    sign_in_btn:         'SIGN IN WITH GOOGLE',
    system_status:       'SYSTEM STATUS',
    setup_title:         '⚠ SETUP REQUIRED',
    setup_body:          'Open js/config.js and set your Google OAuth Client ID, then reload.',

    logout_btn:          'LOGOUT',
    welcome:             'WELCOME BACK',
    tools_available:     'TOOLS AVAILABLE',
    todays_date:         "TODAY'S DATE",
    todo_streak:         'TODO STREAK',
    days:                'DAYS',
  },

  id: {
    settings_title:      '▸ PENGATURAN',
    settings_lang_label: 'BAHASA / LANGUAGE',
    settings_close:      'TUTUP',
    settings_saved:      'PENGATURAN DISIMPAN',
    settings_btn:        'PENGATURAN',
    settings_aria:       'Buka pengaturan',

    logo_sub:            'UTILITAS WEB HARIAN',
    stat_tools:          'ALAT',
    stat_uses:           'PENGGUNAAN',
    stat_style:          'GAYA',
    insert_coin:         '▶ MASUKKAN KOIN UNTUK MAIN ◀',
    sign_in_btn:         'MASUK DENGAN GOOGLE',
    system_status:       'STATUS SISTEM',
    setup_title:         '⚠ PERLU SETUP',
    setup_body:          'Buka js/config.js dan isi Google OAuth Client ID, lalu muat ulang.',

    logout_btn:          'KELUAR',
    welcome:             'SELAMAT DATANG',
    tools_available:     'ALAT TERSEDIA',
    todays_date:         'TANGGAL HARI INI',
    todo_streak:         'STREAK TODO',
    days:                'HARI',
  },
};

const PIXEL_LANG_KEY = 'pixel_lang';
const PIXEL_MODAL_ID = 'px-settings-modal';
const LEGACY_LANG_KEY = 'savedLanguage';
const SETTINGS_TRIGGER_SEL = '#login-settings-btn, #dash-settings-btn';

const PixelLang = (function () {
  function _migrateLegacyLang() {
    const legacy = localStorage.getItem(LEGACY_LANG_KEY);
    if (!legacy) return;
    if (!localStorage.getItem(PIXEL_LANG_KEY)) {
      localStorage.setItem(PIXEL_LANG_KEY, legacy === 'id' ? 'id' : 'en');
    }
    localStorage.removeItem(LEGACY_LANG_KEY);
  }

  function current() {
    _migrateLegacyLang();
    const saved = localStorage.getItem(PIXEL_LANG_KEY);
    return saved === 'id' ? 'id' : 'en';
  }

  function _setDocumentLang(lang) {
    document.documentElement.lang = lang === 'id' ? 'id' : 'en';
  }

  function set(lang) {
    if (!PIXEL_DICT[lang]) return;
    localStorage.setItem(PIXEL_LANG_KEY, lang);
    _setDocumentLang(lang);
    _applyTranslations(lang);
    _updateLangButtons(lang);
    document.dispatchEvent(new CustomEvent('pixel:langchange', { detail: { lang } }));
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function t(key) {
    const lang = current();
    return (PIXEL_DICT[lang] && PIXEL_DICT[lang][key]) || PIXEL_DICT.en[key] || key;
  }

  function _applyTranslations(lang) {
    const dict = PIXEL_DICT[lang] || PIXEL_DICT.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] === undefined) return;
      el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) el.title = dict[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
    });
  }

  function _updateLangButtons(lang) {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      const active = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('px-lang-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function apply(lang) {
    const code = lang === 'id' ? 'id' : 'en';
    _setDocumentLang(code);
    _applyTranslations(code);
    _updateLangButtons(code);
  }

  _migrateLegacyLang();

  return { current, set, t, apply };
})();

const SETTINGS_MODAL_HTML = `
<div id="${PIXEL_MODAL_ID}" class="px-settings-modal hidden"
     role="dialog" aria-modal="true"
     aria-labelledby="px-settings-modal-title" aria-hidden="true">
  <div class="px-settings-modal__backdrop" id="px-settings-backdrop"></div>
  <div class="px-settings-modal__panel">
    <header class="px-settings-modal__head">
      <span id="px-settings-modal-title" data-i18n="settings_title">▸ SETTINGS</span>
      <button type="button" class="px-settings-modal__x" id="px-settings-x"
              aria-label="Close settings">✕</button>
    </header>
    <div class="px-settings-modal__body">
      <div class="px-settings-section">
        <div class="px-settings-label" data-i18n="settings_lang_label">LANGUAGE / BAHASA</div>
        <div class="px-lang-row">
          <button type="button" class="px-lang-btn" data-lang-btn="en" aria-pressed="false">
            🇺🇸 EN
          </button>
          <button type="button" class="px-lang-btn" data-lang-btn="id" aria-pressed="false">
            🇮🇩 ID
          </button>
        </div>
      </div>
    </div>
    <footer class="px-settings-modal__foot">
      <button type="button" class="px-btn px-btn-sm" id="px-settings-close-btn"
              data-i18n="settings_close">CLOSE</button>
    </footer>
  </div>
</div>
`;

const PixelSettings = (function () {
  let _injected = false;
  let _lastTrigger = null;

  function _triggers() {
    return Array.from(document.querySelectorAll(SETTINGS_TRIGGER_SEL));
  }

  function _setTriggersExpanded(expanded) {
    _triggers().forEach((btn) => btn.setAttribute('aria-expanded', String(expanded)));
  }

  function _wireLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      if (btn.dataset.pixelLangBound === '1') return;
      btn.dataset.pixelLangBound = '1';
      btn.addEventListener('click', () => {
        PixelLang.set(btn.getAttribute('data-lang-btn'));
      });
    });
  }

  function _inject() {
    if (_injected) return;
    _injected = true;

    const wrap = document.createElement('div');
    wrap.innerHTML = SETTINGS_MODAL_HTML;
    document.body.appendChild(wrap.firstElementChild);

    document.getElementById('px-settings-backdrop').addEventListener('click', close);
    document.getElementById('px-settings-x').addEventListener('click', close);
    document.getElementById('px-settings-close-btn').addEventListener('click', close);

    _wireLangButtons();
    PixelLang.apply(PixelLang.current());
  }

  function _onTriggerClick(e) {
    e.preventDefault();
    _lastTrigger = e.currentTarget;
    toggle();
  }

  function _bindTriggers() {
    _triggers().forEach((btn) => {
      if (btn.dataset.pixelSettingsBound === '1') return;
      btn.dataset.pixelSettingsBound = '1';
      btn.setAttribute('aria-controls', PIXEL_MODAL_ID);
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', _onTriggerClick);
    });
  }

  function open() {
    _inject();
    _bindTriggers();
    const modal = document.getElementById(PIXEL_MODAL_ID);
    if (!modal) return;

    PixelLang.apply(PixelLang.current());
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    _setTriggersExpanded(true);

    const closeBtn = document.getElementById('px-settings-close-btn');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function close() {
    const modal = document.getElementById(PIXEL_MODAL_ID);
    if (!modal || modal.classList.contains('hidden')) return;

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    _setTriggersExpanded(false);

    const focusTarget = _lastTrigger ||
      document.getElementById('dash-settings-btn') ||
      document.getElementById('login-settings-btn');
    if (focusTarget) focusTarget.focus();
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function toggle() {
    const modal = document.getElementById(PIXEL_MODAL_ID);
    if (modal && !modal.classList.contains('hidden')) close();
    else open();
  }

  function init() {
    _inject();
    PixelLang.apply(PixelLang.current());
    _bindTriggers();
  }

  return { open, close, toggle, init };
})();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') PixelSettings.close();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PixelSettings.init());
} else {
  PixelSettings.init();
}
