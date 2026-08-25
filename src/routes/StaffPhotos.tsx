import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';

type Pending = {
  id: string;
  storage_path: string;
  caption: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  consent_version: string | null;
  created_at: string;
  pets: { name: string } | null;
  households: { name: string } | null;
};

export default function StaffPhotos() {
  const { profile, loading: profileLoading } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const [rows, setRows] = useState<Pending[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    let q = supabase
      .from('photo_submissions')
      .select('id, storage_path, caption, status, consent_version, created_at, pets(name), households(name)')
      .order('created_at', { ascending: true });

    if (!showAll) q = q.eq('status', 'pending');

    const { data, error } = await q;
    if (error) setError(error.message);

    const list = (data ?? []) as unknown as Pending[];
    setRows(list);

    const signed: Record<string, string> = {};
    await Promise.all(
      list.map(async (r) => {
        const { data } = await supabase.storage
          .from('pet-photos')
          .createSignedUrl(r.storage_path, 3600);
        if (data?.signedUrl) signed[r.id] = data.signedUrl;
      }),
    );
    setUrls(signed);
    setLoading(false);
  }, [showAll]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: Pending['status']) {
    const { error } = await supabase
      .from('photo_submissions')
      .update({ status, reviewed_by: profile?.id, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) setError(error.message);
    else load();
  }

  if (profileLoading) return <div className="loading">Loading…</div>;

  if (!isStaff) {
    return (
      <main>
        <Link to="/" className="back">← Back</Link>
        <h1>Staff only</h1>
      </main>
    );
  }

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>Photo submissions</h1>

      <button className="ghost" onClick={() => setShowAll((s) => !s)}>
        {showAll ? 'Show pending only' : 'Show everything'}
      </button>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && rows.length === 0 && <p className="muted">Nothing waiting.</p>}

      <ul className="list">
        {rows.map((r) => (
          <li key={r.id} className="row">
            {urls[r.id] && (
              <img className="review-image" src={urls[r.id]} alt={r.caption ?? 'Submitted pet photo'} />
            )}
            <span className="row-title">{r.caption || 'No caption'}</span>
            <span className="row-detail">
              {r.pets?.name ?? 'Unknown pet'} · {r.households?.name ?? ''} ·{' '}
              {new Date(r.created_at).toLocaleDateString()}
            </span>
            {/* Which release wording they agreed to, in case it is ever asked. */}
            <span className="row-detail">Consent {r.consent_version}</span>

            <div className="actions">
              {r.status !== 'approved' && (
                <button onClick={() => setStatus(r.id, 'approved')}>Approve</button>
              )}
              {r.status === 'approved' && (
                <button onClick={() => setStatus(r.id, 'used')}>Mark posted</button>
              )}
              {r.status !== 'rejected' && (
                <button className="ghost" onClick={() => setStatus(r.id, 'rejected')}>
                  Reject
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
