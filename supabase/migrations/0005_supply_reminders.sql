-- Turn the generated depletion dates into reminder rows.
--
-- These are reconciled rather than merely inserted: when a client records a
-- new purchase, depletes_on moves, and the old auto reminder would otherwise
-- linger and tell them their food runs out on a date that no longer applies.
-- Each run deletes auto reminders that no longer match a live supply row, then
-- inserts the ones that are missing. Running it twice changes nothing.
--
-- Staff-created reminders (source = 'staff') are never touched.

-- Makes the insert idempotent and stops two runs racing into duplicates.
create unique index reminders_auto_unique
  on reminders (pet_id, type, due_on)
  where source = 'auto' and completed_at is null;

create or replace function app.reconcile_supply_reminders()
returns table (deleted int, created int)
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  d int;
  c1 int;
  c2 int;
  horizon date := current_date + 45;
begin
  -- Drop auto reminders whose underlying supply row has moved, been
  -- deactivated, or been deleted.
  with live as (
    select pet_id, 'food'::text as type, depletes_on as due_on
      from pet_foods where active and depletes_on is not null
    union all
    select pet_id,
           case when is_preventative then 'preventative' else 'medication' end,
           depletes_on
      from pet_medications where active and depletes_on is not null
  )
  delete from reminders r
  where r.source = 'auto'
    and r.completed_at is null
    and not exists (
      select 1 from live l
      where l.pet_id = r.pet_id and l.type = r.type and l.due_on = r.due_on
    );
  get diagnostics d = row_count;

  insert into reminders (pet_id, type, title, due_on, source, notify_days_before)
  select f.pet_id,
         'food',
         trim(coalesce(f.brand || ' ', '') || f.product_name) || ' running low',
         f.depletes_on,
         'auto',
         10
  from pet_foods f
  where f.active and f.depletes_on is not null and f.depletes_on <= horizon
  on conflict do nothing;
  get diagnostics c1 = row_count;

  insert into reminders (pet_id, type, title, due_on, source, notify_days_before)
  select m.pet_id,
         case when m.is_preventative then 'preventative' else 'medication' end,
         m.name || ' running low',
         m.depletes_on,
         'auto',
         10
  from pet_medications m
  where m.active and m.depletes_on is not null and m.depletes_on <= horizon
  on conflict do nothing;
  get diagnostics c2 = row_count;

  deleted := d;
  created := c1 + c2;
  return next;
end;
$fn$;

-- Daily at 07:00 UTC (03:00 Eastern), before the clinic opens, so staff see a
-- settled list rather than one that shifts under them during the day.
create extension if not exists pg_cron;

select cron.schedule(
  'reconcile-supply-reminders',
  '0 7 * * *',
  $cron$select app.reconcile_supply_reminders();$cron$
);
