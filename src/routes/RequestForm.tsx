import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { relativeWhen, isSoon, daysUntil } from '../lib/dates';
import type { Pet, PetFood, PetMedication, RequestItem, RequestType } from '../lib/types';

const KG = 1000;

/** One thing the practice already knows an animal is on. */
type OnFile = {
  id: string;
  petId: string;
  petName: string;
  kind: 'food' | 'medication';
  label: string;
  detail: string;
  soon: boolean;
  defaultQty: string;
};

const KIND_NAME: Record<'food' | 'medication', string> = {
  food: 'Food',
  medication: 'Medication',
};

/**
 * One order for the household, whatever it is made of.
 *
 * This was two forms behind two routes, so a client picking up a bag of food
 * and a refill on the same visit sent two requests, which the desk then worked
 * twice and handed over once. It is one page: every animal, food and
 * medication together, tick what you need.
 */
export default function RequestForm() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const household = profile?.household_id;

  const [pets, setPets] = useState<Pet[]>([]);
  const [onFile, setOnFile] = useState<OnFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Ticked lines, keyed by the file row they came from, so an edited quantity
  // stays attached to the right one.
  const [picked, setPicked] = useState<Record<string, RequestItem>>({});
  const [extras, setExtras] = useState<RequestItem[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoading || !household) return;

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data: petRows } = await supabase
        .from('pets')
        .select('id, household_id, name, species, breed, photo_path')
        .eq('household_id', household)
        .is('archived_at', null)
        .order('name');

      if (cancelled) return;
      const list = (petRows ?? []) as Pet[];
      setPets(list);

      const ids = list.map((p) => p.id);
      const nameOf = new Map(list.map((p) => [p.id, p.name]));

      const [foods, meds] = await Promise.all([
        supabase
          .from('pet_foods')
          .select('id, pet_id, brand, product_name, package_size_g, depletes_on')
          .in('pet_id', ids)
          .eq('active', true),
        supabase
          .from('pet_medications')
          .select('id, pet_id, name, dose, frequency, days_supply, depletes_on')
          .in('pet_id', ids)
          .eq('active', true),
      ]);

      if (cancelled) return;

      const runsOut = (on: string | null) =>
        on ? `${daysUntil(on) < 0 ? 'ran out' : 'runs out'} ${relativeWhen(on)}` : '';

      const fromFood = ((foods.data ?? []) as PetFood[]).map((f): OnFile => ({
        id: `food:${f.id}`,
        petId: f.pet_id,
        petName: nameOf.get(f.pet_id) ?? '',
        kind: 'food',
        label: [f.brand, f.product_name].filter(Boolean).join(' '),
        detail: [
          f.package_size_g ? `${Number(f.package_size_g) / KG}kg bag` : '',
          runsOut(f.depletes_on),
        ]
          .filter(Boolean)
          .join(' · '),
        soon: isSoon(f.depletes_on),
        defaultQty: '1 bag',
      }));

      const fromMeds = ((meds.data ?? []) as PetMedication[]).map((m): OnFile => ({
        id: `med:${m.id}`,
        petId: m.pet_id,
        petName: nameOf.get(m.pet_id) ?? '',
        kind: 'medication',
        label: [m.name, m.dose].filter(Boolean).join(' '),
        detail: [m.frequency, runsOut(m.depletes_on)].filter(Boolean).join(' · '),
        soon: isSoon(m.depletes_on),
        defaultQty: m.days_supply ? `${m.days_supply} day supply` : '',
      }));

      // Animals in the order they are listed, food before medication inside
      // each, because that is the order the shelf is walked.
      const order = new Map(list.map((p, i) => [p.id, i]));
      const merged = [...fromFood, ...fromMeds].sort(
        (a, b) =>
          order.get(a.petId)! - order.get(b.petId)! ||
          a.kind.localeCompare(b.kind) ||
          a.label.localeCompare(b.label),
      );

      setOnFile(merged);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [household, profileLoading]);

  function toggle(option: OnFile) {
    setPicked((current) => {
      const next = { ...current };
      if (next[option.id]) delete next[option.id];
      else
        next[option.id] = {
          item: option.label,
          quantity: option.defaultQty,
          pet_id: option.petId,
          pet: option.petName,
          kind: option.kind,
        };
      return next;
    });
  }

  function setQuantity(id: string, quantity: string) {
    setPicked((current) =>
      current[id] ? { ...current, [id]: { ...current[id], quantity } } : current,
    );
  }

  function editExtra(index: number, patch: Partial<RequestItem>) {
    setExtras((current) => current.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  const items: RequestItem[] = [
    ...Object.values(picked),
    ...extras
      .filter((e) => e.item.trim())
      .map((e) => ({
        item: e.item.trim(),
        quantity: e.quantity.trim(),
        pet_id: e.pet_id || null,
        pet: e.pet_id ? (pets.find((p) => p.id === e.pet_id)?.name ?? null) : null,
        kind: e.kind ?? 'food',
      })),
  ];

  // A request still names one animal and one kind when every line agrees, so
  // the ledger and the queue read as they always have. Only a genuinely mixed
  // one goes without, and the lines carry both themselves.
  const petIds = new Set(items.map((i) => i.pet_id).filter(Boolean));
  const kinds = new Set(items.map((i) => i.kind));
  const singlePet = petIds.size === 1 ? [...petIds][0] : null;
  const type: RequestType = kinds.size === 1 ? ([...kinds][0] as RequestType) : 'mixed';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!household || items.length === 0) return;

    setSaving(true);
    setError(null);

    const { error: failed } = await supabase.from('requests').insert({
      household_id: household,
      pet_id: singlePet,
      type,
      details: { items },
      client_note: note.trim() || null,
      created_by: profile?.id,
      // status defaults to 'submitted'; the RLS insert policy requires it.
    });

    if (failed) {
      setError(failed.message);
      setSaving(false);
      return;
    }

    navigate('/requests');
  }

  if (!loading && pets.length === 0) {
    return (
      <main>
        <Link to="/home" className="back">← Back</Link>
        <h1>Order food or medication</h1>
        <p className="muted">Add an animal first so we know who this is for.</p>
        <Link to="/pets"><button>Add a pet</button></Link>
      </main>
    );
  }

  let lastGroup = '';

  return (
    <main>
      <Link to="/home" className="back">← Back</Link>
      <h1>Order food or medication</h1>
      <p className="muted">
        Everything your animals are on is here. Tick anything you need, for any of them,
        and it comes to us as one order.
      </p>

      {loading && <p className="muted">Loading…</p>}

      {!loading && (
        <form onSubmit={submit} className="stack">
          {onFile.length === 0 && (
            <p className="muted record-empty">
              Nothing on file yet, so tell us what you need and we will add it.
            </p>
          )}

          {/* The practice already knows what each animal is on, so nobody
              should have to remember a brand and a bag size to reorder it.
              Food and medication sit in one list per animal: a household
              ordering both orders once. Each row carries when it runs out,
              which is the thing that decides whether you tick it. */}
          <ul className="picks">
            {onFile.map((option) => {
              const chosen = picked[option.id];
              const group = `${option.petId}:${option.kind}`;
              const heading =
                group !== lastGroup
                  ? `${option.petName} · ${KIND_NAME[option.kind]}`
                  : null;
              lastGroup = group;

              return (
                <li key={option.id} className={heading ? 'pick pick-first' : 'pick'}>
                  {heading && <span className="pick-pet">{heading}</span>}

                  <label className="pick-choice">
                    <input
                      type="checkbox"
                      checked={Boolean(chosen)}
                      onChange={() => toggle(option)}
                    />
                    <span className="pick-text">
                      <span className="pick-name">{option.label}</span>
                      {option.detail && (
                        <span className={option.soon ? 'pick-detail pick-soon' : 'pick-detail'}>
                          {option.detail}
                        </span>
                      )}
                    </span>
                  </label>

                  {chosen && (
                    <input
                      className="pick-qty"
                      value={chosen.quantity}
                      aria-label={`How much ${option.label} for ${option.petName}?`}
                      onChange={(e) => setQuantity(option.id, e.target.value)}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <h2 className="field-label">Something else</h2>

          {extras.map((extra, i) => (
            <div key={i} className="pick-extra">
              <input
                value={extra.item}
                aria-label={`Something else, ${i + 1}`}
                placeholder="Royal Canin Renal, 6kg"
                onChange={(e) => editExtra(i, { item: e.target.value })}
              />
              <input
                className="pick-qty"
                value={extra.quantity}
                aria-label={`How much of ${extra.item || `item ${i + 1}`}?`}
                placeholder="1 bag"
                onChange={(e) => editExtra(i, { quantity: e.target.value })}
              />
              <select
                value={extra.kind ?? 'food'}
                aria-label={`Is ${extra.item || `item ${i + 1}`} food or medication?`}
                onChange={(e) =>
                  editExtra(i, { kind: e.target.value as 'food' | 'medication' })
                }
              >
                <option value="food">Food</option>
                <option value="medication">Medication</option>
              </select>
              <select
                value={extra.pet_id ?? ''}
                aria-label={`Which animal is ${extra.item || `item ${i + 1}`} for?`}
                onChange={(e) => editExtra(i, { pet_id: e.target.value || null })}
              >
                <option value="">Which animal?</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="ghost"
                onClick={() => setExtras((c) => c.filter((_, n) => n !== i))}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="ghost"
            onClick={() =>
              setExtras((c) => [...c, { item: '', quantity: '', pet_id: null, kind: 'food' }])
            }
          >
            {extras.length === 0 ? 'Add something not on file' : 'Add another'}
          </button>

          <label htmlFor="note">Anything else? (optional)</label>
          <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />

          <button type="submit" disabled={saving || items.length === 0}>
            {saving
              ? 'Sending…'
              : items.length > 1
                ? `Send request for ${items.length} things`
                : 'Send request'}
          </button>

          {items.length === 0 && (
            <p className="muted">Tick at least one thing to send a request.</p>
          )}
        </form>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  );
}
