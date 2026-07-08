import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !anonKey) throw new Error("The live TravelOS connection is not configured yet.");
  if (!client) client = createClient(supabaseUrl, anonKey);
  return client;
}
