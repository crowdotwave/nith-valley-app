-- Content the front desk can change without anyone's help.
--
-- The practice cannot currently edit its own website: the person who built it
-- holds the keys, so a holiday closure or a change of hours needs an email and
-- a wait. That is how the site ended up advertising an address the clinic moved
-- out of. Everything here is the small set of things that actually change, put
-- somewhere staff can reach.
--
-- Readable by anon as well as authenticated, because this is public
-- information and the practice website will read the same rows when it is
-- rebuilt. One source of truth for the hours, rather than the four
-- contradictory copies the current site manages.

create table public.notices (
  id         uuid primary key default gen_random_uuid(),
  body       text not null,
  -- A notice with an end date takes itself down. The real failure is not
  -- forgetting to post "closed for Christmas", it is finding it still up in
  -- February.
  starts_on  date,
  ends_on    date,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

comment on table public.notices is
  'Short announcements from the practice. Live when today falls inside starts_on..ends_on; either bound may be null for open-ended.';

-- Free text rather than opening and closing times, because "By request" and
-- "Closed" are real answers and a time picker cannot hold them. The website
-- rebuild can add structured times for schema.org; this is the version the
-- front desk can edit in ten seconds, which is the point.
create table public.clinic_hours (
  position   int primary key,
  days       text not null,
  hours      text not null,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

comment on table public.clinic_hours is
  'One row per line of the opening hours, in display order.';

alter table public.notices enable row level security;
alter table public.clinic_hours enable row level security;

create policy notices_read on public.notices
  for select to anon, authenticated using (true);

create policy notices_staff_write on public.notices
  for all to authenticated using (app.is_staff()) with check (app.is_staff());

create policy clinic_hours_read on public.clinic_hours
  for select to anon, authenticated using (true);

create policy clinic_hours_staff_write on public.clinic_hours
  for all to authenticated using (app.is_staff()) with check (app.is_staff());

-- Seeded from src/lib/content.ts, which stays in the bundle as the fallback so
-- the page still says something if this table cannot be read.
insert into public.clinic_hours (position, days, hours) values
  (1, 'Monday to Wednesday', '8:30 am to 5:30 pm'),
  (2, 'Thursday',            '8:30 am to 8:00 pm'),
  (3, 'Friday',              '8:30 am to 5:30 pm'),
  (4, 'Saturday',            'By request'),
  (5, 'Sunday',              'Closed');
