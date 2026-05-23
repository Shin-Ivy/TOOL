/**
 * config.example.js — Copy to js/config.js and fill in your values
 * ================================================================
 * cp js/config.example.js js/config.js
 *
 * Never commit js/config.js if the repo is public (see .gitignore).
 */

const APP_CONFIG = {
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // Supabase → Project Settings → API
  // Use Project URL + anon public (legacy) OR publishable key (sb_publishable_...)
  // Never put service_role or secret keys here — browser-only config.
  SUPABASE_URL: 'https://YOUR_PROJECT_REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_OR_PUBLISHABLE_KEY',

  VERSION: '1.0.0',
};
