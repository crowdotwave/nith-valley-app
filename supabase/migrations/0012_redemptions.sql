-- Claiming a reward.
--
-- The tables have been here since the first migration and nothing could reach
-- them. Two things were missing before a client could be trusted with the
-- insert.
--
-- First, the code. `redemptions.code` is what a client reads out at the desk,
-- and it was the client's job to invent one. A value that has to be unique
-- across every household should never be chosen by the party that benefits from
-- collisions. It is generated here, from an alphabet with no O, 0, I or 1 in it,
-- because this gets read aloud across a counter.
--
-- Second, the balance. The insert policy checked the household and the status
-- and nothing else, so a client with 100 points could ask for three nail trims.
-- Nothing leaked, because the points are not debited until staff confirm, but
-- the desk would have been the only thing standing between a client and a
-- reward they had not earned. That belongs in the database.
--
-- Pending claims are counted as spent while they wait. Otherwise the same 100
-- points would pass the check once per claim.

create or replace function app.redemption_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  candidate text;
  earned integer;
  held integer;
begin
  if new.code is null or new.code = '' then
    loop
      candidate := '';
      for i in 1..6 loop
        candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;
      exit when not exists (select 1 from public.redemptions where code = candidate);
    end loop;
    new.code := candidate;
  end if;

  -- Same arithmetic as the points_balances view: expired rows do not count.
  select coalesce(sum(delta), 0) into earned
  from public.points_ledger
  where household_id = new.household_id
    and (expires_on is null or expires_on >= current_date);

  select coalesce(sum(points_cost), 0) into held
  from public.redemptions
  where household_id = new.household_id and status = 'pending';

  if earned - held < new.points_cost then
    raise exception 'Not enough points: % available, % needed', earned - held, new.points_cost
      using errcode = 'check_violation';
  end if;

  return new;
end;
$fn$;

create trigger redemptions_guard
  before insert on public.redemptions
  for each row execute function app.redemption_guard();

-- Confirming is what spends the points, and the ledger row is written here
-- rather than by whoever remembers to. Same reasoning as the request status
-- audit: a debit a caller can forget is a balance nobody can defend.
--
-- Cancelling a confirmed claim writes the offsetting row instead of removing
-- the debit, because the ledger is append-only and both lines belong on the
-- record.
create or replace function app.settle_redemption()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $fn$
declare
  label text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  select r.label into label from public.rewards r where r.id = new.reward_id;

  if new.status = 'confirmed' then
    new.confirmed_by := auth.uid();
    new.confirmed_at := now();

    insert into public.points_ledger (household_id, delta, reason, redemption_id, staff_id)
    values (new.household_id, -new.points_cost, label, new.id, auth.uid());

  elsif old.status = 'confirmed' and new.status = 'cancelled' then
    insert into public.points_ledger (household_id, delta, reason, redemption_id, staff_id)
    values (new.household_id, new.points_cost, 'Cancelled: ' || label, new.id, auth.uid());
  end if;

  return new;
end;
$fn$;

create trigger redemptions_settle
  before update on public.redemptions
  for each row execute function app.settle_redemption();
