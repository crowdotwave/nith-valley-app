import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { CLINIC, openBooking } from '../lib/clinic';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

type Tile = {
  label: string;
  detail: string;
  icon: string;
  to?: string;
  onClick?: () => void;
  // Hands off to a third-party site rather than navigating in-app.
  external?: boolean;
  // The one action the page leads with.
  primary?: boolean;
};

const GROUPS: { heading: string; tiles: Tile[] }[] = [
  {
    heading: 'Get care',
    tiles: [
      {
        label: 'Book an appointment',
        detail: 'Opens our scheduling system',
        icon: 'calendar',
        onClick: openBooking,
        external: true,
        primary: true,
      },
      {
        label: 'Contact us',
        detail: 'Call, text, email or find us',
        icon: 'message',
        to: '/contact',
      },
      { label: 'What we do', detail: 'Our services', icon: 'care', to: '/services' },
    ],
  },
  {
    heading: 'Food & medication',
    tiles: [
      { label: 'Order food', detail: 'Request a refill', icon: 'food', to: '/request/food' },
      {
        label: 'Request medication',
        detail: 'Refill or renewal',
        icon: 'pill',
        to: '/request/medication',
      },
      { label: 'My requests', detail: 'Track what you have sent', icon: 'list', to: '/requests' },
    ],
  },
  {
    heading: 'Your pets',
    tiles: [
      { label: 'My pets', detail: 'Diet, medications, records', icon: 'paw', to: '/pets' },
      { label: 'Reminders', detail: 'What is coming due', icon: 'bell', to: '/reminders' },
      { label: 'Send us a photo', detail: 'For our social media', icon: 'camera', to: '/photos' },
    ],
  },
];

const STAFF_TILES: Tile[] = [
  { label: 'Request queue', detail: 'Staff view', icon: 'list', to: '/staff' },
  { label: 'Photo submissions', detail: 'Staff view', icon: 'camera', to: '/staff/photos' },
];

// Loading and failure are distinct from "nothing due". Collapsing them into a
// single count meant a dropped request rendered as a confident all-clear.
type Load =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; due: number; open: number };

function TileBody({ tile }: { tile: Tile }) {
  return (
    <>
      <Icon name={tile.icon} />
      <span className="tile-text">
        <span className="tile-label">{tile.label}</span>
        <span className="tile-detail">{tile.detail}</span>
      </span>
      {tile.external && <Icon name="external" className="tile-external-mark" />}
    </>
  );
}

function TileLink({ tile }: { tile: Tile }) {
  const className = ['tile', tile.primary && 'tile-primary', tile.external && 'tile-external']
    .filter(Boolean)
    .join(' ');

  if (tile.to) {
    return (
      <Link to={tile.to} className={className}>
        <TileBody tile={tile} />
      </Link>
    );
  }

  return (
    <button className={className} onClick={tile.onClick}>
      <TileBody tile={tile} />
    </button>
  );
}

export default function Home() {
  const { profile } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoad({ state: 'loading' });

    const today = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    Promise.all([
      supabase
        .from('reminders')
        .select('id', { count: 'exact', head: true })
        .is('completed_at', null)
        .lte('due_on', iso(horizon))
        .or(`snoozed_until.is.null,snoozed_until.lte.${iso(today)}`),
      supabase
        .from('requests')
        .select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'in_review', 'approved', 'ready']),
    ])
      .then(([reminders, requests]) => {
        if (cancelled) return;

        // Never let a failed count fall through to 0. Here "nothing due" is a
        // claim about someone's medication, not an absence of data.
        if (reminders.error || requests.error) {
          setLoad({ state: 'error' });
          return;
        }

        setLoad({ state: 'ready', due: reminders.count ?? 0, open: requests.count ?? 0 });
      })
      .catch(() => {
        if (!cancelled) setLoad({ state: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  return (
    <main className="home">
      <header>
        <Logo className="logo" />
        <p className="muted">{CLINIC.address}</p>
      </header>

      {isStaff && (
        <div>
          <p className="section-label">Staff</p>
          <div className="tiles staff-tile">
            {STAFF_TILES.map((t) => (
              <TileLink key={t.label} tile={t} />
            ))}
          </div>
        </div>
      )}

      {/* The slot holds its height in every state, so the tiles below never move
          once the counts land. A target that slides down a slow-loading page is
          a mis-tap. Still only shows a card when there is something to act on —
          a card that is always there stops being read. */}
      <div className="summary-slot" aria-live="polite">
        {load.state === 'loading' && <div className="summary summary-skeleton" aria-hidden="true" />}

        {load.state === 'error' && (
          <button className="summary summary-error" onClick={() => setAttempt((n) => n + 1)}>
            <span className="summary-title">Couldn&rsquo;t check what&rsquo;s due</span>
            <span className="summary-detail">Tap to try again</span>
          </button>
        )}

        {load.state === 'ready' && load.due > 0 && (
          <Link to="/reminders" className="summary">
            <span className="summary-title">
              {load.due} {plural(load.due, 'thing', 'things')} coming due
            </span>
            <span className="summary-detail">
              {load.open > 0
                ? `You also have ${load.open} open ${plural(load.open, 'request', 'requests')}`
                : 'Tap to see what needs ordering'}
            </span>
          </Link>
        )}

        {/* The calm state. Quiet enough that the accent card still lands when
            something is actually due, present enough that the slot reads as
            breathing room rather than a hole — and it confirms the check ran,
            which an empty gap never did. */}
        {load.state === 'ready' &&
          load.due === 0 &&
          (load.open > 0 ? (
            <Link to="/requests" className="summary-clear">
              Nothing due. {load.open} open {plural(load.open, 'request', 'requests')} to track.
            </Link>
          ) : (
            <p className="summary-clear">Nothing due right now.</p>
          ))}
      </div>

      {GROUPS.map((g) => (
        <div key={g.heading}>
          <p className="section-label">{g.heading}</p>
          <div className="tiles">
            {g.tiles.map((t) => (
              <TileLink key={t.label} tile={t} />
            ))}
          </div>
        </div>
      ))}

      <footer>
        <button className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </footer>
    </main>
  );
}
