import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { CLINIC, openBooking } from '../lib/clinic';
import { relativeDue } from '../lib/dates';
import { removePhoto, signPaths, uploadHouseholdPhoto } from '../lib/photos';
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
      { label: 'What we do', detail: 'Our services', icon: 'care', to: '/services' },
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
  const className = ['tile', entry.primary && 'tile-primary', entry.external && 'tile-external']
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
  const { profile } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoad({ state: 'loading' });

    const today = new Date();
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    Promise.all([
      supabase
        .from('pets')
        .select('id, household_id, name, species, breed, photo_path')
        .is('archived_at', null)
        .order('name'),
      supabase
        .from('reminders')
        .select('pet_id, title, due_on')
        .is('completed_at', null)
        .lte('due_on', iso(horizon))
        .or(`snoozed_until.is.null,snoozed_until.lte.${iso(today)}`)
        .order('due_on'),
      supabase
        .from('requests')
        .select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'in_review', 'approved', 'ready']),
    ])
      .then(async ([pets, due, requests]) => {
        if (cancelled) return;

        if (pets.error || due.error || requests.error) {
          setLoad({ state: 'error' });
          return;
        }

        const list = (pets.data ?? []) as Pet[];
        setLoad({
          state: 'ready',
          pets: list,
          due: (due.data ?? []) as Due[],
          open: requests.count ?? 0,
        });

        const signed = await signPaths(list.map((p) => p.photo_path ?? '').filter(Boolean));
        if (!cancelled) setUrls(signed);
      })
      .catch(() => {
        if (!cancelled) setLoad({ state: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    let cancelled = false;
    if (!profile?.avatar_path) {
      setAvatar(null);
      return;
    }

    signPaths([profile.avatar_path]).then((signed) => {
      if (!cancelled) setAvatar(signed[profile.avatar_path!] ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_path]);

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

  const attachAvatar = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !profile?.household_id || !profile.id) return;

      setPhotoError(null);
      try {
        const path = await uploadHouseholdPhoto(file, profile.household_id, 'avatars');
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_path: path })
          .eq('id', profile.id);

        if (error) {
          await removePhoto(path);
          setPhotoError(error.message);
          return;
        }

        await removePhoto(profile.avatar_path);
        const signed = await signPaths([path]);
        setAvatar(signed[path] ?? null);
      } catch (err) {
        setPhotoError(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [profile?.household_id, profile?.id, profile?.avatar_path],
  );

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);
  const dueCount = load.state === 'ready' ? load.due.length : 0;
  const initial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <main className="home">
      <header className="masthead">
        <Logo className="logo" />
        <p className="issuing">{CLINIC.address}</p>
      </header>

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
        {load.state === 'ready' &&
          load.pets.map((pet) => {
            const next = load.due.find((d) => d.pet_id === pet.id);
            const src = pet.photo_path ? urls[pet.photo_path] : undefined;

            return (
              <li key={pet.id} className="stub">
                <label
                  className={src ? 'stub-photo-slot' : 'stub-photo stub-photo-empty'}
                  title={src ? `Change ${pet.name}'s picture` : `Add a picture of ${pet.name}`}
                >
                  {src ? (
                    <img className="stub-photo" src={src} alt={pet.name} />
                  ) : (
                    pet.name.charAt(0).toUpperCase()
                  )}
                  <input
                    className="photo-field"
                    type="file"
                    accept="image/*"
                    onChange={(e) => attachPetPhoto(pet, e)}
                  />
                </label>

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
          <p className="field-label">Staff</p>
          <div className="tiles">
            <IndexRow
              entry={{
                label: 'Front desk',
                detail: 'Request queue and photo submissions',
                icon: 'list',
                to: '/desk',
              }}
            />
          </div>
        </>
      )}

      <div className="account">
        <label
          className={avatar ? 'account-photo-slot' : 'account-photo account-photo-empty'}
          title="Change your picture"
        >
          {avatar ? <img className="account-photo" src={avatar} alt="" /> : initial}
          <input className="photo-field" type="file" accept="image/*" onChange={attachAvatar} />
        </label>

        <span>
          <span className="account-name">{profile?.full_name || profile?.email}</span>
          <br />
          <span className="account-detail">
            {avatar ? 'Tap your picture to change it' : 'Tap to add your picture'}
          </span>
        </span>

        <button className="ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </main>
  );
}
