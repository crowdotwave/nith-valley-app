// A stand-in for the Supabase client, used only in demo mode.
//
// It answers the exact calls this app makes (see the query chains in src/)
// from the invented practice in ./seed.ts, held in memory. Nothing leaves the
// browser tab, a Start over puts it back, and there is no password or key to
// leak, which is the point: the demo can be shown to anyone, recorded for the
// website, and driven by end-to-end tests without touching the real project.
//
// It is not a database. It implements the handful of PostgREST features the
// app uses, and the few server-side rules a demo would visibly miss:
//   * request status changes are written to request_events (migration 0004)
//   * redemptions get a code, are refused without enough points, and write the
//     ledger debit when confirmed (0012)
//   * food and medication run-out dates are computed (0001)
//   * points_balances is the sum of the ledger
//   * a client reads only their own household, roughly as RLS would.
// It does NOT prove RLS. That is the job of tests against a real database.

import { buildSeed, withDepletion, demoId, DEMO_CLIENT_ID, DEMO_STAFF_ID, type Row, type Tables } from './seed';

export type DemoRole = 'client' | 'staff';

type Result = { data: any; error: { message: string } | null; count: number | null; status: number };
type Filter = (row: Row) => boolean;

const now = () => new Date().toISOString();
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Split "a, b(c, d), e" on top-level commas only. */
function splitTop(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of list) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Compare the way Postgres would for the values this app filters on. */
function cmp(a: any, b: any): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a) < String(b) ? -1 : 1;
}

function coerce(raw: string): any {
  if (raw === 'null') return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return raw;
}

/** The one `.or()` shape the app uses: "col.op.value,col.op.value". */
function parseOr(expr: string): Filter {
  const parts = expr.split(',').map((p) => {
    const [col, op, ...rest] = p.split('.');
    const value = coerce(rest.join('.'));
    return (row: Row) => {
      const v = row[col];
      switch (op) {
        case 'is': return value === null ? v === null || v === undefined : v === value;
        case 'eq': return v === value;
        case 'lte': return v !== null && v !== undefined && cmp(v, value) <= 0;
        case 'gte': return v !== null && v !== undefined && cmp(v, value) >= 0;
        case 'lt': return v !== null && v !== undefined && cmp(v, value) < 0;
        case 'gt': return v !== null && v !== undefined && cmp(v, value) > 0;
        default: throw new Error(`demo: unsupported or() operator ${op}`);
      }
    };
  });
  return (row) => parts.some((f) => f(row));
}

const DATA_KEY = 'nv-demo-data-v1';

export class DemoStore {
  tables: Tables;
  objects = new Map<string, string>();
  constructor(public role: DemoRole) {
    this.tables = this.restore() ?? buildSeed();
  }

  /** The practice outlives a switch between client and desk within the tab, so
   *  a request sent as the client is waiting when the desk view opens. */
  private restore(): Tables | null {
    try {
      const saved = sessionStorage.getItem(DATA_KEY);
      return saved ? (JSON.parse(saved) as Tables) : null;
    } catch {
      return null;
    }
  }

  save() {
    try { sessionStorage.setItem(DATA_KEY, JSON.stringify(this.tables)); } catch { /* storage full or blocked */ }
  }

  get userId() {
    return this.role === 'staff' ? DEMO_STAFF_ID : DEMO_CLIENT_ID;
  }

  get householdId(): string | null {
    return this.tables.profiles.find((p) => p.id === this.userId)?.household_id ?? null;
  }

  /** Rows a client could see, roughly as the RLS policies allow. Staff see all. */
  visible(table: string): Row[] {
    const rows = table === 'points_balances' ? this.balances() : this.tables[table] ?? [];
    if (this.role === 'staff') return rows;
    const hh = this.householdId;
    const ownPets = new Set(this.tables.pets.filter((p) => p.household_id === hh).map((p) => p.id));
    return rows.filter((r) => {
      if (table === 'households') return r.id === hh;
      if (table === 'profiles') return r.id === this.userId || r.household_id === hh;
      if ('household_id' in r) return r.household_id === hh;
      if ('pet_id' in r && ['pet_foods', 'pet_medications', 'pet_vaccinations', 'reminders'].includes(table)) return ownPets.has(r.pet_id);
      if (table === 'request_events') {
        return this.tables.requests.some((q) => q.id === r.request_id && q.household_id === hh);
      }
      return true; // rewards, earn_rules, clinic_hours, notices: readable by any signed in client
    });
  }

  balances(): Row[] {
    const sums = new Map<string, number>();
    for (const r of this.tables.points_ledger) sums.set(r.household_id, (sums.get(r.household_id) ?? 0) + r.delta);
    return [...sums].map(([household_id, balance]) => ({ household_id, balance }));
  }

  /** Resolve "pets(name)" style embeds by the conventional foreign key. */
  project(row: Row, columns: string): Row {
    const parts = splitTop(columns || '*');
    const out: Row = {};
    for (const part of parts) {
      const embed = part.match(/^(\w+)\((.*)\)$/);
      if (embed) {
        const [, rel, inner] = embed;
        const fk = `${rel.replace(/s$/, '')}_id`;
        const target = (this.tables[rel] ?? []).find((t) => t.id === row[fk]);
        out[rel] = target ? this.project(target, inner) : null;
      } else if (part === '*') {
        Object.assign(out, row);
      } else {
        out[part] = row[part] ?? null;
      }
    }
    return out;
  }

  // Server-side rules ------------------------------------------------------

  beforeInsert(table: string, row: Row): Row | { error: string } {
    const base: Row = { id: row.id ?? demoId(), created_at: now(), ...row };
    switch (table) {
      case 'requests':
        return { status: 'submitted', staff_note: null, assigned_to: null, updated_at: now(), ...base };
      case 'reminders':
        return { snoozed_until: null, completed_at: null, notified_at: null, notify_days_before: 10, ...base };
      case 'pets':
        return { archived_at: null, photo_path: null, sex: null, updated_at: now(), ...base };
      case 'photo_submissions':
        return { status: 'pending', ...base };
      case 'pet_foods':
      case 'pet_medications':
        return withDepletion(table, { active: true, updated_at: now(), ...base });
      case 'redemptions': {
        const earned = this.balances().find((b) => b.household_id === base.household_id)?.balance ?? 0;
        const held = this.tables.redemptions
          .filter((r) => r.household_id === base.household_id && r.status === 'pending')
          .reduce((s, r) => s + r.points_cost, 0);
        if (earned - held < base.points_cost) {
          return { error: `Not enough points: ${earned - held} available, ${base.points_cost} needed` };
        }
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        return { status: 'pending', confirmed_by: null, confirmed_at: null, code, ...base };
      }
      default:
        return base;
    }
  }

  afterUpdate(table: string, before: Row, after: Row) {
    if (table === 'requests' && before.status !== after.status) {
      after.updated_at = now();
      this.tables.request_events.push({
        id: demoId(), request_id: after.id, from_status: before.status, to_status: after.status,
        actor_id: this.userId, note: after.staff_note ?? null, created_at: now(),
      });
    }
    if (table === 'requests' && before.staff_note !== after.staff_note) after.updated_at = now();
    if (table === 'redemptions' && before.status !== after.status) {
      const label = this.tables.rewards.find((r) => r.id === after.reward_id)?.label ?? 'Reward';
      const ledger = (delta: number, reason: string) =>
        this.tables.points_ledger.push({
          id: demoId(), household_id: after.household_id, delta, reason, earn_rule_id: null,
          redemption_id: after.id, pet_id: null, staff_id: this.userId, expires_on: null, created_at: now(),
        });
      if (after.status === 'confirmed') {
        after.confirmed_by = this.userId;
        after.confirmed_at = now();
        ledger(-after.points_cost, label);
      } else if (before.status === 'confirmed' && after.status === 'cancelled') {
        ledger(after.points_cost, `Cancelled: ${label}`);
      }
    }
  }
}

class DemoQuery implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private columns = '*';
  private returning = false;
  private filters: Filter[] = [];
  private orders: { col: string; asc: boolean }[] = [];
  private max: number | null = null;
  private one: 'single' | 'maybe' | null = null;
  private head = false;
  private counting = false;
  private payload: any = null;
  private conflictKey = 'id';

  constructor(private store: DemoStore, private table: string) {}

  select(columns = '*', opts?: { count?: string; head?: boolean }) {
    if (this.op === 'select') this.columns = columns;
    else { this.returning = true; this.columns = columns; }
    if (opts?.count) this.counting = true;
    if (opts?.head) this.head = true;
    return this;
  }
  insert(values: Row | Row[]) { this.op = 'insert'; this.payload = values; return this; }
  update(values: Row) { this.op = 'update'; this.payload = values; return this; }
  upsert(values: Row | Row[], opts?: { onConflict?: string }) {
    this.op = 'upsert';
    this.payload = values;
    this.conflictKey = opts?.onConflict ?? (this.table === 'clinic_hours' ? 'position' : 'id');
    return this;
  }
  delete() { this.op = 'delete'; return this; }

  eq(col: string, value: any) { this.filters.push((r) => r[col] === value); return this; }
  neq(col: string, value: any) { this.filters.push((r) => r[col] !== value); return this; }
  in(col: string, values: any[]) { const set = new Set(values); this.filters.push((r) => set.has(r[col])); return this; }
  is(col: string, value: any) {
    this.filters.push((r) => (value === null ? r[col] === null || r[col] === undefined : r[col] === value));
    return this;
  }
  lte(col: string, v: any) { this.filters.push((r) => r[col] != null && cmp(r[col], v) <= 0); return this; }
  gte(col: string, v: any) { this.filters.push((r) => r[col] != null && cmp(r[col], v) >= 0); return this; }
  lt(col: string, v: any) { this.filters.push((r) => r[col] != null && cmp(r[col], v) < 0); return this; }
  gt(col: string, v: any) { this.filters.push((r) => r[col] != null && cmp(r[col], v) > 0); return this; }
  or(expr: string) { this.filters.push(parseOr(expr)); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orders.push({ col, asc: opts?.ascending ?? true }); return this; }
  limit(n: number) { this.max = n; return this; }
  single() { this.one = 'single'; return this; }
  maybeSingle() { this.one = 'maybe'; return this; }

  then<A = Result, B = never>(ok?: ((r: Result) => A | PromiseLike<A>) | null, fail?: ((e: any) => B | PromiseLike<B>) | null) {
    // A short pause, so loading states render the way they do against a network.
    return new Promise<Result>((resolve) => setTimeout(() => resolve(this.run()), 60)).then(ok, fail);
  }

  private matches(row: Row) {
    return this.filters.every((f) => f(row));
  }

  private shape(rows: Row[]): Result {
    let out = rows;
    for (const { col, asc } of [...this.orders].reverse()) {
      out = [...out].sort((a, b) => (asc ? cmp(a[col], b[col]) : cmp(b[col], a[col])));
    }
    const count = out.length;
    if (this.max !== null) out = out.slice(0, this.max);
    const data = out.map((r) => this.store.project(r, this.columns));
    if (this.head) return { data: null, error: null, count, status: 200 };
    if (this.one) {
      if (data.length === 1) return { data: clone(data[0]), error: null, count: this.counting ? count : null, status: 200 };
      if (data.length === 0 && this.one === 'maybe') return { data: null, error: null, count: null, status: 200 };
      return { data: null, error: { message: `JSON object requested, ${data.length} rows returned` }, count: null, status: 406 };
    }
    return { data: clone(data), error: null, count: this.counting ? count : null, status: 200 };
  }

  private run(): Result {
    const store = this.store;
    const all = store.tables[this.table];
    if (this.table !== 'points_balances' && !all) {
      return { data: null, error: { message: `demo: no table ${this.table}` }, count: null, status: 404 };
    }

    if (this.op === 'select') return this.shape(store.visible(this.table).filter((r) => this.matches(r)));
    const result = this.write();
    store.save();
    return result;
  }

  private write(): Result {
    const store = this.store;
    const all = store.tables[this.table];

    if (this.op === 'insert' || this.op === 'upsert') {
      const values: Row[] = Array.isArray(this.payload) ? this.payload : [this.payload];
      const written: Row[] = [];
      for (const v of values) {
        const existing = this.op === 'upsert' ? all.find((r) => r[this.conflictKey] === v[this.conflictKey]) : undefined;
        if (existing) {
          const before = { ...existing };
          Object.assign(existing, v);
          store.afterUpdate(this.table, before, existing);
          written.push(existing);
          continue;
        }
        const row = store.beforeInsert(this.table, { ...v });
        if ('error' in row) return { data: null, error: { message: String(row.error) }, count: null, status: 400 };
        all.push(row);
        written.push(row);
      }
      return this.returning ? this.shape(written) : { data: null, error: null, count: null, status: 201 };
    }

    // update and delete act on what this user could see, as RLS would.
    const visible = new Set(store.visible(this.table));
    const targets = all.filter((r) => visible.has(r) && this.matches(r));

    if (this.op === 'update') {
      for (const row of targets) {
        const before = { ...row };
        Object.assign(row, this.payload);
        store.afterUpdate(this.table, before, row);
      }
      return this.returning ? this.shape(targets) : { data: null, error: null, count: null, status: 204 };
    }

    store.tables[this.table] = all.filter((r) => !targets.includes(r));
    return { data: null, error: null, count: null, status: 204 };
  }
}

/** A small placeholder image for any demo photo, so nothing renders broken. */
function placeholder(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f4f7fa"/><text x="200" y="215" font-family="Arial, sans-serif" font-size="28" fill="#5f7590" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createDemoClient(role: DemoRole) {
  const store = new DemoStore(role);
  const profile = store.tables.profiles.find((p) => p.id === store.userId)!;
  const session = {
    access_token: 'demo',
    token_type: 'bearer',
    expires_in: 86_400,
    refresh_token: 'demo',
    user: { id: profile.id, email: profile.email, role: 'authenticated', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: profile.created_at },
  };

  const client = {
    from: (table: string) => new DemoQuery(store, table),
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      onAuthStateChange: (_cb: (event: string, s: unknown) => void) => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      signInWithOtp: async () => ({ data: {}, error: null }),
      signOut: async () => {
        leaveDemo();
        return { error: null };
      },
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string, file: Blob) => {
          store.objects.set(path, URL.createObjectURL(file));
          return { data: { path }, error: null };
        },
        createSignedUrl: async (path: string, _expires: number) => ({
          data: { signedUrl: store.objects.get(path) ?? placeholder('Demo photo') },
          error: null,
        }),
        remove: async (paths: string[]) => {
          paths.forEach((p) => store.objects.delete(p));
          return { data: [], error: null };
        },
      }),
    },
  };

  return client;
}

// Switching in and out ------------------------------------------------------

const KEY = 'nv-demo-role';

/**
 * Demo mode is opened by a link: `?demo=client` or `?demo=staff`. It is kept
 * for the tab (sessionStorage), so moving around the app keeps it, and it is
 * never the fallback for anything: a real deploy with a failing network is
 * signed out, not quietly shown sample data.
 */
export function demoRole(): DemoRole | null {
  if (typeof window === 'undefined') return null;
  const asked = new URLSearchParams(window.location.search).get('demo');
  try {
    if (asked === 'client' || asked === 'staff') sessionStorage.setItem(KEY, asked);
    if (asked === 'off') sessionStorage.removeItem(KEY);
    const kept = sessionStorage.getItem(KEY);
    return kept === 'client' || kept === 'staff' ? kept : null;
  } catch {
    return asked === 'client' || asked === 'staff' ? asked : null;
  }
}

/** Open the demo as the other side of the counter, same sample practice. */
export function switchDemo(role: DemoRole) {
  const url = new URL(window.location.href);
  url.searchParams.set('demo', role);
  url.hash = '#/';
  window.location.assign(url.toString());
}

/** Put the sample practice back the way it started. */
export function restartDemo() {
  try { sessionStorage.removeItem(DATA_KEY); } catch { /* private mode */ }
  window.location.reload();
}

export function leaveDemo() {
  try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(DATA_KEY); } catch { /* private mode */ }
  const url = new URL(window.location.href);
  url.searchParams.delete('demo');
  url.hash = '';
  window.location.assign(url.toString());
}
