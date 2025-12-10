import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { auth } from "./firebase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars missing. Supabase features will be disabled.");
}

export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  const sessionToken = await auth.currentUser?.getIdToken?.();
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (url, options = {}) => {
        const headers = new Headers(options.headers);
        if (sessionToken) {
          headers.set("Authorization", `Bearer ${sessionToken}`);
        }
        return fetch(url, { ...options, headers });
      }
    }
  });
  return client;
};
