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

**Key Characteristics:**

- White document stock; structure from rules, never from boxes or elevation
- One family, Archivo, worked across its width axis — condensed labels, normal values
- Field-label-and-value grammar on every surface
- State carried by mark shape; hue is decorative or supplementary, never load-bearing
- Light only; no dark mode, no theme switch
- One accent band, one sealed row, per screen
- A phone document at `max-width: 32rem` for clients; a single widened breakpoint for
  the front-desk console

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
  link colour, and the focus-ring colour. It is the only large field of saturated colour
  in the client app apart from the band.
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
- **Ruled Field** (`{colors.field}`): the barely-there fill (**a 1.03:1 tint**) for the
  calm-day band, consent blocks, the emergency notice, photo-frame backing and skeletons.
  Body text on it measures 14.17:1; soft text measures 4.41:1.
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
link, the photo-swap affordance, the account divider, and inline note tops — places
where losing the line loses nothing.

**The No-Hue-State Rule.** No state — anywhere, on any surface — may be communicated by
colour alone. State takes a stamp shape (see Components). Colour may reinforce a state it
does not carry. The acceptance test is one line: render the surface under
`filter: grayscale(1)`; if two states become the same mark, the design is wrong.

**The One Band Rule.** The green band appears at most once per screen, in the summary
slot, running the full content width. It is not a palette; there is no light-green, no
green text, no green icon.

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

**Off-ramp glyph sizes.** Two declarations set `font-size: 1.25rem` and are deliberately
not ramp steps, because neither is type being read as text: the initial letter standing in
for a missing photograph inside a stub's frame (`.stub-photo-empty`), and the disclosure
chevron (`.chev`). Both are letterforms used as graphic marks, sized to their frame rather
than to the hierarchy. Do not treat 1.25rem as an available text size, and do not add
further off-ramp sizes without recording them here.

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
it scopes only to `.desk`, raising the staff console to `max-width: 44rem` (measured
704px). The client app has no breakpoints at all, by design — it is a phone document and
stays one. The only other media query is `prefers-reduced-motion`, which stops the
skeleton pulse.

### Named Rules

**The Phone-Document Rule.** The client app gets no breakpoints. If a client surface
looks sparse on a wide screen, that is the correct outcome; do not add a column, a
two-up grid, or a wider clamp. `(min-width: 46rem)` belongs to `.desk` alone.

**The Reserved-Slot Rule.** Any block whose content arrives asynchronously reserves its
final height first. Loading, error and success occupy the same box.

## Elevation & Depth

**There is no elevation.** `--shadow: none` is a real token and it is the only shadow
value in the system; `box-shadow` computes to `none` on every row, tile, band and queue
cell on the live build. There is no hover lift, no focus glow, no scrim, no
backdrop-filter, and no z-layering beyond normal document flow.

Depth is conveyed by rule weight alone, in three steps:

- **2px `rule-ink`** — the masthead. The document's own edge.
- **1px `rule-ink`** — a field label's underline, an input's border, a photo frame. A
  boundary that belongs to the ink.
- **1px `rule-row`** (3.30:1) — a separator between peer rows. Solid for index rows,
  **dashed** for animal stubs, where the dash reads as the perforation on a detachable
  certificate stub.

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
- **Rule:** exactly one per screen. A second sealed row makes both of them ordinary.

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
- **Ghost button:** no fill, soft-ink text, 1px `rule-ink` border, same metrics.
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
- **Do** keep exactly one sealed row and at most one band per screen.
- **Do** render a missing photograph as the dashed empty frame with the subject's initial
  in `{colors.seal-mid}`.
- **Do** clip visually-hidden inputs rather than removing them from the tab order.
- **Do** keep `{colors.seal-mid}` (4.15:1) to icons and large glyphs; it is not a text
  colour.

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

## Known Gaps in the Built World

Recorded as of this pass so a future one does not mistake them for settled decisions.

- **The staff console was scored *partial* by the finish review.** It is materially
  improved — it has its own masthead, its own summary slot, its own queue fields and its
  own sealed row — but it still reads closer to a document with a summary block than to a
  queue console a five-person front desk works all day. The next pass on `.desk` should
  treat that as the open problem.
- **The app has never been rendered at a real device viewport.** Browser resizing does not
  take effect in the harness this was built in. A 390px layout-width substitute measured
  clean — 0 horizontal overflow, stub 92px, sealed row 75px, index row 69px, queue cells
  117px with unclipped labels — but that substitute does not exercise `env(safe-area-inset-*)`,
  real hit-testing, or mobile text-size adjustment. Treat the phone layout as unverified
  until it has been seen on hardware.
- **The certificate world's warmth is unproven.** No pet photographs exist on file yet, so
  every stub currently renders the dashed empty frame with a letter. The design assumes
  photographs are what stop the document reading as cold; that assumption has not been
  tested against real content.
- **Eleven routes were not individually reworked** in the pass that built this world. They
  inherit it through the legacy aliases at `:root` (`--bg`, `--surface`, `--text`,
  `--border`, `--accent`, `--shadow`, `--font-display`, `--font-body`), which resolve into
  certificate tokens. They are on-palette and on-type, but their composition has not been
  reconsidered against the field-and-value grammar.
