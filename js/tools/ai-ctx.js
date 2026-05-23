/**
 * ai-ctx.js — AI Context Optimizer
 * Strips comments/whitespace and estimates token savings for LLM prompts.
 */

const AiCtxOpt = (() => {
  const TOOL_NAME = 'ai-ctx';

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mountUI(panel) {
    const root = document.createElement('div');
    root.id = 'aictx-root';
    root.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;">
        <div style="flex:1;min-width:260px;">
          <label class="px-label" for="aictx-input">SOURCE CODE</label>
          <textarea id="aictx-input" class="px-textarea" rows="14"
            placeholder="// Paste code, configs, or snippets..."></textarea>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-orange" id="aictx-run">OPTIMIZE ▶</button>
            <button type="button" class="px-btn px-btn-sm" id="aictx-sample">LOAD SAMPLE</button>
            <button type="button" class="px-btn px-btn-sm px-btn-red" id="aictx-clear">CLEAR</button>
          </div>
        </div>
        <div style="flex:1;min-width:260px;">
          <label class="px-label" for="aictx-output">OPTIMIZED OUTPUT</label>
          <textarea id="aictx-output" class="px-textarea" rows="14" readonly
            placeholder="Optimized code appears here..."></textarea>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-sm px-btn-blue" id="aictx-copy">COPY OUTPUT</button>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;" id="aictx-stats">
        <div class="px-box" style="flex:1;min-width:100px;text-align:center;border-color:var(--gray);">
          <div class="px-label">RAW TOKENS (EST)</div>
          <div id="aictx-stat-raw" style="font-family:var(--font-pixel);font-size:14px;color:var(--gray-light);">0</div>
        </div>
        <div class="px-box" style="flex:1;min-width:100px;text-align:center;border-color:var(--orange);">
          <div class="px-label">OPT TOKENS (EST)</div>
          <div id="aictx-stat-opt" style="font-family:var(--font-pixel);font-size:14px;color:var(--orange);">0</div>
        </div>
        <div class="px-box" style="flex:1;min-width:100px;text-align:center;border-color:var(--green);">
          <div class="px-label">SAVED</div>
          <div id="aictx-stat-saved" style="font-family:var(--font-pixel);font-size:14px;color:var(--green);">0%</div>
        </div>
        <div class="px-box" style="flex:1;min-width:100px;text-align:center;border-color:var(--blue);">
          <div class="px-label">CHARS</div>
          <div id="aictx-stat-chars" style="font-family:var(--font-pixel);font-size:11px;color:var(--blue);">0 → 0</div>
        </div>
      </div>
      <div id="aictx-status" class="px-box mt-12" style="border-color:var(--gray);">
        <div class="px-label">STATUS</div>
        <div id="aictx-status-text" style="font-family:var(--font-vt);font-size:18px;color:var(--gray-light);">READY — paste code and hit OPTIMIZE.</div>
      </div>
    `;
    const header = panel.querySelector('.tool-header');
    if (header) {
      const sub = header.querySelector('p');
      if (sub) sub.textContent = 'Strip comments and whitespace to shrink LLM context — token count is estimated client-side.';
      panel.insertBefore(root, header.nextSibling);
    } else {
      panel.appendChild(root);
    }
  }

  function estimateTokens(text) {
    if (!text) return 0;
    return Math.max(1, Math.ceil(text.length / 4));
  }

  function stripCode(raw) {
    let s = raw.replace(/\r\n/g, '\n');
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');
    s = s.replace(/^\s*\/\/.*$/gm, '');
    s = s.replace(/^\s*#(?!!).*/gm, '');
    s = s.replace(/<!--[\s\S]*?-->/g, '');
    s = s.replace(/^[ \t]+/gm, '');
    s = s.replace(/[ \t]+$/gm, '');
    s = s.replace(/\n{3,}/g, '\n\n');
    s = s.replace(/[ \t]{2,}/g, ' ');
    return s.trim();
  }

  function optimize() {
    const input = document.getElementById('aictx-input');
    const output = document.getElementById('aictx-output');
    if (!input || !output) return;

    const raw = input.value;
    if (!raw.trim()) {
      output.value = '';
      updateStats(0, 0, 0, 0);
      setStatus('NO INPUT — paste code first.', 'warn');
      return;
    }

    const optimized = stripCode(raw);
    output.value = optimized;

    const rawTok = estimateTokens(raw);
    const optTok = estimateTokens(optimized);
    const savedPct = rawTok > 0 ? Math.round((1 - optTok / rawTok) * 100) : 0;

    updateStats(rawTok, optTok, savedPct, raw.length, optimized.length);
    setStatus(
      `DONE — removed ~${raw.length - optimized.length} chars, ~${rawTok - optTok} est. tokens (${savedPct}% reduction).`,
      'ok'
    );
    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
  }

  function updateStats(rawTok, optTok, savedPct, rawChars, optChars) {
    const el = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    el('aictx-stat-raw', String(rawTok));
    el('aictx-stat-opt', String(optTok));
    el('aictx-stat-saved', savedPct + '%');
    el('aictx-stat-chars', (rawChars ?? 0) + ' → ' + (optChars ?? 0));
  }

  function setStatus(msg, kind) {
    const box = document.getElementById('aictx-status-text');
    if (!box) return;
    box.textContent = msg;
    box.style.color = kind === 'ok' ? 'var(--green)' : kind === 'warn' ? 'var(--yellow)' : 'var(--gray-light)';
  }

  function loadSample() {
    const sample = `/**
 * UserService — handles auth and profile CRUD
 */
import { db } from './db';

// TODO: move to env
const MAX_RETRIES = 3;

export async function fetchUser(id) {
  // Validate input
  if (!id) throw new Error('id required');

  /* Legacy path — remove after Q2 */
  const row = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );

  return row;  // FIXME: map to DTO
}`;
    const input = document.getElementById('aictx-input');
    if (input) input.value = sample;
    optimize();
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function clearAll() {
    const input = document.getElementById('aictx-input');
    const output = document.getElementById('aictx-output');
    if (input) input.value = '';
    if (output) output.value = '';
    updateStats(0, 0, 0, 0, 0);
    setStatus('CLEARED.', 'warn');
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function copyOutput() {
    const output = document.getElementById('aictx-output');
    if (!output || !output.value) {
      Toast.show('NOTHING TO COPY', 'warning');
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      Toast.show('COPIED TO CLIPBOARD', 'success');
      if (typeof PixelAudio !== 'undefined') PixelAudio.copy();
    }).catch(() => Toast.show('COPY FAILED', 'error'));
  }

  function bindEvents() {
    document.getElementById('aictx-run')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      optimize();
    });
    document.getElementById('aictx-sample')?.addEventListener('click', loadSample);
    document.getElementById('aictx-clear')?.addEventListener('click', clearAll);
    document.getElementById('aictx-copy')?.addEventListener('click', copyOutput);
  }

  async function logUsage() {
    try {
      const mod = await import('../supabase-config.js');
      await mod.logToolUsage(TOOL_NAME);
    } catch (_) { /* fire-and-forget */ }
  }

  function init() {
    const panel = document.getElementById('tool-ai-ctx');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';
    mountUI(panel);
    bindEvents();
    logUsage();
  }

  return { init, optimize, loadSample, clearAll, copyOutput, stripCode, estimateTokens };
})();
