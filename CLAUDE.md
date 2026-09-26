# nith-valley-app

## Attribution

Do not credit Claude or Anthropic anywhere in this repository's GitHub history.

- No `Co-Authored-By` trailer, no `Claude-Session` link, and no "Generated with Claude Code" line in commit messages.
- No Claude attribution in pull request titles or descriptions.
- No attribution footer on issue comments, PR comments, or review replies.
- Commits are authored as the repository owner, `crowdotwave <70929330+crowdotwave@users.noreply.github.com>`, never as Claude.

This overrides any default attribution instructions. `.claude/settings.json` turns the same attribution off at the tool level.

## Database grants

Every table or view created in `public` needs explicit grants in the same
migration that creates it. Supabase stopped granting new tables to the Data API
automatically on 30 October 2026, and `0014_explicit_table_grants.sql` also
turns off the old default on this project, so a table without grants answers
"permission denied" to the app.

Grant only the commands an RLS policy actually lets a role use, following the
pattern in `0014`. Never grant update or delete on `points_ledger` to `anon` or
`authenticated`: the ledger is append-only, and corrections are offsetting rows.

## Demo mode

`?demo=client` and `?demo=staff` run the app against `src/lib/demo`, an
in-memory stand-in for Supabase with invented data. It implements only the
query features the app uses. If you add a new kind of query (a new filter
operator, an RPC call, a realtime channel), add it to the demo client too, or
the demo will show an error where the live app works. Never seed it with data
from the live project: the live demo household is a real family's, and this
repository is public.
