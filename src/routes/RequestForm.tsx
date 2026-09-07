import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { relativeWhen, isSoon, daysUntil } from '../lib/dates';
import type { Pet, PetFood, PetMedication, RequestItem, RequestType } from '../lib/types';

const KG = 1000;

const COPY: Record<'food' | 'medication', {
  title: string;
  hint: string;
  none: string;
  otherPlaceholder: string;
  qtyPlaceholder: string;
}> = {
  food: {
    title: 'Order food',
    hint: 'Everything your animals are on is here. Tick what you need.',
    none: 'No food on file yet, so tell us what you feed and we will add it.',
    otherPlaceholder: 'Royal Canin Renal, 6kg',
    qtyPlaceholder: '1 bag',
  },
  medication: {
    title: 'Request medication',
    hint: 'Everything your animals are on is here. Refills need a vet to approve them, so this may take a day.',
    none: 'Nothing on file yet, so tell us what you need and we will look it up.',
    otherPlaceholder: 'Apoquel 16mg',
    qtyPlaceholder: '30 day supply',
  },
};

/** One thing the practice already knows an animal is on. */
type OnFile = {
  id: string;
  petId: string;
  petName: string;
  label: string;
  detail: string;
  soon: boolean;
  defaultQty: string;
};

export default function RequestForm() {
  const { type } = useParams<{ type: string }>();
  const kind = (type === 'medication' ? 'medication' : 'food') as 'food' | 'medication';
  const copy = COPY[kind];

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

      const { data } =
        kind === 'food'
          ? await supabase
              .from('pet_foods')
              .select('id, pet_id, brand, product_name, package_size_g, depletes_on')
              .in('pet_id', ids)
              .eq('active', true)
          : await supabase
              .from('pet_medications')
              .select('id, pet_id, name, dose, frequency, days_supply, depletes_on')
              .in('pet_id', ids)
              .eq('active', true);

      if (cancelled) return;
      const rows = (data ?? []) as (PetFood & PetMedication)[];

      const mapped = rows.map((r): OnFile => {
        const runsOut = r.depletes_on
          ? `${daysUntil(r.depletes_on) < 0 ? 'ran out' : 'runs out'} ${relativeWhen(r.depletes_on)}`
          : '';

        if (kind === 'food') {
          const size = r.package_size_g ? `${Number(r.package_size_g) / KG}kg bag` : '';
          return {
            id: r.id,
            petId: r.pet_id,
            petName: nameOf.get(r.pet_id) ?? '',
            label: [r.brand, r.product_name].filter(Boolean).join(' '),
            detail: [size, runsOut].filter(Boolean).join(' · '),
            soon: isSoon(r.depletes_on),
            defaultQty: '1 bag',
          };
        }

        return {
          id: r.id,
          petId: r.pet_id,
          petName: nameOf.get(r.pet_id) ?? '',
          label: [r.name, r.dose].filter(Boolean).join(' '),
          detail: [r.frequency, runsOut].filter(Boolean).join(' · '),
          soon: isSoon(r.depletes_on),
          defaultQty: r.days_supply ? `${r.days_supply} day supply` : '',
        };
      });

      // Soonest first inside each animal, animals in the order they are listed.
      const order = new Map(list.map((p, i) => [p.id, i]));
      mapped.sort((a, b) =>
        order.get(a.petId)! - order.get(b.petId)! || a.label.localeCompare(b.label),
      );

      setOnFile(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [household, profileLoading, kind]);

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
      })),
  ];

  // A request still names one animal when every line is for the same one, so
  // the ledger and the queue keep reading as they always have. Only a genuinely
  // mixed request goes without, and the lines carry the animal themselves.
  const petIds = new Set(items.map((i) => i.pet_id).filter(Boolean));
  const singlePet = petIds.size === 1 ? [...petIds][0] : null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!household || items.length === 0) return;

    setSaving(true);
    setError(null);

    const { error: failed } = await supabase.from('requests').insert({
      household_id: household,
      pet_id: singlePet,
      type: kind as RequestType,
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
        <h1>{copy.title}</h1>
        <p className="muted">Add an animal first so we know who this is for.</p>
        <Link to="/pets"><button>Add a pet</button></Link>
      </main>
    );
  }

  let lastPet = '';

  return (
    <main>
      <Link to="/home" className="back">← Back</Link>
      <h1>{copy.title}</h1>
      <p className="muted">{copy.hint}</p>

      {loading && <p className="muted">Loading…</p>}

      {!loading && (
        <form onSubmit={submit} className="stack">
          {onFile.length === 0 && <p className="muted record-empty">{copy.none}</p>}

          {/* The practice already knows what each animal is on, so nobody
              should have to remember a brand and a bag size to reorder it.
              Every animal in the household is on one page: a four-animal
              household orders once, not four times. Each row carries when it
              runs out, which is the thing that decides whether you tick it. */}
          <ul className="picks">
            {onFile.map((option) => {
              const chosen = picked[option.id];
              const heading = option.petName !== lastPet ? option.petName : null;
              lastPet = option.petName;

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
                      placeholder={copy.qtyPlaceholder}
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
                placeholder={copy.otherPlaceholder}
                onChange={(e) => editExtra(i, { item: e.target.value })}
              />
              <input
                className="pick-qty"
                value={extra.quantity}
                aria-label={`How much of ${extra.item || `item ${i + 1}`}?`}
                placeholder={copy.qtyPlaceholder}
                onChange={(e) => editExtra(i, { quantity: e.target.value })}
              />
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
            onClick={() => setExtras((c) => [...c, { item: '', quantity: '', pet_id: null }])}
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
