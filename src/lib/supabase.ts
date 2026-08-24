import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const hasCredentials = !!(supabaseUrl && supabasePublishableKey);

if (!hasCredentials) {
  console.warn('Supabase credentials not configured. Google login and server features will be disabled.');
}

// Safe fallback: avoid crashing when env vars are missing during mockup/dev.
const noopClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: () => Promise.resolve({ data: {}, error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null }),
  },
} as unknown as SupabaseClient;

export const supabase = hasCredentials
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : noopClient;

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!hasCredentials) return null;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
    avatarUrl: session.user.user_metadata?.avatar_url,
  };
}

export async function signInWithGoogle(redirectTo?: string) {
  if (!hasCredentials) return { data: {}, error: new Error('Supabase not configured') };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined),
    },
  });
  return { data, error };
}

export async function signOut() {
  if (!hasCredentials) return { error: null };
  return supabase.auth.signOut();
}
