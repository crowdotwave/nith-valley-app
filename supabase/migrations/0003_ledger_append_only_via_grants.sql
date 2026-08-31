-- The RULEs added in 0001 to make points_ledger append-only also rewrote the
-- referential-integrity queries Postgres runs for foreign keys, so deleting a
-- household with points failed with "gave unexpected result". Rules are too
-- blunt an instrument here; they intercept the system's own queries.
--
-- Append-only is enforced instead by privilege: RLS already denies UPDATE and
-- DELETE to clients (no policy grants them), and the revokes below make that
-- explicit at the grant level. Neither interferes with cascade deletes, which
-- run as the table owner rather than as the calling role.

drop rule if exists points_ledger_no_update on points_ledger;
drop rule if exists points_ledger_no_delete on points_ledger;

revoke update, delete on points_ledger from authenticated, anon;
