-- Close out orders nobody came back to click.
--
-- "We likely won't be back to click 'hand over' because we're lazy", which is
-- honest and correct: once the client has walked away there is no reason to
-- return to this app. Left alone the shelf fills with orders collected days ago
-- and the count keeps calling them waiting.
--
-- The reason this is safe to automate is the second half of what Katrina said:
-- "we have it already in our Covetrus because it shows we billed them out."
-- The invoice is the record of a hand-over, and it lives in the PIMS. This
-- column is housekeeping, not accounting — nobody will ever open this app to
-- answer whether something was billed — so a request that closes itself is
-- tidying a queue rather than asserting a fact.
--
-- Seven days: long enough that a client who is coming in has come in, short
-- enough that the desk is not reading last week's shelf.
--
-- The status trigger writes the audit row as it would for any change. A cron
-- run has no auth.uid(), so actor_id lands null, and that is what tells a
-- closure nobody performed apart from one somebody did.

create or replace function app.close_collected_requests(older_than interval default '7 days')
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  closed integer;
begin
  update public.requests
  set status = 'completed'
  where status = 'ready'
    and updated_at < now() - older_than;

  get diagnostics closed = row_count;
  return closed;
end;
$fn$;

comment on function app.close_collected_requests is
  'Moves ready requests to completed after a quiet period. The invoice in the PIMS is the record of the hand-over; this only stops the queue showing work that is done.';

-- 07:05 UTC, just after the supply reminders, so the whole nightly tidy-up
-- lands before the clinic opens.
select cron.schedule(
  'close-collected-requests',
  '5 7 * * *',
  $cron$select app.close_collected_requests();$cron$
);
