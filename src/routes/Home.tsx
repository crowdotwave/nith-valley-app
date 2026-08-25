import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { CLINIC, openBooking, messageClinic } from '../lib/clinic';

type Tile = {
  label: string;
  detail: string;
  to?: string;
  onClick?: () => void;
  pending?: boolean;
};

// The seven goals, in the order a client is likely to want them.
// `pending` tiles are visible but inert — the shape of the app is real even
// where the feature isn't built yet.
const TILES: Tile[] = [
  {
    label: 'Book an appointment',
    detail: 'Opens our scheduling system',
    onClick: openBooking,
  },
  {
    label: 'Message us',
    detail: `Text ${CLINIC.phoneDisplay}`,
    onClick: messageClinic,
  },
  { label: 'Order food', detail: 'Request a refill', to: '/request/food' },
  {
    label: 'Request medication',
    detail: 'Refill or renewal',
    to: '/request/medication',
  },
  { label: 'My requests', detail: 'Track what you have sent', to: '/requests' },
  { label: 'My pets', detail: 'Diet, medications, records', to: '/pets' },
  { label: 'Reminders', detail: 'What is coming due', to: '/reminders' },
  { label: 'Send us a photo', detail: 'For our social media', pending: true },
];

function TileBody({ tile }: { tile: Tile }) {
  return (
    <>
      <span className="tile-label">{tile.label}</span>
      <span className="tile-detail">
        {tile.pending ? 'Coming soon' : tile.detail}
      </span>
    </>
  );
}

export default function Home() {
  const { profile } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  return (
    <main className="home">
      <header>
        <h1>{CLINIC.name}</h1>
        <p className="muted">{CLINIC.address}</p>
      </header>

      {isStaff && (
        <Link to="/staff" className="tile staff-tile">
          <span className="tile-label">Request queue</span>
          <span className="tile-detail">Staff view</span>
        </Link>
      )}

      <div className="tiles">
        {TILES.map((t) =>
          t.to ? (
            <Link key={t.label} to={t.to} className="tile">
              <TileBody tile={t} />
            </Link>
          ) : (
            <button
              key={t.label}
              className={t.pending ? 'tile pending' : 'tile'}
              onClick={t.onClick}
              disabled={t.pending}
            >
              <TileBody tile={t} />
            </button>
          ),
        )}
      </div>

      <footer>
        <button className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </footer>
    </main>
  );
}
