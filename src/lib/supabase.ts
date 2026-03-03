import { createClient, type Session, type User } from "@supabase/supabase-js";
import type { AuthProvider, AuthUser } from "../types/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const getProvider = (user: User): AuthProvider => {
  const provider = user.app_metadata?.provider;
  if (provider === "google") return "google";
  if (provider === "email") return "email";
  return "unknown";
};

export const toAuthUser = (user: User | null | undefined): AuthUser | null => {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    provider: getProvider(user),
  };
};

export const getSessionUser = (session: Session | null): AuthUser | null => {
  if (!session?.user) return null;
  return toAuthUser(session.user);
};
