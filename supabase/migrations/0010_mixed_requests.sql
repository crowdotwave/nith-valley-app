-- A request can carry food and medication together.
--
-- The type column was written when a request was one thing: a client ordering
-- a bag of food and picking up a refill on the same visit had to send two,
-- which the front desk then worked twice and handed over once. Katrina asked
-- for one.
--
-- Each line in details.items now names its own kind, so the column describes
-- the request as a whole: 'food' or 'medication' when every line agrees, and
-- 'mixed' when they do not. Nothing filters on it — the queue reads the items —
-- so it stays as the summary a report or an export would want, and 'other'
-- keeps its old meaning of neither.

alter table public.requests drop constraint requests_type_check;

alter table public.requests add constraint requests_type_check
  check (type in ('food', 'medication', 'mixed', 'other'));
