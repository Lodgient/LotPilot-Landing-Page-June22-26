import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Server-only Supabase client using the SERVICE ROLE key. Bypasses RLS — use
 * ONLY in trusted server routes (e.g. the visibility ingestion endpoint), never
 * in client code. Returns null if the key isn't configured so callers can fail
 * cleanly with a 501.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
