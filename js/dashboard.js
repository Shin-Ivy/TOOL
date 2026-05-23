/**
 * dashboard.js — Dashboard Controller
 * Handles routing, session guard, clock, and tool initialization.
 */

/* ── AUTH GUARD ── */
(function() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  // Populate header user info
  document.getElementById('user-name').textContent = user.name.toUpperCase();
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('home-username').textContent = user.name.toUpperCase();
  document.getElementById('home-email').textContent = user.email;

  if (user.picture) {
    const img = document.getElementById('user-avatar');
    img.src = user.picture;
    img.onerror = () => {
      img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231a1a1a'/%3E%3Ctext x='50%25' y='55%25' text-anchor='middle' dominant-baseline='middle' font-size='20' fill='%2339ff14'%3E" + encodeURIComponent(user.name[0]) + "%3C/text%3E%3C/svg%3E";
    };
  }

  Store.set('user', user);

  document.addEventListener('pixel:langchange', refreshDashboardI18n);
  if (typeof refreshDashboardI18n === 'function') refreshDashboardI18n();
})();

/* ── SIGN OUT ── */
function handleSignOut() {
  PixelAudio.click();
  signOut();
}

/* ── CLOCK ── */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ── DATE ── */
(function() {
  const now = new Date();
  const d = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  document.getElementById('home-date').textContent = d;
})();

/* ── HOME STREAK ── */
(function() {
  try {
    const streak = JSON.parse(localStorage.getItem('pixel_todo_streak') || '0');
    document.getElementById('home-streak').textContent = streak;
  } catch (e) {}
})();

/* ── I18N HELPERS ── */
function toolI18nKey(toolId, part) {
  const slug = String(toolId).replace(/-/g, '_');
  if (part === 'name') return 'tool_' + slug;
  if (part === 'desc') return 'tool_' + slug + '_desc';
  if (part === 'about') return 'tool_' + slug + '_about';
  return 'tool_' + slug;
}

function getToolLabel(toolId) {
  if (typeof PixelLang === 'undefined') return String(toolId).toUpperCase();
  return PixelLang.t(toolI18nKey(toolId, 'name'));
}

function refreshDashboardI18n() {
  if (typeof PixelLang === 'undefined') return;
  PixelLang.apply(PixelLang.current());
  const toolId = (typeof Store !== 'undefined' && Store.get('activeTool')) || 'home';
  syncToolChrome(toolId);
}

function syncToolChrome(toolId) {
  if (typeof PixelLang === 'undefined') return;
  const name = getToolLabel(toolId);
  const bc = document.getElementById('breadcrumb-tool');
  if (bc) bc.textContent = name;
  const st = document.getElementById('status-tool');
  if (st) st.textContent = PixelLang.t('status_tool_prefix') + name;
}

const TOOL_INITS = {
  ipgeo:      () => typeof IpGeo !== 'undefined'      && IpGeo.init(),
  subnet:     () => typeof SubnetCalc !== 'undefined'  && SubnetCalc.init(),
  ping:       () => typeof PingSim !== 'undefined'     && PingSim.init(),
  base64:     () => typeof Base64Tool !== 'undefined'  && Base64Tool.init(),
  palette:    () => typeof PaletteGen !== 'undefined'  && PaletteGen.init(),
  texttools:  () => typeof TextTools !== 'undefined'   && TextTools.init(),
  todo:       () => typeof TodoList !== 'undefined'    && TodoList.init(),
  pomodoro:   () => typeof Pomodoro !== 'undefined'    && Pomodoro.init(),
  jsonformat: () => typeof JsonFmt !== 'undefined'     && JsonFmt.init(),
  'ai-ctx':       () => typeof AiCtxOpt !== 'undefined'    && AiCtxOpt.init(),
  'micro-digest': () => typeof MicroDigest !== 'undefined' && MicroDigest.init(),
  'content-wiz':  () => typeof ContentWiz !== 'undefined'  && ContentWiz.init(),
  'hd-format':    () => typeof HdFormat !== 'undefined'    && HdFormat.init(),
  'stem-sep':     () => typeof StemSep !== 'undefined'     && StemSep.init(),
  loudness:       () => typeof LoudnessMatch !== 'undefined' && LoudnessMatch.init(),
  'windows-debloater': () => typeof WindowsDebloater !== 'undefined' && WindowsDebloater.init(),
};

/* ── INJECT TOOL DESCRIPTION ── */
function injectToolDesc(toolId) {
  if (toolId === 'home') return;
  const panel = document.getElementById('tool-' + toolId);
  if (!panel || panel.querySelector('.tool-desc-box')) return;
  const aboutKey = toolI18nKey(toolId, 'about');
  const box = document.createElement('div');
  box.className = 'tool-desc-box';
  box.innerHTML =
    '<div class="tool-desc-label" data-i18n="tool_about_label">▸ ABOUT THIS TOOL</div>' +
    '<p class="tool-desc-text" data-i18n="' + aboutKey + '"></p>';
  panel.insertBefore(box, panel.firstChild);
  if (typeof PixelLang !== 'undefined') PixelLang.apply(PixelLang.current());
}

const initializedTools = new Set(['home']);

/* ── SWITCH TOOL ── */
function switchTool(toolId) {
  const prev = Store.get('activeTool');
  if (prev === toolId) return;

  // Hide all panels
  document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#nav-list li[data-tool]').forEach(li => li.classList.remove('active'));

  // Show selected
  const panel = document.getElementById('tool-' + toolId);
  if (panel) panel.classList.add('active');

  const navItem = document.querySelector(`#nav-list li[data-tool="${toolId}"]`);
  if (navItem) navItem.classList.add('active');

  syncToolChrome(toolId);

  // Initialize tool on first visit
  if (!initializedTools.has(toolId)) {
    injectToolDesc(toolId);          // prepend description box first
    if (TOOL_INITS[toolId]) {
      TOOL_INITS[toolId]();
    }
    initializedTools.add(toolId);
  }

  Store.set('activeTool', toolId);
  PixelAudio.click();

  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('open');
}

/* ── SIDEBAR TOGGLE (mobile) ── */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ── STATUS BAR MEM ── */
setInterval(() => {
  if (performance.memory) {
    const mb = Math.round(performance.memory.usedJSHeapSize / 1048576);
    document.getElementById('status-mem').textContent = 'MEM: ' + mb + 'MB';
  }
}, 5000);
