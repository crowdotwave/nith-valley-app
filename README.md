# Nith Valley Animal Hospital — client app

Client app + staff console for Nith Valley Animal Hospital, New Hamburg ON.

## What this is and isn't

This is **not** a medical records system. The clinic's PIMS holds the patient
record, the invoicing, and the prescriptions, and there is no API access to it.
This app holds requests, preferences, and loyalty — things the PIMS has never
heard of.

| Feature | Where it lives |
| --- | --- |
| Book an appointment | Covetrus Rapport — opened in an in-app browser, not rebuilt |
| Message the clinic | Native SMS to the clinic number |
| Food / medication requests | Here |
| Supply reminders (food & meds running out) | Here |
| Clinical reminders (vaccines, exams) | Here, staff-entered |
| Photo submissions for social | Here |
| Pet file — diet, medications, profile pic | Here |
| Pet file — vaccination history | Here, staff-entered, gradually |
| Loyalty points | Here, staff-awarded at checkout |

## Design decisions worth not re-litigating

**The household is the unit of access, not the user.** Two people share a dog;
one of them moves out. Household-scoped permissions handle that without
touching pet records. Everything in RLS keys off `app.household_id()`.

**Supply tracking doubles as the pet file.** Predicting when food runs out
needs brand, bag size, daily amount, and last purchase date. That is the same
data as "current diet". Collected once, shown twice.

**Vaccination dates are transcribed, never computed.** The app must not
calculate a next-due date. An app that tells someone their dog is due when it
isn't is a liability. Staff enter what the PIMS says.

**Points accrue per event, not per dollar.** Staff tap "Rx refill" at checkout
rather than keying an invoice total. Per-dollar accrual requires accurate
manual entry forever, drifts immediately, and cannot be reconciled against a
PIMS we cannot read.

**The points ledger is append-only.** Balance is `sum(delta)`, never a stored
column. Corrections are offsetting rows. Enforced by rule, not convention, so
every point a client has is explainable.

**Passwordless auth.** Email magic link. Clients already have a Covetrus
password for booking; a second one would double the front desk's support load
for no benefit. The app's email must match the one the clinic holds — it's the
join key staff use to match app accounts to client files.

## Layout

```
src/lib/clinic.ts      clinic details, booking link, SMS handoff
src/lib/supabase.ts    Supabase client
src/routes/            screens
supabase/migrations/   database schema and RLS policies
```

## Setup

Requires Node 20+.

```
npm install
cp .env.example .env    # fill in from Supabase dashboard, or use the existing .env
npm run dev
```

The Supabase project is `nith-valley-app` in `ca-central-1` — Canadian data
residency, which matters for an Ontario clinic holding client information.

## Status

Live at https://crowdotwave.github.io/nith-valley-app/ — deploys on push to
`main`.

Database: 15 tables, RLS on all of them, security advisors clean. Policies
verified against simulated client and staff sessions — cross-household reads
blocked, clients cannot write vaccinations, grant themselves points, promote
themselves to staff, or edit the ledger; staff see everything.

Working: magic-link auth, home screen, booking handoff to Covetrus, SMS
handoff, add/list pets, food and medication requests, request tracking, and the
staff request queue. Status changes are audited by a database trigger rather
than by the client.

Staff access is granted by setting `profiles.role` to `staff` — there is no
self-service path to it, by design.

Pet detail carries diet, medications and vaccinations. Depletion dates are
computed by the database and verified: a 6kg bag at 220g/day bought 10 days ago
reads 17 days left; a 90-day med filled 80 days ago reads 10.

Reminders are generated nightly by `app.reconcile_supply_reminders()`, run by
pg_cron at 07:00 UTC. It reconciles rather than appends — when a client records
a new purchase the depletion date moves, so the stale reminder is deleted and
replaced. Verified idempotent: a second run in the same state changes nothing.
Staff-created reminders are never touched by it.

Not started: push notifications (needs the Capacitor wrap and an FCM project),
photo upload, loyalty screens, marketing site.

## The PIMS

The clinic runs Covetrus Pulse, with Rapport Online Scheduling as the booking
front end. There is no API access; see the table above for what that means.
Worth checking whether GreatPetCare (Covetrus's own pet-parent portal, which
requires Pulse) would cover the vaccination gap off the shelf.
