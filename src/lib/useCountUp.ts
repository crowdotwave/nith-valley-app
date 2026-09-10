import { useEffect, useRef, useState } from 'react';

const wantsStill = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Counts a figure up to its value, from wherever it was before.
 *
 * Only the points balance uses this. A number that ticks upward reads as
 * something you have collected rather than something you have been assigned,
 * which is the whole difference between a loyalty balance and an invoice
 * total. Anywhere else in the app a moving figure would just be a number
 * refusing to sit still.
 *
 * Eases out, so it arrives rather than stopping. Under prefers-reduced-motion
 * it does not animate at all: it is decoration, and decoration is the first
 * thing to give up when someone has asked for stillness.
 */
export function useCountUp(target: number, ms = 900) {
  const [shown, setShown] = useState(() => (wantsStill() ? target : 0));
  const from = useRef(wantsStill() ? target : 0);

  useEffect(() => {
    if (wantsStill()) {
      from.current = target;
      setShown(target);
      return;
    }

    const start = performance.now();
    const begin = from.current;
    const distance = target - begin;

    if (distance === 0) return;

    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // Exponential ease-out: quick off the mark, settles rather than stops.
      const eased = 1 - Math.pow(2, -10 * t);
      const value = Math.round(begin + distance * (t === 1 ? 1 : eased));

      setShown(value);

      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);

  return shown;
}
