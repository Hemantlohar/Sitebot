import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder-project.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-publishable-key";

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set() { },
        remove() { },
      },
    }
  );
}