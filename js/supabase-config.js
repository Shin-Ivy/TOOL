/**
 * supabase-config.js — Supabase client for PIXEL.TOOLS
 * =====================================================
 * ES module — loaded by tools via dynamic import().
 *
 * SETUP:
 * 1. Run supabase/phase1-schema.sql in Supabase SQL Editor
 * 2. Copy .env.local.example → .env.local with URL + anon key
 * 3. npm run sync:supabase  (writes js/supabase-secrets.js from .env.local)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

let SUPABASE_URL = 'YOUR_SUPABASE_URL';
let SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

try {
  const secrets = await import('./supabase-secrets.js');
  if (secrets.SUPABASE_URL) SUPABASE_URL = secrets.SUPABASE_URL;
  if (secrets.SUPABASE_ANON_KEY) SUPABASE_ANON_KEY = secrets.SUPABASE_ANON_KEY;
} catch {
  // supabase-secrets.js missing — use placeholders until sync:supabase runs
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function isSupabaseConfigured() {
  return (
    SUPABASE_URL.startsWith('https://') &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('YOUR_') &&
    !SUPABASE_URL.includes('YOUR_')
  );
}

/**
 * Log a tool open/use event to tool_usage_logs.
 * Fire-and-forget: never throws; logs warnings on failure.
 * @param {string} toolName
 */
export async function logToolUsage(toolName) {
  const name = typeof toolName === 'string' ? toolName.trim() : '';
  if (!name) {
    console.warn('[PIXEL.SUPABASE] logToolUsage: toolName is required');
    return;
  }
  if (!isSupabaseConfigured()) {
    console.warn('[PIXEL.SUPABASE] Not configured — skip logToolUsage');
    return;
  }
  try {
    const { error } = await supabase
      .from('tool_usage_logs')
      .insert({ tool_name: name });
    if (error) {
      console.warn('[PIXEL.SUPABASE] logToolUsage:', error.message);
    }
  } catch (err) {
    console.warn('[PIXEL.SUPABASE] logToolUsage:', err?.message || err);
  }
}
