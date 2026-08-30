import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { relativeDue, isSoon } from '../lib/dates';
import { removePhoto, signPaths, uploadHouseholdPhoto } from '../lib/photos';
import type { Pet, PetFood, PetMedication, Vaccination } from '../lib/types';

// Bags are sold in kilograms; feeding guides are written in grams per day.
// Store grams throughout and convert only at the input.
const KG = 1000;

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';

  const [pet, setPet] = useState<Pet | null>(null);
  const [foods, setFoods] = useState<PetFood[]>([]);
  const [meds, setMeds] = useState<PetMedication[]>([]);
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<'food' | 'med' | 'vaccine' | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    const [p, f, m, v] = await Promise.all([
      supabase.from('pets').select('*').eq('id', id).single(),
      supabase.from('pet_foods').select('*').eq('pet_id', id).eq('active', true),
      supabase.from('pet_medications').select('*').eq('pet_id', id).eq('active', true),
      supabase
        .from('pet_vaccinations')
        .select('*')
        .eq('pet_id', id)
        .order('administered_on', { ascending: false }),
    ]);

    if (p.error) setError(p.error.message);
    else setPet(p.data as Pet);

    setFoods((f.data ?? []) as PetFood[]);
    setMeds((m.data ?? []) as PetMedication[]);
    setVaccines((v.data ?? []) as Vaccination[]);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // The bucket is private, so the picture needs a signed URL each time.
  useEffect(() => {
    let cancelled = false;
    const path = pet?.photo_path;

    if (!path) {
      setPhoto(null);
      return;
    }

    signPaths([path]).then((signed) => {
      if (!cancelled) setPhoto(signed[path] ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [pet?.photo_path]);

  async function attachPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !pet || !profile?.household_id) return;

    setError(null);
    try {
      const path = await uploadHouseholdPhoto(file, profile.household_id, 'pets');
      const { error: writeError } = await supabase
        .from('pets')
        .update({ photo_path: path })
        .eq('id', pet.id);

      if (writeError) {
        // Do not leave an orphaned object behind if the row failed to write.
        await removePhoto(path);
        setError(writeError.message);
        return;
      }

      await removePhoto(pet.photo_path);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  async function addFood(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const kg = Number(d.get('bag'));

    const { error } = await supabase.from('pet_foods').insert({
      pet_id: id,
      brand: String(d.get('brand') || '') || null,
      product_name: String(d.get('product')),
      package_size_g: kg ? kg * KG : null,
      daily_amount_g: Number(d.get('daily')) || null,
      last_purchased_on: String(d.get('purchased')) || null,
    });

    if (error) setError(error.message);
    else {
      setForm(null);
      load();
    }
  }

  async function addMed(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);

    const { error } = await supabase.from('pet_medications').insert({
      pet_id: id,
      name: String(d.get('name')),
      dose: String(d.get('dose') || '') || null,
      last_filled_on: String(d.get('filled')) || null,
      days_supply: Number(d.get('supply')) || null,
      is_preventative: d.get('preventative') === 'on',
    });

    if (error) setError(error.message);
    else {
      setForm(null);
      load();
    }
  }

  async function addVaccine(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);

    const { error } = await supabase.from('pet_vaccinations').insert({
      pet_id: id,
      vaccine_name: String(d.get('vaccine')),
      administered_on: String(d.get('given')),
      next_due_on: String(d.get('due')) || null,
      entered_by: profile?.id,
    });

    if (error) setError(error.message);
    else {
      setForm(null);
      load();
    }
  }

  if (loading) return <div className="loading">Loading…</div>;
  if (!pet) return <main><Link to="/pets" className="back">← Back</Link><p className="error">{error ?? 'Not found'}</p></main>;

  return (
    <main>
      <Link to="/pets" className="back">← All pets</Link>

      {/* The animal's own picture belongs on the animal's own record, not only
          on the home screen. */}
      <div className="pet-head">
        <label
          className={photo ? 'pet-photo-slot' : 'pet-photo pet-photo-empty'}
          htmlFor="pet-photo"
        >
          {photo ? (
            <img className="pet-photo" src={photo} alt={pet.name} />
          ) : (
            pet.name.charAt(0).toUpperCase()
          )}
        </label>

        <input
          id="pet-photo"
          className="photo-field"
          type="file"
          accept="image/*"
          aria-label={photo ? `Change ${pet.name}'s picture` : `Add a picture of ${pet.name}`}
          onChange={attachPhoto}
        />

        <span>
          <h1>{pet.name}</h1>
          <p className="muted">{[pet.species, pet.breed].filter(Boolean).join(' · ')}</p>
        </span>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Food ------------------------------------------------------------ */}
      <section>
        <h2>Diet</h2>
        {foods.length === 0 && <p className="muted">No food recorded.</p>}
        <ul className="list">
          {foods.map((f) => (
            <li key={f.id} className="row">
              <span className="row-title">
                {[f.brand, f.product_name].filter(Boolean).join(' ')}
              </span>
              <span className="row-detail">
                {f.package_size_g ? `${f.package_size_g / KG}kg bag` : 'Bag size unknown'}
                {f.daily_amount_g ? ` · ${f.daily_amount_g}g/day` : ''}
              </span>
              {f.depletes_on && (
                <span className={isSoon(f.depletes_on) ? 'badge' : 'row-detail'}>
                  Runs out {relativeDue(f.depletes_on)}
                </span>
              )}
            </li>
          ))}
        </ul>

        {form === 'food' ? (
          <form onSubmit={addFood} className="stack">
            <label htmlFor="brand">Brand</label>
            <input id="brand" name="brand" placeholder="Royal Canin" />
            <label htmlFor="product">Product</label>
            <input id="product" name="product" required placeholder="Renal Support" />
            <label htmlFor="bag">Bag size (kg)</label>
            <input id="bag" name="bag" type="number" step="0.1" min="0" placeholder="6" />
            <label htmlFor="daily">Amount fed per day (g)</label>
            <input id="daily" name="daily" type="number" min="0" placeholder="220" />
            <label htmlFor="purchased">Last bought</label>
            <input id="purchased" name="purchased" type="date" />
            <button type="submit">Save food</button>
            <button type="button" className="ghost" onClick={() => setForm(null)}>Cancel</button>
          </form>
        ) : (
          <button onClick={() => setForm('food')}>Add food</button>
        )}
      </section>

      {/* Medications ----------------------------------------------------- */}
      <section>
        <h2>Medications</h2>
        {meds.length === 0 && <p className="muted">No medications recorded.</p>}
        <ul className="list">
          {meds.map((m) => (
            <li key={m.id} className="row">
              <span className="row-title">
                {m.name} {m.dose && <span className="row-detail">{m.dose}</span>}
              </span>
              <span className="row-detail">
                {m.is_preventative ? 'Flea/tick/heartworm' : 'Prescription'}
                {m.days_supply ? ` · ${m.days_supply} day supply` : ''}
              </span>
              {m.depletes_on && (
                <span className={isSoon(m.depletes_on) ? 'badge' : 'row-detail'}>
                  Runs out {relativeDue(m.depletes_on)}
                </span>
              )}
            </li>
          ))}
        </ul>

        {form === 'med' ? (
          <form onSubmit={addMed} className="stack">
            <label htmlFor="name">Medication</label>
            <input id="name" name="name" required placeholder="Apoquel" />
            <label htmlFor="dose">Dose</label>
            <input id="dose" name="dose" placeholder="16mg twice daily" />
            <label htmlFor="filled">Last filled</label>
            <input id="filled" name="filled" type="date" />
            <label htmlFor="supply">Days supply</label>
            <input id="supply" name="supply" type="number" min="1" placeholder="30" />
            <label className="inline">
              <input name="preventative" type="checkbox" />
              Flea, tick or heartworm prevention
            </label>
            <button type="submit">Save medication</button>
            <button type="button" className="ghost" onClick={() => setForm(null)}>Cancel</button>
          </form>
        ) : (
          <button onClick={() => setForm('med')}>Add medication</button>
        )}
      </section>

      {/* Vaccinations ---------------------------------------------------- */}
      <section>
        <h2>Vaccinations</h2>
        {vaccines.length === 0 && (
          <p className="muted">
            Nothing recorded yet. Vaccination history is entered by the clinic.
          </p>
        )}
        <ul className="list">
          {vaccines.map((v) => (
            <li key={v.id} className="row">
              <span className="row-title">{v.vaccine_name}</span>
              <span className="row-detail">
                Given {new Date(v.administered_on + 'T00:00:00').toLocaleDateString()}
              </span>
              {v.next_due_on && (
                <span className={isSoon(v.next_due_on, 30) ? 'badge' : 'row-detail'}>
                  Next {relativeDue(v.next_due_on)}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Clients cannot write here — the policy blocks it, and offering the
            form would only produce a confusing error. */}
        {isStaff &&
          (form === 'vaccine' ? (
            <form onSubmit={addVaccine} className="stack">
              <label htmlFor="vaccine">Vaccine</label>
              <input id="vaccine" name="vaccine" required placeholder="Rabies" />
              <label htmlFor="given">Date given</label>
              <input id="given" name="given" type="date" required />
              <label htmlFor="due">Next due (copy from Pulse)</label>
              <input id="due" name="due" type="date" />
              <button type="submit">Save vaccination</button>
              <button type="button" className="ghost" onClick={() => setForm(null)}>Cancel</button>
            </form>
          ) : (
            <button onClick={() => setForm('vaccine')}>Add vaccination</button>
          ))}
      </section>
    </main>
  );
}
