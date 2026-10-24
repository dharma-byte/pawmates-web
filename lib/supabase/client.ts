import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Supabase client for Client Components. The browser client is a singleton,
// so calling this in many components reuses one connection and one session.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
