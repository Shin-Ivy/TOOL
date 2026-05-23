/**
 * loudness.js — Loudness Matcher
 * Web Audio API analysis + GainNode normalization toward -14 LUFS (simulated) + WAV export.
 */

const LoudnessMatch = (() => {
  const TOOL_NAME = 'loudness';
  const TARGET_LUFS = -14;

  let decodedBuffer = null;
  let sourceFile = null;
  let lastNormalizedBuffer = null;
  let appliedGainDb = 0;

  function mountUI(panel) {
    const root = document.createElement('div');
    root.id = 'loud-root';
    root.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;">
        <div style="flex:1;min-width:260px;">
          <div class="px-box" style="border-color:var(--blue);">
            <label class="px-label" for="loud-file">UPLOAD AUDIO</label>
            <input type="file" id="loud-file" accept="audio/*,.mp3,.wav"
              style="font-family:var(--font-vt);font-size:18px;color:var(--green);margin-top:8px;width:100%;">
            <div id="loud-meta" style="font-family:var(--font-vt);font-size:16px;color:var(--gray-light);margin-top:8px;">NO TRACK</div>
          </div>
          <div style="display:flex;gap:8px;margin:12px 0;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-blue" id="loud-analyze" disabled>ANALYZE</button>
            <button type="button" class="px-btn px-btn-orange" id="loud-normalize" disabled>NORMALIZE ▶</button>
            <button type="button" class="px-btn px-btn-sm px-btn-pink" id="loud-download" disabled>DOWNLOAD WAV</button>
          </div>
          <audio id="loud-preview" controls style="width:100%;display:none;margin-bottom:12px;"></audio>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="px-box" style="text-align:center;border-color:var(--gray);">
              <div class="px-label">EST. LUFS</div>
              <div id="loud-stat-lufs" style="font-family:var(--font-pixel);font-size:12px;color:var(--yellow);">—</div>
            </div>
            <div class="px-box" style="text-align:center;border-color:var(--green);">
              <div class="px-label">GAIN APPLIED</div>
              <div id="loud-stat-gain" style="font-family:var(--font-pixel);font-size:12px;color:var(--green);">—</div>
            </div>
            <div class="px-box" style="text-align:center;border-color:var(--blue);">
              <div class="px-label">TARGET</div>
              <div style="font-family:var(--font-pixel);font-size:12px;color:var(--blue);">${TARGET_LUFS} LUFS</div>
            </div>
            <div class="px-box" style="text-align:center;border-color:var(--pink);">
              <div class="px-label">PEAK</div>
              <div id="loud-stat-peak" style="font-family:var(--font-pixel);font-size:12px;color:var(--pink);">—</div>
            </div>
          </div>
        </div>
        <div style="flex:1;min-width:260px;">
          <div id="loud-status" class="px-box" style="border-color:var(--gray);">
            <div class="px-label">METER LOG</div>
            <div id="loud-status-text" style="font-family:var(--font-vt);font-size:18px;color:var(--gray-light);line-height:1.5;">Upload audio to measure integrated loudness and export a normalized WAV.</div>
          </div>
        </div>
      </div>
    `;
    const header = panel.querySelector('.tool-header');
    if (header) {
      const sub = header.querySelector('p');
      if (sub) sub.textContent = 'Spotify/YouTube-style -14 LUFS targeting via Web Audio — fully client-side.';
      panel.insertBefore(root, header.nextSibling);
    } else {
      panel.appendChild(root);
    }
  }

  function setStatus(msg, color) {
    const el = document.getElementById('loud-status-text');
    if (el) {
      el.textContent = msg;
      el.style.color = color || 'var(--gray-light)';
    }
  }

  function measureLoudness(buffer) {
    const data = buffer.getChannelData(0);
    let sumSq = 0;
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const s = data[i];
      sumSq += s * s;
      const a = Math.abs(s);
      if (a > peak) peak = a;
    }
    const rms = Math.sqrt(sumSq / data.length) || 1e-10;
    const lufs = -0.691 + 10 * Math.log10(rms * rms);
    const peakDb = 20 * Math.log10(peak || 1e-10);
    return { lufs, peakDb, rms };
  }

  async function applyGainWithGainNode(buffer, gainLinear) {
    const offline = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    const src = offline.createBufferSource();
    src.buffer = buffer;
    const gain = offline.createGain();
    gain.gain.value = gainLinear;
    src.connect(gain);
    gain.connect(offline.destination);
    src.start(0);
    return offline.startRendering();
  }

  function encodeWav(buffer) {
    const numCh = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const samples = buffer.length;
    const bytesPerSample = 2;
    const blockAlign = numCh * bytesPerSample;
    const dataSize = samples * blockAlign;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);

    function writeStr(off, s) {
      for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
    }

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }

  async function loadFile(file) {
    sourceFile = file;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const ab = await file.arrayBuffer();
    decodedBuffer = await ctx.decodeAudioData(ab.slice(0));
    await ctx.close();

    const meta = document.getElementById('loud-meta');
    if (meta) {
      meta.textContent = file.name + ' — ' + decodedBuffer.duration.toFixed(1) + 's @ ' + decodedBuffer.sampleRate + 'Hz';
    }
    document.getElementById('loud-analyze')?.removeAttribute('disabled');
    document.getElementById('loud-normalize')?.removeAttribute('disabled');
    lastNormalizedBuffer = null;
    document.getElementById('loud-download')?.setAttribute('disabled', 'disabled');
    setStatus('TRACK LOADED — run ANALYZE or NORMALIZE.', 'var(--green)');
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function analyze() {
    if (!decodedBuffer) {
      Toast.show('LOAD AUDIO FIRST', 'warning');
      return;
    }
    const { lufs, peakDb } = measureLoudness(decodedBuffer);
    document.getElementById('loud-stat-lufs').textContent = lufs.toFixed(1);
    document.getElementById('loud-stat-peak').textContent = peakDb.toFixed(1) + ' dBFS';
    document.getElementById('loud-stat-gain').textContent = '—';
    setStatus(
      'MEASURED ~' + lufs.toFixed(1) + ' LUFS (integrated estimate). Target: ' + TARGET_LUFS + ' LUFS.',
      'var(--yellow)'
    );
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  async function normalize() {
    if (!decodedBuffer) {
      Toast.show('LOAD AUDIO FIRST', 'warning');
      return;
    }

    const { lufs, peakDb, rms } = measureLoudness(decodedBuffer);
    const gainDb = TARGET_LUFS - lufs;
    const gainLinear = Math.pow(10, gainDb / 20);

    appliedGainDb = gainDb;
    lastNormalizedBuffer = await applyGainWithGainNode(decodedBuffer, gainLinear);

    document.getElementById('loud-stat-lufs').textContent = TARGET_LUFS.toFixed(1) + ' (target)';
    document.getElementById('loud-stat-gain').textContent = (gainDb >= 0 ? '+' : '') + gainDb.toFixed(1) + ' dB';
    document.getElementById('loud-stat-peak').textContent = (peakDb + gainDb).toFixed(1) + ' dBFS (est)';

    const blob = encodeWav(lastNormalizedBuffer);
    const preview = document.getElementById('loud-preview');
    if (preview) {
      preview.src = URL.createObjectURL(blob);
      preview.style.display = 'block';
    }

    document.getElementById('loud-download')?.removeAttribute('disabled');
    setStatus(
      'NORMALIZED via GainNode simulation: ' + gainDb.toFixed(1) + ' dB → ~' + TARGET_LUFS + ' LUFS. Preview ready.',
      'var(--green)'
    );
    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
    Toast.show('NORMALIZED — DOWNLOAD WAV', 'success');
  }

  function downloadWav() {
    if (!lastNormalizedBuffer) {
      Toast.show('NORMALIZE FIRST', 'warning');
      return;
    }
    const blob = encodeWav(lastNormalizedBuffer);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pixel-loudness-' + TARGET_LUFS + 'lufs-' + Date.now() + '.wav';
    a.click();
    URL.revokeObjectURL(a.href);
    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
    Toast.show('WAV EXPORTED', 'success');
  }

  function bindEvents() {
    document.getElementById('loud-file')?.addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        await loadFile(f);
      } catch (_) {
        Toast.show('DECODE FAILED', 'error');
      }
    });
    document.getElementById('loud-analyze')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      analyze();
    });
    document.getElementById('loud-normalize')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      normalize();
    });
    document.getElementById('loud-download')?.addEventListener('click', downloadWav);
  }

  async function logUsage() {
    try {
      const mod = await import('../supabase-config.js');
      await mod.logToolUsage(TOOL_NAME);
    } catch (_) {}
  }

  function init() {
    const panel = document.getElementById('tool-loudness');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';
    mountUI(panel);
    bindEvents();
    logUsage();
  }

  return { init, analyze, normalize, downloadWav, measureLoudness, TARGET_LUFS };
})();
