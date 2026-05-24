/**
 * ipgeo.js — IP Geolocation Tool
 * Providers (no API key): ip-api.com (HTTP, granular ISP/ASN) + ipinfo.io (HTTPS fallback).
 * ip-api.com free tier does not support HTTPS; ipinfo.io is used on HTTPS pages and as fallback.
 */

const IpGeo = (() => {

  const IP_API_FIELDS = [
    'status', 'message', 'query', 'country', 'countryCode',
    'region', 'regionName', 'city', 'lat', 'lon', 'timezone',
    'isp', 'org', 'as', 'zip',
  ].join(',');

  function canUseIpApi() {
    return typeof location !== 'undefined' && location.protocol !== 'https:';
  }

  const PROVIDERS = [
    {
      id: 'ip-api.com',
      enabled: canUseIpApi,
      url(ip) {
        const base = ip
          ? `http://ip-api.com/json/${encodeURIComponent(ip)}`
          : 'http://ip-api.com/json/';
        return `${base}?fields=${IP_API_FIELDS}`;
      },
      apiError(data) {
        if (data?.status === 'fail') {
          return data.message || 'Lookup failed';
        }
        return null;
      },
      normalize(data) {
        const asnMatch = (data.as || '').match(/^(AS\d+)\b/i);
        return {
          ip: data.query,
          city: data.city,
          region: data.regionName || data.region,
          countryName: data.country,
          countryCode: data.countryCode,
          isp: data.isp,
          org: data.org,
          asn: asnMatch ? asnMatch[1].toUpperCase() : data.as,
          timezone: data.timezone,
          postal: data.zip,
          latitude: data.lat,
          longitude: data.lon,
        };
      },
    },
    {
      id: 'ipinfo.io',
      enabled: () => true,
      url(ip) {
        return ip
          ? `https://ipinfo.io/${encodeURIComponent(ip)}/json`
          : 'https://ipinfo.io/json';
      },
      apiError(data) {
        if (data?.bogon) return 'Reserved or private address (bogon)';
        if (data?.error) {
          const err = data.error;
          return typeof err === 'string' ? err : (err.message || err.title || 'Lookup failed');
        }
        return null;
      },
      normalize(data) {
        const [lat, lon] = (data.loc || '').split(',').map(Number);
        const asnMatch = (data.org || '').match(/^(AS\d+)\s*(.*)$/i);
        return {
          ip: data.ip,
          city: data.city,
          region: data.region,
          countryName: null,
          countryCode: data.country,
          isp: asnMatch ? (asnMatch[2] || data.org) : data.org,
          org: data.org,
          asn: asnMatch ? asnMatch[1].toUpperCase() : null,
          timezone: data.timezone,
          postal: data.postal,
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lon) ? lon : null,
        };
      },
    },
  ];

  function init() {
    const panel = document.getElementById('tool-ipgeo');
    if (!panel || panel.dataset.inited) return;
    panel.dataset.inited = 'true';

    panel.innerHTML = `
      <div class="tool-header">
        <h2>◈ IP GEOLOCATION LOOKUP</h2>
        <p>Lookup location and network info for any IP address. Auto-detects your IP.</p>
      </div>

      <div class="px-box ipgeo-disclaimer" style="border-color:var(--gray);margin-bottom:16px;padding:10px 14px;"
        title="IP geolocation uses ISP routing records, not GPS. Mobile and broadband IPs often register at a carrier hub (e.g. Jakarta) even when you are in another city (e.g. Palembang).">
        <div class="px-label" style="color:var(--yellow);">ⓘ ACCURACY NOTE</div>
        <p style="font-size:15px;color:var(--gray-light);margin:6px 0 0;line-height:1.45;font-family:var(--font-vt);">
          City/region data comes from ISP routing databases, not GPS.
          Mobile and residential IPs often show a carrier hub (capital or regional POP), not your exact town.
        </p>
      </div>

      <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:16px;">
        <div style="flex:1;min-width:200px;">
          <label class="px-label">IP ADDRESS (BLANK = YOUR IP)</label>
          <input id="ipgeo-input" class="px-input" type="text" placeholder="8.8.8.8 or leave blank"
            onkeydown="if(event.key==='Enter') IpGeo.lookup()">
        </div>
        <button class="px-btn px-btn-blue" onclick="IpGeo.lookup()" style="height:44px;">LOOKUP</button>
        <button class="px-btn px-btn-sm" onclick="IpGeo.lookupMine()" style="height:44px;">MY IP</button>
      </div>

      <div id="ipgeo-loading" class="hidden" style="font-family:var(--font-pixel);font-size:8px;color:var(--blue);">
        ▶ QUERYING DATABASE...
        <span class="blink">_</span>
      </div>
      <div id="ipgeo-error" class="px-box-red hidden mt-8" role="alert">
        <span id="ipgeo-error-text" style="font-family:var(--font-pixel);font-size:8px;line-height:1.6;"></span>
      </div>

      <div id="ipgeo-results" class="hidden">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:16px;" id="ipgeo-cards"></div>

        <div class="px-box" id="ipgeo-map-box">
          <div class="px-label">COORDINATES</div>
          <div id="ipgeo-coords" style="font-family:var(--font-vt);font-size:20px;"></div>
          <div id="ipgeo-map-link" style="margin-top:8px;"></div>
        </div>

        <div class="px-box mt-16" style="border-color:var(--gray);">
          <div class="px-label">RAW RESPONSE</div>
          <pre id="ipgeo-raw" class="px-code" style="font-size:14px;max-height:200px;overflow-y:auto;"></pre>
        </div>
      </div>
    `;

    lookupMine();
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function friendlyError(err) {
    const msg = (err && err.message) ? String(err.message) : String(err || 'Unknown error');

    if (err && err.name === 'AbortError') {
      return '▶ REQUEST TIMEOUT — Geo database did not respond in time. Try again.';
    }
    if (/failed to fetch|networkerror|load failed|network request failed/i.test(msg)) {
      return '▶ SIGNAL LOST — Cannot reach the geo database. On HTTPS hosts only the backup provider is used; check your connection or try again.';
    }
    if (/rate|429|too many|quota|limit/i.test(msg)) {
      return '▶ DATABASE BUSY — Too many lookups. Wait a moment, then try again.';
    }
    if (/invalid|private|reserved|bogon/i.test(msg)) {
      return '▶ INVALID TARGET — ' + msg;
    }
    if (/^HTTP[_\s]?(4|5)/i.test(msg) || /^HTTP \d{3}/.test(msg)) {
      return '▶ SERVER ERROR — Geo provider returned ' + msg.replace(/^HTTP[_\s]?/, '') + '. Try again shortly.';
    }
    return '▶ LOOKUP FAILED — ' + msg;
  }

  function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
  }

  /**
   * Fetch geolocation with automatic provider fallback.
   * @param {string|null} ip - IPv4/IPv6 or null for auto-detect
   * @returns {Promise<{ normalized: object, raw: object, provider: string }>}
   */
  async function fetchIpData(ip) {
    const query = (ip || '').trim() || null;
    let lastError = new Error('All geo providers unavailable');

    for (const provider of PROVIDERS) {
      if (provider.enabled && !provider.enabled()) continue;

      try {
        const res = await fetchWithTimeout(provider.url(query), 12000);

        if (res.status === 429) {
          throw new Error('Rate limit exceeded (429)');
        }
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }

        const raw = await res.json();
        const apiErr = provider.apiError(raw);
        if (apiErr) throw new Error(apiErr);

        const normalized = provider.normalize(raw);
        if (!normalized.ip && query) normalized.ip = query;

        return { normalized, raw, provider: provider.id };
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError;
  }

  function resetUi({ loading, errBox, results }) {
    if (loading) loading.classList.add('hidden');
    if (errBox) errBox.classList.add('hidden');
    if (results) results.classList.add('hidden');
  }

  function showError(message) {
    const loading = document.getElementById('ipgeo-loading');
    const errBox = document.getElementById('ipgeo-error');
    const results = document.getElementById('ipgeo-results');
    const errText = document.getElementById('ipgeo-error-text');

    resetUi({ loading, errBox: null, results });
    if (errText) errText.textContent = message;
    if (errBox) errBox.classList.remove('hidden');
    if (typeof PixelAudio !== 'undefined') PixelAudio.error();
  }

  function renderResult({ normalized, raw, provider }) {
    const loading = document.getElementById('ipgeo-loading');
    const errBox = document.getElementById('ipgeo-error');
    const results = document.getElementById('ipgeo-results');

    resetUi({ loading, errBox, results: null });

    const countryLabel = [
      normalized.countryName,
      normalized.countryCode,
    ].filter(Boolean).join(' ') || '—';

    const ispLabel = normalized.isp || normalized.org || '—';
    const asnLabel = normalized.asn
      ? (String(normalized.asn).toUpperCase().startsWith('AS') ? normalized.asn : 'AS' + normalized.asn)
      : '—';

    const cards = [
      { label: 'IP ADDRESS', val: normalized.ip || '—', color: 'green' },
      { label: 'CITY', val: normalized.city || '—', color: 'blue' },
      { label: 'REGION / STATE', val: normalized.region || '—', color: 'blue' },
      { label: 'COUNTRY', val: countryLabel, color: 'pink' },
      { label: 'ISP', val: ispLabel, color: 'yellow' },
      { label: 'TIMEZONE', val: normalized.timezone || '—', color: 'green' },
      { label: 'ASN', val: asnLabel, color: 'gray' },
      { label: 'POSTAL', val: normalized.postal || '—', color: 'gray' },
      { label: 'DATA SOURCE', val: provider, color: 'gray' },
    ];

    const boxClass = (color) => {
      if (color === 'pink') return 'px-box-pink';
      if (color === 'blue') return 'px-box-blue';
      if (color === 'yellow') return 'px-box-yellow';
      return 'px-box';
    };

    const valColor = (color) => {
      if (color === 'gray') return 'var(--gray-light)';
      return `var(--${color})`;
    };

    const cardsEl = document.getElementById('ipgeo-cards');
    cardsEl.innerHTML = cards.map((c) => `
      <div class="${boxClass(c.color)}">
        <div class="px-label">${escapeHtml(c.label)}</div>
        <div style="font-family:var(--font-vt);font-size:22px;color:${valColor(c.color)};word-break:break-all;">${escapeHtml(c.val)}</div>
      </div>
    `).join('');

    const lat = normalized.latitude;
    const lon = normalized.longitude;
    document.getElementById('ipgeo-coords').textContent =
      lat != null && lon != null ? `LAT: ${lat}  LON: ${lon}` : 'COORDINATES UNAVAILABLE';

    const mapLink = document.getElementById('ipgeo-map-link');
    if (lat != null && lon != null) {
      mapLink.innerHTML = `<a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=10" target="_blank" rel="noopener noreferrer" class="px-btn px-btn-sm px-btn-blue">OPEN MAP ↗</a>`;
    } else {
      mapLink.innerHTML = '';
    }

    document.getElementById('ipgeo-raw').textContent = JSON.stringify(raw, null, 2);
    results.classList.remove('hidden');
    if (typeof PixelAudio !== 'undefined') PixelAudio.success();
  }

  async function runLookup(ip) {
    const loading = document.getElementById('ipgeo-loading');
    const errBox = document.getElementById('ipgeo-error');
    const results = document.getElementById('ipgeo-results');

    if (!loading) return;

    loading.classList.remove('hidden');
    errBox.classList.add('hidden');
    results.classList.add('hidden');

    try {
      const payload = await fetchIpData(ip);
      renderResult(payload);
    } catch (e) {
      showError(friendlyError(e));
    }
  }

  async function lookup() {
    const val = document.getElementById('ipgeo-input').value.trim();
    await runLookup(val || null);
  }

  async function lookupMine() {
    const input = document.getElementById('ipgeo-input');
    if (input) input.value = '';
    await runLookup(null);
  }

  return { init, lookup, lookupMine, fetchIpData };
})();

/*
 * Optional backend proxy (Next.js App Router) — use ip-api.com over HTTPS server-side:
 *
 * // app/api/ip-geo/route.js
 * const FIELDS = 'status,message,query,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as,zip';
 * export async function GET(request) {
 *   const ip = new URL(request.url).searchParams.get('ip');
 *   const target = ip
 *     ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=${FIELDS}`
 *     : `http://ip-api.com/json/?fields=${FIELDS}`;
 *   const res = await fetch(target, { headers: { Accept: 'application/json' }, next: { revalidate: 60 } });
 *   return new Response(await res.text(), {
 *     status: res.status,
 *     headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
 *   });
 * }
 *
 * Then call: fetch(`/api/ip-geo${ip ? '?ip=' + encodeURIComponent(ip) : ''}`)
 */
