import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { EarnRule, LedgerRow, Reward } from './types';

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
  const [rules, setRules] = useState<EarnRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!householdId) return;
    setLoading(true);

    const [b, l, r, e] = await Promise.all([
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
    ]);

    const failure = b.error || l.error || r.error || e.error;
    if (failure) setError(failure.message);
    else setError(null);

    // No ledger rows yet means no view row, which is a zero balance rather
    // than a missing one. `maybeSingle` returns null data for both.
    setBalance(b.data?.balance ?? 0);
    setLedger((l.data ?? []) as unknown as LedgerRow[]);
    setRewards((r.data ?? []) as Reward[]);
    setRules((e.data ?? []) as EarnRule[]);
    setLoading(false);
  }, [householdId]);

  useEffect(() => {
    load();
  }, [load]);

  return { balance, ledger, rewards, rules, loading, error, reload: load };
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
