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

/* ── TOOL REGISTRY ── */
const TOOL_NAMES = {
  home:       'HOME',
  ipgeo:      'IP GEOLOCATE',
  subnet:     'SUBNET CALC',
  ping:       'PING SIM',
  base64:     'BASE64 / URL',
  palette:    'PALETTE GEN',
  texttools:  'TEXT TOOLS',
  todo:       'TODO LIST',
  pomodoro:   'POMODORO',
  jsonformat: 'JSON FORMAT',
  'ai-ctx':       'AI CTX OPT',
  'micro-digest': 'MICRO-DIGEST',
  'content-wiz':  'CONTENT WIZ',
  'hd-format':    'HD FORMAT',
  'stem-sep':     'STEM SEP',
  loudness:       'LOUDNESS',
  'windows-debloater': 'WIN DEBLOAT'
};

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

/* ── TOOL DESCRIPTIONS ── */
const TOOL_DESCRIPTIONS = {
  ipgeo:       'Instantly look up any IP address or domain and reveal its geographic location, ISP, timezone, and network details. Paste any IPv4, IPv6, or hostname to get a full intelligence report — no account required.',
  subnet:      'A full CIDR/subnet calculator for network engineers. Input any IP and prefix length to instantly compute the network address, broadcast address, usable host range, wildcard mask, and total host count.',
  ping:        'Simulate HTTP latency checks directly from your browser. Measure round-trip response times for any public URL, visualize latency trends over multiple pings, and diagnose connectivity issues without leaving the dashboard.',
  base64:      'Encode any text or binary data to Base64, or decode Base64/URL-encoded strings back to plaintext. Supports standard Base64, URL-safe Base64, and percent-encoding — essential for debugging APIs and auth tokens.',
  palette:     'Generate harmonious 8-bit color palettes from a seed color or at random. Export palettes as CSS variables, HEX arrays, or pixel-art swatches. Perfect for retro game dev, pixel art, and UI theming.',
  texttools:   'A multi-function text transformer. Change case (upper, lower, title, camelCase, snake_case), count words and characters, strip whitespace, reverse strings, and run simple regex find-and-replace — all in one place.',
  todo:        'A persistent task manager with streak tracking. Add, complete, and delete tasks that survive browser refreshes via localStorage. Build daily habits and watch your streak counter climb — gamified productivity.',
  pomodoro:    'A classic Pomodoro focus timer with pixel-art styling. Work in 25-minute focused sessions separated by short breaks. Audio cues and a visible countdown keep you on track without disrupting your flow.',
  jsonformat:  'Validate, format, and pretty-print raw JSON in seconds. Paste minified or malformed JSON to instantly detect syntax errors, reformat with proper indentation, and copy the clean output — ideal for API debugging.',
  'ai-ctx':    'An intelligent code context optimizer for LLM prompts. Paste your codebase snippet and target token budget; the tool trims comments, whitespace, and boilerplate to maximize information density within your context window.',
  'micro-digest': 'A universal document summarizer powered by AI. Paste any text — meeting notes, articles, PDFs — and receive a concise, structured digest in seconds. No file size limits, no subscriptions, no data sent to external servers.',
  'content-wiz':  'The Content Repurposing Wizard transforms a single idea or article into multiple social media formats simultaneously. Generate Twitter/X threads, LinkedIn posts, Instagram captions, and newsletter snippets from one source.',
  'hd-format':    'A local photo and video upscaler running entirely in your browser via WebGPU and WASM. No uploads, no cloud — your files never leave your device. Increase resolution by 2x or 4x with AI-powered super-resolution.',
  'stem-sep':     'Separate any song into isolated stems — vocals, drums, bass, and other instruments — using ONNX Web inference running 100% locally. Free, unlimited, and private: your audio is processed entirely on-device.',
  'loudness':     'Automatically normalize audio files to broadcast loudness standards (LUFS) used by Spotify, YouTube, and Apple Music. Powered by the Web Audio API, it analyzes and adjusts gain without quality loss, all in your browser.',
  'windows-debloater': 'A safe GUI-to-script generator for Windows optimization. Select debloat modules—telemetry removal, bloatware uninstalls, Cortana disable, network tweaks—and download a custom PowerShell script. PIXEL.TOOLS never executes system commands from the browser.',
};

/* ── INJECT TOOL DESCRIPTION ── */
function injectToolDesc(toolId) {
  const desc = TOOL_DESCRIPTIONS[toolId];
  if (!desc) return;
  const panel = document.getElementById('tool-' + toolId);
  if (!panel || panel.querySelector('.tool-desc-box')) return; // already injected
  const box = document.createElement('div');
  box.className = 'tool-desc-box';
  box.innerHTML =
    '<div class="tool-desc-label">▸ ABOUT THIS TOOL</div>' +
    '<p class="tool-desc-text">' + desc + '</p>';
  panel.insertBefore(box, panel.firstChild);
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

  // Update breadcrumb & status
  const name = TOOL_NAMES[toolId] || toolId.toUpperCase();
  document.getElementById('breadcrumb-tool').textContent = name;
  document.getElementById('status-tool').textContent = 'TOOL: ' + name;

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
