/**
 * content-wiz.js — Content Wizard
 * Repurposes one idea into Twitter, LinkedIn, and Instagram formats; saves to content_history.
 */

const ContentWiz = (() => {
  const TOOL_NAME = 'content-wiz';

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function mountUI(panel) {
    const root = document.createElement('div');
    root.id = 'cwiz-root';
    root.innerHTML = `
      <div style="margin-top:16px;">
        <label class="px-label" for="cwiz-input">SOURCE IDEA / ARTICLE</label>
        <textarea id="cwiz-input" class="px-textarea" rows="6"
          placeholder="Paste your blog post, announcement, or rough idea..."></textarea>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button type="button" class="px-btn px-btn-orange" id="cwiz-generate">GENERATE ▶</button>
          <button type="button" class="px-btn px-btn-sm" id="cwiz-sample">LOAD SAMPLE</button>
          <button type="button" class="px-btn px-btn-sm px-btn-red" id="cwiz-clear">CLEAR</button>
        </div>
      </div>
      <div id="cwiz-save-status" class="px-box mt-16 hidden" style="border-color:var(--blue);">
        <div class="px-label">SUPABASE SYNC</div>
        <div id="cwiz-save-text" style="font-family:var(--font-vt);font-size:18px;color:var(--blue);"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-top:20px;">
        <div class="px-box" style="border-color:var(--blue);">
          <div class="px-label">𝕏 TWITTER / X</div>
          <div id="cwiz-out-twitter" class="cwiz-output" style="font-family:var(--font-vt);font-size:18px;color:var(--green);white-space:pre-wrap;min-height:80px;margin:8px 0;">—</div>
          <button type="button" class="px-btn px-btn-sm px-btn-blue cwiz-copy" data-platform="twitter">COPY</button>
        </div>
        <div class="px-box" style="border-color:var(--pink);">
          <div class="px-label">LINKEDIN ESSAY</div>
          <div id="cwiz-out-linkedin" class="cwiz-output" style="font-family:var(--font-vt);font-size:18px;color:var(--green);white-space:pre-wrap;min-height:80px;margin:8px 0;">—</div>
          <button type="button" class="px-btn px-btn-sm px-btn-blue cwiz-copy" data-platform="linkedin">COPY</button>
        </div>
        <div class="px-box" style="border-color:var(--yellow);">
          <div class="px-label">INSTAGRAM CAPTION</div>
          <div id="cwiz-out-instagram" class="cwiz-output" style="font-family:var(--font-vt);font-size:18px;color:var(--green);white-space:pre-wrap;min-height:80px;margin:8px 0;">—</div>
          <button type="button" class="px-btn px-btn-sm px-btn-blue cwiz-copy" data-platform="instagram">COPY</button>
        </div>
      </div>
    `;
    const header = panel.querySelector('.tool-header');
    if (header) {
      const sub = header.querySelector('p');
      if (sub) sub.textContent = 'One input → three social formats. Outputs sync to content_history when Supabase is configured.';
      panel.insertBefore(root, header.nextSibling);
    } else {
      panel.appendChild(root);
    }
  }

  function extractKeywords(text) {
    const stop = new Set(['about','after','before','could','should','their','there','these','those','which','while','would','with','from','that','this','have','been','your','into']);
    const freq = {};
    text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter(w => w.length > 4 && !stop.has(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([w]) => w);
  }

  function firstSentence(text) {
    const m = text.trim().match(/^[^.!?\n]+[.!?]?/);
    return m ? m[0].trim() : text.trim().slice(0, 120);
  }

  function formatTwitter(text) {
    const hook = firstSentence(text);
    const tags = extractKeywords(text).map(t => '#' + t.replace(/[^a-z0-9]/gi, '')).filter(Boolean).slice(0, 3);
    let body = '🧵 ' + hook;
    if (text.length > hook.length + 20) {
      body += '\n\n' + text.trim().slice(hook.length, hook.length + 180).replace(/\s+/g, ' ').trim();
    }
    if (tags.length) body += '\n\n' + tags.join(' ');
    if (body.length > 280) body = body.slice(0, 277) + '…';
    return body;
  }

  function formatLinkedIn(text) {
    const hook = firstSentence(text);
    const paras = text.trim().split(/\n\n+/).filter(Boolean);
    const mid = paras.length > 1 ? paras.slice(1, 3).join('\n\n') : text.trim().slice(hook.length, hook.length + 400);
    return (
      hook + '\n\n' +
      (mid || text.trim()) + '\n\n' +
      'What resonates with your team? Drop a comment — I read every one.\n\n' +
      '#Leadership #Productivity #PIXELTOOLS'
    ).slice(0, 2200);
  }

  function formatInstagram(text) {
    const hook = firstSentence(text);
    const tags = extractKeywords(text).map(t => '#' + t.replace(/[^a-z0-9]/gi, '')).slice(0, 8);
    const emojis = '✨🚀💡';
    let cap = emojis + ' ' + hook + '\n\n' + text.trim().slice(0, 400);
    if (tags.length) cap += '\n.\n.\n.\n' + tags.join(' ');
    if (cap.length > 2200) cap = cap.slice(0, 2197) + '…';
    return cap;
  }

  function setOutput(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '—';
  }

  function showSaveStatus(msg, ok) {
    const box = document.getElementById('cwiz-save-status');
    const txt = document.getElementById('cwiz-save-text');
    if (box) box.classList.remove('hidden');
    if (txt) {
      txt.textContent = msg;
      txt.style.color = ok ? 'var(--green)' : 'var(--yellow)';
    }
  }

  async function saveToSupabase(formats) {
    try {
      const mod = await import('../supabase-config.js');
      if (!mod.isSupabaseConfigured()) {
        showSaveStatus('GENERATED — Supabase not configured (run npm run sync:supabase)', false);
        return;
      }
      const rows = [
        { platform: 'twitter', generated_text: formats.twitter },
        { platform: 'linkedin', generated_text: formats.linkedin },
        { platform: 'instagram', generated_text: formats.instagram },
      ];
      const { error } = await mod.supabase.from('content_history').insert(rows);
      if (error) {
        showSaveStatus('GENERATED — Supabase save skipped: ' + error.message, false);
        return;
      }
      showSaveStatus('SAVED 3 ROWS TO content_history', true);
    } catch (err) {
      showSaveStatus('GENERATED — Supabase not configured or unavailable', false);
    }
  }

  async function generate() {
    const input = document.getElementById('cwiz-input');
    const raw = input?.value?.trim();
    if (!raw) {
      Toast.show('ENTER SOURCE TEXT', 'warning');
      return;
    }

    const formats = {
      twitter: formatTwitter(raw),
      linkedin: formatLinkedIn(raw),
      instagram: formatInstagram(raw),
    };

    setOutput('cwiz-out-twitter', formats.twitter);
    setOutput('cwiz-out-linkedin', formats.linkedin);
    setOutput('cwiz-out-instagram', formats.instagram);

    await saveToSupabase(formats);

    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
    Toast.show('CONTENT GENERATED', 'success');
  }

  function loadSample() {
    const input = document.getElementById('cwiz-input');
    if (input) {
      input.value =
        'PIXEL.TOOLS just shipped Phase 2: six browser-native utilities for AI context trimming, ' +
        'document digests, social repurposing, image upscale preview, stem separation hooks, and loudness matching. ' +
        'Everything runs client-side — no uploads, no API keys for the core loop.';
    }
    generate();
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function clearAll() {
    const input = document.getElementById('cwiz-input');
    if (input) input.value = '';
    setOutput('cwiz-out-twitter', '—');
    setOutput('cwiz-out-linkedin', '—');
    setOutput('cwiz-out-instagram', '—');
    document.getElementById('cwiz-save-status')?.classList.add('hidden');
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function copyPlatform(platform) {
    const map = {
      twitter: 'cwiz-out-twitter',
      linkedin: 'cwiz-out-linkedin',
      instagram: 'cwiz-out-instagram',
    };
    const el = document.getElementById(map[platform]);
    const text = el?.textContent?.trim();
    if (!text || text === '—') {
      Toast.show('GENERATE FIRST', 'warning');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      Toast.show(platform.toUpperCase() + ' COPIED', 'success');
      if (typeof PixelAudio !== 'undefined') PixelAudio.copy();
    }).catch(() => Toast.show('COPY FAILED', 'error'));
  }

  function bindEvents() {
    document.getElementById('cwiz-generate')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      generate();
    });
    document.getElementById('cwiz-sample')?.addEventListener('click', loadSample);
    document.getElementById('cwiz-clear')?.addEventListener('click', clearAll);
    document.querySelectorAll('.cwiz-copy').forEach(btn => {
      btn.addEventListener('click', () => copyPlatform(btn.getAttribute('data-platform')));
    });
  }

  async function logUsage() {
    try {
      const mod = await import('../supabase-config.js');
      await mod.logToolUsage(TOOL_NAME);
    } catch (_) {}
  }

  function init() {
    const panel = document.getElementById('tool-content-wiz');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';
    mountUI(panel);
    bindEvents();
    logUsage();
  }

  return { init, generate, formatTwitter, formatLinkedIn, formatInstagram, clearAll };
})();
