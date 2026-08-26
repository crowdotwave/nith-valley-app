import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { STATUS_LABEL, STATUS_STAMP, type ClientRequest } from '../lib/types';

export default function Requests() {
  const [rows, setRows] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('requests')
      .select('id, pet_id, type, status, details, client_note, staff_note, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setRows((data ?? []) as ClientRequest[]);
        setLoading(false);
      });
  }, []);

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>My requests</h1>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && rows.length === 0 && (
        <p className="muted">Nothing yet.</p>
      )}

      <ul className="list">
        {rows.map((r) => (
          <li key={r.id} className="row">
            <span className="row-title">
              {r.details?.item || (r.type === 'food' ? 'Food' : 'Medication')}
            </span>
            <span className="row-detail">
              Sent {new Date(r.created_at).toLocaleDateString()}
            </span>
            <span className={`badge ${STATUS_STAMP[r.status]}`}>{STATUS_LABEL[r.status]}</span>
            {r.staff_note && <span className="row-note">{r.staff_note}</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
