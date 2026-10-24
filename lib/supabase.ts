import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) {
    return clientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
    );
  }

  clientInstance = createClient(supabaseUrl, publishableKey);
  return clientInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
