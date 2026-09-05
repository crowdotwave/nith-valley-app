import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { signPaths } from '../lib/photos';
import Icon from '../components/Icon';
import type { Pet } from '../lib/types';

export default function Pets() {
  const { profile } = useProfile();
  const [pets, setPets] = useState<Pet[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Pet['species']>('dog');

  async function load() {
    const { data, error } = await supabase
      .from('pets')
      .select('id, household_id, name, species, breed, photo_path')
      .is('archived_at', null)
      .order('name');

    if (error) setError(error.message);
    else {
      const list = (data ?? []) as Pet[];
      setPets(list);
      // The bucket is private, so each picture needs its own signed URL.
      setUrls(await signPaths(list.map((p) => p.photo_path ?? '').filter(Boolean)));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addPet(e: FormEvent) {
    e.preventDefault();
    if (!profile?.household_id) return;

    setError(null);
    const { error } = await supabase.from('pets').insert({
      household_id: profile.household_id,
      name: name.trim(),
      species,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setName('');
    setAdding(false);
    load();
  }

  return (
    <main>
      <Link to="/" className="back">
        ← Back
      </Link>
      <h1>My pets</h1>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && pets.length === 0 && !adding && (
        <p className="muted">
          No pets yet. Add one so you can request food and medication for them.
        </p>
      )}

      {/* The same stub the home screen uses, so an animal looks like an animal
          wherever it appears. Here the whole stub is one link: this screen is
          an index into the records, and the photo frame is not also a control
          the way it is on the home screen. */}
      <ul className="stubs">
        {pets.map((p) => {
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
                </span>

                <Icon name="chevron" className="chev" />
              </Link>
            </li>
          );
        })}
      </ul>

      {adding ? (
        <form onSubmit={addPet} className="stack">
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
            value={species ?? 'dog'}
            onChange={(e) => setSpecies(e.target.value as Pet['species'])}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>

          <button type="submit">Add pet</button>
          <button type="button" className="ghost" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}>Add a pet</button>
      )}
    </main>
  );
}
