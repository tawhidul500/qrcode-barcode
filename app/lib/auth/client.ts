import {createClient, type SupabaseClient} from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
export function authConfigured(): boolean {
 return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
export function getAuthClient(): SupabaseClient {
 if (!authConfigured()) throw new Error('Account access is temporarily unavailable. Please try again later.');
 if (!client) client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  auth: {flowType: 'pkce', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true},
 });
 return client;
}
