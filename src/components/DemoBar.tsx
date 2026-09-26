import { demo } from '../lib/supabase';
import { leaveDemo, restartDemo, switchDemo } from '../lib/demo/client';

// Always on screen in demo mode, so a demo can never be mistaken for a real
// practice's records, in person or in a recording.
export default function DemoBar() {
  if (!demo) return null;

  const other = demo === 'client' ? 'staff' : 'client';

  return (
    <div className="demo-bar" role="note">
      <p>
        <strong>Demo</strong> Invented sample data
      </p>
      <div className="demo-bar__actions">
        <button type="button" onClick={() => switchDemo(other)} aria-label={other === 'staff' ? 'View as the front desk' : 'View as a client'}>
          {other === 'staff' ? 'Front desk' : 'Client'}
        </button>
        <button type="button" onClick={restartDemo}>
          Start over
        </button>
        <button type="button" onClick={leaveDemo} aria-label="Exit the demo">
          Exit
        </button>
      </div>
    </div>
  );
}
