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
        <strong>Demo</strong> Sample practice, invented data. Nothing leaves this browser.
      </p>
      <div className="demo-bar__actions">
        <button type="button" onClick={() => switchDemo(other)}>
          {other === 'staff' ? 'View as front desk' : 'View as client'}
        </button>
        <button type="button" onClick={restartDemo}>
          Start over
        </button>
        <button type="button" onClick={leaveDemo}>
          Exit demo
        </button>
      </div>
    </div>
  );
}
