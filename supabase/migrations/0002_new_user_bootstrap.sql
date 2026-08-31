-- Every signed-in user needs a profile and a household before RLS lets them
-- see anything; app.household_id() reads from profiles. Doing this in a
-- trigger rather than in the app means there is no window where a user exists
-- but has no household, and no way to skip it by calling the API directly.

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  new_household uuid;
begin
  -- One household per signup. Staff merge households later when they spot
  -- two people who share a pet; that is a deliberate manual step.
  insert into public.households (name)
  values (coalesce(split_part(new.email, '@', 1), 'Household'))
  returning id into new_household;

  insert into public.profiles (id, household_id, email)
  values (new.id, new_household, new.email);

  return new;
end;
$fn$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();
