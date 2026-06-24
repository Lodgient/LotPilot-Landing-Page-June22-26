"use server";

import { createClient } from "@/lib/supabase/server";

export interface SaveResult {
  ok: boolean;
  error?: string;
}

/**
 * Persist the signed-in dealer's profile (name + role). Writes via the session
 * client — RLS `dp_profiles_update_self` scopes it to their own row. The public
 * demo is anonymous, so it returns a read-only signal the UI surfaces honestly.
 */
export async function saveProfile(input: { fullName: string; role: string }): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "read_only_demo" };

  const { error } = await supabase
    .from("dp_profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ full_name: input.fullName.trim(), role: input.role.trim() } as any)
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
