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
      },
      {
        label: 'Contact us',
        detail: 'Call, text, email or find us',
        icon: 'message',
        to: '/contact',
      },
      { label: 'What we do', detail: 'Our services', icon: 'list', to: '/services' },
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

function TileBody({ tile }: { tile: Tile }) {
  return (
    <>
      <Icon name={tile.icon} />
      <span>
        <span className="tile-label">{tile.label}</span>
        <br />
        <span className="tile-detail">{tile.detail}</span>
      </span>
    </>
  );
}

export default function Home() {
  const { profile } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';
  const [due, setDue] = useState(0);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const today = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .is('completed_at', null)
      .lte('due_on', iso(horizon))
      .or(`snoozed_until.is.null,snoozed_until.lte.${iso(today)}`)
      .then(({ count }) => setDue(count ?? 0));

    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .in('status', ['submitted', 'in_review', 'approved', 'ready'])
      .then(({ count }) => setOpen(count ?? 0));
  }, []);

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  return (
    <main className="home">
      <header>
        <Logo className="logo" />
        <p className="muted">{CLINIC.address}</p>
      </header>

      {isStaff && (
        <div className="tiles staff-tile">
          <Link to="/staff" className="tile">
            <Icon name="list" />
            <span>
              <span className="tile-label">Request queue</span>
              <br />
              <span className="tile-detail">Staff view</span>
            </span>
          </Link>
          <Link to="/staff/photos" className="tile">
            <Icon name="camera" />
            <span>
              <span className="tile-label">Photo submissions</span>
              <br />
              <span className="tile-detail">Staff view</span>
            </span>
          </Link>
        </div>
      )}

      {/* Only shown when there is genuinely something to act on — a card that
          is always there stops being read. */}
      {due > 0 && (
        <Link to="/reminders" className="summary">
          <span className="summary-title">
            {due} {plural(due, 'thing', 'things')} coming due
          </span>
          <span className="summary-detail">
            {open > 0
              ? `You also have ${open} open ${plural(open, 'request', 'requests')}`
              : 'Tap to see what needs ordering'}
          </span>
        </Link>
      )}

      {GROUPS.map((g) => (
        <div key={g.heading}>
          <p className="section-label">{g.heading}</p>
          <div className="tiles">
            {g.tiles.map((t) =>
              t.to ? (
                <Link key={t.label} to={t.to} className="tile">
                  <TileBody tile={t} />
                </Link>
              ) : (
                <button key={t.label} className="tile" onClick={t.onClick}>
                  <TileBody tile={t} />
                </button>
              ),
            )}
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
