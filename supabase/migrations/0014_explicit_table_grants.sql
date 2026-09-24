-- Explicit Data API grants, so these migrations still produce a working app on
-- a fresh project.
--
-- Until now every table relied on Supabase granting anon, authenticated and
-- service_role full access to anything created in `public`, with RLS doing all
-- the real restricting. From 30 October 2026 Supabase stops doing that for new
-- tables, and "new" includes every table these migrations create when replayed
-- on a new project, a preview branch, or `supabase db reset`. Without this
-- file, all of them would answer "permission denied".
--
-- The grants below are derived from the RLS policies, one table at a time:
-- a role gets a command only where some policy lets that role use it. Since
-- RLS already refused everything else, this changes nothing a client can do.
-- It only removes table privileges that no policy ever let anyone use.
--
-- Two things this file must not undo:
--   * points_ledger stays append-only. Clients get select and insert, never
--     update or delete (0001, 0003). Balances are sum(delta); a correction is
--     an offsetting row.
--   * anon reads only what is public: notices and clinic hours (0013), which
--     the sign-in screen shows before anyone has an account.
--
-- invites has a single policy with no `to` clause, which applies to anon too,
-- but its check is app.is_staff(), which anon can never pass. So anon gets no
-- grant there and loses nothing.
--
-- Every table added from here on needs its own grants in the migration that
-- creates it. The default-privileges line at the end makes that true on this
-- project now, rather than only after 30 October, so a missing grant shows up
-- in testing instead of in production.

-- Start from nothing for the client roles, then grant back exactly what the
-- policies use. service_role is left as it is: it bypasses RLS by design and
-- is only ever used server side.
revoke all on all tables in schema public from anon, authenticated;

-- Client-owned records: full read and write, row access decided by policy.
grant select, insert, update, delete on public.households        to authenticated;
grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert, update, delete on public.pets              to authenticated;
grant select, insert, update, delete on public.pet_foods         to authenticated;
grant select, insert, update, delete on public.pet_medications   to authenticated;
grant select, insert, update, delete on public.pet_vaccinations  to authenticated;
grant select, insert, update, delete on public.requests          to authenticated;
grant select, insert, update, delete on public.reminders         to authenticated;
grant select, insert, update, delete on public.photo_submissions to authenticated;
grant select, insert, update, delete on public.redemptions       to authenticated;
grant select, insert, update, delete on public.device_tokens     to authenticated;

-- Staff-managed configuration: readable when signed in, writable by staff.
grant select, insert, update, delete on public.earn_rules        to authenticated;
grant select, insert, update, delete on public.rewards           to authenticated;
grant select, insert, update, delete on public.invites           to authenticated;

-- Audit trails: rows are only ever added, never edited or removed.
grant select, insert on public.request_events to authenticated;
grant select, insert on public.points_ledger  to authenticated;

-- Public site content: anyone can read, staff edit.
grant select                         on public.notices      to anon;
grant select, insert, update, delete on public.notices      to authenticated;
grant select                         on public.clinic_hours to anon;
grant select, insert, update, delete on public.clinic_hours to authenticated;

-- points_balances is a security_invoker view over points_ledger, so the
-- ledger's own policies still decide which rows a caller sees.
grant select on public.points_balances to authenticated;

-- service_role, as Supabase's own guidance sets it for new tables.
grant select, insert, update, delete on all tables in schema public to service_role;

-- New tables get no client access until a migration grants it.
alter default privileges in schema public revoke all on tables from anon, authenticated;
