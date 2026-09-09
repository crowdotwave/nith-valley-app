import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { EarnRule, LedgerRow, Redemption, Reward } from './types';

/**
 * Everything both points surfaces need, loaded once so the client's page and
 * the desk's cannot disagree about a balance.
 *
 * The balance is read from `points_balances`, which sums the ledger and drops
 * expired rows. It is deliberately not computed here from `ledger`: that array
 * is capped for display, and a balance derived from a truncated list would be
 * quietly wrong. The database owns the arithmetic.
 */
export function usePoints(householdId: string | null | undefined) {
  const [balance, setBalance] = useState<number | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Redemption[]>([]);
  const [rules, setRules] = useState<EarnRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);

    const [b, l, r, e, c] = await Promise.all([
      supabase
        .from('points_balances')
        .select('balance')
        .eq('household_id', householdId)
        .maybeSingle(),
      supabase
        .from('points_ledger')
        .select('id, delta, reason, created_at, earn_rule_id, pets(name)')
        .eq('household_id', householdId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('rewards').select('*').eq('active', true).order('points_cost'),
      supabase.from('earn_rules').select('*').eq('active', true).order('points', { ascending: false }),
      supabase
        .from('redemptions')
        .select('id, reward_id, points_cost, code, status, created_at, rewards(label)')
        .eq('household_id', householdId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    const failure = b.error || l.error || r.error || e.error || c.error;
    if (failure) setError(failure.message);
    else setError(null);

    // No ledger rows yet means no view row, which is a zero balance rather
    // than a missing one. `maybeSingle` returns null data for both.
    setBalance(b.data?.balance ?? 0);
    setLedger((l.data ?? []) as unknown as LedgerRow[]);
    setRewards((r.data ?? []) as Reward[]);
    setRules((e.data ?? []) as EarnRule[]);
    setClaims((c.data ?? []) as unknown as Redemption[]);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    load();
  }, [load]);

  return { balance, ledger, rewards, rules, claims, loading, error, reload: load };
}

/**
 * Award points for something that happened at the counter. The reason is
 * copied from the rule rather than referenced, so a ledger line still reads
 * correctly years later after the rule has been renamed or retired.
 */
export async function awardPoints(
  householdId: string,
  rule: EarnRule,
  staffId: string | undefined,
  petId: string | null,
) {
  return supabase.from('points_ledger').insert({
    household_id: householdId,
    delta: rule.points,
    reason: rule.label,
    earn_rule_id: rule.id,
    pet_id: petId,
    staff_id: staffId,
  });
}

/**
 * Undo a mis-tap. The ledger is append-only by privilege, not by convention,
 * so this cannot delete the mistake and does not try: it writes the opposite
 * row. The pair stays visible, which is the point — a balance nobody can
 * explain is worse than one that shows its corrections.
 */
export async function reversePoints(row: LedgerRow, householdId: string, staffId: string | undefined) {
  return supabase.from('points_ledger').insert({
    household_id: householdId,
    delta: -row.delta,
    reason: `Correction: ${row.reason}`,
    staff_id: staffId,
  });
}

/**
 * Claim a reward. The code and the balance check both belong to the database:
 * a value that must be unique across every household should not be chosen by
 * the party that benefits from a collision, and a client with 100 points asking
 * for three nail trims should be stopped by something better than the person at
 * the desk noticing. See migration 0012.
 *
 * The points are not spent here. They are spent when staff confirm, which is
 * the moment the client actually gets the thing.
 */
export async function claimReward(householdId: string, reward: Reward) {
  return supabase.from('redemptions').insert({
    household_id: householdId,
    reward_id: reward.id,
    points_cost: reward.points_cost,
  });
}

/** Honour a claim at the desk. A trigger writes the debit; see migration 0012. */
export async function confirmRedemption(id: string) {
  return supabase.from('redemptions').update({ status: 'confirmed' }).eq('id', id);
}

/** Put a claim back before it was honoured. Nothing was spent, so nothing returns. */
export async function cancelRedemption(id: string) {
  return supabase.from('redemptions').update({ status: 'cancelled' }).eq('id', id);
}
