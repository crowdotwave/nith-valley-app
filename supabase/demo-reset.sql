-- Put the demo household's request queue back to its starting state.
--
-- Working the queue is the point of the demo, so a tester who moves all four
-- open requests through leaves the front desk empty for the next person. Run
-- this before or after a session to hand the queue back intact.
--
-- Dates are relative to now() rather than fixed, so a queue reset in November
-- reads the same as one reset today: the newest request arrived this morning,
-- the oldest was picked up a few weeks ago. Nothing here touches pets, diets,
-- medications, vaccinations or reminders; supply reminders are reconciled
-- nightly by app.reconcile_supply_reminders().
--
-- Run against the project database:
--   psql "$DATABASE_URL" -f supabase/demo-reset.sql

begin;

-- d0000000-…-000000000001 is the Kaufman household, seeded with the four demo
-- animals; the a1–a4 ids below are Aeries, Gertie, Soren and Thelma. Written
-- out in full rather than bound to a variable so this also runs as-is in the
-- Supabase SQL editor.

delete from public.request_events
where request_id in (
  select id from public.requests
  where household_id = 'd0000000-0000-4000-8000-000000000001'
);

delete from public.requests
where household_id = 'd0000000-0000-4000-8000-000000000001';

insert into public.requests
  (household_id, pet_id, type, status, details, client_note, staff_note, created_at)
values
  -- Closed, so it shows only under "Show everything" on the request record.
  ('d0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-0000000000a1',
   'food', 'completed',
   '{"item":"X-Small Adult 1.5kg","quantity":"1 bag"}'::jsonb,
   null, null, now() - interval '24 days'),

  -- A decline with a reason, so the client view has something to show for
  -- "Not approved" other than a dead end.
  ('d0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-0000000000a2',
   'medication', 'declined',
   '{"item":"Galliprant 20mg","quantity":"90 tablets"}'::jsonb,
   'Can we get a bigger box?',
   'Gertie is due for bloodwork before we refill a 90 day supply. Give us a call and we will book her in.',
   now() - interval '12 days'),

  -- The four open requests, one per column of the queue.
  ('d0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-0000000000a4',
   'food', 'ready',
   '{"item":"Urinary SO 3kg","quantity":"1 bag"}'::jsonb,
   null, 'Ready at the front desk', now() - interval '3 days'),

  ('d0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-0000000000a3',
   'medication', 'approved',
   '{"item":"Revolution Plus","quantity":"3 pack"}'::jsonb,
   null, 'Approved, in with Thursday order', now() - interval '2 days'),

  ('d0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-0000000000a1',
   'food', 'in_review',
   '{"item":"X-Small Adult 1.5kg","quantity":"1 bag"}'::jsonb,
   null, null, now() - interval '1 day'),

  -- The one waiting on the desk, and the one to walk through to Ready.
  ('d0000000-0000-4000-8000-000000000001',
   'd0000000-0000-4000-8000-0000000000a2',
   'medication', 'submitted',
   '{"item":"Galliprant 20mg","quantity":"30 tablets"}'::jsonb,
   'She has about a week left', null, now() - interval '3 hours');

commit;
