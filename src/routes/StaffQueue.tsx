import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { STATUS_LABEL, type RequestStatus } from '../lib/types';

type QueueRow = {
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
// deliberately linear — declining is always available, everything else moves
// one step forward, so nobody has to remember the state machine.
const NEXT: Record<RequestStatus, RequestStatus[]> = {
  submitted: ['in_review', 'declined'],
  in_review: ['approved', 'declined'],
  approved: ['ready', 'declined'],
  ready: ['completed'],
  completed: [],
  declined: [],
};

const OPEN: RequestStatus[] = ['submitted', 'in_review', 'approved', 'ready'];

export default function StaffQueue() {
  const { profile, loading: profileLoading } = useProfile();
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    let query = supabase
      .from('requests')
      .select(
        'id, type, status, details, client_note, staff_note, created_at, pets(name), households(name)',
      )
      .order('created_at', { ascending: true });

    if (!showDone) query = query.in('status', OPEN);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setRows((data ?? []) as unknown as QueueRow[]);
    setLoading(false);
  }, [showDone]);

  useEffect(() => {
    load();
  }, [load]);

  async function move(id: string, status: RequestStatus) {
    setError(null);
    // The status-change audit row is written by a database trigger.
    const { error } = await supabase.from('requests').update({ status }).eq('id', id);
    if (error) setError(error.message);
    else load();
  }

  async function saveNote(id: string, staff_note: string) {
    const { error } = await supabase.from('requests').update({ staff_note }).eq('id', id);
    if (error) setError(error.message);
  }

  if (profileLoading) return <div className="loading">Loading…</div>;

  if (profile?.role !== 'staff' && profile?.role !== 'admin') {
    return (
      <main>
        <Link to="/" className="back">← Back</Link>
        <h1>Staff only</h1>
        <p className="muted">This account doesn't have staff access.</p>
      </main>
    );
  }

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>Request queue</h1>

      <button className="ghost" onClick={() => setShowDone((s) => !s)}>
        {showDone ? 'Show open only' : 'Show everything'}
      </button>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && rows.length === 0 && <p className="muted">Queue is empty.</p>}

      <ul className="list">
        {rows.map((r) => (
          <li key={r.id} className="row">
            <span className="row-title">
              {r.details?.item || r.type}
              {r.details?.quantity ? ` — ${r.details.quantity}` : ''}
            </span>
            <span className="row-detail">
              {r.pets?.name ?? 'No pet'} · {r.households?.name ?? ''} ·{' '}
              {r.type === 'medication' ? 'Medication' : 'Food'} ·{' '}
              {new Date(r.created_at).toLocaleDateString()}
            </span>

            <span className="badge">{STATUS_LABEL[r.status]}</span>

            {r.client_note && <span className="row-note">“{r.client_note}”</span>}

            <input
              defaultValue={r.staff_note ?? ''}
              placeholder="Note back to the client…"
              onBlur={(e) => saveNote(r.id, e.target.value)}
            />

            <div className="actions">
              {NEXT[r.status].map((next) => (
                <button key={next} onClick={() => move(r.id, next)}>
                  {STATUS_LABEL[next]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
