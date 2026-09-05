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

-- d0000000-…-000000000001 is the Niederer household, holding the four animals
-- the demo is built from; the a1–a4 ids below are Aeries, Gertie, Soren and
-- Thelma. Written out in full rather than bound to a variable so this also runs
-- as-is in the Supabase SQL editor.

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

-- Points. Awarding is the demo, so a tester who taps a few rules moves the
-- balance and the page stops telling its story. 135 puts the free nail trim in
-- reach and leaves the exam discount exactly one bag of food away, which is the
-- shape worth showing: not "you have some points" but "one more bag and you
-- have ten dollars off".
--
-- The ledger is append-only for the app, by privilege rather than convention.
-- These deletes run as the owner in a maintenance script, which is a different
-- thing from the client being able to rewrite a balance.
delete from public.points_ledger
where household_id = 'd0000000-0000-4000-8000-000000000001';

insert into public.points_ledger
  (household_id, delta, reason, earn_rule_id, pet_id, staff_id, created_at)
select 'd0000000-0000-4000-8000-000000000001', e.points, e.label, e.id, v.pet_id,
       (select id from public.profiles where role in ('staff', 'admin') order by created_at limit 1),
       now() - v.ago
from (values
  ('annual_exam',  'd0000000-0000-4000-8000-0000000000a1'::uuid, interval '5 months'),
  ('food_bag',     'd0000000-0000-4000-8000-0000000000a1'::uuid, interval '4 months'),
  ('preventative', 'd0000000-0000-4000-8000-0000000000a3'::uuid, interval '3 months'),
  ('food_bag',     'd0000000-0000-4000-8000-0000000000a3'::uuid, interval '3 months'),
  ('rx_refill',    'd0000000-0000-4000-8000-0000000000a2'::uuid, interval '2 months'),
  ('food_bag',     'd0000000-0000-4000-8000-0000000000a4'::uuid, interval '2 months'),
  ('preventative', 'd0000000-0000-4000-8000-0000000000a1'::uuid, interval '6 weeks'),
  ('rx_refill',    'd0000000-0000-4000-8000-0000000000a2'::uuid, interval '1 month'),
  ('food_bag',     'd0000000-0000-4000-8000-0000000000a1'::uuid, interval '3 weeks'),
  ('rx_refill',    'd0000000-0000-4000-8000-0000000000a2'::uuid, interval '12 days')
) as v(code, pet_id, ago)
join public.earn_rules e on e.code = v.code;

commit;
