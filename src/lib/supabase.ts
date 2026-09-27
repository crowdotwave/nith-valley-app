import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { App } from '@capacitor/app';
import { createDemoClient, demoRole } from './demo/client';
import { AUTH_CALLBACK, isNative, nativeAuthStorage } from './native';

/**
 * Set when the app was opened with `?demo=client` or `?demo=staff`. In demo
 * mode the app runs against an invented practice held in memory (src/lib/demo)
 * and never contacts Supabase. See the demo section of README.md.
 */
export const demo = demoRole();

function realClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env and fill it in.',
    );
  }

  if (isNative) return nativeClient(url, key);

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Magic links come back with the token in the URL fragment.
      detectSessionInUrl: true,
    },
  });
}

/**
 * The store build. A magic link cannot land on the page that asked for it,
 * because that page is inside the app, so it returns on the app's own scheme
 * (AUTH_CALLBACK) and is handed over here.
 *
 * PKCE rather than the web's token-in-the-fragment: any app can claim a custom
 * scheme, and with PKCE what arrives on it is a one-time code that only this
 * install, holding the verifier, can exchange. The web cannot use PKCE the same
 * way, because a link opened in the mail app's own browser has no verifier.
 */
function nativeClient(url: string, key: string): SupabaseClient {
  const client = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      storage: nativeAuthStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  // A link can arrive twice when it also launched the app: once as the launch
  // URL and once as an open event. A code can only be exchanged once.
  const seen = new Set<string>();

  async function receive(link: string | undefined) {
    if (!link?.startsWith(AUTH_CALLBACK)) return;
    const code = new URL(link).searchParams.get('code');
    if (!code || seen.has(code)) return;
    seen.add(code);
    // On success onAuthStateChange in App.tsx signs the client in. An expired
    // or reused link leaves them on the sign-in screen, as it does on the web.
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) console.warn('Sign-in link not accepted:', error.message);
  }

  void App.addListener('appUrlOpen', ({ url: link }) => receive(link));
  void App.getLaunchUrl().then((launch) => receive(launch?.url));

  return client;
}

// The demo client implements only the calls this app makes, so it is cast
// rather than typed as a full client. A new kind of query that works live but
// not in the demo shows up as a demo error, not a silent wrong answer.
export const supabase: SupabaseClient = demo
  ? (createDemoClient(demo) as unknown as SupabaseClient)
  : realClient();
