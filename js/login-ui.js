/**
 * login-ui.js — Login page unique-user tracking (device)
 * Language + settings UI: js/lang_unified.js (PixelLang / PixelSettings)
 */
(function (global) {
  const UNIQUE_USERS_KEY = 'uniqueUsersOnDevice';

  function readUniqueUsers() {
    try {
      const raw = localStorage.getItem(UNIQUE_USERS_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr.filter((id) => typeof id === 'string' && id.trim()) : [];
    } catch {
      return [];
    }
  }

  function registerUniqueUser(userId) {
    const id = typeof userId === 'string' ? userId.trim() : '';
    if (!id) return false;
    const arr = readUniqueUsers();
    if (arr.includes(id)) return false;
    arr.push(id);
    localStorage.setItem(UNIQUE_USERS_KEY, JSON.stringify(arr));
    return true;
  }

  function getUniqueUserCount() {
    return readUniqueUsers().length;
  }

  function updateUsesCount() {
    const el = document.getElementById('uses-count');
    if (!el) return;
    const n = getUniqueUserCount();
    el.textContent = n < 10 ? String(n).padStart(2, '0') : String(n);
  }

  async function resolveAuthUserId(googleProfile) {
    try {
      const mod = await import('./supabase-config.js');
      if (mod.isSupabaseConfigured()) {
        const { data: { session }, error } = await mod.supabase.auth.getSession();
        if (!error && session?.user?.id) {
          return session.user.id;
        }
      }
    } catch (err) {
      console.warn('[PIXEL.LOGIN] Supabase session check:', err?.message || err);
    }
    return googleProfile?.sub || googleProfile?.id || '';
  }

  async function onAuthSuccess(googleProfile) {
    const userId = await resolveAuthUserId(googleProfile);
    if (userId) {
      registerUniqueUser(userId);
      updateUsesCount();
    }
  }

  function init() {
    updateUsesCount();

    (async () => {
      try {
        const mod = await import('./supabase-config.js');
        if (!mod.isSupabaseConfigured()) return;
        const { data: { session } } = await mod.supabase.auth.getSession();
        if (session?.user?.id) {
          registerUniqueUser(session.user.id);
          updateUsesCount();
        }
      } catch (_) { /* optional */ }
    })();
  }

  global.PixelLoginUI = {
    onAuthSuccess,
    resolveAuthUserId,
    registerUniqueUser,
    getUniqueUserCount,
    updateUsesCount,
    init,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
