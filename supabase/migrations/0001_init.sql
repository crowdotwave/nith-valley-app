-- Nith Valley Animal Hospital client app
-- 0001_init: households, pets, supply tracking, requests, reminders, photos, loyalty
--
-- Access model: the HOUSEHOLD is the unit of ownership, not the user.
-- Two people can share a dog; removing someone from a household revokes
-- their access to every pet in it without touching the pet records.

create extension if not exists "pgcrypto";

-- Private schema for RLS helpers so they aren't exposed via PostgREST.
create schema if not exists app;

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

create table households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  household_id  uuid references households (id) on delete set null,
  email         text not null,
  full_name     text,
  phone         text,
  -- 'client' sees only their household. 'staff' and 'admin' see everything.
  role          text not null default 'client'
                  check (role in ('client', 'staff', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index profiles_email_key on profiles (lower(email));
create index profiles_household_idx on profiles (household_id);

-- The email is the join key back to the clinic's PIMS records. Staff match
-- app signups to real client files by it, so it must be verified at signup.
comment on column profiles.email is
  'Must match the email the clinic holds in the PIMS. Used by staff to link app accounts to client records.';

-- ---------------------------------------------------------------------------
-- Pets
-- ---------------------------------------------------------------------------

create table pets (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households (id) on delete cascade,
  name           text not null,
  species        text check (species in ('dog', 'cat', 'other')),
  breed          text,
  sex            text check (sex in ('male', 'female', 'unknown')),
  date_of_birth  date,
  photo_path     text,           -- Supabase Storage object path
  -- Optional back-reference to the PIMS. Staff-entered, never trusted for
  -- clinical decisions; it exists so staff can find the right file fast.
  pims_patient_ref text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  archived_at    timestamptz
);

create index pets_household_idx on pets (household_id) where archived_at is null;

-- ---------------------------------------------------------------------------
-- Supply tracking
--
-- This is the engine behind "your food is running out". It also doubles as
-- the pet file's diet + medication view, so the data is entered once.
-- ---------------------------------------------------------------------------

create table pet_foods (
  id                uuid primary key default gen_random_uuid(),
  pet_id            uuid not null references pets (id) on delete cascade,
  brand             text,
  product_name      text not null,
  package_size_g    numeric(10, 2) check (package_size_g > 0),
  daily_amount_g    numeric(10, 2) check (daily_amount_g > 0),
  last_purchased_on date,
  -- Predicted run-out date, derived not stored by hand. Null until we have
  -- enough information, which keeps partial setups harmless.
  depletes_on date generated always as (
    last_purchased_on
      + floor(package_size_g / nullif(daily_amount_g, 0))::int
  ) stored,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index pet_foods_depletes_idx on pet_foods (depletes_on) where active;
create index pet_foods_pet_idx on pet_foods (pet_id);

create table pet_medications (
  id             uuid primary key default gen_random_uuid(),
  pet_id         uuid not null references pets (id) on delete cascade,
  name           text not null,
  dose           text,
  frequency      text,
  last_filled_on date,
  days_supply    int check (days_supply > 0),
  -- Flea/tick/heartworm live here too; they just have a long days_supply.
  is_preventative boolean not null default false,
  depletes_on date generated always as (
    last_filled_on + days_supply
  ) stored,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index pet_medications_depletes_idx on pet_medications (depletes_on) where active;
create index pet_medications_pet_idx on pet_medications (pet_id);

-- Vaccines are STAFF-ENTRY ONLY and clients can never write to this table.
-- Filled in gradually as pets come through for appointments. Do not compute
-- next_due_on in the app; it is transcribed from the PIMS, never derived.
create table pet_vaccinations (
  id              uuid primary key default gen_random_uuid(),
  pet_id          uuid not null references pets (id) on delete cascade,
  vaccine_name    text not null,
  administered_on date not null,
  next_due_on     date,
  entered_by      uuid references profiles (id),
  created_at      timestamptz not null default now()
);

create index pet_vaccinations_pet_idx on pet_vaccinations (pet_id);

-- ---------------------------------------------------------------------------
-- Requests (food, medication)
--
-- One table with a type discriminator: the staff console is a single queue,
-- and three near-identical tables would only make that harder to build.
-- ---------------------------------------------------------------------------

create table requests (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  pet_id       uuid references pets (id) on delete set null,
  type         text not null check (type in ('food', 'medication', 'other')),
  status       text not null default 'submitted'
                 check (status in ('submitted', 'in_review', 'approved',
                                   'ready', 'completed', 'declined')),
  -- Line items and free text. Shape varies by type, so it stays loose.
  details      jsonb not null default '{}'::jsonb,
  client_note  text,
  staff_note   text,
  created_by   uuid references profiles (id),
  assigned_to  uuid references profiles (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index requests_queue_idx on requests (status, created_at)
  where status in ('submitted', 'in_review', 'approved');
create index requests_household_idx on requests (household_id, created_at desc);

-- Audit trail. Medication requests need a defensible record of who approved
-- what and when, so status changes are logged rather than just overwritten.
create table request_events (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references requests (id) on delete cascade,
  from_status text,
  to_status   text not null,
  actor_id    uuid references profiles (id),
  note        text,
  created_at  timestamptz not null default now()
);

create index request_events_request_idx on request_events (request_id, created_at);

-- ---------------------------------------------------------------------------
-- Reminders
--
-- Both "front" (client-visible, some auto-generated from supply tracking)
-- and "back" (staff-created for a specific client).
-- ---------------------------------------------------------------------------

create table reminders (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references pets (id) on delete cascade,
  type          text not null check (type in ('exam', 'recheck', 'vaccine',
                                              'food', 'medication', 'preventative')),
  title         text not null,
  due_on        date not null,
  notify_days_before int not null default 10 check (notify_days_before >= 0),
  source        text not null default 'staff' check (source in ('auto', 'staff')),
  created_by    uuid references profiles (id),
  snoozed_until date,
  completed_at  timestamptz,
  notified_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index reminders_due_idx on reminders (due_on)
  where completed_at is null;
create index reminders_pet_idx on reminders (pet_id)
  where completed_at is null;

-- ---------------------------------------------------------------------------
-- Social media photo submissions
-- ---------------------------------------------------------------------------

create table photo_submissions (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households (id) on delete cascade,
  pet_id         uuid references pets (id) on delete set null,
  storage_path   text not null,
  caption        text,
  -- Consent is captured at submit time and the wording version is recorded,
  -- so a release can still be evidenced after the terms are reworded.
  consent_granted boolean not null default false,
  consent_version text,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected', 'used')),
  reviewed_by    uuid references profiles (id),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),

  constraint photo_requires_consent check (consent_granted)
);

create index photo_submissions_queue_idx on photo_submissions (status, created_at)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- Loyalty points
--
-- Points accrue per QUALIFYING EVENT, not per dollar; staff tap one button
-- at checkout instead of keying in invoice totals that nobody can reconcile
-- against the PIMS.
-- ---------------------------------------------------------------------------

create table earn_rules (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,     -- e.g. 'rx_refill'
  label      text not null,            -- e.g. 'Prescription refill'
  points     int not null check (points > 0),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table rewards (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,           -- e.g. 'Free nail trim'
  points_cost int not null check (points_cost > 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table redemptions (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  reward_id    uuid not null references rewards (id),
  points_cost  int not null,           -- captured at redemption time
  code         text not null unique,   -- short code the client shows at the desk
  status       text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  confirmed_by uuid references profiles (id),
  confirmed_at timestamptz,
  created_at   timestamptz not null default now()
);

create index redemptions_household_idx on redemptions (household_id, created_at desc);

-- Append-only. The balance is always sum(delta), never a stored column that
-- can drift. Corrections are offsetting rows, so every point is explainable.
create table points_ledger (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households (id) on delete cascade,
  delta         int not null check (delta <> 0),
  reason        text not null,
  earn_rule_id  uuid references earn_rules (id),
  redemption_id uuid references redemptions (id),
  pet_id        uuid references pets (id) on delete set null,
  staff_id      uuid references profiles (id),
  expires_on    date,
  created_at    timestamptz not null default now()
);

create index points_ledger_household_idx on points_ledger (household_id, created_at desc);

-- Append-only is enforced by privilege, not by RULEs: rules also rewrite the
-- referential-integrity queries behind foreign keys and break cascade deletes.
-- RLS grants no UPDATE or DELETE policy here, and this makes it explicit.
revoke update, delete on points_ledger from authenticated, anon;

-- security_invoker so the view respects points_ledger's RLS. Without it a
-- client could read every household's balance through this view.
create view points_balances with (security_invoker = true) as
  select household_id, sum(delta)::int as balance
  from points_ledger
  where expires_on is null or expires_on >= current_date
  group by household_id;

-- ---------------------------------------------------------------------------
-- Push notification tokens
-- ---------------------------------------------------------------------------

create table device_tokens (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  token       text not null unique,
  platform    text not null check (platform in ('ios', 'android', 'web')),
  created_at  timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index device_tokens_profile_idx on device_tokens (profile_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'pets', 'pet_foods', 'pet_medications', 'requests'
  ] loop
    execute format(
      'create trigger %I_touch before update on %I
         for each row execute function app.touch_updated_at()', t, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS helpers
--
-- These are SECURITY DEFINER so that a policy on `profiles` can read
-- `profiles` without recursing into its own policy.
-- ---------------------------------------------------------------------------

create or replace function app.household_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select household_id from public.profiles where id = (select auth.uid());
$$;

create or replace function app.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('staff', 'admin')
  );
$$;

create or replace function app.owns_pet(p uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.pets
    where id = p and household_id = app.household_id()
  );
$$;

revoke all on function app.household_id(), app.is_staff(), app.owns_pet(uuid)
  from public, anon;
grant execute on function app.household_id(), app.is_staff(), app.owns_pet(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Default posture: a client can read and write only within their household;
-- staff can do everything. Anything clinical or financial is staff-write-only.
-- ---------------------------------------------------------------------------

alter table households        enable row level security;
alter table profiles          enable row level security;
alter table pets              enable row level security;
alter table pet_foods         enable row level security;
alter table pet_medications   enable row level security;
alter table pet_vaccinations  enable row level security;
alter table requests          enable row level security;
alter table request_events    enable row level security;
alter table reminders         enable row level security;
alter table photo_submissions enable row level security;
alter table earn_rules        enable row level security;
alter table rewards           enable row level security;
alter table redemptions       enable row level security;
alter table points_ledger     enable row level security;
alter table device_tokens     enable row level security;

-- Households -----------------------------------------------------------------
create policy households_read on households for select to authenticated
  using (id = app.household_id() or app.is_staff());
create policy households_staff_write on households for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Profiles -------------------------------------------------------------------
create policy profiles_read_self on profiles for select to authenticated
  using (id = (select auth.uid()) or household_id = app.household_id() or app.is_staff());
create policy profiles_update_self on profiles for update to authenticated
  using (id = (select auth.uid()))
  -- Clients must not be able to promote themselves to staff.
  with check (id = (select auth.uid()) and role = 'client');
create policy profiles_staff_write on profiles for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Pets -----------------------------------------------------------------------
create policy pets_read on pets for select to authenticated
  using (household_id = app.household_id() or app.is_staff());
create policy pets_client_write on pets for all to authenticated
  using (household_id = app.household_id())
  with check (household_id = app.household_id());
create policy pets_staff_write on pets for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Supply tracking: client-editable, because they are the ones who know what
-- they bought and when. Staff can correct.
create policy pet_foods_rw on pet_foods for all to authenticated
  using (app.owns_pet(pet_id) or app.is_staff())
  with check (app.owns_pet(pet_id) or app.is_staff());

create policy pet_medications_rw on pet_medications for all to authenticated
  using (app.owns_pet(pet_id) or app.is_staff())
  with check (app.owns_pet(pet_id) or app.is_staff());

-- Vaccinations: read-only for clients. This is transcribed clinical data.
create policy pet_vaccinations_read on pet_vaccinations for select to authenticated
  using (app.owns_pet(pet_id) or app.is_staff());
create policy pet_vaccinations_staff_write on pet_vaccinations for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Requests -------------------------------------------------------------------
create policy requests_read on requests for select to authenticated
  using (household_id = app.household_id() or app.is_staff());
create policy requests_client_create on requests for insert to authenticated
  with check (household_id = app.household_id() and status = 'submitted');
create policy requests_staff_write on requests for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

create policy request_events_read on request_events for select to authenticated
  using (
    app.is_staff()
    or exists (select 1 from requests r
               where r.id = request_id and r.household_id = app.household_id())
  );
create policy request_events_staff_write on request_events for insert to authenticated
  with check (app.is_staff());

-- Reminders: clients may snooze/complete their own but never create clinical ones.
create policy reminders_read on reminders for select to authenticated
  using (app.owns_pet(pet_id) or app.is_staff());
create policy reminders_client_update on reminders for update to authenticated
  using (app.owns_pet(pet_id)) with check (app.owns_pet(pet_id));
create policy reminders_staff_write on reminders for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Photo submissions ----------------------------------------------------------
create policy photos_read on photo_submissions for select to authenticated
  using (household_id = app.household_id() or app.is_staff());
create policy photos_client_create on photo_submissions for insert to authenticated
  with check (household_id = app.household_id() and status = 'pending');
create policy photos_staff_write on photo_submissions for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Loyalty --------------------------------------------------------------------
-- Rules and rewards are public reading material for signed-in clients.
create policy earn_rules_read on earn_rules for select to authenticated using (true);
create policy earn_rules_staff_write on earn_rules for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

create policy rewards_read on rewards for select to authenticated using (true);
create policy rewards_staff_write on rewards for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Clients may request a redemption; only staff may confirm one.
create policy redemptions_read on redemptions for select to authenticated
  using (household_id = app.household_id() or app.is_staff());
create policy redemptions_client_create on redemptions for insert to authenticated
  with check (household_id = app.household_id() and status = 'pending');
create policy redemptions_staff_write on redemptions for all to authenticated
  using (app.is_staff()) with check (app.is_staff());

-- Points are readable by their household and writable only by staff.
create policy points_ledger_read on points_ledger for select to authenticated
  using (household_id = app.household_id() or app.is_staff());
create policy points_ledger_staff_insert on points_ledger for insert to authenticated
  with check (app.is_staff());

-- Device tokens --------------------------------------------------------------
create policy device_tokens_own on device_tokens for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Seed: starting loyalty configuration. Owners can change these in the console.
-- ---------------------------------------------------------------------------

insert into earn_rules (code, label, points) values
  ('rx_refill',    'Prescription refill',     10),
  ('food_bag',     'Bag of food',             15),
  ('preventative', 'Flea/tick/heartworm',     10),
  ('annual_exam',  'Annual wellness exam',    25),
  ('dental',       'Dental procedure',        50);

insert into rewards (label, points_cost) values
  ('Free nail trim',        100),
  ('$10 off an exam',       150),
  ('$25 off a dental',      400);
