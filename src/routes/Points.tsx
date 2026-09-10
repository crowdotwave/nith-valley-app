import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '../lib/useProfile';
import { usePoints, claimReward } from '../lib/usePoints';
import { useCountUp } from '../lib/useCountUp';
import type { Reward } from '../lib/types';

/**
 * What the client's points are worth, in the order they care about: whether
 * anything is claimable right now, how far the next thing is, and only then how
 * the total was arrived at.
 *
 * The balance is never presented as a number on its own. A loyalty scheme that
 * says "135" and nothing else is asking the reader to do the clinic's
 * arithmetic; every figure here is stated against what it buys.
 */
export default function Points() {
  const { profile } = useProfile();
  const { balance, ledger, rewards, claims, loading, error, reload } = usePoints(
    profile?.household_id,
  );
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  async function claim(reward: Reward) {
    if (!profile?.household_id) return;
    setClaiming(reward.id);
    setClaimError(null);

    const { error: failed } = await claimReward(profile.household_id, reward);
    setClaiming(null);

    // The balance is checked by the database, not here, so a refusal is a real
    // answer rather than a bug: it is what a second device claiming the same
    // points a moment earlier looks like.
    if (failed) setClaimError(failed.message);
    else reload();
  }

  const points = balance ?? 0;
  const counted = useCountUp(points);
  const claimedIds = new Set(claims.map((c) => c.reward_id));
  const ready = rewards.filter((r) => points >= r.points_cost && !claimedIds.has(r.id));
  const coming = rewards.filter((r) => points < r.points_cost);
  const next = coming[0];

  return (
    <main>
      <Link to="/home" className="back">← Back</Link>
      <h1>Points</h1>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {/* The screen's one band, carrying the only line that is news. */}
          <div className="summary-slot">
            {claims.length > 0 ? (
              <p className="summary">
                <span className="summary-title">
                  {claims.length === 1 ? 'Claimed and waiting' : `${claims.length} claimed and waiting`}
                </span>
                <span className="summary-detail">Show your code at the front desk</span>
              </p>
            ) : ready.length > 0 ? (
              <p className="summary">
                <span className="summary-title">
                  {ready.length === 1
                    ? 'You can claim this now'
                    : `You can claim ${ready.length} of these now`}
                </span>
                <span className="summary-detail">
                  {ready[ready.length - 1].label} · ask at the front desk
                </span>
              </p>
            ) : next ? (
              <p className="summary-clear">
                {next.points_cost - points} points from {next.label.toLowerCase()}.
              </p>
            ) : (
              <p className="summary-clear">Points collect on visits, food and prescriptions.</p>
            )}
          </div>

          {/* A claim comes off the document as a stub you carry to the desk,
              which is what a coupon has always been. The code is the whole
              point of it, so it is set at the size a code gets read aloud
              across a counter rather than the size of the words around it. */}
          {claims.length > 0 && (
            <ul className="coupons">
              {claims.map((c) => (
                <li key={c.id} className="coupon">
                  <span className="coupon-label">{c.rewards?.label ?? 'Reward'}</span>
                  <span className="coupon-code">{c.code}</span>
                  <span className="coupon-note">
                    Show this at the front desk · {c.points_cost} points
                  </span>
                </li>
              ))}
            </ul>
          )}

          {claimError && <p className="error">{claimError}</p>}

          {/* No fill, no box, no accent: a figure and its label over a rule,
              the same posture as the queue's counts on the desk. */}
          <p className="balance">
            <span className="balance-value">{counted}</span>
            <span className="balance-name">points collected</span>
          </p>

          {ready.length > 0 && (
            <>
              <h2 className="field-label">Ready to claim</h2>
              <ul className="rewards">
                {ready.map((r) => (
                  <li key={r.id} className="reward reward-ready">
                    <span className="reward-label">{r.label}</span>
                    <span className="reward-cost">{r.points_cost} points</span>
                    <button
                      className="reward-claim"
                      disabled={claiming !== null}
                      onClick={() => claim(r)}
                    >
                      {claiming === r.id ? 'Claiming…' : 'Claim this'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {coming.length > 0 && (
            <>
              <h2 className="field-label">Coming up</h2>
              <ul className="rewards">
                {coming.map((r) => (
                  <li key={r.id} className="reward">
                    <span className="reward-label">{r.label}</span>
                    <span className="reward-cost">{r.points_cost} points</span>
                    <span className="reward-note">{r.points_cost - points} points to go</span>
                    {/* Decorative: the sentence above already states the gap,
                        so nothing is carried by the bar alone. */}
                    <span className="meter" aria-hidden="true">
                      <span
                        className="meter-ink"
                        style={{ width: `${Math.round((points / r.points_cost) * 100)}%` }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="field-label">How you collected them</h2>

          {ledger.length === 0 && (
            <p className="muted record-empty">
              Nothing yet. Points are added at the desk when you pick up food, collect a
              prescription, or bring an animal in.
            </p>
          )}

          <ul className="list">
            {ledger.map((row) => (
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
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
