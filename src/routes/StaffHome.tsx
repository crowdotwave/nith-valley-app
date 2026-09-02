import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CLINIC } from '../lib/clinic';
import { useRequestQueue } from '../lib/useRequestQueue';
import AccountRow from '../components/AccountRow';
import { FirstRunNote, ViewMark } from '../components/ViewMark';
import QueueList from '../components/QueueList';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

// The front desk's own document. Clients and staff are co-equal audiences, so
// this is a console in its own right, and the queue is worked here, on the
// page, rather than sitting one click behind a link.
export default function StaffHome() {
  const { rows, loading, error, counts, move, saveNote } = useRequestQueue('open');
  const [photos, setPhotos] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('photo_submissions')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending'])
      .then(({ count, error: readError }) => {
        if (!cancelled) setPhotos(readError ? null : (count ?? 0));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  return (
    <main className="home desk">
      <header className="masthead">
        <Logo className="logo" />
        <div className="issuing-row">
          <p className="issuing">{CLINIC.address}</p>
          <ViewMark view="desk" isStaff />
        </div>
      </header>

      <FirstRunNote view="desk" isStaff />

      <div className="summary-slot" aria-live="polite">
        {loading && <div className="summary summary-skeleton" aria-hidden="true" />}

        {!loading && error && (
          <p className="summary summary-error">
            <span className="summary-title">Could not load the queue</span>
            <span className="summary-detail">{error}</span>
          </p>
        )}

        {!loading && !error && counts.waiting > 0 && (
          <p className="summary">
            <span className="summary-title">Waiting on the desk</span>
            <span className="summary-detail">
              {counts.waiting} new {plural(counts.waiting, 'request', 'requests')}
              {counts.inReview > 0 && ` · ${counts.inReview} being looked at`}
            </span>
          </p>
        )}

        {!loading && !error && counts.waiting === 0 && (
          <p className="summary-clear">
            {counts.inReview > 0
              ? `Nothing new. ${counts.inReview} still being looked at.`
              : 'Nothing new on the desk.'}
          </p>
        )}
      </div>

      <p className="field-label">The queue</p>

      {!loading && !error && (
        <div className="queue-fields">
          <div className="queue-field">
            <span className="queue-value">{counts.waiting}</span>
            <span className="queue-name">New</span>
          </div>
          <div className="queue-field">
            <span className="queue-value">{counts.inReview}</span>
            <span className="queue-name">In review</span>
          </div>
          <div className="queue-field">
            <span className="queue-value">{counts.ready}</span>
            <span className="queue-name">To hand over</span>
          </div>
        </div>
      )}

      {!loading && rows.length === 0 && !error && (
        <p className="muted record-empty">Queue is clear. Nothing waiting on the desk.</p>
      )}

      <QueueList rows={rows} onMove={move} onNote={saveNote} />

      <p className="field-label">Also on the desk</p>
      <div className="tiles">
        <Link to="/staff/photos" className="tile">
          <Icon name="camera" />
          <span className="tile-text">
            <span className="tile-label">Photo submissions</span>
            <span className="tile-detail">
              {photos === null
                ? 'Client photos for social media'
                : photos > 0
                  ? `${photos} waiting for review`
                  : 'Nothing waiting'}
            </span>
          </span>
        </Link>

        <Link to="/staff" className="tile">
          <Icon name="list" />
          <span className="tile-text">
            <span className="tile-label">Request record</span>
            <span className="tile-detail">Everything, including closed requests</span>
          </span>
        </Link>

        <Link to="/pets" className="tile">
          <Icon name="paw" />
          <span className="tile-text">
            <span className="tile-label">Animals</span>
            <span className="tile-detail">Diet, medications, vaccinations</span>
          </span>
        </Link>

        <Link to="/home" className="tile">
          <Icon name="care" />
          <span className="tile-text">
            <span className="tile-label">Client view</span>
            <span className="tile-detail">Your own animals and requests</span>
          </span>
        </Link>
      </div>

      <AccountRow />
    </main>
  );
}
