import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createDemoClient, demoRole } from './demo/client';

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

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Magic links come back with the token in the URL fragment.
      detectSessionInUrl: true,
    },
  });
}

// The demo client implements only the calls this app makes, so it is cast
// rather than typed as a full client. A new kind of query that works live but
// not in the demo shows up as a demo error, not a silent wrong answer.
export const supabase: SupabaseClient = demo
  ? (createDemoClient(demo) as unknown as SupabaseClient)
  : realClient();
