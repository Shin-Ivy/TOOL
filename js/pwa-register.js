/**
 * Register the PIXEL.TOOLS service worker on page load.
 */
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('service-worker.js', { scope: './' })
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
