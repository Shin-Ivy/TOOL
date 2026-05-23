/**
 * stem-sep.js — Stem Separator UI
 * Audio upload + Vocal/Instrument toggles; DOM mount for future ONNX Web nodes.
 */

const StemSep = (() => {
  const TOOL_NAME = 'stem-sep';

  let audioBuffer = null;
  let activeStem = 'vocal';
  let objectUrl = null;
  let filePicker = null;

  function mountUI(panel) {
    filePicker = RetroFileInput.create({
      id: 'stem-file',
      label: 'UPLOAD AUDIO (.mp3 / .wav)',
      accept: '.mp3,.wav,audio/mpeg,audio/wav,audio/wave',
      ariaLabel: 'Upload audio file (.mp3 or .wav)',
      variant: 'blue',
      placeholder: 'NO FILE SELECTED',
      extensions: ['mp3', 'wav'],
      invalidMessage: 'USE .mp3 OR .wav',
      onFileSelect: async (file) => {
        const meta = document.getElementById('stem-meta');
        if (meta) {
          meta.textContent = 'DECODING TRACK...';
          meta.style.color = 'var(--yellow)';
          meta.removeAttribute('title');
        }
        try {
          await decodeFile(file);
        } catch (err) {
          if (meta) {
            meta.textContent = 'NO TRACK LOADED';
            meta.style.color = 'var(--gray-light)';
            meta.removeAttribute('title');
          }
          Toast.show('AUDIO DECODE FAILED', 'error');
          throw err;
        }
      },
    });
    const root = document.createElement('div');
    root.id = 'stem-root';
    root.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;">
        <div style="flex:1;min-width:260px;">
          <div class="px-box" style="border-color:var(--blue);">
            ${filePicker.renderHTML()}
            <div id="stem-meta" style="font-family:var(--font-vt);font-size:16px;color:var(--gray-light);margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">NO TRACK LOADED</div>
          </div>
          <div style="display:flex;gap:8px;margin:16px 0;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-blue" id="stem-btn-vocal" data-stem="vocal">VOCAL</button>
            <button type="button" class="px-btn" id="stem-btn-instrument" data-stem="instrument">INSTRUMENT</button>
            <button type="button" class="px-btn px-btn-orange" id="stem-process" disabled>SEPARATE ▶</button>
          </div>
          <audio id="stem-player" controls style="width:100%;margin-bottom:12px;display:none;"></audio>
          <div id="stem-status" class="px-box" style="border-color:var(--gray);">
            <div class="px-label">RUNTIME</div>
            <div id="stem-status-text" style="font-family:var(--font-vt);font-size:18px;color:var(--gray-light);">ONNX Web nodes mount below when inference is wired.</div>
          </div>
        </div>
        <div style="flex:1;min-width:260px;">
          <div class="px-box" style="border-color:var(--blue);min-height:200px;">
            <div class="px-label">ONNX WEB RUNTIME MOUNT</div>
            <div id="stem-onnx-mount" style="margin-top:12px;font-family:var(--font-vt);font-size:17px;color:var(--gray-light);line-height:1.5;">
              <div data-onnx-node="session-placeholder" class="px-box" style="border-color:var(--dark3);margin-bottom:8px;padding:8px;">
                ◇ ort.InferenceSession — <span style="color:var(--yellow);">PENDING</span>
              </div>
              <div data-onnx-node="model-vocal" class="px-box" style="border-color:var(--dark3);margin-bottom:8px;padding:8px;">
                ◇ MODEL: vocal_umx.onnx — <span style="color:var(--gray);">NOT LOADED</span>
              </div>
              <div data-onnx-node="model-instrument" class="px-box" style="border-color:var(--dark3);padding:8px;">
                ◇ MODEL: instrument_umx.onnx — <span style="color:var(--gray);">NOT LOADED</span>
              </div>
            </div>
          </div>
          <canvas id="stem-waveform" width="400" height="64"
            style="width:100%;margin-top:12px;border:2px solid var(--dark3);background:var(--black);image-rendering:pixelated;"></canvas>
        </div>
      </div>
    `;
    const header = panel.querySelector('.tool-header');
    if (header) {
      const sub = header.querySelector('p');
      if (sub) sub.textContent = 'Upload a track, pick a stem, and preview — full ONNX separation ships in the next pass.';
      panel.insertBefore(root, header.nextSibling);
    } else {
      panel.appendChild(root);
    }
    filePicker.bind();
  }

  function setStem(stem) {
    activeStem = stem;
    const vocalBtn = document.getElementById('stem-btn-vocal');
    const instBtn = document.getElementById('stem-btn-instrument');
    if (vocalBtn) vocalBtn.className = 'px-btn' + (stem === 'vocal' ? ' px-btn-blue' : '');
    if (instBtn) instBtn.className = 'px-btn' + (stem === 'instrument' ? ' px-btn-blue' : '');
    updateOnnxMount();
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function updateOnnxMount() {
    const mount = document.getElementById('stem-onnx-mount');
    if (!mount) return;
    const vocal = mount.querySelector('[data-onnx-node="model-vocal"] span');
    const inst = mount.querySelector('[data-onnx-node="model-instrument"] span');
    const session = mount.querySelector('[data-onnx-node="session-placeholder"] span');
    if (session) {
      session.textContent = audioBuffer ? 'READY (MOCK)' : 'PENDING';
      session.style.color = audioBuffer ? 'var(--green)' : 'var(--yellow)';
    }
    if (vocal) {
      vocal.textContent = activeStem === 'vocal' && audioBuffer ? 'SELECTED' : 'NOT LOADED';
      vocal.style.color = activeStem === 'vocal' ? 'var(--green)' : 'var(--gray)';
    }
    if (inst) {
      inst.textContent = activeStem === 'instrument' && audioBuffer ? 'SELECTED' : 'NOT LOADED';
      inst.style.color = activeStem === 'instrument' ? 'var(--green)' : 'var(--gray)';
    }
  }

  function drawWaveform(buffer) {
    const canvas = document.getElementById('stem-waveform');
    if (!canvas || !buffer) return;
    const ctx = canvas.getContext('2d');
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const mid = canvas.height / 2;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = activeStem === 'vocal' ? '#ff2079' : '#0ff0fc';

    for (let x = 0; x < canvas.width; x++) {
      let min = 1;
      let max = -1;
      for (let i = 0; i < step; i++) {
        const v = data[x * step + i] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const h = Math.max(1, (max - min) * mid);
      ctx.fillRect(x, mid - h / 2, 1, h);
    }
  }

  async function decodeFile(file) {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const ab = await file.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(ab.slice(0));
    await ctx.close();

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);

    const player = document.getElementById('stem-player');
    if (player) {
      player.src = objectUrl;
      player.style.display = 'block';
    }

    filePicker?.setFileName(file.name, true);
    const meta = document.getElementById('stem-meta');
    if (meta) {
      meta.textContent = file.name + ' — ' + audioBuffer.duration.toFixed(1) + 's, ' +
        audioBuffer.numberOfChannels + 'ch @ ' + audioBuffer.sampleRate + 'Hz';
      meta.title = meta.textContent;
      meta.style.color = 'var(--green)';
    }
    document.getElementById('stem-process')?.removeAttribute('disabled');
    drawWaveform(audioBuffer);
    updateOnnxMount();

    const status = document.getElementById('stem-status-text');
    if (status) status.textContent = 'TRACK DECODED — select VOCAL or INSTRUMENT, then SEPARATE ▶';
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function processStem() {
    if (!audioBuffer) {
      Toast.show('LOAD AUDIO FIRST', 'warning');
      return;
    }
    const status = document.getElementById('stem-status-text');
    if (status) {
      status.textContent = 'MOCK SEPARATION: ' + activeStem.toUpperCase() +
        ' stem queued — ONNX InferenceSession.run() will stream here.';
      status.style.color = 'var(--green)';
    }
    updateOnnxMount();
    drawWaveform(audioBuffer);
    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
    Toast.show(activeStem.toUpperCase() + ' STEM SELECTED (MOCK)', 'info', 2000);
  }

  function bindEvents() {
    document.getElementById('stem-btn-vocal')?.addEventListener('click', () => setStem('vocal'));
    document.getElementById('stem-btn-instrument')?.addEventListener('click', () => setStem('instrument'));
    document.getElementById('stem-process')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      processStem();
    });
  }

  async function logUsage() {
    try {
      const mod = await import('../supabase-config.js');
      await mod.logToolUsage(TOOL_NAME);
    } catch (_) {}
  }

  function init() {
    const panel = document.getElementById('tool-stem-sep');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';
    mountUI(panel);
    bindEvents();
    setStem('vocal');
    logUsage();
  }

  return { init, setStem, processStem, decodeFile };
})();
