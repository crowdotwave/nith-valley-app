import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { CLINIC, openBooking } from '../lib/clinic';
import { relativeDue } from '../lib/dates';
import { removePhoto, signPaths, uploadHouseholdPhoto } from '../lib/photos';
import AccountRow from '../components/AccountRow';
import { FirstRunNote, ViewMark } from '../components/ViewMark';
import Icon from '../components/Icon';
import Logo from '../components/Logo';
import type { Pet } from '../lib/types';

type Entry = {
  label: string;
  detail: string;
  icon: string;
  to?: string;
  onClick?: () => void;
  // Hands off to a third-party site rather than navigating in-app.
  external?: boolean;
  // The one action the document leads with; rendered as the sealed row.
  primary?: boolean;
  // Only a staff account is offered this. Takes the counter-stamp.
  staff?: boolean;
};

const SECTIONS: { heading: string; entries: Entry[] }[] = [
  {
    heading: 'Get care',
    entries: [
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
      { label: 'Services', detail: 'What we treat and offer', icon: 'care', to: '/services' },
    ],
  },
  {
    heading: 'Food & medication',
    entries: [
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
    entries: [
      { label: 'All reminders', detail: 'What is coming due', icon: 'bell', to: '/reminders' },
      { label: 'Send us a photo', detail: 'For our social media', icon: 'camera', to: '/photos' },
    ],
  },
];

type Due = { pet_id: string; title: string; due_on: string };

// Loading and failure stay distinct from "nothing due". Collapsing them into a
// single count meant a dropped request rendered as a confident all-clear, and
// here that is a claim about someone's medication.
type Load =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; pets: Pet[]; due: Due[]; open: number };

function IndexRow({ entry }: { entry: Entry }) {
  const className = [
    'tile',
    entry.primary && 'tile-primary',
    entry.external && 'tile-external',
    entry.staff && 'staff-only',
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      <Icon name={entry.icon} />
      <span className="tile-text">
        <span className="tile-label">{entry.label}</span>
        <span className="tile-detail">{entry.detail}</span>
      </span>
      {entry.external && <Icon name="external" className="tile-external-mark" />}
      {entry.staff && <span className="staff-mark">Staff</span>}
    </>
  );

  return entry.to ? (
    <Link to={entry.to} className={className}>
      {body}
    </Link>
  ) : (
    <button className={className} onClick={entry.onClick}>
      {body}
    </button>
  );
}

export default function Home() {
  const { profile, loading: profileLoading } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';
  const household = profile?.household_id;

  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoading) return;

    let cancelled = false;
    setLoad({ state: 'loading' });

    // Staff can read every household, so this document has to name the one it
    // wants. Without it the front desk's own client view listed other people's
    // animals and requests as though they were theirs.
    if (!household) {
      setLoad({ state: 'error' });
      return;
    }

    const today = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    // Reminders hang off pets, not households, so the animals have to land
    // before there is anything to scope the reminders to.
    (async () => {
      const pets = await supabase
        .from('pets')
        .select('id, household_id, name, species, breed, photo_path')
        .eq('household_id', household)
        .is('archived_at', null)
        .order('name');

      if (cancelled) return;

      if (pets.error) {
        setLoad({ state: 'error' });
        return;
      }

      const list = (pets.data ?? []) as Pet[];

      const [due, requests] = await Promise.all([
        supabase
          .from('reminders')
          .select('pet_id, title, due_on')
          .in('pet_id', list.map((p) => p.id))
          .is('completed_at', null)
          .lte('due_on', iso(horizon))
          .or(`snoozed_until.is.null,snoozed_until.lte.${iso(today)}`)
          .order('due_on'),
        supabase
          .from('requests')
          .select('id', { count: 'exact', head: true })
          .eq('household_id', household)
          .in('status', ['submitted', 'in_review', 'approved', 'ready']),
      ]);

      if (cancelled) return;

      if (due.error || requests.error) {
        setLoad({ state: 'error' });
        return;
      }

      setLoad({
        state: 'ready',
        pets: list,
        due: (due.data ?? []) as Due[],
        open: requests.count ?? 0,
      });

      const signed = await signPaths(list.map((p) => p.photo_path ?? '').filter(Boolean));
      if (!cancelled) setUrls(signed);
    })().catch(() => {
      if (!cancelled) setLoad({ state: 'error' });
    });

    return () => {
      cancelled = true;
    };
  }, [attempt, household, profileLoading]);

  const attachPetPhoto = useCallback(
    async (pet: Pet, e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !profile?.household_id) return;

      setPhotoError(null);
      try {
        const path = await uploadHouseholdPhoto(file, profile.household_id, 'pets');
        const { error } = await supabase
          .from('pets')
          .update({ photo_path: path })
          .eq('id', pet.id);

        if (error) {
          // Do not leave an orphaned object behind if the row failed to write.
          await removePhoto(path);
          setPhotoError(error.message);
          return;
        }

        await removePhoto(pet.photo_path);
        setAttempt((n) => n + 1);
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [profile?.household_id],
  );

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
  const dueCount = load.state === 'ready' ? load.due.length : 0;

  // Ordered by what each animal needs, not by name. A page whose whole promise
  // is "the one thing this animal needs" must not bury the most urgent one at
  // the bottom of an alphabetical list. `due` arrives sorted by date, so the
  // first match for a pet is its soonest; animals with nothing due fall to the
  // end in name order.
  const stubs =
    load.state === 'ready'
      ? load.pets
          .map((pet) => ({ pet, next: load.due.find((d) => d.pet_id === pet.id) }))
          .sort((a, b) => {
            if (a.next && b.next) {
              return a.next.due_on === b.next.due_on
                ? a.pet.name.localeCompare(b.pet.name)
                : a.next.due_on < b.next.due_on
                  ? -1
                  : 1;
            }
            if (a.next) return -1;
            if (b.next) return 1;
            return a.pet.name.localeCompare(b.pet.name);
          })
      : [];

  return (
    <main className="home">
      <header className="masthead">
        <Logo className="logo" />
        <div className="issuing-row">
          <p className="issuing">{CLINIC.address}</p>
          <ViewMark view="client" isStaff={isStaff} />
        </div>
      </header>

      <FirstRunNote view="client" isStaff={isStaff} />

      {/* The slot holds its height in every state so the record below never
          shifts once the counts land. */}
      <div className="summary-slot" aria-live="polite">
        {load.state === 'loading' && <div className="summary summary-skeleton" aria-hidden="true" />}

        {load.state === 'error' && (
          <button className="summary summary-error" onClick={() => setAttempt((n) => n + 1)}>
            <span className="summary-title">Could not load your record</span>
            <span className="summary-detail">Tap to try again</span>
          </button>
        )}

        {load.state === 'ready' && dueCount > 0 && (
          <Link to="/reminders" className="summary">
            <span className="summary-title">Coming due</span>
            <span className="summary-detail">
              {dueCount} {plural(dueCount, 'thing', 'things')} in the next two weeks
              {load.open > 0 &&
                ` · ${load.open} open ${plural(load.open, 'request', 'requests')}`}
            </span>
          </Link>
        )}

        {load.state === 'ready' && dueCount === 0 && (
          load.open > 0 ? (
            <Link to="/requests" className="summary-clear">
              Nothing due. {load.open} open {plural(load.open, 'request', 'requests')} to track.
            </Link>
          ) : (
            <p className="summary-clear">Nothing due right now.</p>
          )
        )}
      </div>

      <p className="field-label">Animals on file</p>

      {load.state === 'ready' && load.pets.length === 0 && (
        <p className="muted record-empty">
          No animals on file yet.{' '}
          <Link to="/pets">Add one</Link> so you can request food and medication.
        </p>
      )}

      <ul className="stubs">
        {stubs.map(({ pet, next }) => {
          const src = pet.photo_path ? urls[pet.photo_path] : undefined;

            return (
              <li key={pet.id} className="stub">
                <label
                  className={src ? 'stub-photo-slot' : 'stub-photo stub-photo-empty'}
                  htmlFor={`pet-photo-${pet.id}`}
                >
                  {src ? (
                    <img className="stub-photo" src={src} alt={pet.name} />
                  ) : (
                    pet.name.charAt(0).toUpperCase()
                  )}
                </label>

                <input
                  id={`pet-photo-${pet.id}`}
                  className="photo-field"
                  type="file"
                  accept="image/*"
                  aria-label={
                    src ? `Change ${pet.name}'s picture` : `Add a picture of ${pet.name}`
                  }
                  onChange={(e) => attachPetPhoto(pet, e)}
                />

                <Link to={`/pets/${pet.id}`} className="stub-body">
                  <span className="stub-name">{pet.name}</span>
                  <span className="stub-meta">
                    {[pet.species, pet.breed].filter(Boolean).join(' · ') || 'On file'}
                  </span>
                  <span className={next ? 'stub-due' : 'stub-due clear'}>
                    {next ? `${next.title} ${relativeDue(next.due_on)}` : 'Nothing due'}
                  </span>
                </Link>
              </li>
            );
          })}
      </ul>

      {photoError && <p className="error">{photoError}</p>}

      {SECTIONS.map((section) => (
        <div key={section.heading}>
          <p className="field-label">{section.heading}</p>
          <div className="tiles">
            {section.entries.map((entry) => (
              <IndexRow key={entry.label} entry={entry} />
            ))}
          </div>
        </div>
      ))}

      {isStaff && (
        <>
          <p className="field-label staff-label">Staff</p>
          <div className="tiles">
            <IndexRow
              entry={{
                label: 'Front desk',
                detail: 'Request queue and photo submissions',
                icon: 'list',
                to: '/desk',
                staff: true,
              }}
            />
          </div>
        </>
      )}

      <AccountRow />
    </main>
  );
}
