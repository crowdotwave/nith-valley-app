/** Days from today until `iso`. Negative means it has already passed. */
export function daysUntil(iso: string): number {
  const then = new Date(iso + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((then.getTime() - now.getTime()) / 86_400_000);
}

/** Plain-language countdown for a depletion or due date. */
export function relativeDue(iso: string | null): string | null {
  if (!iso) return null;

  const days = daysUntil(iso);
  if (days < 0) return `overdue by ${Math.abs(days)} days`;
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  if (days < 14) return `due in ${days} days`;
  if (days < 60) return `due in ${Math.round(days / 7)} weeks`;
  return `due ${new Date(iso + 'T00:00:00').toLocaleDateString()}`;
}

/** Depletion dates only matter when they are close. */
export function isSoon(iso: string | null, within = 21): boolean {
  return iso !== null && daysUntil(iso) <= within;
}
