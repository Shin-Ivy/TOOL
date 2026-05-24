/**
 * Register the PIXEL.TOOLS service worker on page load.
 * Query string busts CDN/browser caches on Vercel and mobile install flows.
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  var PWA_BUILD = 'v=2';
  var SW_URL = '/service-worker.js?' + PWA_BUILD;

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register(SW_URL, { scope: '/' })
      .then(function (reg) {
        reg.addEventListener('updatefound', function () {
          var worker = reg.installing;
          if (!worker) return;
          worker.addEventListener('statechange', function () {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[PIXEL.TOOLS] New version available — refresh to update.');
            }
          });
        });
      })
      .catch(function (err) {
        console.warn('[PIXEL.TOOLS] Service worker registration failed:', err);
      });
  });
})();
