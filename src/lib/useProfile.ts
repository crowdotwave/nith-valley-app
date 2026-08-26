import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Profile } from './types';

// The profile row is created by a database trigger when the auth user is
// created, so it always exists by the time anyone is signed in. Every insert
// needs household_id off it, so it is fetched once and shared.
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('profiles')
      .select('id, household_id, email, full_name, role, avatar_path')
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setProfile(data as Profile);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, error };
}
