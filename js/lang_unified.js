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
    settings_theme_label:     'THEME',
    settings_theme_dark:      'DARK CYBERPUNK',
    settings_theme_light:     'LIGHT TERMINAL',
    settings_theme_custom:    'CUSTOM THEME CREATOR',
    settings_theme_bg:        'PRIMARY BACKGROUND',
    settings_theme_accent:    'ACCENT COLOR',
    settings_theme_border:    'NEON BORDERS',
    settings_theme_glow:      'TEXT GLOW',
    settings_theme_reset:     'RESET TO DARK DEFAULT',
    settings_notify_label:    'SYSTEM ALERTS',
    settings_notify_status_default: 'STATUS: STANDBY — PERMISSION REQUIRED',
    settings_notify_status_granted: 'STATUS: ONLINE — ALERTS ARMED',
    settings_notify_status_denied:  'STATUS: OFFLINE — BLOCKED BY BROWSER',
    settings_notify_status_unsupported: 'STATUS: NOT AVAILABLE',
    settings_notify_hint:       'Reminders run while this tab is open. True background cron needs Push API + server.',
    settings_notify_enable:     'ENABLE ALERTS',
    settings_notify_test:       'TEST NOTIFICATION',
    notify_toast_granted:       'SYSTEM ONLINE — ALERTS ENABLED',
    notify_toast_denied:        'ALERTS BLOCKED — ENABLE IN BROWSER SETTINGS',
    notify_toast_test:          'TEST ALERT TRANSMITTED',
    theme_toast_dark:         'DARK CYBERPUNK',
    theme_toast_light:        'LIGHT TERMINAL',
    theme_toast_custom:       'CUSTOM THEME APPLIED',
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
    settings_theme_label:     'TEMA',
    settings_theme_dark:      'CYBERPUNK GELAP',
    settings_theme_light:     'TERMINAL TERANG',
    settings_theme_custom:    'PEMBUAT TEMA KUSTOM',
    settings_theme_bg:        'LATAR BELAKANG',
    settings_theme_accent:    'WARNA AKSES',
    settings_theme_border:    'TEPI NEON',
    settings_theme_glow:      'CAHAYA TEKS',
    settings_theme_reset:     'ATUR ULANG KE GELAP',
    settings_notify_label:    'ALERT SISTEM',
    settings_notify_status_default: 'STATUS: SIAGA — IZIN DIPERLUKAN',
    settings_notify_status_granted: 'STATUS: ONLINE — ALERT AKTIF',
    settings_notify_status_denied:  'STATUS: OFFLINE — DIBLOKIR BROWSER',
    settings_notify_status_unsupported: 'STATUS: TIDAK TERSEDIA',
    settings_notify_hint:       'Pengingat hanya saat tab terbuka. Cron latar butuh Push API + server.',
    settings_notify_enable:     'AKTIFKAN ALERT',
    settings_notify_test:       'TES NOTIFIKASI',
    notify_toast_granted:       'SISTEM ONLINE — ALERT AKTIF',
    notify_toast_denied:        'ALERT DIBLOKIR — AKTIFKAN DI PENGATURAN BROWSER',
    notify_toast_test:          'TES ALERT TERKIRIM',
    theme_toast_dark:         'MODE GELAP',
    theme_toast_light:        'MODE TERANG',
    theme_toast_custom:       'TEMA KUSTOM',
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
    settings_theme_label:     'TEMA',
    settings_theme_dark:      'CYBERPUNK OSCURO',
    settings_theme_light:     'TERMINAL CLARO',
    settings_theme_custom:    'CREADOR DE TEMA',
    settings_theme_bg:        'FONDO PRINCIPAL',
    settings_theme_accent:    'COLOR ACENTO',
    settings_theme_border:    'BORDES NEÓN',
    settings_theme_glow:      'BRILLO TEXTO',
    settings_theme_reset:     'RESTABLECER OSCURO',
    settings_notify_label:    'ALERTAS DEL SISTEMA',
    settings_notify_status_default: 'ESTADO: EN ESPERA — SE REQUIERE PERMISO',
    settings_notify_status_granted: 'ESTADO: ONLINE — ALERTAS ACTIVAS',
    settings_notify_status_denied:  'ESTADO: OFFLINE — BLOQUEADO POR EL NAVEGADOR',
    settings_notify_status_unsupported: 'ESTADO: NO DISPONIBLE',
    settings_notify_hint:       'Los avisos funcionan con la pestaña abierta. Cron en segundo plano requiere Push API + servidor.',
    settings_notify_enable:     'ACTIVAR ALERTAS',
    settings_notify_test:       'PROBAR NOTIFICACIÓN',
    notify_toast_granted:       'SISTEMA ONLINE — ALERTAS ACTIVAS',
    notify_toast_denied:        'ALERTAS BLOQUEADAS — HABILÍTALAS EN EL NAVEGADOR',
    notify_toast_test:          'ALERTA DE PRUEBA ENVIADA',
    theme_toast_dark:         'MODO OSCURO',
    theme_toast_light:        'MODO CLARO',
    theme_toast_custom:       'TEMA PERSONALIZADO',
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
    settings_theme_label:     'THÈME',
    settings_theme_dark:      'CYBERPUNK SOMBRE',
    settings_theme_light:     'TERMINAL CLAIR',
    settings_theme_custom:    'CRÉATEUR DE THÈME',
    settings_theme_bg:        'FOND PRINCIPAL',
    settings_theme_accent:    'COULEUR ACCENT',
    settings_theme_border:    'BORDURES NÉON',
    settings_theme_glow:      'LUEUR TEXTE',
    settings_theme_reset:     'RÉINIT. SOMBRE',
    settings_notify_label:    'ALERTES SYSTÈME',
    settings_notify_status_default: 'STATUT: VEILLE — AUTORISATION REQUISE',
    settings_notify_status_granted: 'STATUT: EN LIGNE — ALERTES ARMÉES',
    settings_notify_status_denied:  'STATUT: HORS LIGNE — BLOQUÉ PAR LE NAVIGATEUR',
    settings_notify_status_unsupported: 'STATUT: INDISPONIBLE',
    settings_notify_hint:       'Rappels actifs tant que l’onglet est ouvert. Cron arrière-plan = Push API + serveur.',
    settings_notify_enable:     'ACTIVER LES ALERTES',
    settings_notify_test:       'TESTER LA NOTIFICATION',
    notify_toast_granted:       'SYSTÈME EN LIGNE — ALERTES ACTIVÉES',
    notify_toast_denied:        'ALERTES BLOQUÉES — ACTIVEZ-LES DANS LE NAVIGATEUR',
    notify_toast_test:          'ALERTE TEST ENVOYÉE',
    theme_toast_dark:         'MODE SOMBRE',
    theme_toast_light:        'MODE CLAIR',
    theme_toast_custom:       'THÈME PERSONNALISÉ',
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
    settings_theme_label:     'テーマ',
    settings_theme_dark:      'ダークサイバー',
    settings_theme_light:     'ライト端末',
    settings_theme_custom:    'カスタムテーマ',
    settings_theme_bg:        '背景色',
    settings_theme_accent:    'アクセント',
    settings_theme_border:    'ネオン枠',
    settings_theme_glow:      'テキスト光',
    settings_theme_reset:     'ダークに戻す',
    settings_notify_label:    'システムアラート',
    settings_notify_status_default: '状態: 待機 — 許可が必要です',
    settings_notify_status_granted: '状態: オンライン — アラート有効',
    settings_notify_status_denied:  '状態: オフライン — ブラウザでブロック',
    settings_notify_status_unsupported: '状態: 利用不可',
    settings_notify_hint:       'タブ表示中のみリマインド。バックグラウンドは Push API + サーバーが必要。',
    settings_notify_enable:     'アラートを有効化',
    settings_notify_test:       '通知テスト',
    notify_toast_granted:       'システムオンライン — アラート有効',
    notify_toast_denied:        'アラート拒否 — ブラウザ設定で許可',
    notify_toast_test:          'テスト通知を送信しました',
    theme_toast_dark:         'ダークモード',
    theme_toast_light:        'ライトモード',
    theme_toast_custom:       'カスタム適用',
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

function _buildThemeSectionHtml() {
  return `
      <div class="px-settings-section">
        <div class="px-settings-label" data-i18n="settings_theme_label">THEME</div>
        <div class="px-theme-presets">
          <button type="button" class="px-theme-preset-btn" data-theme-preset="dark"
                  aria-pressed="false" data-i18n="settings_theme_dark">DARK CYBERPUNK</button>
          <button type="button" class="px-theme-preset-btn" data-theme-preset="light"
                  aria-pressed="false" data-i18n="settings_theme_light">LIGHT TERMINAL</button>
        </div>
        <details class="px-theme-custom" id="px-theme-custom-panel">
          <summary class="px-theme-custom__summary" data-i18n="settings_theme_custom">CUSTOM THEME CREATOR</summary>
          <div class="px-theme-custom__grid">
            <label class="px-theme-color-field">
              <span data-i18n="settings_theme_bg">PRIMARY BACKGROUND</span>
              <input type="color" data-theme-color="bg" value="#0a0a0a" aria-label="Primary background color">
            </label>
            <label class="px-theme-color-field">
              <span data-i18n="settings_theme_accent">ACCENT COLOR</span>
              <input type="color" data-theme-color="accent" value="#39ff14" aria-label="Accent color">
            </label>
            <label class="px-theme-color-field">
              <span data-i18n="settings_theme_border">NEON BORDERS</span>
              <input type="color" data-theme-color="border" value="#39ff14" aria-label="Neon border color">
            </label>
            <label class="px-theme-color-field">
              <span data-i18n="settings_theme_glow">TEXT GLOW</span>
              <input type="color" data-theme-color="glow" value="#39ff14" aria-label="Text glow color">
            </label>
          </div>
          <button type="button" class="px-btn px-btn-sm px-theme-reset-btn" id="px-theme-reset-custom"
                  data-i18n="settings_theme_reset">RESET TO DARK DEFAULT</button>
        </details>
      </div>`;
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
      ${_buildThemeSectionHtml()}
      <div class="px-settings-section">
        <div class="px-settings-label" data-i18n="settings_lang_label">LANGUAGE</div>
        <div class="px-lang-grid">${_buildLangButtonsHtml()}</div>
      </div>
      <div class="px-settings-section" id="px-settings-notify-section">
        <div class="px-settings-label" data-i18n="settings_notify_label">SYSTEM ALERTS</div>
        <p id="px-notify-status" class="px-notify-status" data-i18n="settings_notify_status_default">STATUS: STANDBY — PERMISSION REQUIRED</p>
        <p class="px-notify-hint" data-i18n="settings_notify_hint">Reminders run while this tab is open. True background cron needs Push API + server.</p>
        <div class="px-notify-actions">
          <button type="button" class="px-btn px-btn-sm" id="px-notify-enable-btn"
                  data-i18n="settings_notify_enable">ENABLE ALERTS</button>
          <button type="button" class="px-btn px-btn-sm px-btn-yellow" id="px-notify-test-btn"
                  data-i18n="settings_notify_test">TEST NOTIFICATION</button>
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
    if (typeof PixelNotify !== 'undefined') PixelNotify.wireSettings();
    if (typeof PixelTheme !== 'undefined') PixelTheme.init();
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
    if (typeof PixelTheme !== 'undefined') {
      PixelTheme.apply(PixelTheme.current());
      PixelTheme.init();
    }
    _refreshAccount();
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    _setTriggersExpanded(true);

    const closeBtn = document.getElementById('px-settings-close-btn');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
    if (typeof PixelNotify !== 'undefined') {
      PixelNotify.wireSettings();
      PixelNotify.refreshSettingsUI();
      PixelNotify.requestPermission({ flashTarget: '.px-settings-modal__panel', quiet: true });
    }
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

document.addEventListener('pixel:themechange', () => {
  if (typeof PixelLang !== 'undefined') PixelLang.apply(PixelLang.current());
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PixelSettings.init());
} else {
  PixelSettings.init();
}
