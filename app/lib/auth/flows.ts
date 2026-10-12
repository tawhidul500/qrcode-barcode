import type {SupabaseClient} from '@supabase/supabase-js';

export type SocialProvider = 'google' | 'facebook' | 'apple';
export function safeNext(value: string | null): string {
 // Only known public destinations; callbacks cannot redirect to arbitrary URLs.
 return value && ['/account','/qr-code-generator','/barcode-generator','/scanner'].includes(value) ? value : '/account';
}
export function callbackURL(origin: string, recovery = false): string {
 return new URL(recovery ? '/auth/callback?next=/reset-password' : '/auth/callback', origin).href;
}
export function passwordError(password: string, confirmation: string): string | null {
 if (password.length < 12) return 'Use at least 12 characters for your password.';
 if (password.length > 128) return 'Use no more than 128 characters for your password.';
 if (password !== confirmation) return 'The passwords do not match.';
 return null;
}
export function authError(error: unknown): string {
 const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
 if (code === 'invalid_credentials') return 'The email or password is incorrect.';
 if (code === 'email_not_confirmed') return 'Please confirm your email address before signing in.';
 if (code === 'weak_password') return 'Choose a stronger password and try again.';
 if (code === 'same_password') return 'Choose a different password from your current one.';
 if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'Too many attempts. Please wait before trying again.';
 return 'We could not complete your request. Check your connection and try again.';
}
export async function submitCredentials(client: SupabaseClient, values: {email:string;password:string;name:string;signup:boolean}, origin:string) {
 const email=values.email.trim();
 if (!values.signup) return client.auth.signInWithPassword({email,password:values.password});
 return client.auth.signUp({email,password:values.password,options:{data:{full_name:values.name.trim()},emailRedirectTo:callbackURL(origin)}});
}
export async function startSocial(client: SupabaseClient, provider: SocialProvider, origin: string) {
 return client.auth.signInWithOAuth({provider, options:{redirectTo:callbackURL(origin)}});
}
export async function requestReset(client: SupabaseClient, email:string, origin:string) {
 return client.auth.resetPasswordForEmail(email.trim(),{redirectTo:callbackURL(origin,true)});
}
// Deduplicate Strict Mode mounts so a single-use authorization code is never exchanged twice.
const exchanges = new Map<string, ReturnType<SupabaseClient['auth']['exchangeCodeForSession']>>();
export function exchangeCallback(client: SupabaseClient, code: string) {
 let request=exchanges.get(code);
 if (!request) {request=client.auth.exchangeCodeForSession(code);exchanges.set(code,request);}
 return request;
}
