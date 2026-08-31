import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { RequestStatus } from './types';

export type QueueRow = {
  id: string;
  type: 'food' | 'medication' | 'other';
  status: RequestStatus;
  details: { item?: string; quantity?: string };
  client_note: string | null;
  staff_note: string | null;
  created_at: string;
  pets: { name: string } | null;
  households: { name: string } | null;
};

// What a staff member can move a request to from where it is now. Kept
// deliberately linear: declining is always available, everything else moves
// one step forward, so nobody has to remember the state machine.
export const NEXT: Record<RequestStatus, RequestStatus[]> = {
  submitted: ['in_review', 'declined'],
  in_review: ['approved', 'declined'],
  approved: ['ready', 'declined'],
  ready: ['completed'],
  completed: [],
  declined: [],
};

export const OPEN: RequestStatus[] = ['submitted', 'in_review', 'approved', 'ready'];

// Shared by the console, which works the queue in place, and the full queue
// screen, which can also show closed requests. One loader so the two surfaces
// cannot drift apart on what a request is or how it moves.
export function useRequestQueue(scope: 'open' | 'all') {
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let query = supabase
      .from('requests')
      .select(
        'id, type, status, details, client_note, staff_note, created_at, pets(name), households(name)',
      )
      .order('created_at', { ascending: true });

    if (scope === 'open') query = query.in('status', OPEN);

    const { data, error: readError } = await query;
    if (readError) setError(readError.message);
    else {
      setError(null);
      setRows((data ?? []) as unknown as QueueRow[]);
    }
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const move = useCallback(
    async (id: string, status: RequestStatus) => {
      setError(null);
      // The status-change audit row is written by a database trigger.
      const { error: writeError } = await supabase.from('requests').update({ status }).eq('id', id);
      if (writeError) setError(writeError.message);
      else load();
    },
    [load],
  );

  const saveNote = useCallback(async (id: string, staff_note: string) => {
    const { error: writeError } = await supabase
      .from('requests')
      .update({ staff_note })
      .eq('id', id);
    if (writeError) setError(writeError.message);
  }, []);

  const counts = {
    waiting: rows.filter((r) => r.status === 'submitted').length,
    inReview: rows.filter((r) => r.status === 'in_review').length,
    ready: rows.filter((r) => r.status === 'approved' || r.status === 'ready').length,
  };

  return { rows, loading, error, counts, move, saveNote, reload: load };
}
