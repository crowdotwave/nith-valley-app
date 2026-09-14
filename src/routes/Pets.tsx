import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { signPaths } from '../lib/photos';
import Icon from '../components/Icon';
import type { Pet } from '../lib/types';

/**
 * The owner travels with the animal. One query serves both readers because the
 * read policy already decides who is on the list: a client gets their own
 * household, staff get the practice. See pets_read in 0001_init.sql.
 */
type PetRow = Pet & { households: { name: string } | null };

type Household = { id: string; name: string };

/**
 * A practice holds more animals than anyone will scroll, and the desk always
 * arrives knowing something — an animal's name, an owner's surname, sometimes
 * only "the yorkie". So the staff index is a search first and a list second,
 * and the list it falls back to is capped rather than endless: an uncapped one
 * would sign a photo URL per animal on every keystroke and read no better at
 * the bottom than it does at the top.
 */
const SHOWN = 60;

/** Every term has to land somewhere, so "niederer cat" narrows to one animal. */
function matches(pet: PetRow, terms: string[]) {
  if (terms.length === 0) return true;

  const hay = [pet.name, pet.breed, pet.species, pet.households?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.every((t) => hay.includes(t));
}

/** 'Other' is the option, but an animal with no species recorded is one too. */
function inSpecies(pet: PetRow, want: 'all' | 'dog' | 'cat' | 'other') {
  if (want === 'all') return true;
  if (want === 'other') return pet.species !== 'dog' && pet.species !== 'cat';
  return pet.species === want;
}

/** "Aeries and Thelma": the note is a sentence, not an enumeration. */
function inWords(names: string[]) {
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export default function Pets() {
  const { profile } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const [pets, setPets] = useState<PetRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [species, setSpecies] = useState<'all' | 'dog' | 'cat' | 'other'>('all');

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [newSpecies, setNewSpecies] = useState<Pet['species']>('dog');
  const [households, setHouseholds] = useState<Household[]>([]);
  const [owner, setOwner] = useState('');

  async function load() {
    const { data, error: readError } = await supabase
      .from('pets')
      .select('id, household_id, name, species, breed, photo_path, households(name)')
      .is('archived_at', null)
      .order('name');

    if (readError) setError(readError.message);
    else {
      setError(null);
      setPets((data ?? []) as unknown as PetRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // The desk can file an animal to any client, so it needs the list of them.
  useEffect(() => {
    if (!isStaff) return;

    supabase
      .from('households')
      .select('id, name')
      .order('name')
      .then(({ data }) => setHouseholds((data ?? []) as Household[]));
  }, [isStaff]);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return pets.filter((p) => inSpecies(p, species) && matches(p, terms));
  }, [pets, query, species]);

  const visible = isStaff ? filtered.slice(0, SHOWN) : filtered;
  const owners = useMemo(() => new Set(pets.map((p) => p.household_id)).size, [pets]);

  /**
   * The same animal on file under two households. This is a demo arrangement
   * rather than a fault, and the desk should be told so on sight: a name
   * appearing twice in a medical index is otherwise the first sign of a
   * duplicated client record, which is the thing a practice hunts down.
   *
   * The test is the name AND the photograph, not the name alone. Two clients
   * can both have a dog called Bella and in a practice this size they will;
   * they cannot both have the same photograph, because a copied record is the
   * only way two rows come to point at one object in the bucket. An unphotographed
   * copy goes unremarked, which is the right way round for a note that accuses
   * the record of nothing.
   */
  const duplicates = useMemo(() => {
    if (!isStaff) return [];

    const seen = new Map<string, { name: string; households: Set<string> }>();
    for (const p of pets) {
      if (!p.photo_path) continue;

      const key = `${p.name.trim().toLowerCase()}\n${p.photo_path}`;
      const row = seen.get(key) ?? { name: p.name, households: new Set<string>() };
      row.households.add(p.household_id);
      seen.set(key, row);
    }

    return [...seen.values()].filter((r) => r.households.size > 1).map((r) => r.name);
  }, [pets, isStaff]);

  // The bucket is private, so each picture needs its own signed URL — and only
  // the pictures actually on the page get one. A path that has been asked for
  // is never asked for again, including one whose signing failed: the index
  // still reads with an empty frame, and retrying on every render would not.
  const asked = useRef<Set<string>>(new Set());
  const onPage = visible
    .map((p) => p.photo_path ?? '')
    .filter(Boolean)
    .join('\n');

  useEffect(() => {
    let cancelled = false;
    const missing = onPage.split('\n').filter((p) => p && !asked.current.has(p));
    if (missing.length === 0) return;

    missing.forEach((p) => asked.current.add(p));
    signPaths(missing).then((next) => {
      if (!cancelled) setUrls((have) => ({ ...have, ...next }));
    });

    return () => {
      cancelled = true;
    };
  }, [onPage]);

  async function addPet(e: FormEvent) {
    e.preventDefault();

    // Staff pick the client; nothing defaults, because a default would file
    // somebody else's animal under the desk's own household in silence.
    const household = isStaff ? owner : profile?.household_id;
    if (!household) return;

    setError(null);
    const { error: writeError } = await supabase.from('pets').insert({
      household_id: household,
      name: name.trim(),
      species: newSpecies,
    });

    if (writeError) {
      setError(writeError.message);
      return;
    }

    setName('');
    setOwner('');
    setAdding(false);
    load();
  }

  return (
    <main className={isStaff ? 'desk' : undefined}>
      {/* The one back reference that should resolve by role rather than name a
          document. This index is reached from the desk's Animals tile and from
          the client home's empty state, so "/" returning each reader to their
          own home is the correct answer here and the wrong one everywhere
          else. */}
      <Link to="/" className="back">
        ← Back
      </Link>
      <h1>{isStaff ? 'Animals' : 'My pets'}</h1>

      {isStaff && duplicates.length > 0 && (
        <p className="notice">
          {inWords(duplicates)} appear more than once because I gave the office email{' '}
          {duplicates.length} of Katrina's pets
        </p>
      )}

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {/* The desk's way in. A client has a handful of animals and can see all
          of them, so the finder is the one thing on this page the two readers
          do not share. */}
      {isStaff && !loading && pets.length > 0 && (
        <>
          <div className="finder">
            <div className="finder-field">
              <label htmlFor="find">Find an animal</label>
              <input
                id="find"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, owner or breed"
                autoComplete="off"
              />
            </div>

            <div className="finder-field">
              <label htmlFor="find-species">Species</label>
              <select
                id="find-species"
                value={species}
                onChange={(e) => setSpecies(e.target.value as typeof species)}
              >
                <option value="all">All</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <p className="finder-count" aria-live="polite">
            {filtered.length === pets.length
              ? `${pets.length} ${pets.length === 1 ? 'animal' : 'animals'} on file · ${owners} ${
                  owners === 1 ? 'household' : 'households'
                }`
              : `${filtered.length} of ${pets.length} animals`}
          </p>
        </>
      )}

      {!loading && pets.length === 0 && !adding && (
        <p className="muted record-empty">
          {isStaff
            ? 'No animals on file yet.'
            : 'No pets yet. Add one so you can request food and medication for them.'}
        </p>
      )}

      {!loading && pets.length > 0 && filtered.length === 0 && (
        <p className="muted record-empty">Nothing matches that. Try a name or a surname.</p>
      )}

      {/* The same stub the home screen uses, so an animal looks like an animal
          wherever it appears. Here the whole stub is one link: this screen is
          an index into the records, and the photo frame is not also a control
          the way it is on the home screen. The desk's stub carries one extra
          field, the owner, because at the counter the animal and the person
          holding the lead are looked up as one thing. */}
      <ul className="stubs">
        {visible.map((p) => {
          const src = p.photo_path ? urls[p.photo_path] : undefined;

          return (
            <li key={p.id}>
              <Link to={`/pets/${p.id}`} className="stub">
                {src ? (
                  <img className="stub-photo" src={src} alt="" />
                ) : (
                  <span className="stub-photo stub-photo-empty">
                    {p.name.charAt(0).toUpperCase()}
                  </span>
                )}

                <span className="stub-body">
                  <span className="stub-name">{p.name}</span>
                  <span className="stub-meta">
                    {[p.species, p.breed].filter(Boolean).join(' · ') || 'On file'}
                  </span>
                  {isStaff && (
                    <span className="stub-owner">{p.households?.name ?? 'No household'}</span>
                  )}
                </span>

                <Icon name="chevron" className="chev" />
              </Link>
            </li>
          );
        })}
      </ul>

      {isStaff && filtered.length > visible.length && (
        <p className="muted record-empty">
          Showing the first {SHOWN} of {filtered.length}. Keep typing to narrow it down.
        </p>
      )}

      {adding ? (
        <form onSubmit={addPet} className="stack">
          {isStaff && (
            <>
              <label htmlFor="pet-owner">Client</label>
              <select
                id="pet-owner"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="">Choose a client…</option>
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="pet-name">Name</label>
          <input
            id="pet-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bella"
          />

          <label htmlFor="pet-species">Species</label>
          <select
            id="pet-species"
            value={newSpecies ?? 'dog'}
            onChange={(e) => setNewSpecies(e.target.value as Pet['species'])}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>

          <button type="submit">{isStaff ? 'Add animal' : 'Add pet'}</button>
          <button type="button" className="ghost" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}>
          {isStaff ? 'Add an animal' : 'Add a pet'}
        </button>
      )}
    </main>
  );
}
