/**
 * hd-format.js — HD Format (canvas image upscale preview)
 * Local image upload, simulated 2× upscale, and download.
 */

const HdFormat = (() => {
  const TOOL_NAME = 'hd-format';

  let sourceImage = null;
  let scaleFactor = 2;

  function mountUI(panel) {
    const root = document.createElement('div');
    root.id = 'hdf-root';
    root.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;">
        <div style="flex:1;min-width:240px;">
          <div class="px-box" style="border-color:var(--pink);">
            <label class="px-label" for="hdf-file">UPLOAD IMAGE</label>
            <input type="file" id="hdf-file" accept="image/png,image/jpeg,image/webp,image/gif"
              style="font-family:var(--font-vt);font-size:18px;color:var(--green);margin-top:8px;width:100%;">
            <div id="hdf-meta" style="font-family:var(--font-vt);font-size:16px;color:var(--gray-light);margin-top:8px;">NO IMAGE</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <button type="button" class="px-btn px-btn-sm" id="hdf-scale-2" data-scale="2">2× SCALE</button>
            <button type="button" class="px-btn px-btn-sm px-btn-pink" id="hdf-scale-4" data-scale="4">4× SCALE</button>
            <button type="button" class="px-btn px-btn-orange" id="hdf-upscale" disabled>UPSCALE &amp; DOWNLOAD ▶</button>
          </div>
          <div id="hdf-status" class="px-box mt-12" style="border-color:var(--gray);">
            <div class="px-label">STATUS</div>
            <div id="hdf-status-text" style="font-family:var(--font-vt);font-size:18px;color:var(--gray-light);">AWAITING IMAGE — WebGPU/WASM path reserved for Phase 3.</div>
          </div>
        </div>
        <div style="flex:2;min-width:280px;">
          <div class="px-box" style="border-color:var(--pink);padding:12px;overflow:auto;">
            <div class="px-label">CANVAS PREVIEW (NEAREST-NEIGHBOR 8-BIT UPSCALE)</div>
            <div style="overflow:auto;max-height:420px;margin-top:8px;background:var(--black);border:2px solid var(--dark3);">
              <canvas id="hdf-canvas" style="image-rendering:pixelated;image-rendering:crisp-edges;max-width:100%;"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
    const header = panel.querySelector('.tool-header');
    if (header) {
      const sub = header.querySelector('p');
      if (sub) sub.textContent = 'Browser-local image upscale preview — files never uploaded to a server.';
      panel.insertBefore(root, header.nextSibling);
    } else {
      panel.appendChild(root);
    }
  }

  function setStatus(msg, color) {
    const el = document.getElementById('hdf-status-text');
    if (el) {
      el.textContent = msg;
      el.style.color = color || 'var(--gray-light)';
    }
  }

  function setScale(factor) {
    scaleFactor = factor;
    document.getElementById('hdf-scale-2')?.classList.toggle('px-btn-pink', factor === 2);
    document.getElementById('hdf-scale-4')?.classList.toggle('px-btn-pink', factor === 4);
    if (sourceImage) drawPreview(false);
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function drawPreview(upscaled) {
    const canvas = document.getElementById('hdf-canvas');
    if (!canvas || !sourceImage) return;
    const ctx = canvas.getContext('2d');
    const w = sourceImage.naturalWidth;
    const h = sourceImage.naturalHeight;
    const sw = upscaled ? w * scaleFactor : w;
    const sh = upscaled ? h * scaleFactor : h;

    canvas.width = sw;
    canvas.height = sh;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, sw, sh);
    ctx.drawImage(sourceImage, 0, 0, sw, sh);
  }

  function onImageLoaded(file, img) {
    sourceImage = img;
    const meta = document.getElementById('hdf-meta');
    if (meta) {
      meta.textContent = file.name + ' — ' + img.naturalWidth + '×' + img.naturalHeight + ' px';
    }
    document.getElementById('hdf-upscale')?.removeAttribute('disabled');
    drawPreview(false);
    setStatus('IMAGE LOADED — select scale and run UPSCALE.', 'var(--green)');
    if (typeof PixelAudio !== 'undefined') PixelAudio.click();
  }

  function onFileChange(file) {
    if (!file || !file.type.startsWith('image/')) {
      Toast.show('SELECT A VALID IMAGE', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onImageLoaded(file, img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      Toast.show('IMAGE LOAD FAILED', 'error');
    };
    img.src = url;
  }

  function upscaleAndDownload() {
    if (!sourceImage) {
      Toast.show('LOAD AN IMAGE FIRST', 'warning');
      return;
    }
    drawPreview(true);
    const canvas = document.getElementById('hdf-canvas');
    if (!canvas) return;

    setStatus('RENDERING ' + scaleFactor + '× UPSCALE…', 'var(--yellow)');

    canvas.toBlob((blob) => {
      if (!blob) {
        Toast.show('EXPORT FAILED', 'error');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pixel-hd-' + scaleFactor + 'x-' + Date.now() + '.png';
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus('DONE — ' + canvas.width + '×' + canvas.height + ' PNG downloaded (simulated AI upscale).', 'var(--green)');
      if (typeof PixelAudio !== 'undefined') PixelAudio.success();
      Toast.show('UPSCALED PNG DOWNLOADED', 'success');
    }, 'image/png');
  }

  function bindEvents() {
    document.getElementById('hdf-file')?.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (f) onFileChange(f);
    });
    document.getElementById('hdf-scale-2')?.addEventListener('click', () => setScale(2));
    document.getElementById('hdf-scale-4')?.addEventListener('click', () => setScale(4));
    document.getElementById('hdf-upscale')?.addEventListener('click', () => {
      if (typeof PixelAudio !== 'undefined') PixelAudio.click();
      upscaleAndDownload();
    });
  }

  async function logUsage() {
    try {
      const mod = await import('../supabase-config.js');
      await mod.logToolUsage(TOOL_NAME);
    } catch (_) {}
  }

  function init() {
    const panel = document.getElementById('tool-hd-format');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';
    mountUI(panel);
    bindEvents();
    setScale(2);
    logUsage();
  }

  return { init, upscaleAndDownload, drawPreview };
})();
