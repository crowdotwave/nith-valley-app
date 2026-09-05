-- Someone joining an existing household, or arriving as staff, cannot be
-- handled after the fact without a person at a keyboard. The profile row is
-- written by a trigger the instant the auth user appears, and until it is
-- corrected the new arrival is a client in a household of their own: an empty
-- app, no console, none of their animals. A front desk cannot onboard a
-- colleague that way, and a client whose partner already holds the pet file
-- would land beside their own household rather than in it.
--
-- An invite is that correction, recorded before they ever sign in.
--
-- It keeps the property the app was built with. There is still no self-service
-- path to staff: only someone with database access can write an invite, and the
-- invited person still has to control the mailbox to receive the magic link.
-- What changes is that the correction happens before the first screen instead
-- of after it.

create table public.invites (
  email text primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  role text not null default 'client' check (role in ('client', 'staff', 'admin')),
  full_name text,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.invites is
  'Where a new signup lands, decided before they sign in. Consumed by app.handle_new_user().';

alter table public.invites enable row level security;

-- Staff only, and clients never: an invite names a household and a role, which
-- is exactly the pair a client must not be able to read or write.
create policy invites_staff_all on public.invites
  for all using (app.is_staff()) with check (app.is_staff());

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  waiting public.invites%rowtype;
  new_household uuid;
begin
  -- Case-insensitively: an invite is typed by hand, and mailboxes are not case
  -- sensitive in practice.
  select * into waiting
  from public.invites
  where lower(email) = lower(new.email);

  if found then
    insert into public.profiles (id, household_id, email, full_name, role)
    values (new.id, waiting.household_id, new.email, waiting.full_name, waiting.role);

    -- Consumed. The profile is the record now, and a stale invite would sit
    -- here naming a household forever.
    delete from public.invites where lower(email) = lower(new.email);
  else
    -- One household per signup. Staff merge households later when they spot two
    -- people who share a pet; that is a deliberate manual step.
    insert into public.households (name)
    values (coalesce(split_part(new.email, '@', 1), 'Household'))
    returning id into new_household;

    insert into public.profiles (id, household_id, email)
    values (new.id, new_household, new.email);
  end if;

  return new;
end;
$fn$;
