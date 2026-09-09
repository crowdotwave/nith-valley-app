import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import {
  usePoints,
  awardPoints,
  reversePoints,
  confirmRedemption,
  cancelRedemption,
} from '../lib/usePoints';
import { useRequestQueue } from '../lib/useRequestQueue';
import { waited } from '../lib/dates';
import { summariseItems, type Pet } from '../lib/types';

type Household = { id: string; name: string };

/**
 * Awarding at the counter. The practice management system holds the invoice and
 * this app cannot read it, so a point is earned by a staff member tapping what
 * just happened rather than by keying a total. That is the whole reason the
 * scheme accrues per event: a per-dollar rule would need accurate manual entry
 * forever and could never be reconciled against a PIMS with no API.
 *
 * The page is built for someone standing at a desk with a client in front of
 * them, so it leads with who they are and what they already have, and the taps
 * are one deep.
 */
export default function StaffPoints() {
  const { profile, loading: profileLoading } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const [households, setHouseholds] = useState<Household[]>([]);
  const [chosen, setChosen] = useState<string>('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [pet, setPet] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);

  const { balance, ledger, rewards, rules, claims, loading, error, reload } = usePoints(
    chosen || null,
  );

  // Nobody walks back to the desk to close a request out after the client has
  // gone. The one moment it reliably happens is this one, with the client
  // standing here, so the orders waiting for them are on the same page as the
  // points they are collecting.
  const queue = useRequestQueue('open');
  const waitingHere = queue.rows.filter(
    (r) => r.status === 'ready' && r.household_id === chosen,
  );

  useEffect(() => {
    if (!isStaff) return;

    supabase
      .from('households')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        const list = (data ?? []) as Household[];
        setHouseholds(list);
        // One household is the common case early on, and making someone pick
        // from a list of one is a tap that teaches nothing.
        if (list.length === 1) setChosen(list[0].id);
      });
  }, [isStaff]);

  useEffect(() => {
    setPet('');
    if (!chosen) {
      setPets([]);
      return;
    }

    supabase
      .from('pets')
      .select('id, household_id, name, species, breed, photo_path')
      .eq('household_id', chosen)
      .is('archived_at', null)
      .order('name')
      .then(({ data }) => setPets((data ?? []) as Pet[]));
  }, [chosen]);

  async function award(ruleId: string) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule || !chosen) return;

    setBusy(true);
    setWriteError(null);
    const { error: failed } = await awardPoints(chosen, rule, profile?.id, pet || null);
    setBusy(false);

    if (failed) {
      setWriteError(failed.message);
      return;
    }

    setNote(`${rule.label}, ${rule.points} points`);
    reload();
  }

  async function undo(rowId: string) {
    const row = ledger.find((r) => r.id === rowId);
    if (!row || !chosen) return;

    setBusy(true);
    setWriteError(null);
    const { error: failed } = await reversePoints(row, chosen, profile?.id);
    setBusy(false);

    if (failed) setWriteError(failed.message);
    else {
      setNote(null);
      reload();
    }
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

  const points = balance ?? 0;
  const ready = rewards.filter((r) => points >= r.points_cost);

  return (
    <main className="desk">
      <Link to="/desk" className="back">← Back</Link>
      <h1>At the counter</h1>

      {households.length > 1 && (
        <>
          <label htmlFor="household">Client</label>
          <select id="household" value={chosen} onChange={(e) => setChosen(e.target.value)}>
            <option value="">Choose a client…</option>
            {households.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </>
      )}

      {chosen && !loading && (
        <>
          <p className="balance">
            <span className="balance-value">{points}</span>
            <span className="balance-name">
              points · {ready.length > 0
                ? `can claim ${ready[ready.length - 1].label.toLowerCase()}`
                : 'nothing claimable yet'}
            </span>
          </p>

          {/* The client is here. This is the only moment the shelf gets
              cleared honestly, so it comes before the points. */}
          {waitingHere.length > 0 && (
            <>
              <h2 className="field-label">Waiting to hand over</h2>
              <ul className="list">
                {waitingHere.map((r) => (
                  <li key={r.id} className="row entry">
                    <span className="row-title">{summariseItems(r.details, r.type)}</span>
                    <span className="row-detail">
                      {[r.pets?.name, `ready ${waited(r.updated_at)}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <button
                      className="act-go entry-undo"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        await queue.move(r.id, 'completed');
                        setBusy(false);
                      }}
                    >
                      Handed over
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {claims.length > 0 && (
            <>
              <h2 className="field-label">Claimed rewards</h2>
              <ul className="list">
                {claims.map((c) => (
                  <li key={c.id} className="row entry">
                    <span className="row-title">{c.rewards?.label ?? 'Reward'}</span>
                    <span className="row-detail">
                      Code {c.code} · {c.points_cost} points
                    </span>
                    <span className="entry-delta entry-less">-{c.points_cost}</span>
                    {/* Confirming is what spends the points: a trigger writes
                        the debit so it cannot be honoured without being paid
                        for. See migration 0012. */}
                    <span className="entry-pair">
                      <button
                        className="act-go"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          await confirmRedemption(c.id);
                          setBusy(false);
                          reload();
                        }}
                      >
                        Given
                      </button>
                      <button
                        className="ghost"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          await cancelRedemption(c.id);
                          setBusy(false);
                          reload();
                        }}
                      >
                        Cancel
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {pets.length > 0 && (
            <>
              <label htmlFor="pet">Which animal? (optional)</label>
              <select id="pet" value={pet} onChange={(e) => setPet(e.target.value)}>
                <option value="">Not tied to one</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </>
          )}

          <h2 className="field-label">What happened</h2>
          <div className="earn">
            {rules.map((rule) => (
              <button
                key={rule.id}
                className="earn-rule"
                disabled={busy}
                onClick={() => award(rule.id)}
              >
                <span className="earn-label">{rule.label}</span>
                <span className="earn-points">+{rule.points}</span>
              </button>
            ))}
          </div>

          {note && <p className="muted record-empty" aria-live="polite">Added: {note}</p>}
          {writeError && <p className="error">{writeError}</p>}
          {error && <p className="error">{error}</p>}

          <h2 className="field-label">Recent</h2>

          {ledger.length === 0 && <p className="muted record-empty">Nothing awarded yet.</p>}

          <ul className="list">
            {ledger.slice(0, 12).map((row) => (
              <li key={row.id} className="row entry">
                <span className="row-title">{row.reason}</span>
                <span className="row-detail">
                  {[row.pets?.name, new Date(row.created_at).toLocaleDateString()]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className={row.delta < 0 ? 'entry-delta entry-less' : 'entry-delta'}>
                  {row.delta > 0 ? `+${row.delta}` : row.delta}
                </span>
                {/* The ledger is append-only by privilege, so this writes the
                    opposite row rather than removing anything. Both lines stay
                    on the record, which is what makes a balance defensible. */}
                {row.delta > 0 && (
                  <button className="ghost entry-undo" disabled={busy} onClick={() => undo(row.id)}>
                    Undo
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
