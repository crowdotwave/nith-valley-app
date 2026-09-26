// The demo practice. Everything here is invented: no person, animal, phone
// number or address in this file belongs to anyone real. It is built fresh on
// every page load, with dates relative to today, so a demo run in March reads
// exactly like one run today: food is always nearly out, a booster is always
// coming up, and one refill is always waiting on the desk.
//
// The story it is shaped around matches supabase/demo-reset.sql on the live
// project, with a different household. That one belongs to a real family and
// this file is public.

export type Row = Record<string, any>;
export type Tables = Record<string, Row[]>;

export const DEMO_CLIENT_ID = 'de000000-0000-4000-8000-00000000c001';
export const DEMO_STAFF_ID = 'de000000-0000-4000-8000-00000000d001';

const H_HARPER = 'de000000-0000-4000-8000-0000000000a1';
const H_OKAFOR = 'de000000-0000-4000-8000-0000000000b2';
const H_LINDQVIST = 'de000000-0000-4000-8000-0000000000b3';

const BISCUIT = 'de000000-0000-4000-8000-0000000000e1';
const MAPLE = 'de000000-0000-4000-8000-0000000000e2';
const JUNIPER = 'de000000-0000-4000-8000-0000000000e3';
const PEPPER = 'de000000-0000-4000-8000-0000000000e4';
const RUFUS = 'de000000-0000-4000-8000-0000000000e5';
const MOCHI = 'de000000-0000-4000-8000-0000000000e6';

let counter = 0;
/** Stable-looking ids without needing crypto, so the seed also runs in tests. */
export function demoId(): string {
  counter += 1;
  const tail = (Date.now().toString(16) + counter.toString(16).padStart(6, '0')).slice(-12);
  return `de000000-0000-4000-9000-${tail.padStart(12, '0')}`;
}

const DAY = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const daysFromNow = (n: number) => isoDay(new Date(Date.now() + n * DAY));
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const daysAgo = (n: number) => ago(n * DAY);

/** The database computes these as generated columns; so does the demo. */
export function withDepletion(table: string, row: Row): Row {
  if (table === 'pet_foods') {
    const { last_purchased_on: from, package_size_g: size, daily_amount_g: daily } = row;
    row.depletes_on =
      from && size && daily
        ? isoDay(new Date(Date.parse(from) + Math.floor(size / daily) * DAY))
        : null;
  }
  if (table === 'pet_medications') {
    const { last_filled_on: from, days_supply: supply } = row;
    row.depletes_on = from && supply ? isoDay(new Date(Date.parse(from) + supply * DAY)) : null;
  }
  return row;
}

export function buildSeed(): Tables {
  const earnRules = [
    { id: 'de000000-0000-4000-8000-00000000f001', code: 'rx_refill', label: 'Prescription refill', points: 10, active: true },
    { id: 'de000000-0000-4000-8000-00000000f002', code: 'food_bag', label: 'Bag of food', points: 15, active: true },
    { id: 'de000000-0000-4000-8000-00000000f003', code: 'preventative', label: 'Flea/tick/heartworm', points: 10, active: true },
    { id: 'de000000-0000-4000-8000-00000000f004', code: 'annual_exam', label: 'Annual wellness exam', points: 25, active: true },
    { id: 'de000000-0000-4000-8000-00000000f005', code: 'dental', label: 'Dental procedure', points: 50, active: true },
  ].map((r) => ({ ...r, created_at: daysAgo(200) }));
  const rule = (code: string) => earnRules.find((r) => r.code === code)!;

  const rewards = [
    { id: 'de000000-0000-4000-8000-00000000c0a1', label: 'Free nail trim', points_cost: 100, active: true },
    { id: 'de000000-0000-4000-8000-00000000c0a2', label: '$10 off an exam', points_cost: 150, active: true },
    { id: 'de000000-0000-4000-8000-00000000c0a3', label: '$25 off a dental', points_cost: 400, active: true },
  ].map((r) => ({ ...r, created_at: daysAgo(200) }));

  const households = [
    { id: H_HARPER, name: 'Harper', created_at: daysAgo(300) },
    { id: H_OKAFOR, name: 'Okafor', created_at: daysAgo(120) },
    { id: H_LINDQVIST, name: 'Lindqvist', created_at: daysAgo(60) },
  ];

  const profiles = [
    { id: DEMO_CLIENT_ID, household_id: H_HARPER, email: 'sam.harper@example.com', full_name: 'Sam Harper', phone: '519-555-0142', role: 'client', avatar_path: null },
    { id: 'de000000-0000-4000-8000-00000000c002', household_id: H_OKAFOR, email: 'dele.okafor@example.com', full_name: 'Dele Okafor', phone: '519-555-0178', role: 'client', avatar_path: null },
    { id: 'de000000-0000-4000-8000-00000000c003', household_id: H_LINDQVIST, email: 'ingrid.l@example.com', full_name: 'Ingrid Lindqvist', phone: '519-555-0115', role: 'client', avatar_path: null },
    { id: DEMO_STAFF_ID, household_id: null, email: 'desk@example.com', full_name: 'Front desk', phone: null, role: 'staff', avatar_path: null },
  ].map((p) => ({ ...p, created_at: daysAgo(300), updated_at: daysAgo(300) }));

  const pet = (id: string, household_id: string, name: string, species: string, breed: string, dob: string) => ({
    id, household_id, name, species, breed, sex: null, date_of_birth: dob, photo_path: null,
    pims_patient_ref: null, created_at: daysAgo(280), updated_at: daysAgo(30), archived_at: null,
  });
  const pets = [
    pet(BISCUIT, H_HARPER, 'Biscuit', 'dog', 'Yorkshire Terrier', '2022-05-14'),
    pet(MAPLE, H_HARPER, 'Maple', 'dog', 'Shih-poo', '2013-03-02'),
    pet(JUNIPER, H_HARPER, 'Juniper', 'cat', 'Domestic Longhair', '2020-08-19'),
    pet(PEPPER, H_HARPER, 'Pepper', 'cat', 'Calico', '2019-11-05'),
    pet(RUFUS, H_OKAFOR, 'Rufus', 'dog', 'Labrador Retriever', '2018-04-22'),
    pet(MOCHI, H_LINDQVIST, 'Mochi', 'cat', 'Ragdoll', '2021-01-09'),
  ];

  // Bag size over daily amount sets how long a bag lasts, and the purchase date
  // is back-dated so each one runs out a few days from now.
  const food = (pet_id: string, brand: string, product_name: string, size: number, daily: number, runsOutIn: number) =>
    withDepletion('pet_foods', {
      id: demoId(), pet_id, brand, product_name, package_size_g: size, daily_amount_g: daily,
      last_purchased_on: daysFromNow(runsOutIn - Math.floor(size / daily)), active: true,
      created_at: daysAgo(60), updated_at: daysAgo(60),
    });
  const pet_foods = [
    food(BISCUIT, 'Royal Canin', 'X-Small Adult', 1500, 70, 4),
    food(MAPLE, "Hill's Science Diet", 'Small Paws 7+', 2000, 85, 9),
    food(JUNIPER, 'Royal Canin', 'Maine Coon Adult', 2000, 65, 12),
    food(PEPPER, 'Royal Canin', 'Urinary SO', 3000, 55, 20),
    food(RUFUS, 'Purina Pro Plan', 'Large Breed Adult', 13600, 400, 3),
  ];

  const med = (pet_id: string, name: string, dose: string, frequency: string, supply: number, runsOutIn: number, preventative: boolean) =>
    withDepletion('pet_medications', {
      id: demoId(), pet_id, name, dose, frequency, days_supply: supply,
      last_filled_on: daysFromNow(runsOutIn - supply), is_preventative: preventative, active: true,
      created_at: daysAgo(60), updated_at: daysAgo(60),
    });
  const pet_medications = [
    med(BISCUIT, 'NexGard', '11.3 mg', 'Monthly', 30, 3, true),
    med(MAPLE, 'Galliprant', '20 mg', 'Once daily', 30, 6, false),
    med(JUNIPER, 'Revolution Plus', '1 tube', 'Monthly', 30, 10, true),
    med(MOCHI, 'Gabapentin', '50 mg', 'Twice daily', 60, 8, false),
  ];

  const vax = (pet_id: string, vaccine_name: string, given: string, next: string | null) => ({
    id: demoId(), pet_id, vaccine_name, administered_on: given, next_due_on: next, entered_by: DEMO_STAFF_ID, created_at: daysAgo(90),
  });
  const pet_vaccinations = [
    vax(BISCUIT, 'Rabies', '2025-05-20', '2028-05-20'),
    vax(BISCUIT, 'DHPP', daysFromNow(14 - 365), daysFromNow(14)),
    vax(MAPLE, 'Rabies', '2024-09-11', '2027-09-11'),
    vax(JUNIPER, 'FVRCP', daysFromNow(40 - 365), daysFromNow(40)),
    vax(PEPPER, 'Rabies', '2025-07-03', '2028-07-03'),
    vax(RUFUS, 'Rabies', '2024-04-30', '2027-04-30'),
  ];

  const reminder = (pet_id: string, type: string, title: string, due_on: string, source: string) => ({
    id: demoId(), pet_id, type, title, due_on, notify_days_before: 10, source, created_by: null,
    snoozed_until: null, completed_at: null, notified_at: null, created_at: daysAgo(5),
  });
  const reminders = [
    reminder(MAPLE, 'exam', 'Senior wellness exam', daysFromNow(6), 'staff'),
    reminder(BISCUIT, 'vaccine', 'DHPP booster', daysFromNow(14), 'staff'),
    reminder(PEPPER, 'recheck', 'Urinary recheck', daysFromNow(18), 'staff'),
    ...pet_foods.map((f) => reminder(f.pet_id, 'food', `${f.brand} ${f.product_name} running low`, f.depletes_on, 'auto')),
    ...pet_medications.map((m) =>
      reminder(m.pet_id, m.is_preventative ? 'preventative' : 'medication', `${m.name} running low`, m.depletes_on, 'auto'),
    ),
  ];

  const item = (pet_id: string, petName: string, kind: 'food' | 'medication', name: string, quantity: string) => ({
    item: name, quantity, pet_id, pet: petName, kind,
  });
  const request = (household_id: string, pet_id: string | null, type: string, status: string,
    items: Row[], client_note: string | null, staff_note: string | null, createdMsAgo: number) => ({
    id: demoId(), household_id, pet_id, type, status, details: { items }, client_note, staff_note,
    created_by: null, assigned_to: null, created_at: ago(createdMsAgo), updated_at: ago(Math.max(createdMsAgo / 2, 60_000)),
  });
  const HOUR = 3_600_000;
  const requests = [
    request(H_HARPER, BISCUIT, 'food', 'completed', [item(BISCUIT, 'Biscuit', 'food', 'Royal Canin X-Small Adult 1.5kg', '1 bag')], null, null, 24 * DAY),
    request(H_HARPER, MAPLE, 'medication', 'declined', [item(MAPLE, 'Maple', 'medication', 'Galliprant 20mg', '90 tablets')],
      'Can we get a bigger box?', 'Maple is due for bloodwork before we refill a 90 day supply. Give us a call and we will book her in.', 12 * DAY),
    request(H_HARPER, PEPPER, 'food', 'ready', [item(PEPPER, 'Pepper', 'food', 'Royal Canin Urinary SO 3kg', '1 bag')], null, 'Ready at the front desk', 3 * DAY),
    request(H_HARPER, JUNIPER, 'medication', 'approved', [item(JUNIPER, 'Juniper', 'medication', 'Revolution Plus', '3 pack')], null, 'Approved, in with Thursday order', 2 * DAY),
    request(H_HARPER, BISCUIT, 'food', 'in_review', [item(BISCUIT, 'Biscuit', 'food', 'Royal Canin X-Small Adult 1.5kg', '1 bag')], null, null, 1 * DAY),
    request(H_HARPER, MAPLE, 'medication', 'submitted', [item(MAPLE, 'Maple', 'medication', 'Galliprant 20mg', '30 tablets')], 'She has about a week left', null, 3 * HOUR),
    request(H_OKAFOR, RUFUS, 'food', 'submitted', [item(RUFUS, 'Rufus', 'food', 'Purina Pro Plan Large Breed Adult 13.6kg', '1 bag')], 'Picking up Saturday if that works', null, 5 * HOUR),
    request(H_LINDQVIST, MOCHI, 'medication', 'approved', [item(MOCHI, 'Mochi', 'medication', 'Gabapentin 50mg', '60 capsules')], null, null, 1.5 * DAY),
  ];

  // 135 for the Harpers: a free nail trim in reach, and $10 off an exam exactly
  // one bag of food away. The same shape the live demo household is set to.
  const ledgerRow = (household_id: string, code: string, pet_id: string, daysBack: number) => {
    const r = rule(code);
    return { id: demoId(), household_id, delta: r.points, reason: r.label, earn_rule_id: r.id, redemption_id: null,
      pet_id, staff_id: DEMO_STAFF_ID, expires_on: null, created_at: daysAgo(daysBack) };
  };
  const points_ledger = [
    ledgerRow(H_HARPER, 'annual_exam', BISCUIT, 150),
    ledgerRow(H_HARPER, 'food_bag', BISCUIT, 120),
    ledgerRow(H_HARPER, 'preventative', JUNIPER, 90),
    ledgerRow(H_HARPER, 'food_bag', JUNIPER, 88),
    ledgerRow(H_HARPER, 'rx_refill', MAPLE, 60),
    ledgerRow(H_HARPER, 'food_bag', PEPPER, 58),
    ledgerRow(H_HARPER, 'preventative', BISCUIT, 42),
    ledgerRow(H_HARPER, 'rx_refill', MAPLE, 30),
    ledgerRow(H_HARPER, 'food_bag', BISCUIT, 21),
    ledgerRow(H_HARPER, 'rx_refill', MAPLE, 12),
    ledgerRow(H_OKAFOR, 'annual_exam', RUFUS, 100),
    ledgerRow(H_OKAFOR, 'food_bag', RUFUS, 40),
    ledgerRow(H_LINDQVIST, 'rx_refill', MOCHI, 20),
  ];

  const clinic_hours = [
    ['Monday to Wednesday', '8:30 am to 5:30 pm'],
    ['Thursday', '8:30 am to 8:00 pm'],
    ['Friday', '8:30 am to 5:30 pm'],
    ['Saturday', 'By request'],
    ['Sunday', 'Closed'],
  ].map(([days, hours], i) => ({ position: i + 1, days, hours, updated_by: null, updated_at: daysAgo(14) }));

  return {
    households,
    profiles,
    pets,
    pet_foods,
    pet_medications,
    pet_vaccinations,
    reminders,
    requests,
    request_events: [],
    points_ledger,
    earn_rules: earnRules,
    rewards,
    redemptions: [],
    photo_submissions: [],
    notices: [],
    clinic_hours,
    invites: [],
    device_tokens: [],
  };
}
