import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service-role privileges.
 *
 * - Uses SUPABASE_SERVICE_ROLE_KEY ONLY. It never falls back to the anon key,
 *   because an anon client silently fails RLS-protected admin operations
 *   (e.g. DELETE on orders/payments).
 * - Throws a clear error when the service role key is missing.
 * - Server-side only: never import this from client components. The key is
 *   read from server env and is never exposed to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('SUPABASE_CONFIG_MISSING: NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY_MISSING: admin operations require SUPABASE_SERVICE_ROLE_KEY. ' +
        'Add it to .env.local (local dev) or your deployment environment variables (production). ' +
        'Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY is intentionally disabled.'
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
