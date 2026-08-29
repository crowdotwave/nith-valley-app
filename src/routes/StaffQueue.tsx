import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../lib/useProfile';
import { useRequestQueue } from '../lib/useRequestQueue';
import QueueList from '../components/QueueList';

// The complete record, including closed requests. The console at /desk works
// the open queue in place; this is where you come to look something up.
export default function StaffQueue() {
  const { profile, loading: profileLoading } = useProfile();
  const [showDone, setShowDone] = useState(false);
  const { rows, loading, error, move, saveNote } = useRequestQueue(showDone ? 'all' : 'open');

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
    <main className="desk">
      <Link to="/" className="back">← Back</Link>
      <h1>Request record</h1>

      <button className="ghost" onClick={() => setShowDone((s) => !s)}>
        {showDone ? 'Show open only' : 'Show everything'}
      </button>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && rows.length === 0 && <p className="muted">Nothing to show.</p>}

      <QueueList rows={rows} onMove={move} onNote={saveNote} />
    </main>
  );
}
