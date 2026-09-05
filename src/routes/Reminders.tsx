import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../lib/useProfile';
import { relativeDue, isSoon } from '../lib/dates';
import type { Pet } from '../lib/types';

type ReminderRow = {
  id: string;
  pet_id: string;
  type: 'exam' | 'recheck' | 'vaccine' | 'food' | 'medication' | 'preventative';
  title: string;
  due_on: string;
  source: 'auto' | 'staff' | 'client';
  snoozed_until: string | null;
  pets: { name: string } | null;
};

const KIND_LABEL: Record<ReminderRow['type'], string> = {
  exam: 'Exam',
  recheck: 'Recheck',
  vaccine: 'Vaccine',
  food: 'Food',
  medication: 'Medication',
  preventative: 'Prevention',
};

// Whose reminder this is. A client can set their own, so the page has to say
// which came from the practice. A note to yourself must never read as clinical
// instruction from the clinic.
const SOURCE_LABEL: Record<ReminderRow['source'], string> = {
  auto: 'From your pet file',
  staff: 'From the clinic',
  client: 'You set this',
};

// Supply reminders are actionable in one tap; clinical ones need a booking.
const ORDERABLE: ReminderRow['type'][] = ['food', 'medication', 'preventative'];

export default function Reminders() {
  const { profile, loading: profileLoading } = useProfile();
  const isStaff = profile?.role === 'staff' || profile?.role === 'admin';
  const household = profile?.household_id;

  const [rows, setRows] = useState<ReminderRow[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    if (!household) return;

    const today = new Date().toISOString().slice(0, 10);

    // Reminders key off the pet, so the household's animals come first and
    // scope the rest. Staff can read every household's reminders; this page is
    // the client's own list and must not.
    const p = await supabase
      .from('pets')
      .select('*')
      .eq('household_id', household)
      .is('archived_at', null)
      .order('name');

    const list = (p.data ?? []) as Pet[];
    setPets(list);

    const r = await supabase
      .from('reminders')
      .select('id, pet_id, type, title, due_on, source, snoozed_until, pets(name)')
      .in('pet_id', list.map((pet) => pet.id))
      .is('completed_at', null)
      .or(`snoozed_until.is.null,snoozed_until.lte.${today}`)
      .order('due_on');

    if (r.error) setError(r.error.message);
    else setRows((r.data ?? []) as unknown as ReminderRow[]);
    setLoading(false);
  }, [household]);

  useEffect(() => {
    if (profileLoading) return;
    load();
  }, [load, profileLoading]);

  async function snooze(id: string) {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    const { error } = await supabase
      .from('reminders')
      .update({ snoozed_until: until.toISOString().slice(0, 10) })
      .eq('id', id);
    if (error) setError(error.message);
    else load();
  }

  async function done(id: string) {
    const { error } = await supabase
      .from('reminders')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) setError(error.message);
    else load();
  }

  async function addReminder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);

    const { error } = await supabase.from('reminders').insert({
      pet_id: String(d.get('pet')),
      type: String(d.get('type')),
      title: String(d.get('title')),
      due_on: String(d.get('due')),
      // A client may only ever write source 'client'; the insert policy
      // enforces it, and this keeps the app honest about it too.
      source: isStaff ? 'staff' : 'client',
      created_by: profile?.id,
    });

    if (error) setError(error.message);
    else {
      setAdding(false);
      load();
    }
  }

  return (
    <main>
      <Link to="/" className="back">← Back</Link>
      <h1>Reminders</h1>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && rows.length === 0 && (
        <p className="muted">
          Nothing coming up. Add food and medication details to a pet and we'll
          tell you before they run out.
        </p>
      )}

      <ul className="list">
        {rows.map((r) => (
          <li key={r.id} className="row">
            <span className="row-title">{r.title}</span>
            <span className="row-detail">
              {r.pets?.name ?? ''} · {KIND_LABEL[r.type]} · {SOURCE_LABEL[r.source]}
            </span>
            <span className={isSoon(r.due_on) ? 'badge' : 'row-detail'}>
              {relativeDue(r.due_on)}
            </span>

            <div className="actions">
              {ORDERABLE.includes(r.type) && (
                <Link
                  to={`/request/${r.type === 'food' ? 'food' : 'medication'}`}
                >
                  <button>Order now</button>
                </Link>
              )}
              <button className="ghost" onClick={() => snooze(r.id)}>
                Remind me later
              </button>
              <button className="ghost" onClick={() => done(r.id)}>
                Done
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Both ends of the requirement: the clinic sets reminders here, and so
          can the client. A client's own reminder is stamped source 'client' and
          labelled as theirs wherever it appears. */}
      {adding ? (
        <form onSubmit={addReminder} className="stack">
          <label htmlFor="pet">Pet</label>
          <select id="pet" name="pet" required>
            <option value="">Choose a pet…</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={isStaff ? 'exam' : 'food'}>
            <option value="exam">Exam</option>
            <option value="recheck">Recheck exam</option>
            <option value="vaccine">Vaccine</option>
            <option value="food">Food running low</option>
            <option value="medication">Medication running low</option>
            <option value="preventative">Flea, tick or heartworm</option>
          </select>

          <label htmlFor="title">What to say</label>
          <input
            id="title"
            name="title"
            required
            placeholder={isStaff ? 'Annual wellness exam due' : 'Pick up more flea treatment'}
          />

          <label htmlFor="due">Due</label>
          <input id="due" name="due" type="date" required />

          <button type="submit">Save reminder</button>
          <button type="button" className="ghost" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}>
          {isStaff ? 'Add a reminder' : 'Remind me about something'}
        </button>
      )}
    </main>
  );
}
