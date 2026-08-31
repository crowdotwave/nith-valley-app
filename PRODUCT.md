# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Ships inside a Capacitor shell for iOS and Android, but the design language is
one web system rather than per-OS native conventions. Confirmed this session.

## Users

Two audiences, confirmed co-equal: front desk lives in this daily, so staff
screens carry the same quality bar as client screens.

**Clients.** Existing clients of the practice, on a phone. The household is the
unit of access, not the individual: two people share a dog, one moves out, and
household-scoped permissions handle it without touching pet records. Their jobs
are requesting food and medication refills, tracking those requests, keeping the
pet file current, seeing what is coming due, submitting photos, and reaching the
clinic.

**Staff.** A five-person front desk plus veterinarians. Their jobs are working
the request queue, moderating photo submissions, transcribing vaccination dates
from the PIMS, and awarding loyalty points at checkout. Access is granted by
setting `profiles.role`; there is no self-service path to it, by design.

## Product Purpose

Confirmed success measures, all four selected this session:

- Fewer phone interruptions: refill and food requests arrive as structured
  records rather than calls the front desk fields mid-appointment.
- More refills captured: supply reminders catch food and medication running out
  before the client forgets or goes elsewhere.
- Client loyalty and retention: the points ledger and pet file make the practice
  stickier than the clinic down the road.
- Fewer missed clinical reminders: vaccines and exams get booked because the
  client sees them coming.

## Positioning

This is not a medical records system. The clinic runs Covetrus Pulse, with
Rapport Online Scheduling as the booking front end, and there is no API access to
either. The PIMS holds the patient record, the invoicing and the prescriptions.

This app holds requests, preferences and loyalty, things the PIMS has never
heard of. Where the clinic already staffs a system, the app hands off to it
rather than rebuilding it: booking opens Rapport, and messaging is native SMS.

## Operating Context

- The front desk is five people and will not reliably watch a second message
  queue. This is why messaging is SMS and not an in-app inbox.
- **Staff work mainly on computers, not phones** (practice, August 2026). The
  client app is a phone document; the staff console is a desktop surface and
  should be designed as one. This is why `.desk` is the only route carrying a
  width breakpoint.
- Clients already hold a Covetrus password for booking. The app is passwordless
  (email magic link) so there is no second credential to support.
- The app's email address is the join key staff use to match app accounts to
  client files, so it must match the address the clinic holds.
- The practice moved to 216 Huron St, New Hamburg ON on 31 August 2026. Postal
  code still to confirm.
- Hours, service area and services copy live in `src/lib/content.ts`.
- Data resides in Supabase `ca-central-1`, Canadian residency, which matters for
  an Ontario clinic holding client information.
- Supply reminders are generated nightly by `app.reconcile_supply_reminders()`
  under pg_cron at 07:00 UTC. It reconciles rather than appends.

## Capabilities and Constraints

Built: magic-link auth, home, booking handoff, SMS handoff, pets, food and
medication requests, request tracking, staff request queue, reminders, photo
submissions with versioned consent, staff photo moderation, contact, services.

Not started: push notifications (needs the Capacitor wrap and an FCM project),
loyalty screens, marketing site.

Durable constraints future work must preserve:

- **Vaccination dates are transcribed, never computed.** The app must not
  calculate a next-due date. Telling someone their dog is due when it isn't is a
  liability.
- **Points accrue per event, not per dollar.** Staff tap "Rx refill" at checkout
  rather than keying an invoice total.
- **The points ledger is append-only.** Balance is `sum(delta)`; corrections are
  offsetting rows.
- **Household-scoped RLS** keys off `app.household_id()`.
- **Supply tracking doubles as the pet file**: brand, bag size, daily amount and
  last purchase date are the same data as "current diet". Collected once, shown
  twice.

Stated direction, explicitly deferred:

- **The practice wants the app and Covetrus to talk to each other eventually**
  (practice, August 2026), but has asked that Covetrus not be contacted yet.
  Treat PIMS integration as a wanted future capability, not a dead end, and
  note it bears directly on the GreatPetCare question below.
- **A public-facing website is wanted but deferred.** Not this app, and not the
  staff console; a separate surface for a separate audience.

Undecided, recorded rather than invented:

- Whether GreatPetCare (Covetrus's own pet-parent portal, which requires Pulse)
  would cover the vaccination gap off the shelf.
- Postal code for the new address.

Near-term goal (August 2026): something the clinic owner can click around and
get excited by. That is a demo-readiness goal, not a feature goal; it is served
by realistic data and populated screens far more than by additional surfaces.

## Brand Commitments

- Name: Nith Valley Animal Hospital.
- **The logo is fixed and is not to be altered.** `public/logo.png`, 1425×675,
  genuinely transparent (87.8% of pixels fully transparent, verified by decode).
  It is used to accent the interface.
- Binding visual constraint volunteered this session: **a clean white app, with
  the logo's blues as the accents.** Dark mode is not wanted at the moment; it
  was removed from `src/styles.css` and `index.html` rather than maintained.
- **Typography is open.** Fraunces is in the codebase only because it matches the
  practice website's headings, inherited evidence, not a constraint the practice
  made binding. Confirmed this session that later design work should choose a
  display face deliberately rather than carry this one forward.
- Voice: plain language, no marketing filler. The standing note at the top of
  `src/lib/content.ts` is the house style: "no sentences that could describe any
  clinic in the country." Client-facing status wording is deliberately
  non-technical (`STATUS_LABEL` in `src/lib/types.ts` maps `submitted` to "Sent",
  `in_review` to "Being looked at").

## Evidence on Hand

- Real services copy, hours and service area: `src/lib/content.ts`
- Real clinic details, booking URL, consent text and version: `src/lib/clinic.ts`
- Logo asset: `public/logo.png`
- Live deployment: https://crowdotwave.github.io/nith-valley-app/
- Design critique snapshot for the home screen: `.impeccable/critique/`

No testimonials, pricing, client counts, case studies or press exist. Future work
must not fabricate them.

## Product Principles

1. **The PIMS is the record; this app is everything around it.** Never restate or
   compute clinical fact the practice management system owns.
2. **Never manufacture certainty.** A failed check is reported, not rendered as an
   all-clear. "Nothing due" is a claim about someone's medication.
3. **The household is the unit, not the person.**
4. **Don't create a second queue nobody watches.** Hand off to the system the
   clinic already staffs.
5. **Every point is explainable.** Append-only ledger, corrections as offsetting
   rows, balance derived and never stored.

## Accessibility & Inclusion

No formal standard has been established, and no product-specific requirement was
confirmed this session. Open decision rather than a captured fact: the practice
serves a rural Ontario area and its client base plausibly skews older, which
would argue for a legibility and touch-target floor above WCAG AA minimums. To be
decided with the practice, not assumed.
