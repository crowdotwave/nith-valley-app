import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { useSiteContent, isLive, type HoursLine } from '../lib/useSiteContent';

/**
 * The practice editing its own words.
 *
 * The clinic cannot currently change anything on its website: the person who
 * built it holds the keys, so a holiday closure needs an email and a wait. That
 * is how the site came to advertise an address the practice had moved out of.
 * This is the small set of things that genuinely change, put where the front
 * desk can reach them without asking anyone.
 */
export default function StaffContent() {
  const { profile, loading: profileLoading } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const { notices, hours, reload } = useSiteContent();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [draft, setDraft] = useState<HoursLine[]>([]);

  // Edits are held locally until saved, so a half-typed line is never live.
  const lines = draft.length ? draft : hours;

  async function post(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body = String(form.get('body') || '').trim();
    if (!body) return;

    setBusy(true);
    setError(null);

    const { error: failed } = await supabase.from('notices').insert({
      body,
      starts_on: String(form.get('starts') || '') || null,
      ends_on: String(form.get('ends') || '') || null,
      updated_by: profile?.id,
    });

    setBusy(false);
    if (failed) setError(failed.message);
    else {
      (e.target as HTMLFormElement).reset();
      setSaved('Notice posted');
      reload();
    }
  }

  async function remove(id: string) {
    setBusy(true);
    const { error: failed } = await supabase.from('notices').delete().eq('id', id);
    setBusy(false);
    if (failed) setError(failed.message);
    else reload();
  }

  async function saveHours() {
    setBusy(true);
    setError(null);

    // Small enough to write in one pass, and a partial save would leave the
    // page contradicting itself.
    const { error: failed } = await supabase.from('clinic_hours').upsert(
      lines.map((l) => ({
        position: l.position,
        days: l.days,
        hours: l.hours,
        updated_by: profile?.id,
        updated_at: new Date().toISOString(),
      })),
    );

    setBusy(false);
    if (failed) setError(failed.message);
    else {
      setDraft([]);
      setSaved('Hours saved');
      reload();
    }
  }

  function editLine(position: number, patch: Partial<HoursLine>) {
    setDraft(lines.map((l) => (l.position === position ? { ...l, ...patch } : l)));
  }

  if (profileLoading) return <div className="loading">Loading…</div>;

  if (!isStaff) {
    return (
      <main>
        <Link to="/" className="back">← Back</Link>
        <h1>Staff only</h1>
        <p className="muted">This account doesn't have staff access.</p>
      </main>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="desk">
      <Link to="/desk" className="back">← Back</Link>
      <h1>What clients see</h1>
      <p className="muted">
        Changes here reach every client's phone straight away. Nobody else has to be asked.
      </p>

      <h2 className="field-label">Post a notice</h2>

      <form onSubmit={post} className="stack">
        <label htmlFor="body">What do you want to tell people?</label>
        <textarea
          id="body"
          name="body"
          rows={3}
          required
          placeholder="Closed Monday 13 October for Thanksgiving."
        />

        {/* A notice with an end date takes itself down. The real failure is not
            forgetting to post one, it is finding it still up in February. */}
        <label htmlFor="starts">Show from (optional)</label>
        <input id="starts" name="starts" type="date" />

        <label htmlFor="ends">Stop showing after (optional)</label>
        <input id="ends" name="ends" type="date" />

        <button type="submit" disabled={busy}>
          {busy ? 'Posting…' : 'Post notice'}
        </button>
      </form>

      {notices.length > 0 && (
        <>
          <h2 className="field-label">Posted</h2>
          <ul className="list">
            {notices.map((n) => (
              <li key={n.id} className="row entry">
                <span className="row-title">{n.body}</span>
                <span className="row-detail">
                  {isLive(n, today)
                    ? n.ends_on
                      ? `Showing now, until ${n.ends_on}`
                      : 'Showing now'
                    : n.starts_on && n.starts_on > today
                      ? `Starts ${n.starts_on}`
                      : 'Finished'}
                </span>
                <span className={isLive(n, today) ? 'badge stamp-ready' : 'badge stamp-done'}>
                  {isLive(n, today) ? 'Live' : 'Not showing'}
                </span>
                <button
                  className="ghost entry-undo"
                  disabled={busy}
                  onClick={() => remove(n.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="field-label">Opening hours</h2>
      <p className="muted">
        Write them however they should read. “By request” and “Closed” are fine.
      </p>

      <ul className="picks">
        {lines.map((l) => (
          <li key={l.position} className="pick-extra">
            <input
              value={l.days}
              aria-label={`Days, line ${l.position}`}
              onChange={(e) => editLine(l.position, { days: e.target.value })}
            />
            <input
              value={l.hours}
              aria-label={`Hours, line ${l.position}`}
              onChange={(e) => editLine(l.position, { hours: e.target.value })}
            />
          </li>
        ))}
      </ul>

      <button onClick={saveHours} disabled={busy || draft.length === 0}>
        {busy ? 'Saving…' : draft.length ? 'Save hours' : 'Hours saved'}
      </button>

      {saved && !error && <p className="muted record-empty" aria-live="polite">{saved}</p>}
      {error && <p className="error">{error}</p>}
    </main>
  );
}
