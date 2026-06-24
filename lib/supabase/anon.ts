import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * A cookie-free anon Supabase client for cached, read-only demo data.
 *
 * The public dashboard serves a single, anonymous demo dataset (RLS scopes anon
 * reads to the demo dealer), so these reads are identical for every visitor and
 * safe to cache. Because it never touches cookies/headers, it can run inside
 * `unstable_cache` — unlike the request-scoped `createClient()` in ./server.
 */
let _client: ReturnType<typeof createClient> | null = null;

export function createAnonClient() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}
