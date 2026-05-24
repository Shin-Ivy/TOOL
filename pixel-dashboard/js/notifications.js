/**
 * notifications.js — PIXEL.TOOLS browser notifications & To-Do reminders
 *
 * LIMITATION: True background/cron reminders need Push API + a backend server.
 * This module polls only while the tab is visible (Page Visibility API).
 * Closing the app stops automated checks until the user opens it again.
 */
const PixelNotify = (function () {
  const TODO_STORAGE_KEY = 'pixel_todo_items';
  const COOLDOWN_KEY = 'pixel_notify_todo_last';
  const ICON_URL = 'img/icon-192.png?v=2';
  const NOTIFICATION_TAG = 'pixel-todo-reminder';

  /** Min time between "unfinished tasks" alerts (4 hours) */
  const COOLDOWN_MS = 4 * 60 * 60 * 1000;
  /** How often to evaluate list state while tab is active (5 minutes) */
  const POLL_INTERVAL_MS = 5 * 60 * 1000;

  let _pollTimer = null;

  function toast(msg, type) {
    if (typeof Toast !== 'undefined') Toast.show(msg, type);
  }

  function isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  function permission() {
    return isSupported() ? Notification.permission : 'unsupported';
  }

  function playerName() {
    try {
      const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      if (user && user.name) return user.name;
    } catch (e) { /* ignore */ }
    return 'Player One';
  }

  function t(key, fallback) {
    if (typeof PixelLang !== 'undefined') {
      const v = PixelLang.t(key);
      if (v && v !== key) return v;
    }
    return fallback;
  }

  /**
   * Request notification permission with retro flash feedback on a target element.
   * @param {{ flashTarget?: string|Element, quiet?: boolean }} [opts]
   * @returns {Promise<NotificationPermission|string>}
   */
  async function requestPermission(opts) {
    opts = opts || {};
    if (!isSupported()) {
      if (!opts.quiet) {
        toast('NOTIFICATIONS NOT SUPPORTED IN THIS BROWSER', 'warning');
      }
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      flashFeedback(opts.flashTarget, 'granted');
      refreshSettingsUI();
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      flashFeedback(opts.flashTarget, 'denied');
      if (!opts.quiet) {
        toast(t('notify_toast_denied', 'ALERTS BLOCKED — ENABLE IN BROWSER SETTINGS'), 'error');
      }
      refreshSettingsUI();
      return 'denied';
    }

    let result;
    try {
      result = await Notification.requestPermission();
    } catch (e) {
      result = 'denied';
    }

    flashFeedback(opts.flashTarget, result === 'granted' ? 'granted' : 'denied');

    if (!opts.quiet) {
      if (result === 'granted') {
        toast(t('notify_toast_granted', 'SYSTEM ONLINE — ALERTS ENABLED'), 'success');
        if (typeof PixelAudio !== 'undefined') PixelAudio.success();
      } else {
        toast(t('notify_toast_denied', 'ALERTS BLOCKED — ENABLE IN BROWSER SETTINGS'), 'error');
        if (typeof PixelAudio !== 'undefined') PixelAudio.alert();
      }
    }

    refreshSettingsUI();
    return result;
  }

  function flashFeedback(target, state) {
    const el = typeof target === 'string'
      ? document.querySelector(target)
      : target;
    if (!el) return;

    const cls = state === 'granted' ? 'px-notify-flash--granted' : 'px-notify-flash--denied';
    el.classList.remove('px-notify-flash--granted', 'px-notify-flash--denied');
    void el.offsetWidth;
    el.classList.add(cls);
    el.addEventListener('animationend', function onEnd() {
      el.classList.remove(cls);
      el.removeEventListener('animationend', onEnd);
    });
  }

  function loadTodoItems() {
    try {
      return JSON.parse(localStorage.getItem(TODO_STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * @returns {{ pending: object[], overdue: object[], pendingCount: number, overdueCount: number }}
   */
  function evaluateTodoState() {
    const items = loadTodoItems();
    const pending = items.filter(function (i) { return !i.done; });
    const now = Date.now();
    const overdue = pending.filter(function (i) {
      if (!i.due) return false;
      const dueMs = new Date(i.due).getTime();
      return !isNaN(dueMs) && dueMs < now;
    });
    return {
      pending: pending,
      overdue: overdue,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }

  function canFireReminder() {
    const last = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
    return Date.now() - last >= COOLDOWN_MS;
  }

  function markReminderFired() {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  }

  function buildReminderCopy(state) {
    const name = playerName();
    if (state.overdueCount > 0) {
      const first = state.overdue[0];
      const extra = state.overdueCount > 1
        ? ' (+' + (state.overdueCount - 1) + ' MORE)'
        : '';
      return {
        title: 'SYSTEM ALERT: MISSION OVERDUE',
        body: name + ', critical quest expired: "' + (first.text || 'TASK') + '"' + extra,
      };
    }
    const n = state.pendingCount;
    return {
      title: 'SYSTEM ALERT: PENDING TASKS',
      body: name + ', you have ' + n + ' uncompleted mission' + (n === 1 ? '' : 's') + '!',
    };
  }

  /**
   * Show a notification via the service worker when possible (handles notificationclick).
   */
  async function showNotification(title, body, data) {
    data = data || { tool: 'todo' };
    const options = {
      body: body,
      icon: ICON_URL,
      badge: ICON_URL,
      tag: NOTIFICATION_TAG,
      data: data,
      requireInteraction: false,
    };

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        return reg.showNotification(title, options);
      } catch (e) { /* fall through */ }
    }

    if (permission() === 'granted') {
      return new Notification(title, options);
    }
    return null;
  }

  /**
   * Evaluate To-Do state and fire a reminder if needed (respects cooldown).
   * @param {{ force?: boolean, test?: boolean }} [opts]
   */
  async function evaluateAndMaybeNotify(opts) {
    opts = opts || {};
    if (!isSupported()) return false;

    if (!opts.test && permission() !== 'granted') return false;
    if (!opts.test && document.visibilityState !== 'visible') return false;

    const state = evaluateTodoState();
    if (state.pendingCount === 0 && !opts.test) return false;

    if (!opts.test && !opts.force && !canFireReminder()) return false;

    let copy;
    if (opts.test) {
      copy = {
        title: 'SYSTEM ALERT: TEST TRANSMISSION',
        body: playerName() + ', arcade comms online. Insert coin to continue.',
      };
    } else {
      copy = buildReminderCopy(state);
    }

    await showNotification(copy.title, copy.body, { tool: 'todo', test: !!opts.test });

    if (!opts.test) markReminderFired();
    return true;
  }

  async function sendTestNotification() {
    const perm = await requestPermission({
      flashTarget: '.px-settings-modal__panel',
      quiet: true,
    });
    if (perm !== 'granted') {
      Toast.show(t('notify_toast_denied', 'ALERTS BLOCKED — ENABLE IN BROWSER SETTINGS'), 'error');
      return;
    }
    await evaluateAndMaybeNotify({ test: true, force: true });
    flashFeedback('.px-settings-modal__panel', 'granted');
    toast(t('notify_toast_test', 'TEST ALERT TRANSMITTED'), 'success');
    if (typeof PixelAudio !== 'undefined') PixelAudio.alert();
  }

  function refreshSettingsUI() {
    const statusEl = document.getElementById('px-notify-status');
    const enableBtn = document.getElementById('px-notify-enable-btn');
    if (!statusEl) return;

    const perm = permission();
    if (perm === 'granted') {
      statusEl.textContent = t('settings_notify_status_granted', 'STATUS: ONLINE — ALERTS ARMED');
      statusEl.className = 'px-notify-status px-notify-status--ok';
    } else if (perm === 'denied') {
      statusEl.textContent = t('settings_notify_status_denied', 'STATUS: OFFLINE — BLOCKED BY BROWSER');
      statusEl.className = 'px-notify-status px-notify-status--bad';
    } else if (perm === 'unsupported') {
      statusEl.textContent = t('settings_notify_status_unsupported', 'STATUS: NOT AVAILABLE');
      statusEl.className = 'px-notify-status px-notify-status--bad';
    } else {
      statusEl.textContent = t('settings_notify_status_default', 'STATUS: STANDBY — PERMISSION REQUIRED');
      statusEl.className = 'px-notify-status';
    }

    if (enableBtn) {
      enableBtn.disabled = perm === 'granted' || perm === 'denied' || perm === 'unsupported';
    }
  }

  function wireSettings() {
    const enableBtn = document.getElementById('px-notify-enable-btn');
    const testBtn = document.getElementById('px-notify-test-btn');
    if (enableBtn && enableBtn.dataset.pixelNotifyBound !== '1') {
      enableBtn.dataset.pixelNotifyBound = '1';
      enableBtn.addEventListener('click', function () {
        requestPermission({ flashTarget: '.px-settings-modal__panel' });
      });
    }
    if (testBtn && testBtn.dataset.pixelNotifyBound !== '1') {
      testBtn.dataset.pixelNotifyBound = '1';
      testBtn.addEventListener('click', function () {
        sendTestNotification();
      });
    }
    refreshSettingsUI();
  }

  function startPolling() {
    if (_pollTimer) return;
    _pollTimer = setInterval(function () {
      if (document.visibilityState === 'visible') {
        evaluateAndMaybeNotify();
      }
    }, POLL_INTERVAL_MS);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        evaluateAndMaybeNotify();
      }
    });
  }

  function initDashboard() {
    if (!document.getElementById('dash-page')) return;

    wireSettings();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', function (event) {
        const data = event.data || {};
        if (data.type === 'PIXEL_NAVIGATE' && data.tool && typeof switchTool === 'function') {
          switchTool(data.tool);
        }
      });
    }

    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool');
    if (toolParam && typeof switchTool === 'function') {
      switchTool(toolParam);
    }

    startPolling();
  }

  return {
    isSupported: isSupported,
    permission: permission,
    requestPermission: requestPermission,
    evaluateTodoState: evaluateTodoState,
    evaluateAndMaybeNotify: evaluateAndMaybeNotify,
    sendTestNotification: sendTestNotification,
    refreshSettingsUI: refreshSettingsUI,
    wireSettings: wireSettings,
    startPolling: startPolling,
    initDashboard: initDashboard,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { PixelNotify.initDashboard(); });
} else {
  PixelNotify.initDashboard();
}
