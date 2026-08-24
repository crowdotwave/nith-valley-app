import { supabase } from '../lib/supabase';
import { CLINIC, openBooking, messageClinic } from '../lib/clinic';

type Tile = {
  label: string;
  detail: string;
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
  { label: 'Order food', detail: 'Request a refill', pending: true },
  { label: 'Request medication', detail: 'Refill or renewal', pending: true },
  { label: 'Reminders', detail: 'What is coming due', pending: true },
  { label: 'Send us a photo', detail: 'For our social media', pending: true },
  { label: 'My pets', detail: 'Diet, medications, records', pending: true },
];

export default function Home() {
  return (
    <main className="home">
      <header>
        <h1>{CLINIC.name}</h1>
        <p className="muted">{CLINIC.address}</p>
      </header>

      <div className="tiles">
        {TILES.map((t) => (
          <button
            key={t.label}
            className={t.pending ? 'tile pending' : 'tile'}
            onClick={t.onClick}
            disabled={t.pending}
          >
            <span className="tile-label">{t.label}</span>
            <span className="tile-detail">
              {t.pending ? 'Coming soon' : t.detail}
            </span>
          </button>
        ))}
      </div>

      <footer>
        <button className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </footer>
    </main>
  );
}
