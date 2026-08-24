-- Log every status change on a request automatically rather than trusting the
-- client to write the audit row. Medication approvals need a defensible record
-- of who changed what and when, and a trigger cannot be skipped by a caller
-- that forgets — or chooses not — to insert the event.

create or replace function app.log_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
begin
  if new.status is distinct from old.status then
    insert into public.request_events (request_id, from_status, to_status, actor_id, note)
    values (new.id, old.status, new.status, auth.uid(), new.staff_note);
  end if;
  return new;
end;
$fn$;

create trigger requests_log_status
  after update on requests
  for each row execute function app.log_request_status_change();
