import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { HOURS } from './content';

export type Notice = {
  id: string;
  body: string;
  starts_on: string | null;
  ends_on: string | null;
  updated_at: string;
};

export type HoursLine = { position: number; days: string; hours: string };

/** What content.ts ships, in the shape the table returns. */
const FALLBACK: HoursLine[] = HOURS.map((h, i) => ({
  position: i + 1,
  days: h.days,
  hours: h.time,
}));

/** Live today: inside both bounds, either of which may be open-ended. */
export function isLive(n: Notice, today = new Date().toISOString().slice(0, 10)) {
  return (!n.starts_on || n.starts_on <= today) && (!n.ends_on || n.ends_on >= today);
}

/**
 * The handful of things the practice needs to change about itself, read from
 * the database rather than the bundle.
 *
 * The hours fall back to the compiled-in copy rather than rendering nothing.
 * A contact page that says "we could not load our hours" is worse than one
 * showing last week's, and these change a few times a year.
 */
export function useSiteContent() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [hours, setHours] = useState<HoursLine[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [n, h] = await Promise.all([
      supabase
        .from('notices')
        .select('id, body, starts_on, ends_on, updated_at')
        .order('created_at', { ascending: false }),
      supabase.from('clinic_hours').select('position, days, hours').order('position'),
    ]);

    setNotices((n.data ?? []) as Notice[]);
    if (h.data?.length) setHours(h.data as HoursLine[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { notices, live: notices.filter((n) => isLive(n)), hours, loading, reload: load };
}
