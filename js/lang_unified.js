/**
 * lang_unified.js — PIXEL.TOOLS Unified Language & Settings
 * Vanilla JS (no framework). Persists locale in localStorage key `pixel_lang`.
 */

const PIXEL_LOCALES = ['en', 'id', 'es', 'fr', 'ja'];
const PIXEL_LANG_KEY = 'pixel_lang';
const PIXEL_MODAL_ID = 'px-settings-modal';
const LEGACY_LANG_KEY = 'savedLanguage';
const SETTINGS_TRIGGER_SEL = '#login-settings-btn, #dash-settings-btn';

const LANG_OPTIONS = [
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'id', flag: '🇮🇩', label: 'ID' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'ja', flag: '🇯🇵', label: 'JP' },
];

const PIXEL_DICT = {
  en: {
    settings_title:           '▸ SETTINGS',
    settings_lang_label:      'LANGUAGE',
    settings_account_label:   'ACCOUNT',
    settings_account_guest:   'NOT SIGNED IN',
    settings_switch_account:  'SWITCH ACCOUNT',
    settings_close:           'CLOSE',
    settings_btn:             'SETTINGS',
    settings_aria:            'Open settings',
    logo_sub:                 'EVERYDAY WEB UTILITIES',
    stat_tools:               'TOOLS',
    stat_uses:                'USES',
    stat_style:               'STYLE',
    insert_coin:              '▶ INSERT COIN TO PLAY ◀',
    sign_in_btn:              'SIGN IN WITH GOOGLE',
    system_status:            'SYSTEM STATUS',
    setup_title:              '⚠ SETUP REQUIRED',
    setup_body:               'Open js/config.js and set your Google OAuth Client ID, then reload.',
    logout_btn:               'LOGOUT',
    welcome:                  'WELCOME BACK',
    tools_available:          'TOOLS AVAILABLE',
    todays_date:              "TODAY'S DATE",
    todo_streak:              'TODO STREAK',
    days:                     'DAYS',
    home_command_title:       '▸ COMMAND CENTER',
    home_command_desc:        'Select a tool from the sidebar or the grid below. PLAYER ONE, START!',
    nav_home:                 'HOME',
  },
  id: {
    settings_title:           '▸ PENGATURAN',
    settings_lang_label:      'BAHASA',
    settings_account_label:   'AKUN',
    settings_account_guest:   'BELUM MASUK',
    settings_switch_account:  'GANTI AKUN',
    settings_close:           'TUTUP',
    settings_btn:             'PENGATURAN',
    settings_aria:            'Buka pengaturan',
    logo_sub:                 'UTILITAS WEB HARIAN',
    stat_tools:               'ALAT',
    stat_uses:                'PENGGUNAAN',
    stat_style:               'GAYA',
    insert_coin:              '▶ MASUKKAN KOIN UNTUK MAIN ◀',
    sign_in_btn:              'MASUK DENGAN GOOGLE',
    system_status:            'STATUS SISTEM',
    setup_title:              '⚠ PERLU SETUP',
    setup_body:               'Buka js/config.js dan isi Google OAuth Client ID, lalu muat ulang.',
    logout_btn:               'KELUAR',
    welcome:                  'SELAMAT DATANG',
    tools_available:          'ALAT TERSEDIA',
    todays_date:              'TANGGAL HARI INI',
    todo_streak:              'STREAK TODO',
    days:                     'HARI',
    home_command_title:       '▸ PUSAT KOMANDO',
    home_command_desc:        'Pilih alat dari sidebar atau grid di bawah. PLAYER ONE, MULAI!',
    nav_home:                 'BERANDA',
  },
  es: {
    settings_title:           '▸ AJUSTES',
    settings_lang_label:      'IDIOMA',
    settings_account_label:   'CUENTA',
    settings_account_guest:   'SIN SESIÓN',
    settings_switch_account:  'CAMBIAR CUENTA',
    settings_close:           'CERRAR',
    settings_btn:             'AJUSTES',
    settings_aria:            'Abrir ajustes',
    logo_sub:                 'UTILIDADES WEB DIARIAS',
    stat_tools:               'HERRAM.',
    stat_uses:                'USOS',
    stat_style:               'ESTILO',
    insert_coin:              '▶ INSERTA MONEDA PARA JUGAR ◀',
    sign_in_btn:              'ENTRAR CON GOOGLE',
    system_status:            'ESTADO DEL SISTEMA',
    setup_title:              '⚠ CONFIGURACIÓN',
    setup_body:               'Abre js/config.js y configura tu Google OAuth Client ID, luego recarga.',
    logout_btn:               'SALIR',
    welcome:                  'BIENVENIDO',
    tools_available:          'HERRAMIENTAS',
    todays_date:              'FECHA DE HOY',
    todo_streak:              'RACHA TODO',
    days:                     'DÍAS',
    home_command_title:       '▸ CENTRO DE MANDO',
    home_command_desc:        'Elige una herramienta en la barra o la cuadrícula. ¡PLAYER ONE, START!',
    nav_home:                 'INICIO',
  },
  fr: {
    settings_title:           '▸ PARAMÈTRES',
    settings_lang_label:      'LANGUE',
    settings_account_label:   'COMPTE',
    settings_account_guest:   'NON CONNECTÉ',
    settings_switch_account:  'CHANGER DE COMPTE',
    settings_close:           'FERMER',
    settings_btn:             'PARAMÈTRES',
    settings_aria:            'Ouvrir les paramètres',
    logo_sub:                 'UTILITAIRES WEB QUOTIDIENS',
    stat_tools:               'OUTILS',
    stat_uses:                'UTILIS.',
    stat_style:               'STYLE',
    insert_coin:              '▶ INSÉREZ UNE PIÈCE POUR JOUER ◀',
    sign_in_btn:              'CONNEXION GOOGLE',
    system_status:            'ÉTAT SYSTÈME',
    setup_title:              '⚠ CONFIGURATION',
    setup_body:               'Ouvrez js/config.js et définissez votre Google OAuth Client ID, puis rechargez.',
    logout_btn:               'DÉCONNEXION',
    welcome:                  'BON RETOUR',
    tools_available:          'OUTILS DISPONIBLES',
    todays_date:              "DATE DU JOUR",
    todo_streak:              'SÉRIE TODO',
    days:                     'JOURS',
    home_command_title:       '▸ CENTRE DE COMMANDE',
    home_command_desc:        'Choisissez un outil dans la barre ou la grille. PLAYER ONE, START !',
    nav_home:                 'ACCUEIL',
  },
  ja: {
    settings_title:           '▸ 設定',
    settings_lang_label:      '言語',
    settings_account_label:   'アカウント',
    settings_account_guest:   '未ログイン',
    settings_switch_account:  'アカウント切替',
    settings_close:           '閉じる',
    settings_btn:             '設定',
    settings_aria:            '設定を開く',
    logo_sub:                 '日常のウェブユーティリティ',
    stat_tools:               'ツール',
    stat_uses:                '使用',
    stat_style:               'スタイル',
    insert_coin:              '▶ コインを入れてプレイ ◀',
    sign_in_btn:              'GOOGLEでサインイン',
    system_status:            'システム状態',
    setup_title:              '⚠ セットアップ必要',
    setup_body:               'js/config.js で Google OAuth Client ID を設定して再読み込みしてください。',
    logout_btn:               'ログアウト',
    welcome:                  'おかえりなさい',
    tools_available:          '利用可能ツール',
    todays_date:              '今日の日付',
    todo_streak:              'TODO連続',
    days:                     '日',
    home_command_title:       '▸ コマンドセンター',
    home_command_desc:        'サイドバーまたは下のグリッドからツールを選択。PLAYER ONE, START!',
    nav_home:                 'ホーム',
  },
};

if (typeof window !== 'undefined' && window.PIXEL_DASHBOARD_DICT) {
  for (const loc of PIXEL_LOCALES) {
    const pack = window.PIXEL_DASHBOARD_DICT[loc];
    if (pack) Object.assign(PIXEL_DICT[loc], pack);
  }
}

const PixelLang = (function () {
  const _subscribers = new Set();
  function _normalizeLang(code) {
    if (!code) return 'en';
    if (code === 'jp') return 'ja';
    return PIXEL_LOCALES.includes(code) ? code : 'en';
  }

  function _migrateLegacyLang() {
    const legacy = localStorage.getItem(LEGACY_LANG_KEY);
    if (!legacy) return;
    if (!localStorage.getItem(PIXEL_LANG_KEY)) {
      localStorage.setItem(PIXEL_LANG_KEY, _normalizeLang(legacy));
    }
    localStorage.removeItem(LEGACY_LANG_KEY);
  }

  function current() {
    _migrateLegacyLang();
    return _normalizeLang(localStorage.getItem(PIXEL_LANG_KEY));
  }

  function _setDocumentLang(lang) {
    const code = _normalizeLang(lang);
    document.documentElement.lang = code === 'ja' ? 'ja' : code;
  }

  function set(lang) {
    const code = _normalizeLang(lang);
    if (!PIXEL_DICT[code]) return;
    localStorage.setItem(PIXEL_LANG_KEY, code);
    _setDocumentLang(code);
    _applyTranslations(code);
    _updateLangButtons(code);
    document.dispatchEvent(new CustomEvent('pixel:langchange', { detail: { lang: code } }));
    _subscribers.forEach((fn) => {
      try { fn(code); } catch (err) { console.warn('[PixelLang]', err); }
    });
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    _subscribers.add(fn);
    return () => _subscribers.delete(fn);
  }

  function t(key) {
    const lang = current();
    return (PIXEL_DICT[lang] && PIXEL_DICT[lang][key]) || PIXEL_DICT.en[key] || key;
  }

  function _applyTranslations(lang) {
    const dict = PIXEL_DICT[_normalizeLang(lang)] || PIXEL_DICT.en;
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
    const code = _normalizeLang(lang);
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      const active = btn.getAttribute('data-lang-btn') === code;
      btn.classList.toggle('px-lang-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function apply(lang) {
    const code = _normalizeLang(lang);
    _setDocumentLang(code);
    _applyTranslations(code);
    _updateLangButtons(code);
  }

  _migrateLegacyLang();

  return { current, set, t, apply, subscribe, locales: PIXEL_LOCALES, dict: PIXEL_DICT };
})();

/** Global i18n facade — same state on login + dashboard (vanilla “provider”). */
const PixelI18n = {
  t: (key) => PixelLang.t(key),
  set: (lang) => PixelLang.set(lang),
  current: () => PixelLang.current(),
  apply: (lang) => PixelLang.apply(lang),
  subscribe: (fn) => PixelLang.subscribe(fn),
  locales: PIXEL_LOCALES,
};

if (typeof window !== 'undefined') {
  window.PixelI18n = PixelI18n;
  window.PixelLang = PixelLang;
}

function _buildLangButtonsHtml() {
  return LANG_OPTIONS.map(
    (o) => `<button type="button" class="px-lang-btn" data-lang-btn="${o.code}" aria-pressed="false">${o.flag} ${o.label}</button>`
  ).join('');
}

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
        <div class="px-settings-label" data-i18n="settings_account_label">ACCOUNT</div>
        <div class="px-settings-account" id="px-settings-account">
          <img id="px-settings-avatar" class="px-settings-account__avatar" alt="" width="40" height="40" hidden>
          <div class="px-settings-account__meta">
            <div id="px-settings-account-name" class="px-settings-account__name">—</div>
            <div id="px-settings-account-email" class="px-settings-account__email">—</div>
          </div>
        </div>
        <button type="button" class="px-btn px-btn-sm px-settings-switch-btn"
                id="px-settings-switch-account" data-i18n="settings_switch_account">SWITCH ACCOUNT</button>
      </div>
      <div class="px-settings-section">
        <div class="px-settings-label" data-i18n="settings_lang_label">LANGUAGE</div>
        <div class="px-lang-grid">${_buildLangButtonsHtml()}</div>
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

  function _refreshAccount() {
    const nameEl = document.getElementById('px-settings-account-name');
    const emailEl = document.getElementById('px-settings-account-email');
    const avatarEl = document.getElementById('px-settings-avatar');
    if (!nameEl || !emailEl) return;

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user) {
      nameEl.textContent = (user.name || 'Player').toUpperCase();
      emailEl.textContent = user.email || '—';
      if (avatarEl) {
        if (user.picture) {
          avatarEl.src = user.picture;
          avatarEl.hidden = false;
          avatarEl.alt = user.name || '';
        } else {
          avatarEl.hidden = true;
        }
      }
    } else {
      nameEl.textContent = PixelLang.t('settings_account_guest');
      emailEl.textContent = '—';
      if (avatarEl) avatarEl.hidden = true;
    }
  }

  function _wireLangButtons() {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      if (btn.dataset.pixelLangBound === '1') return;
      btn.dataset.pixelLangBound = '1';
      btn.addEventListener('click', () => {
        PixelLang.set(btn.getAttribute('data-lang-btn'));
        _refreshAccount();
      });
    });
  }

  function _wireAccountActions() {
    const switchBtn = document.getElementById('px-settings-switch-account');
    if (!switchBtn || switchBtn.dataset.pixelSwitchBound === '1') return;
    switchBtn.dataset.pixelSwitchBound = '1';
    switchBtn.addEventListener('click', () => {
      if (typeof switchAccount === 'function') switchAccount();
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
    _wireAccountActions();
    PixelLang.apply(PixelLang.current());
    _refreshAccount();
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
    _refreshAccount();
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
    _refreshAccount();
  }

  return { open, close, toggle, init, refreshAccount: _refreshAccount };
})();

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') PixelSettings.close();
});

document.addEventListener('pixel:langchange', () => {
  if (typeof PixelSettings !== 'undefined') PixelSettings.refreshAccount();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PixelSettings.init());
} else {
  PixelSettings.init();
}
