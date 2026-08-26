import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { CLINIC } from '../lib/clinic';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

// The front desk's own document. Clients and staff are co-equal audiences, so
// this is a console in its own right rather than two tiles bolted onto the
// client home.
type Load =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; waiting: number; inReview: number; ready: number; photos: number };

export default function StaffHome() {
  const { profile } = useProfile();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoad({ state: 'loading' });

    const count = (table: string, column: string, values: string[]) =>
      supabase.from(table).select('id', { count: 'exact', head: true }).in(column, values);

    Promise.all([
      count('requests', 'status', ['submitted']),
      count('requests', 'status', ['in_review']),
      count('requests', 'status', ['approved', 'ready']),
      count('photo_submissions', 'status', ['pending']),
    ])
      .then(([waiting, inReview, ready, photos]) => {
        if (cancelled) return;

        if (waiting.error || inReview.error || ready.error || photos.error) {
          setLoad({ state: 'error' });
          return;
        }

        setLoad({
          state: 'ready',
          waiting: waiting.count ?? 0,
          inReview: inReview.count ?? 0,
          ready: ready.count ?? 0,
          photos: photos.count ?? 0,
        });
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
      <header className="masthead">
        <Logo className="logo" />
        <p className="issuing">Front desk · {CLINIC.address}</p>
      </header>

      <div className="summary-slot" aria-live="polite">
        {load.state === 'loading' && <div className="summary summary-skeleton" aria-hidden="true" />}

        {load.state === 'error' && (
          <button className="summary summary-error" onClick={() => setAttempt((n) => n + 1)}>
            <span className="summary-title">Could not load the queue</span>
            <span className="summary-detail">Tap to try again</span>
          </button>
        )}

        {load.state === 'ready' && load.waiting > 0 && (
          <Link to="/staff" className="summary">
            <span className="summary-title">Waiting on the desk</span>
            <span className="summary-detail">
              {load.waiting} new {plural(load.waiting, 'request', 'requests')}
              {load.inReview > 0 && ` · ${load.inReview} being looked at`}
            </span>
          </Link>
        )}

        {load.state === 'ready' && load.waiting === 0 && (
          <p className="summary-clear">
            {load.inReview > 0
              ? `Nothing new. ${load.inReview} still being looked at.`
              : 'Nothing new on the desk.'}
          </p>
        )}
      </div>

      <p className="field-label">The queue</p>
      <div className="tiles">
        <Link to="/staff" className="tile tile-primary">
          <Icon name="list" />
          <span className="tile-text">
            <span className="tile-label">Request queue</span>
            <span className="tile-detail">
              {load.state === 'ready'
                ? `${load.waiting} new · ${load.inReview} in review · ${load.ready} to hand over`
                : 'Food and medication requests'}
            </span>
          </span>
        </Link>

        <Link to="/staff/photos" className="tile">
          <Icon name="camera" />
          <span className="tile-text">
            <span className="tile-label">Photo submissions</span>
            <span className="tile-detail">
              {load.state === 'ready' && load.photos > 0
                ? `${load.photos} waiting for review`
                : 'Nothing waiting'}
            </span>
          </span>
        </Link>
      </div>

      <p className="field-label">Records</p>
      <div className="tiles">
        <Link to="/pets" className="tile">
          <Icon name="paw" />
          <span className="tile-text">
            <span className="tile-label">Animals</span>
            <span className="tile-detail">Diet, medications, vaccinations</span>
          </span>
        </Link>

        <Link to="/reminders" className="tile">
          <Icon name="bell" />
          <span className="tile-text">
            <span className="tile-label">Reminders</span>
            <span className="tile-detail">What is coming due</span>
          </span>
        </Link>
      </div>

      <p className="field-label">Your account</p>
      <div className="tiles">
        <Link to="/home" className="tile">
          <Icon name="care" />
          <span className="tile-text">
            <span className="tile-label">Client view</span>
            <span className="tile-detail">Your own pets and requests</span>
          </span>
        </Link>
      </div>

      <div className="account">
        <span className="account-photo account-photo-empty">
          {(profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase()}
        </span>

        <span>
          <span className="account-name">{profile?.full_name || profile?.email}</span>
          <br />
          <span className="account-detail">Signed in as {profile?.role}</span>
        </span>

        <button className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </main>
  );
}
