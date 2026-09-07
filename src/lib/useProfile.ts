import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Profile } from './types';

// The profile row is created by a database trigger when the auth user is
// created, so it always exists by the time anyone is signed in. Every insert
// needs household_id off it, so it is fetched once and shared.
//
// It has to name whose profile it wants. The read policy is "yourself, or your
// household, or any if you are staff", so this asked for one row and got as
// many as the reader could see: fine while the practice had a single account,
// and a 406 from `.single()` the moment a colleague signed in, which left every
// screen holding a null profile. Filtering by the session's own user id is what
// "my profile" always meant.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // From local storage rather than the network: the session is already
      // here, and this runs on every screen.
      const { data: auth } = await supabase.auth.getSession();
      const id = auth.session?.user.id;

      if (!id) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data, error: failed } = await supabase
        .from('profiles')
        .select('id, household_id, email, full_name, role, avatar_path')
        .eq('id', id)
        .single();

      if (cancelled) return;
      if (failed) setError(failed.message);
      else setProfile(data as Profile);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
