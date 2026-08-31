---
name: Nith Valley Animal Hospital
description: The document the practice issues about your animal — white stock, hairline rules, a ruled field-and-value grid, and status carried by stamp shape.
colors:
  stock: "#ffffff"
  field: "#f4f7fa"
  ink: "#14263f"
  ink-soft: "#5f7590"
  rule: "#d3dce8"
  rule-row: "#7e8fa6"
  rule-ink: "#14263f"
  seal: "#1d3557"
  seal-mid: "#4e7ebf"
  seal-ink: "#ffffff"
  band: "#1f7a46"
  band-ink: "#ffffff"
  alert: "#a4262c"
typography:
  title:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.09em"
    fontVariation: "'wdth' 78"
  subtitle:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.09em"
    fontVariation: "'wdth' 78"
  record:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 100"
  metric:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
    fontVariation: "'wdth' 100"
    fontFeature: "tabular-nums"
  body:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
    fontVariation: "'wdth' 100"
  lead:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
    fontVariation: "'wdth' 100"
  note:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
    fontVariation: "'wdth' 100"
  caption:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.09em"
    fontVariation: "'wdth' 78"
  stamp:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.1em"
    fontVariation: "'wdth' 78"
rounded:
  none: "0"
  doc: "2px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  row: "0.8125rem"
  gutter: "0.875rem"
  lg: "1.25rem"
  xl: "1.5rem"
  label-lead: "1.75rem"
  section: "2rem"
components:
  index-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.8125rem 0"
    height: "69px"
  index-row-sealed:
    backgroundColor: "{colors.seal}"
    textColor: "{colors.seal-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "1rem 0.875rem"
    height: "75px"
  stub:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.record}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0"
    height: "92px"
  stamp:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "0.1875rem 0.5rem"
    height: "23px"
  stamp-ready:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stock}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "0.1875rem 0.5rem"
  stamp-declined:
    backgroundColor: "transparent"
    textColor: "{colors.alert}"
    typography: "{typography.stamp}"
    rounded: "{rounded.none}"
    padding: "0.1875rem 0.5rem"
  band:
    backgroundColor: "{colors.band}"
    textColor: "{colors.band-ink}"
    rounded: "{rounded.doc}"
    padding: "0.75rem 0.875rem"
    height: "3.75rem"
  band-clear:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 0.875rem"
    height: "3.75rem"
  field-label:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 0 0.3125rem"
  input:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.doc}"
    padding: "0.75rem"
  button-primary:
    backgroundColor: "{colors.seal}"
    textColor: "{colors.seal-ink}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.doc}"
    padding: "0.8125rem 1.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.doc}"
    padding: "0.8125rem 1.25rem"
  queue-field:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    typography: "{typography.metric}"
    rounded: "{rounded.none}"
    padding: "0.625rem 0.75rem"
  queue-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.lead}"
    rounded: "{rounded.none}"
    padding: "0.875rem 0"
    height: "120px"
  queue-action:
    backgroundColor: "transparent"
    textColor: "{colors.seal}"
    typography: "{typography.label}"
    rounded: "{rounded.doc}"
    padding: "0.5rem 0.875rem"
    height: "30px"
  pet-photo:
    backgroundColor: "{colors.field}"
    textColor: "{colors.seal-mid}"
    rounded: "{rounded.none}"
    size: "4.5rem"
---

# Design System: Nith Valley Animal Hospital

## Overview

**Creative North Star: "The Vaccination Certificate"**

The app is the document the practice issues about your animal. Not a dashboard, not a
feed, not a grid of equal-weight cards — a printed record on white stock, ruled into
fields and values, with the practice's mark at the head and the issuing address beneath
it. Every screen inherits that posture: a masthead, a heavy rule, then rows of
information separated by hairlines. Where a card app would draw a box, this one draws a
line and lets the white ground carry the rest.

The density is document density rather than app density. Rows sit on the page at their
natural height (measured 69px for an index row, 92px for an animal stub) with no fill,
no border box, no radius and no shadow. Structure comes entirely from the rules between
things and from the alternation of condensed uppercase field labels against normal-width
values. The one place the document raises its voice is the sealed row — a single navy
block per screen for the one action that leads — and the one place it uses colour as
information is the summary band, borrowed from the year-coded colour of a rabies tag.

Status never speaks in hue. A request's state is a stamp whose *shape* carries the
meaning: solid, dashed, doubled, filled, struck, struck-and-hatched. The stamps were
verified distinct under `filter: grayscale(1)`, and that verification is the standing
acceptance test, not a one-time check. This is the system's central accessibility
commitment and the reason several obvious shortcuts (a red chip, a green chip) are
permanently unavailable.

The document has two readers and it now issues two documents. The client gets a phone
record clamped at 32rem. The front desk gets a **ledger** — the same white stock and the
same hairlines, opened out to counter width, one ruled line per request, worked in place.
Both are the same world; the console is not a wider version of the client app but the
same grammar doing a different job. What separates them is that the console is the only
surface where a state mark and a control sit side by side all day, and that adjacency
produced the two rules this pass records: a mark that is *filled* is a state, and a
control that is *pressed* is outlined and named in the imperative.

**Key Characteristics:**

- White document stock; structure from rules, never from boxes or elevation
- One family, Archivo, worked across its width axis — condensed labels, normal values
- Field-label-and-value grammar on every surface
- State carried by mark shape; hue is decorative or supplementary, never load-bearing
- States are named as states, controls in the imperative; fills separate the two
- Light only; no dark mode, no theme switch
- At most one accent band and at most one sealed row per screen; never two of either
- A phone document at `max-width: 32rem` for clients; one widened breakpoint takes the
  front-desk console to `60rem` and spreads its ledger into columns

## Colors

Ink-on-paper: one near-black navy doing almost all the work, a soft navy for secondary
text, two structural greys for rules, the practice mark's two blues, and a single green
band standing in for a tag colour. All ratios below are measured against the actual
built page, not estimated.

### Primary

- **Certificate Ink** (`{colors.ink}`): the body text colour and the heavy boundary
  weight. **15.23:1** on stock. Used for all primary text, the 2px masthead rule, the
  1px underline beneath every field label, input borders, and photo frames (where the
  stylesheet names it `rule-ink` — a distinct role that deliberately resolves to the
  same value, so a boundary and a word are the same darkness).
- **Practice Navy** (`{colors.seal}`): the mark's navy. **12.36:1** on stock, and white
  on it is the same 12.36:1. This is the sealed-row fill, the primary button fill, the
  link colour, the focus-ring colour, and — since the ledger — the **ink and 1px border
  of an outlined ledger action**, where it reads at the same 12.36:1. It is the only
  large field of saturated colour in the client app apart from the band.
- **Mid Blue** (`{colors.seal-mid}`): the mark's lighter blue, **4.15:1** on stock.
  Reserved for non-text marks and large glyphs only — the stroke icons in index rows and
  the single large initial inside an empty photo frame (1.25rem, 600). It is below the
  4.5:1 body-text floor and must not be used for running text.

### Secondary

- **Tag Band Green** (`{colors.band}` on `{colors.band-ink}`): **5.34:1** with white
  text. Rabies tags are colour-coded by year; this is the app's borrowed version of that
  convention and the sole chromatic accent outside the logo blues. It appears once per
  screen at most, as a full-width band in the summary slot, and never as a text colour,
  an icon colour, or a per-row accent.

### Tertiary

- **Alert Oxblood** (`{colors.alert}`): **7.26:1** on stock. Error text, the error
  band's 1px border, and the declined stamp's ink and rule. Never a fill.

### Neutral

- **Document Stock** (`{colors.stock}`): the ground. Pure white, everywhere, always.
- **Ruled Field** (`{colors.field}`): the barely-there fill (**a 1.08:1 tint**, corrected
  this pass from a previously recorded 1.03) for the calm-day band, consent blocks, the
  emergency notice, photo-frame backing and skeletons. Body text on it measures 14.17:1;
  soft text measures 4.41:1.
- **Soft Ink** (`{colors.ink-soft}`): **4.74:1** on stock, **4.41:1** on field. Field
  labels, captions, meta lines, the ghost button. This is the floor — the system has no
  lighter text colour and must not acquire one.
- **Row Rule** (`{colors.rule-row}`): **3.30:1** on stock, 3.07:1 on field. The
  separator. Every row boundary, every stub perforation, the queue grid lines, and the
  emergency notice's border.
- **Hairline** (`{colors.rule}`): **1.38:1**. Decorative only.

### Named Rules

**The Two-Rule Rule.** `--rule` (1.38:1) is decorative. `--rule-row` (3.30:1) is the
separator. These are not interchangeable and the distinction is not stylistic: on this
system the rules *are* the information structure, and at 1.38:1 they were near-invisible
to an older client base. Any boundary a reader must perceive to parse the page takes
`--rule-row` or `--rule-ink`. `--rule` is permitted only for the underline on the back
link, the photo-swap affordance, the account divider, inline note tops, and the loading
skeleton's outline — places where losing the line loses nothing. The emergency notice was
moved off `--rule` during this build: with every peer separator raised to `--rule-row`,
the one block on the page that most needs an edge had ended up carrying the faintest one.

**The No-Hue-State Rule.** No state — anywhere, on any surface — may be communicated by
colour alone. State takes a stamp shape (see Components). Colour may reinforce a state it
does not carry. The acceptance test is one line: render the surface under
`filter: grayscale(1)`; if two states become the same mark, the design is wrong.

**The One Band Rule.** The green band appears at most once per screen, in the summary
slot, running the full content width. It is not a palette; there is no light-green, no
green text, no green icon.

**The Filled-Is-State Rule.** Where a state mark and a control sit adjacent in the same
row, **the fill belongs to the state and the control gives it up**. In the ledger the
filled `ready` stamp is a solid navy block; the buttons beside it are therefore navy
*outlines* on stock — same hue, 1px border, transparent fill. Before the fix, a filled
navy stamp and a filled navy button sat a few pixels apart and read as one object, so a
state looked pressable and a control looked like a status.

This is an **adjacency** rule, not a ban on filled controls. The world uses a filled navy
control natively and must keep doing so: the sealed row is a filled navy block, and the
primary button is filled navy on every form in the app. Both are correct — neither sits
next to a filled stamp. The audit test is one line: find every place a `.stamp`/`.badge`
and a control share a row; if both carry a fill, the control is wrong.

**The Light-Only Rule.** `color-scheme: light`, one `<meta name="theme-color">`
(`#1D3557`), and no `prefers-color-scheme` block anywhere in the stylesheet. Dark mode
existed and was removed on the practice's instruction. Do not reintroduce it, and do not
add a dark branch "just in case".

## Typography

**Display Font:** Archivo (variable, `wdth 62..125`, `wght 400..700`)
**Body Font:** Archivo — the same face
**Label Font:** Archivo at `font-stretch: 78%` — the same face, narrowed
**Fallback:** `'Helvetica Neue', Arial, sans-serif`

**Character:** One grotesque, worked across its width axis instead of paired with a
second family. Condensed uppercase for the document's own voice — field labels, section
headings, stamps, buttons, the masthead's issuing line — and normal width for everything
the document is *about*: an animal's name, a due line, a request detail, a count. The
narrowing is the hierarchy. Verified loaded on the live build
(`document.fonts.check('600 11px Archivo')` returns true); remote fonts do not load
offline under Capacitor, which is why the grotesque fallback is specified rather than a
generic `sans-serif`.

### Hierarchy

- **Title** (600, 1.125rem / 18px, 1.2, `wdth 78`, uppercase, .09em): page and screen
  headings (`h1`). Sits at ink.
- **Subtitle** (600, 0.8125rem / 13px, 1.2, `wdth 78`, uppercase, .09em): secondary
  headings (`h2`) in soft ink. Shares its metrics with `button`.
- **Record** (600, 1.0625rem / 17px, 1.5, `wdth 100`, −.005em): an animal's name on its
  stub. The largest normal-width type in the client app — the subject of the document.
- **Metric** (600, 1.375rem / 22px, 1.1, `wdth 100`, `tabular-nums`): the staff console's
  standing queue counts. The only role that uses tabular figures.
- **Body** (400, 1rem / 16px, 1.5, `wdth 100`): the root, set on `body`. The sealed row's
  label holds 1rem; everything that steps down from it uses Lead or Note below.
- **Lead** (0.9375rem / 15px, 1.5, `wdth 100`): the step immediately under Body, and the
  most-used size in the app after Body itself. Index-row labels and record titles take it
  at 600 (`.tile-label`, `.row-title`); summary details, notice body, and inline label
  text take it at 400 (`.summary-detail`, `.notice`, `label.inline`).
- **Note** (0.875rem / 14px, 1.45–1.5, `wdth 100`): quieter running text that is still
  prose rather than caption — the calm-day band (`.summary-clear`), consent wording
  (`label.consent`), and the account name (`.account-name`).
- **Caption** (400, 0.75rem / 12px, 1.5, `wdth 100`): row details and the issuing address
  (which takes `wdth 78` and .04em instead).
- **Label** (600, 0.6875rem / 11px, 1.2, `wdth 78`, uppercase, .09em): field labels,
  section labels, form labels, the back link, stub meta lines (at .07em). Always soft
  ink, and always followed by a 1px `rule-ink` underline when it heads a section.
- **Stamp** (700, 0.625rem / 10px, `wdth 78`, uppercase, .1em): status marks and the
  queue-field names (at 10px / .625rem).

**Off-ramp glyph sizes.** Three declarations sit deliberately outside the ramp, because
none of them is type being read as text — each is a letterform used as a graphic mark,
sized to its frame rather than to the hierarchy:

- `1.25rem` — the initial standing in for a missing photograph in a home-screen stub
  (`.stub-photo-empty`), and the disclosure chevron (`.chev`).
- `1.5rem` — the same initial in the larger 4.5rem frame on an animal's own record
  (`.pet-photo`).

The rule is the frame, not the number: a stand-in initial is sized to the box that holds
it. Do not treat either value as an available text size, and do not add further off-ramp
sizes without recording them here.

### Named Rules

**The One Family Rule.** Archivo alone, carried on its width axis. There is no second
face and no display face. Fraunces was inherited from the practice's website, was never a
binding practice commitment, and was retired during this build — do not reintroduce it or
substitute another serif for "warmth". Warmth in this system comes from the animals'
photographs, not from a typeface.

**The Two Widths Rule.** `font-stretch: 78%` is the document's voice; `font-stretch: 100%`
is the document's content. A row that renders as either a link or a button must be pinned
to `100%` and `text-transform: none` explicitly, or it inherits the button's stamped
casing and the same row shouts or whispers depending on its destination.

**The Soft-Ink Floor Rule.** `{colors.ink-soft}` at 4.74:1 is the lightest text in the
system. Do not lighten it, do not apply `opacity` to text (that took the completed stamp
below contrast once already), and do not introduce a third, fainter text tier.

**The Imperative-Control Rule.** A control is named for what pressing it *does*; a state
is named for what a thing *is*. They are separate vocabularies and the build keeps them
in separate maps in `src/lib/types.ts`: `ACTION_LABEL` (Reopen / Review / Approve / Mark
ready / Hand over / Decline) for buttons, `STATUS_LABEL` (Sent / Being looked at /
Approved / Ready for pickup / Picked up / Not approved) for stamps and for every word the
client reads. Reusing one wording for both shipped a button reading "Approved" beside a
stamp reading "Being looked at", which told a staff member nothing about what the button
would do. Never label a control with a status, and never label a stamp with a verb. Where
a control moves a record into a state, name the act on the face and the destination in
the `title` — the ledger's buttons read "Approve" and carry `Move to "Approved"`.

**The Provenance Rule.** Where a record can be authored by more than one party, the
surface says which. `SOURCE_LABEL` in `src/routes/Reminders.tsx` renders "From your pet
file" / "From the clinic" / "You set this" into the row's meta line, at Caption size in
soft ink alongside the animal and the kind — provenance is a field of the record, not a
badge or a colour. This is not decoration: a client can now write their own reminders
(`supabase/migrations/0008_client_reminders.sql`, which pins `source` in the database as
well as the app), and a note you wrote to yourself must never be readable as clinical
instruction from the practice.

## Layout

A single-column document. The client app is clamped at `max-width: 32rem` (measured
512px) with `1.5rem` top padding, `1.125rem` side padding and `4rem` bottom padding, and
`env(safe-area-inset-*)` applied on `body` so the Capacitor shell's notch and home
indicator are respected outside the content clamp.

Vertical rhythm is set by the field label: `1.75rem` of lead above, a `.3125rem` gap to
its 1px underline, then `.5rem` before the first row. Rows are `.8125rem` of vertical
padding each (index rows) or `.75rem` (stubs), so a section reads as a run of evenly
ruled entries rather than a stack of spaced objects. Sections are separated by `2rem`.

The summary slot reserves `3.75rem` (measured 60px) in every load state — skeleton,
error, band and calm day all occupy the same box — so the record below never shifts once
counts land. The slot sits `1.5rem` below the masthead rule; at the previous spacing the
masthead's 2px rule and the band's 3px top edge read as one thick double rule under the
logo instead of two separate signals.

**One width media query exists in the entire system**: `@media (min-width: 46rem)`, and
it scopes only to `.desk`, raising the staff console to `max-width: 60rem` (measured
960px, up from 44rem in the previous pass). The client app has no breakpoints at all, by
design — it is a phone document and stays one. The only other media query is
`prefers-reduced-motion`, which stops the skeleton pulse.

That one query now carries the ledger as well as the clamp. Above 46rem `.queue-row`
takes **fixed tracks with only the item column flexible** —
`9rem minmax(0, 1fr) 5.5rem 8.5rem 13.5rem`, measured `144 / 284 / 88 / 136 / 216`px
inside a 924px content width, with a `.25rem 0.875rem` gap and `.875rem` vertical padding
(measured 120px per row). The staff note drops to `grid-column: 2 / -1` on its own line
beneath. The action column is **fixed at 13.5rem and must stay fixed**: an `auto` track
sized itself to each row's button count, so a row with two buttons and a row with one
produced different column positions and the ledger stopped being a ledger. Measured on
the live console, the left edge of every one of the five tracks is identical across all
four rows — that identity is the acceptance test.

Below the breakpoint `.queue-row` has no `grid-template-columns` at all, so the six
fields fall into a single implicit column and a request stacks. That branch has not been
rendered (see Known Gaps).

### Named Rules

**The Phone-Document Rule.** The client app gets no breakpoints. If a client surface
looks sparse on a wide screen, that is the correct outcome; do not add a column, a
two-up grid, or a wider clamp. `(min-width: 46rem)` belongs to `.desk` alone.

**The Reserved-Slot Rule.** Any block whose content arrives asynchronously reserves its
final height first. Loading, error and success occupy the same box.

**The Fixed-Track Rule.** In a ruled ledger, every column is a fixed width except the one
carrying the longest content. A track sized `auto` takes its width from the row's own
content, so each line resolves differently and the columns stop reading down the page —
which is the only thing that makes a ledger scannable. One flexible track per ledger,
`minmax(0, 1fr)` so it can shrink; everything else in `rem`.

## Elevation & Depth

**There is no elevation.** `--shadow: none` is a real token and it is the only shadow
value in the system; `box-shadow` computes to `none` on every row, tile, band and queue
cell on the live build. There is no hover lift, no focus glow, no scrim, no
backdrop-filter, and no z-layering beyond normal document flow.

Depth is conveyed by rule weight alone, in three steps:

- **2px `rule-ink`** — a masthead. The practice's masthead over the issuing address, and
  (since the pet file header) the head of an animal's own record. Two uses, one meaning:
  this is the top of a document, and what follows belongs to it.
- **1px `rule-ink`** — a field label's underline, an input's border, a photo frame. A
  boundary that belongs to the ink.
- **1px `rule-row`** (3.30:1) — a separator between peer rows. Solid for index rows and
  for ledger rows, **dashed** for animal stubs, where the dash reads as the perforation on
  a detachable certificate stub.

Fill is used only three ways: `field` as a near-white tint for a passive block, `seal` for
the single sealed row, `band` for the summary. Nothing else has a background.

### Named Rules

**The Flat-Forever Rule.** `--shadow: none` is not a default awaiting a value. Do not add
a shadow token, a hover elevation, or a "subtle" 1px offset. If a thing needs to separate
from what is around it, it gets a rule.

## Shapes

Rectangles. `--radius: 2px` exists for the few filled blocks that need the corner taken
off an edge — inputs, buttons, the summary band, the emergency notice — and `--pill: 2px`
is deliberately the same value, so a pill and a rectangle are the same shape. Rows,
tiles, stamps, queue cells, photo frames and the sealed row all compute to `0`.

Two silhouettes recur and both come from paper:

- **The perforation** — a 1px dashed `rule-row` bottom edge, used on animal stubs.
- **The empty frame** — a square dashed `rule-ink` border with a single large initial in
  mid blue, used wherever a photograph has not been supplied. It is a designed state, not
  a grey placeholder circle: it is the blank box the certificate ships with.

Icons are 1.125rem (18px) inline SVG strokes at `stroke-width: 1.6`, `currentColor`,
round caps and joins, inlined in `src/components/Icon.tsx` rather than pulled from a
package. Thirteen paths; each row's icon is specific to that row's meaning.

### Named Rules

**The No-Cards Rule.** A row carries no fill, no border box, no radius and no shadow.
Grouping is expressed by a field label above and hairlines between. If a surface needs a
card to make sense, the surface is wrong.

**The No-Side-Tab Rule.** A coloured stripe down one side of a block is refused outright.
It was found and removed twice during this build. The band runs the full content width as
a *band*; the calm-day variant takes a 3px top edge, and `border-left` computes to 0 on
the live page. Vertical accent stripes, left-border status bars, and per-row colour tabs
are all the same tell and all prohibited.

## Components

### Index Row (`.tile`)

The workhorse. A ruled line item that reads as an entry in an index, not a button.

- **Shape:** square (0 radius), no fill, 1px solid `rule-row` bottom rule
- **Grid:** `auto 1fr` — an 18px icon, then a two-line text block; `.75rem` gap
- **Padding / height:** `.8125rem 0`; measured 69px
- **Type:** label at 600 / .9375rem, detail at .75rem in soft ink, both at `wdth 100`
- **Icon:** mid blue, 18px stroke
- **States:** `.pending` drops to 45% opacity; focus takes the global 2px `seal` outline
  at 2px offset. There is no hover fill and no active depression.
- **External variant:** adds a third grid column carrying a 14px corner-arrow mark at 80%
  opacity, for rows that hand off to a third-party site.

### Sealed Row (`.tile-primary`)

The single action that leads a screen. One per surface.

- **Shape:** square; no bottom rule (it is a block, not a row in the run)
- **Fill:** `seal` with `seal-ink` text; detail line at 78% opacity
- **Padding / height:** `1rem .875rem`; measured 75px
- **Type:** label steps up to 1rem
- **Rule:** **at most one per screen — never two.** A second sealed row makes both of them
  ordinary. Zero is correct where the screen's leading job is not a link: `#/desk` now
  carries none, because the console's leading act is working the ledger in place, and a
  navy block sending the front desk somewhere else would be pointing away from the work.
  The previous pass recorded this as "exactly one", which the rebuilt console falsified.

### Animal Stub (`.stub`)

The detachable section of a certificate — one per animal, each showing the one thing it
needs.

- **Grid:** `3.5rem 1fr auto` — photo frame, body, optional trailing mark; `.875rem` gap
- **Separator:** 1px **dashed** `rule-row` — the perforation
- **Padding / height:** `.75rem 0`; measured 92px
- **Photo:** 56px square, 1px `rule-ink` border, `object-fit: cover`. The frame is its own
  label-wrapped file input so tapping the picture attaches one, while the body beside it
  links into the animal's record — two targets, two jobs, in one row.
- **Empty photo:** dashed border, the name's initial at 1.25rem / 600 in mid blue
- **Body:** name (Record role), meta line (species · breed, Label metrics at .07em), due
  line at .8125rem; `.due.clear` drops to soft ink for "Nothing due"

### Pet File Header (`.pet-head`)

The head of an animal's own record. The animal leads its file; the picture is not
something that only exists on the home screen.

- **Grid:** `4.5rem 1fr`, `1rem` gap, `1rem` bottom padding over a **2px `rule-ink`**
  bottom rule — the same weight as the practice masthead, and `1.25rem` clear beneath it
- **Photo:** 72px square (`4.5rem`), 1px `rule-ink` border, `object-fit: cover`, `field`
  backing. The frame is a `<label>` bound to a clipped file input, so tapping the picture
  attaches or replaces one; `:focus-within` puts the standard 2px `seal` outline on it
- **Empty photo:** the dashed frame with the name's initial at **1.5rem** / 600 in mid
  blue — the larger frame's stand-in, sized to the box (see Off-ramp glyph sizes)
- **Type:** the animal's name as Title (h1, 18px, `wdth 78`, uppercase) with `.25rem`
  beneath, then species · breed in soft ink

### Status Stamp (`.stamp`)

The system's signature component and its accessibility spine. Mapped from status in
`src/lib/types.ts` (`STATUS_STAMP`). All six measured 23px tall, 10px / 700 / `wdth 78` /
uppercase / .1em, 0 radius, `.1875rem .5rem` padding.

- **Sent** (`submitted`): 1px **solid** ink border, no fill
- **Being looked at** (`in_review`): 1px **dashed** ink border
- **Approved** (`approved`): 3px **double** ink border, padding tightened to
  `.0625rem .4375rem` so the box holds its height
- **Ready for pickup** (`ready`): **filled** ink, stock text
- **Picked up** (`completed`): solid soft-ink border, soft-ink text, **line-through**
- **Not approved** (`declined`): solid alert border, alert text, **line-through**, plus a
  135° **hatch** at `rgba(20,38,63,.16)` on a 3px/2px repeat

Picked up and Not approved are opposite outcomes, so they may not differ by hue or by
lightness alone — struck-plain versus struck-and-hatched is what separates them in
greyscale. No `opacity` is used on any stamp; it took the completed variant below
contrast.

The **bare base mark** (`.badge` with no `stamp-*` modifier — 1px solid ink, no fill) is a
second, legitimate use of the same object: a *due* marker, applied on pet-file rows and
reminder rows when `isSoon()` is true, carrying text like "Due in 4 days". It shares the
stamp's box because it is the same kind of statement — a short mark the document has
struck onto a row — and it takes the plainest shape precisely so it never competes with a
request status. Four of the six status shapes (sent, review, approved, ready) were
exercised live on this pass; `stamp-done` and `stamp-declined` are defined but the current
data closes no requests, so they were verified from the stylesheet rather than measured.

In the ledger, `.queue-row .badge` drops its `.375rem` top margin to `0` so the stamp
aligns to the top of its row alongside the other fields; measured 23px tall there, the
same as everywhere else.

### Summary Band (`.summary`)

The one accent, in the summary slot, in four mutually exclusive states that share a
`3.75rem` box.

- **Due:** `band` fill, `band-ink` text, 2px radius, `.75rem .875rem` padding. Title in
  Label metrics at .08em, detail at .9375rem.
- **Calm day** (`.summary-clear`): `field` fill, 3px `band` **top** edge, no radius,
  `.875rem` side padding, ink text at .875rem. Full width; no side stripe.
- **Error:** stock fill, 1px `alert` border, title in alert, detail in soft ink, rendered
  as a real button that retries. A failed load is never rendered as an all-clear.
- **Loading:** `field` fill, 1px `rule` border, a 1.4s opacity pulse to 55%, disabled
  under `prefers-reduced-motion`.

### Field Label (`.field-label`, `.section-label`)

The document's section marker and the primary grouping device, standing in for the card
header the system refuses.

- Label role in soft ink, `display: block`
- `1.75rem` top lead, `.3125rem` to a full-width 1px `rule-ink` underline, `.5rem` below
- Never bold-and-black, never a background; the underline is what makes it a heading

### Account Row (`.account`)

The signed-in footer, shared by both homes so the client and staff surfaces cannot drift.

- **Grid:** `2.75rem 1fr auto`, `.75rem` gap, `2rem` top margin, `.875rem` top padding
  above a 1px `rule` divider (decorative here — it closes the document rather than
  separating peers)
- **Avatar:** 44px square, 1px `rule-ink`; empty state is the dashed frame with a 1rem
  initial in mid blue, wrapped in a label bound to a hidden file input
- **Action:** ghost button ("Sign out")

### Inputs and Buttons

- **Input / select / textarea:** full width, `.75rem` padding, stock fill, 1px `rule-ink`
  border, 2px radius, inherited body type. Textareas resize vertically only.
- **Label:** Label role in soft ink; `.inline` and `.consent` variants reset to normal
  width, sentence case and 400 weight so a checkbox's text reads as a sentence. Consent
  blocks take a `field` fill and a 1px dashed `rule-ink` border.
- **Primary button:** `seal` fill, `seal-ink` text, `.8125rem 1.25rem` padding, 2px
  radius, Subtitle metrics (600 / .8125rem / `wdth 78` / uppercase / .09em). Disabled
  drops to 45% opacity.
- **Ghost button:** no fill, soft-ink text, 1px `rule-ink` border, same metrics. The
  secondary action anywhere in the app — "Cancel", "Sign out", "Remind me later", "Done".
- **Ledger action button** (`.queue-act button`): no fill, **`seal` text and a 1px `seal`
  border**, Label metrics at 11px, `.5rem .875rem` padding, measured 30px. The third and
  last button treatment. It is not a ghost — a ghost is a secondary action in soft ink;
  this is a *primary* action that has given up its fill to stay distinct from an adjacent
  filled stamp, so it keeps the accent in its ink and border. Do not introduce a fourth
  variant; if a control needs to look different, it belongs in one of these three.
- **Focus:** one treatment system-wide — `outline: 2px solid var(--seal)` at `2px` offset,
  on inputs, buttons, links, and (via `:focus-within`) both photo slots.

### Queue Fields (`.queue-fields`) — staff console only

The front desk's standing counts, expressed as fields of the document.

- **Grid:** three equal columns with a **1px gap over a `rule-row` background**, inside a
  1px `rule-row` border — the gaps *are* the rules; there is no per-cell border
- **Cells:** stock fill, `.625rem .75rem` padding, 0 radius, no shadow, no per-tile accent
- **Type:** Metric value (22px, 600, tabular) over a 10px `wdth 78` uppercase name in soft
  ink

**This component sits close to the hero-metric tile template the system otherwise
refuses, and is held onside only by carrying no fills, no radii, and no per-tile accent
colours.** That is the line. Adding a coloured number, an icon, a tile background or a
trend arrow turns it into the thing it is imitating, and it should be re-examined rather
than extended.

### Queue Ledger (`.queue`, `.queue-row`) — staff console only

**The signature component of the staff side, and the surface the previous pass scored
*partial*.** The queue is now worked in place on `#/desk`: one ruled line per request,
read across, with the controls that move it on the same line. It is not a list of links
to a queue — a queue sitting one click behind a link is a menu, not a console. Shared
loader, mutations and derived counts live in `src/lib/useRequestQueue.ts`, and the same
`QueueList` renders both `#/desk` (open requests) and `#/staff` (all, including closed),
so the two surfaces cannot drift on what a request is or how it moves.

- **Shape:** no fill, no radius, no shadow. A 1px solid `rule-row` bottom rule per row —
  the same separator as an index row. It is a run of ruled entries, not a stack of cards
- **Row:** `.875rem` vertical padding, `.25rem 0.875rem` gap; measured **120px** at
  counter width (125.5px when a client's quoted note is present)
- **Fields, in reading order:** animal (name at Lead/600 over household in Label metrics,
  `wdth 78`, .07em, soft ink) · item (product at Lead/400 over the client's note in
  quotation marks at Note size, soft ink) · date sent (Caption, soft ink, tabular) ·
  status stamp · actions
- **Staff note:** a real full-width text input on its own line at `grid-column: 2 / -1`,
  Note size, `.75rem` padding, 1px `rule-ink` border, 2px radius, saved on blur. Measured
  766×47px. It is the one place in the ledger with a border box, and it has one because
  it is an input — the field-and-value grammar's own device, not a card
- **Actions** (`.queue-act`): a `.5rem`-gapped wrapping flex row of **outlined** buttons —
  transparent fill, 1px `seal` border, `seal` text, Label metrics (11px / 600 / `wdth 78`
  / uppercase / .09em), `.5rem .875rem` padding, 2px radius; measured 30px tall. Outlined
  by the Filled-Is-State Rule, because the filled `ready` stamp sits inches away
- **Wording:** faces carry `ACTION_LABEL` (Review, Approve, Mark ready, Hand over,
  Decline); the `title` carries the destination state. See the Imperative-Control Rule
- **Transitions** are deliberately linear (`NEXT` in `useRequestQueue.ts`): one step
  forward, decline always available, so nobody has to hold a state machine in their head

**The line to hold.** The ledger earns its width by staying a document: no row fill, no
row hover, no zebra striping, no per-status row tint, no drag handles, no sticky header.
The moment a row gets a background it becomes the card grid the whole world refuses.

### Hidden File Inputs

`.photo-field` and `.sr-only` are clipped (`clip-path: inset(50%)`), never
`display: none`. Hiding them dropped photo capture out of the tab order entirely and the
feature shipped mouse-only.

## Do's and Don'ts

### Do:

- **Do** separate peers with 1px `{colors.rule-row}` (3.30:1) and reserve
  `{colors.rule}` (1.38:1) for decoration only.
- **Do** carry every state on a stamp shape — solid, dashed, double, filled, struck,
  hatched-struck — and verify the surface under `filter: grayscale(1)` before shipping it.
- **Do** work hierarchy through Archivo's width axis: `font-stretch: 78%` uppercase for
  the document's voice, `100%` for its content.
- **Do** head each group with a field label and its 1px `rule-ink` underline instead of
  drawing a container.
- **Do** reserve a block's final height across loading, error and ready states — the
  summary slot's `3.75rem` is the pattern.
- **Do** keep at most one sealed row and at most one band per screen. Zero sealed rows is
  right where the screen's leading act happens on the page rather than behind a link.
- **Do** render a missing photograph as the dashed empty frame with the subject's initial
  in `{colors.seal-mid}`.
- **Do** clip visually-hidden inputs rather than removing them from the tab order.
- **Do** keep `{colors.seal-mid}` (4.15:1) to icons and large glyphs; it is not a text
  colour.
- **Do** give the fill to the state where a stamp and a control share a row: the stamp
  stays filled, the button becomes a 1px `{colors.seal}` outline.
- **Do** name a control for what pressing it does (`ACTION_LABEL`) and a state for what a
  thing is (`STATUS_LABEL`), and keep the two vocabularies in separate maps.
- **Do** say where a record came from — "From your pet file", "From the clinic", "You set
  this" — in the row's meta line, wherever more than one party can author it.
- **Do** fix every ledger column in `rem` except the one flexible content column
  (`minmax(0, 1fr)`), so the tracks read down the page.
- **Do** work the queue in place on the console. A queue behind a link is a menu.

### Don't:

- **Don't** add a dark mode, a `prefers-color-scheme` block, or a second `theme-color`.
- **Don't** introduce a second typeface — no display face, no serif, and specifically not
  Fraunces, which was retired from this build.
- **Don't** give a row a fill, a border box, a radius or a shadow. `--shadow: none` is the
  whole elevation system.
- **Don't** run a coloured stripe down one side of a block. The band is full-width; a side
  tab has been removed from this build twice.
- **Don't** signal state with colour alone, and don't use `opacity` on text to express it.
- **Don't** add a width breakpoint to the client app. `(min-width: 46rem)` is scoped to
  `.desk` and stays there.
- **Don't** lighten `{colors.ink-soft}` or add a fainter text tier beneath it.
- **Don't** extend `.queue-fields` with tile backgrounds, per-cell accents, icons or trend
  marks.
- **Don't** render a failed load as "nothing due". Loading, error and empty are three
  states with three treatments.
- **Don't** sit a filled control beside a filled stamp. (This bans the *adjacency*, not
  the filled control — the sealed row and the primary button stay filled navy.)
- **Don't** put a status word on a button face, or a verb on a stamp.
- **Don't** give a ledger row a fill, a hover state, zebra striping or a per-status tint.
- **Don't** size a ledger column `auto`; it makes each row resolve its own widths.
- **Don't** add a fourth button treatment. Filled primary, ghost secondary, outlined
  ledger action — that is the whole set.

## Known Gaps in the Built World

Recorded as of this pass so a future one does not mistake them for settled decisions.

- **CLOSED — the staff console's *partial* verdict.** The previous pass recorded `#/desk`
  as "a menu, not a console", with the queue one click behind a link. Re-judged against
  the live build: the queue is worked in place, four real requests deep, each row carrying
  its own status stamp and its own transition controls, with the counts derived from the
  same loader that renders the rows. The console is now a console. This finding is
  retired, not carried forward. What replaces it is narrower and is recorded above as the
  line to hold: the ledger stays a document, and the first row fill undoes it.
- **CLOSED — the certificate world's warmth.** The previous pass recorded that no pet
  photographs existed and the world's only source of warmth was therefore unproven.
  Re-judged: all four animals on `#/home` render real photographs in the 56px frame, and
  the pet file header renders one at 72px. Measured live — 4 of 4 stubs carry
  `img.stub-photo`, 0 render the empty frame. The assumption held: with photographs in
  place, the white stock reads as a record about an animal rather than as a form. **The
  empty frame remains a designed state and must stay** — it is what a new animal ships
  with, and both stand-in sizes stay recorded under Off-ramp glyph sizes.
- **OPEN, and sharper than before — the app has still never been rendered at a real device
  viewport.** Browser resizing does not take effect in this harness. The 390px
  layout-width substitute is now *less* informative than it was last pass, because `.desk`
  has acquired a genuinely width-conditional layout the substitute cannot reach:
  `matchMedia('(min-width: 46rem)')` returns true under the substitute, so the ledger
  keeps its five fixed tracks inside a 390px container and measures a 268px overflow that
  a real phone would never produce. On real hardware the media query would not match, the
  fixed tracks would not apply, and `.queue-row` would stack into one implicit column.
  **That stacked branch is unrendered and unmeasured.** The client app remains free of
  breakpoints and measured clean at the substitute width (0 horizontal overflow, stub
  91.5px, sealed row 75px, index row 68.5px), but the substitute still does not exercise
  `env(safe-area-inset-*)`, real hit-testing, or mobile text-size adjustment. Treat both
  the phone layout and the ledger's stacked form as unverified until seen on hardware.
- **OPEN — nine routes have still not been individually re-laid-out** against the
  field-and-value grammar (down from eleven). `#/pets/:id` gained the pet file header and
  `#/staff` gained the ledger since the last pass, joining `#/home` and `#/desk`. The
  remainder — login, the pet index, the request form, the client request list, reminders,
  both photo surfaces, contact and services — inherit the world through the legacy aliases
  at `:root` (`--bg`, `--surface`, `--text`, `--border`, `--accent`, `--shadow`,
  `--font-display`, `--font-body`), which resolve into certificate tokens. They are
  on-palette and on-type, but their composition has not been reconsidered. `#/reminders`
  is the closest call: it gained real provenance wording this pass but its layout is still
  the generic `.row` + `.actions` stack, so it counts as un-reworked.
- **OPEN — a copy defect the system does not sanction.** On `#/pets/:id`, supply rows
  render `Runs out {relativeDue(...)}` and `relativeDue()` already returns a "due …"
  phrase, so the live page reads "Runs out due tomorrow" and "Runs out due in 4 days".
  Recorded here as a defect to fix, **not** as a wording pattern: the Imperative-Control
  Rule's separation of vocabularies is the system rule, and this is a string-composition
  bug in `src/routes/Pet.tsx`.
