-- Clients set their own reminders.
--
-- The practice asked for reminders at both ends. Staff already had them; this
-- is the client half. Three rules keep a client-set reminder from ever being
-- mistaken for clinical instruction from the practice:
--
--   1. A third source, 'client'. The nightly reconcile only ever deletes
--      source = 'auto', so these survive it exactly as staff ones do.
--   2. Clients may only insert with source = 'client', stamped with their own
--      id. They cannot post a reminder as the clinic.
--   3. A client may only snooze or complete an existing reminder. The previous
--      update policy checked ownership but not which columns changed, so a
--      client could have relabelled their own reminder as staff-created, or
--      rewritten a real clinical one. Now the columns that carry meaning are
--      frozen for anyone who is not staff.
--
-- Vaccination dates are still transcribed, never computed. A client-set
-- "vaccine" reminder is a note to themselves, and the app shows whose it is.

alter table reminders drop constraint reminders_source_check;

alter table reminders add constraint reminders_source_check
  check (source in ('auto', 'staff', 'client'));

create policy reminders_client_create on reminders for insert to authenticated
  with check (
    app.owns_pet(pet_id)
    and source = 'client'
    and created_by = (select auth.uid())
  );

create or replace function app.guard_client_reminder_edit()
returns trigger
language plpgsql
security definer
set search_path = public, app
as $$
begin
  if app.is_staff() then
    return new;
  end if;

  -- Everything a client is allowed to change lives in snoozed_until and
  -- completed_at. Anything else is put back as it was.
  new.pet_id             := old.pet_id;
  new.type               := old.type;
  new.title              := old.title;
  new.due_on             := old.due_on;
  new.source             := old.source;
  new.created_by         := old.created_by;
  new.notify_days_before := old.notify_days_before;
  new.notified_at        := old.notified_at;
  new.created_at         := old.created_at;

  return new;
end;
$$;

create trigger reminders_guard_client_edit
  before update on reminders
  for each row execute function app.guard_client_reminder_edit();

comment on function app.guard_client_reminder_edit is
  'Clients may snooze or complete a reminder and nothing else. Without this the update policy checked ownership but not which columns moved, so a client could rewrite a clinical reminder or relabel their own as staff-created.';
