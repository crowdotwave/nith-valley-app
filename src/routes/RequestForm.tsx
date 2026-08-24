import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import type { Pet, RequestType } from '../lib/types';

const COPY: Record<'food' | 'medication', { title: string; itemLabel: string; hint: string }> = {
  food: {
    title: 'Order food',
    itemLabel: 'What food?',
    hint: 'Brand and bag size if you know it — we can look it up otherwise.',
  },
  medication: {
    title: 'Request medication',
    itemLabel: 'Which medication?',
    hint: 'Refills need a vet to approve them, so this may take a day.',
  },
};

export default function RequestForm() {
  const { type } = useParams<{ type: string }>();
  const kind = (type === 'medication' ? 'medication' : 'food') as 'food' | 'medication';
  const copy = COPY[kind];

  const navigate = useNavigate();
  const { profile } = useProfile();

  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState('');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('pets')
      .select('id, household_id, name, species, breed, photo_path')
      .is('archived_at', null)
      .order('name')
      .then(({ data }) => {
        const rows = (data ?? []) as Pet[];
        setPets(rows);
        if (rows.length === 1) setPetId(rows[0].id);
      });
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!profile?.household_id) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase.from('requests').insert({
      household_id: profile.household_id,
      pet_id: petId || null,
      type: kind as RequestType,
      details: { item: item.trim(), quantity: quantity.trim() },
      client_note: note.trim() || null,
      created_by: profile.id,
      // status defaults to 'submitted'; the RLS insert policy requires it.
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    navigate('/requests');
  }

  if (pets.length === 0) {
    return (
      <main>
        <Link to="/" className="back">← Back</Link>
        <h1>{copy.title}</h1>
        <p className="muted">
          Add a pet first so we know who this is for.
        </p>
        <Link to="/pets"><button>Add a pet</button></Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>{copy.title}</h1>
      <p className="muted">{copy.hint}</p>

      <form onSubmit={submit} className="stack">
        <label htmlFor="pet">Which pet?</label>
        <select id="pet" required value={petId} onChange={(e) => setPetId(e.target.value)}>
          <option value="">Choose a pet…</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label htmlFor="item">{copy.itemLabel}</label>
        <input
          id="item"
          required
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder={kind === 'food' ? 'Royal Canin Renal, 6kg' : 'Apoquel 16mg'}
        />

        <label htmlFor="qty">How much?</label>
        <input
          id="qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={kind === 'food' ? '1 bag' : '30 day supply'}
        />

        <label htmlFor="note">Anything else? (optional)</label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Sending…' : 'Send request'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </main>
  );
}
