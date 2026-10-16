import { collectBackup, applyBackup } from "@/lib/backup";
import { getSupabase } from "@/lib/supabase";

/** What we know about a student's saved copy, without downloading it. */
export type CloudInfo = { updatedAt: string } | null;

const TABLE = "cv_sync";

/** Turns a database error into something a student can act on. */
function explain(error: { code?: string; message?: string }): Error {
  // The table is missing until the SQL in supabase/schema.sql has been run
  if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("cv_sync")) {
    return new Error("Saving to your account is not set up yet. Please try again later.");
  }
  return new Error("We could not reach your account. Check your internet and try again.");
}

/** The signed-in student's id, or an error asking them to log in. */
async function currentUserId(): Promise<string> {
  const supabase = getSupabase();
  const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!data.user) throw new Error("Please log in first.");
  return data.user.id;
}

/** When the student last saved to their account, or null if they never have. */
export async function getCloudInfo(): Promise<CloudInfo> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const userId = await currentUserId();
  const { data, error } = await supabase.from(TABLE).select("updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw explain(error);
  return data ? { updatedAt: data.updated_at as string } : null;
}

/** Saves everything in this browser to the student's account, replacing their last saved copy. */
export async function saveToCloud(): Promise<void> {
  const supabase = getSupabase();
  const data = collectBackup();
  if (!supabase) throw new Error("Accounts are not switched on yet.");
  if (!data) throw new Error("There is nothing to save yet. Start your CV first.");

  const userId = await currentUserId();
  const { error } = await supabase.from(TABLE).upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  if (error) throw explain(error);
}

/** Replaces what is saved in this browser with the student's account copy. */
export async function loadFromCloud(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Accounts are not switched on yet.");

  const userId = await currentUserId();
  const { data, error } = await supabase.from(TABLE).select("data").eq("user_id", userId).maybeSingle();
  if (error) throw explain(error);
  if (!data) throw new Error("You have not saved a CV to your account yet.");
  applyBackup(data.data);
}
