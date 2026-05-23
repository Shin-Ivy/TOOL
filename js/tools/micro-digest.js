/**
 * micro-digest.js — Micro-Digest Engine
 * Reads .txt/.md via FileReader and produces a client-side summary heuristic.
 */

const MicroDigest = (() => {
  const TOOL_NAME = 'micro-digest';

  function mountUI(panel) {
    const root = document.createElement('div');
    root.id = 'mdigest-root';
    root.innerHTML = `
      <div class="px-box mt-16" style="border-color:var(--orange);">
        <label class="px-label" for="mdigest-file">UPLOAD DOCUMENT (.txt / .md)</label>
        <input type="file" id="mdigest-file" accept=".txt,.md,text/plain,text/markdown"
          style="font-family:var(--font-vt);font-size:18px;color:var(--green);margin-top:8px;width:100%;">
        <div id="mdigest-file-meta" style="font-family:var(--font-vt);font-size:16px;color:var(--gray-light);margin-top:8px;">NO FILE LOADED</div>
      </div>
      <div style="display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;">
        <button type="button" class="px-btn px-btn-orange" id="mdigest-run" disabled>DIGEST ▶</button>
        <button type="button" class="px-btn px-btn-sm px-btn-blue" id="mdigest-copy" disabled>COPY SUMMARY</button>
        <button type="button" class="px-btn px-btn-sm px-btn-red" id="mdigest-clear">CLEAR</button>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <div class="px-box" style="flex:1;min-width:120px;text-align:center;border-color:var(--gray);">
          <div class="px-label">SOURCE WORDS</div>
          <div id="mdigest-stat-words" style="font-family:var(--font-pixel);font-size:14px;color:var(--gray-light);">0</div>
        </div>
        <div class="px-box" style="flex:1;min-width:120px;text-align:center;border-color:var(--orange);">
          <div class="px-label">SUMMARY WORDS</div>
          <div id="mdigest-stat-sum" style="font-family:var(--font-pixel);font-size:14px;color:var(--orange);">0</div>
        </div>
        <div class="px-box" style="flex:1;min-width:120px;text-align:center;border-color:var(--green);">
          <div class="px-label">COMPRESSION</div>
          <div id="mdigest-stat-ratio" style="font-family:var(--font-pixel);font-size:14px;color:var(--green);">—</div>
        </div>
      </div>
      <label class="px-label" for="mdigest-output">INSTANT DIGEST</label>
      <div id="mdigest-output" class="px-box" style="border-color:var(--orange);min-height:160px;">
        <div style="font-family:var(--font-vt);font-size:20px;color:var(--gray-light);line-height:1.6;white-space:pre-wrap;">Upload a .txt or .md file to generate a digest.</div>
      </div>
    `;
    const header = panel.querySelector('.tool-header');
    if (header) {
      const sub = header.querySelector('p');
      if (sub) sub.textContent = 'Local document summarizer — files never leave your browser.';
      panel.insertBefore(root, header.nextSibling);
    } else {
      panel.appendChild(root);
    }
  }

  let sourceText = '';

  function wordCount(s) {
    const t = s.trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function summarize(text) {
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/^#+\s+/gm, '')
      .replace(/^\s*[-*•]\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleaned) return 'EMPTY DOCUMENT.';

    const sentences = cleaned
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
    const keywords = {};
    cleaned.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !/^(about|after|before|could|should|their|there|these|those|which|while|would)$/.test(w))
      .forEach(w => { keywords[w] = (keywords[w] || 0) + 1; });

    const topKw = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([w]) => w);

    const lead = sentences.slice(0, 3);
    const bullets = lines
      .filter(l => l.length > 30 && l.length < 200)
      .slice(0, 4);

    const parts = ['▸ TL;DR', lead.join(' ') || cleaned.slice(0, 280)];
    if (bullets.length) {
      parts.push('', '▸ KEY POINTS', ...bullets.map(b => '• ' + b));
    }
    if (topKw.length) {
      parts.push('', '▸ TOPICS: ' + topKw.join(', '));
    }

    let summary = parts.join('\n');
    const maxLen = Math.min(900, Math.max(320, Math.floor(cleaned.length * 0.35)));
    if (summary.length > maxLen) {
      summary = summary.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
    }
    return summary;
  }

  function renderOutput(html) {
    const out = document.getElementById('mdigest-output');
    if (out) out.innerHTML = html;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function updateStats(srcWords, sumWords) {
    const el = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    el('mdigest-stat-words', String(srcWords));
    el('mdigest-stat-sum', String(sumWords));
    const ratio = srcWords > 0 ? Math.round((sumWords / srcWords) * 100) + '%' : '—';
    el('mdigest-stat-ratio', ratio);
  }

  function runDigest() {
    if (!sourceText.trim()) {
      Toast.show('LOAD A FILE FIRST', 'warning');
      return;
    }
    const summary = summarize(sourceText);
    renderOutput(
      '<div style="font-family:var(--font-vt);font-size:20px;color:var(--green);line-height:1.6;white-space:pre-wrap;">' +
      escHtml(summary) + '</div>'
    );
    updateStats(wordCount(sourceText), wordCount(summary));
    document.getElementById('mdigest-copy')?.removeAttribute('disabled');
    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
    Toast.show('DIGEST READY', 'success', 1600);
  }

  function onFileSelected(file) {
    const meta = document.getElementById('mdigest-file-meta');
    const runBtn = document.getElementById('mdigest-run');
    if (!file) return;

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['txt', 'md'].includes(ext)) {
      Toast.show('USE .txt OR .md ONLY', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      sourceText = String(e.target?.result || '');
      if (meta) meta.textContent = file.name + ' — ' + (sourceText.length) + ' chars, ' + wordCount(sourceText) + ' words';
      if (runBtn) runBtn.disabled = false;
      renderOutput(
        '<div style="font-family:var(--font-vt);font-size:18px;color:var(--yellow);">FILE LOADED — press DIGEST ▶</div>'
      );
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
    };
    reader.onerror = () => Toast.show('FILE READ ERROR', 'error');
    reader.readAsText(file);
  }

  function clearAll() {
    sourceText = '';
    const input = document.getElementById('mdigest-file');
    if (input) input.value = '';
    const meta = document.getElementById('mdigest-file-meta');
    if (meta) meta.textContent = 'NO FILE LOADED';
    document.getElementById('mdigest-run')?.setAttribute('disabled', 'disabled');
    document.getElementById('mdigest-copy')?.setAttribute('disabled', 'disabled');
    updateStats(0, 0);
    renderOutput(
      '<div style="font-family:var(--font-vt);font-size:20px;color:var(--gray-light);">Upload a .txt or .md file to generate a digest.</div>'
    );
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function copySummary() {
    const out = document.getElementById('mdigest-output');
    const text = out?.innerText?.trim();
    if (!text) {
      Toast.show('NO SUMMARY YET', 'warning');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      Toast.show('COPIED', 'success');
      if (typeof PixelAudio !== 'undefined') PixelAudio.copy();
    }).catch(() => Toast.show('COPY FAILED', 'error'));
  }

  function bindEvents() {
    document.getElementById('mdigest-file')?.addEventListener('change', (ev) => {
      const f = ev.target.files?.[0];
      if (f) onFileSelected(f);
    });
    document.getElementById('mdigest-run')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      runDigest();
    });
    document.getElementById('mdigest-copy')?.addEventListener('click', copySummary);
    document.getElementById('mdigest-clear')?.addEventListener('click', clearAll);
  }

  async function logUsage() {
    try {
      const mod = await import('../supabase-config.js');
      await mod.logToolUsage(TOOL_NAME);
    } catch (_) {}
  }

  function init() {
    const panel = document.getElementById('tool-micro-digest');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';
    mountUI(panel);
    bindEvents();
    logUsage();
  }

  return { init, summarize, runDigest, clearAll };
})();
