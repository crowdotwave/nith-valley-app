import { useState } from 'react';
import { Link } from 'react-router-dom';

export type View = 'client' | 'desk';

const COPY: Record<View, { stamp: string; swapTo: string; swapLabel: string; note: string }> = {
  client: {
    stamp: 'Client view',
    swapTo: '/desk',
    swapLabel: 'Switch to front desk',
    note: 'This is what a pet owner sees: their animals, what each one needs, and the requests they have sent.',
  },
  desk: {
    stamp: 'Front desk',
    swapTo: '/home',
    swapLabel: 'Switch to client view',
    note: 'This is what the clinic sees: every open request, worked here on the page.',
  },
};

/**
 * Which document you are reading, stamped on the masthead like a file copy.
 * The two views share a layout on purpose, so without this the only thing
 * telling them apart was one line of small grey text.
 */
export function ViewMark({ view, isStaff }: { view: View; isStaff: boolean }) {
  const copy = COPY[view];

  return (
    <span className="view-mark">
      {/* Not a `.badge`: naming the document is not naming a state, and while
          this shared the status stamps' outline it read as one of them. The
          desk's sheet takes the staff ink, filled; the client's stays quiet. */}
      <span className={view === 'desk' ? 'view-stamp view-stamp-desk' : 'view-stamp'}>
        {copy.stamp}
      </span>
      {isStaff && (
        <Link to={copy.swapTo} className="view-switch staff-only">
          {copy.swapLabel}
        </Link>
      )}
    </span>
  );
}

const SEEN_KEY = 'nv-intro-seen';

/** Shown once, on first arrival, then never again. */
export function FirstRunNote({ view, isStaff }: { view: View; isStaff: boolean }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === 'yes';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(SEEN_KEY, 'yes');
    } catch {
      // Private browsing can refuse storage; hiding it for this visit is enough.
    }
    setDismissed(true);
  }

  return (
    <div className="first-run">
      <p className="first-run-body">
        {COPY[view].note}
        {isStaff && ' The app has two views and you can see both. Use the link at the top to switch.'}
      </p>
      <button className="ghost" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
