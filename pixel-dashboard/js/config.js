/**
 * config.js — Konfigurasi PIXEL.TOOLS
 * ======================================
 * ISI FILE INI dengan Client ID dari Google Cloud Console.
 *
 * CARA MENDAPATKAN CLIENT ID:
 * 1. Buka https://console.cloud.google.com
 * 2. APIs & Services → Credentials
 * 3. Create Credentials → OAuth 2.0 Client ID
 * 4. Application type: Web application
 * 5. Authorized JavaScript Origins: http://localhost:5500
 * 6. Salin Client ID → paste di bawah
 *
 * ⚠️  Client SECRET tidak dibutuhkan — ini client-side only (GIS).
 * ⚠️  Supabase: isi pixel-dashboard/.env.local lalu `npm run sync:supabase`
 * ⚠️  Jangan commit js/config.js atau .env.local jika repo PUBLIC.
 */

const APP_CONFIG = {
  // ← GANTI INI dengan Client ID kamu
  GOOGLE_CLIENT_ID: '776587796650-05ih700lu0vtp211f860r90e7rhgr6es.apps.googleusercontent.com',

  // Supabase: set pixel-dashboard/.env.local → npm run sync:supabase (see README)
  VERSION: '1.0.0',
};
