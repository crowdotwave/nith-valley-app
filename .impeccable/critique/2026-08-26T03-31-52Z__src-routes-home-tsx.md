---
target: the home page
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-26T03-31-52Z
slug: src-routes-home-tsx
---
⚠️ DEGRADED: single-context (sub-agent spawning disabled by session operator config; Assessment A and B run inline, A completed before detector output was read)

**Target:** `src/routes/Home.tsx` · **Browser pass:** skipped. Home is gated behind Supabase auth and authenticating is not something I can do on the user's behalf.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | `due`/`open` counts fetch async with no loading state; both initialise to `0`, so "nothing due" and "still loading" are visually identical |
| 2 | Match System / Real World | 3 | Copy is plainspoken and good ("What is coming due", "Track what you have sent"); parallel actions use non-parallel verbs (Order food / Request medication) |
| 3 | User Control and Freedom | 3 | Launcher surface, little to escape from; Sign out has no confirmation |
| 4 | Consistency and Standards | 2 | `<Link>` tiles and the external-booking `<button>` tile are visually identical; `list` icon is reused for two unrelated tiles |
| 5 | Error Prevention | 2 | No confirm on Sign out; neither Supabase query is guarded |
| 6 | Recognition Rather Than Recall | 3 | Every icon is labelled, every group is labelled; only the duplicate icon hurts |
| 7 | Flexibility and Efficiency | 1 | Nine equally-weighted tiles, no recents, no personalisation, no shortcut to the common action |
| 8 | Aesthetic and Minimalist Design | 3 | Genuinely clean and restrained; the flaw is flat hierarchy, not clutter |
| 9 | Error Recovery | 0 | Zero error affordances on this route; both `.then()` chains have no `.catch()` |
| 10 | Help and Documentation | 2 | No help surface, but tile `detail` lines carry real inline micro-guidance |
| **Total** | | **20/40** | **Acceptable (bottom of band)** |

## Design Specificity Verdict

**LLM assessment.** Split verdict, and the split is the story.

The *surface* is specific. The palette is lifted from the practice's own site rather than invented (navy `#1D3557`, pale blue ground, Fraunces for display), the dark mode is derived from that same navy instead of a generic grey ramp, and the white plate behind the logo in dark mode is the kind of fix that only happens when someone actually looked at the screen. The spacing scale is consistent, the shadow is restrained, focus-visible is defined globally. This is careful work.

The *composition* is category-interchangeable. A three-by-three grid of icon + label + detail tiles under uppercase section labels is the default utility-launcher shape. Swap nine strings and this is a dentist, a car dealership, or a municipal services portal; nothing about the structure says veterinary. For a business whose emotional core is "I am worried about my animal," the home screen is a directory.

The single biggest missed opportunity: **the pet is absent.** The app knows the user's pets (there is a whole `/pets` route and a `paw` tile pointing at it) and the home screen shows none of them. No name, no photo, no "Ruby is due for her heartworm refill." The one genuinely warm item on the page, "Send us a photo," is in position 9 of 9.

**Deterministic scan.** `node .claude/skills/impeccable/scripts/detect.mjs --json src/routes/Home.tsx` → exit 0, `[]`, zero findings. Clean. Note what that does and does not mean: the detector catches mechanical defects (broken images, clipping, contrast failures, gradient text, glow shadows, design-system drift) and found none, which is consistent with the care visible in the CSS. Every issue below is a judgment-level finding the detector is not built to catch. A clean detector run is a floor, not a verdict.

**Contrast, checked manually** since the detector had no browser to measure in: `--muted #5f7590` on white is **4.74:1**, passing AA for normal text, but that is the tightest ratio on the page and `.tile-detail` renders it at 13px. Dark mode `--muted #93aabe` on `--surface #182333` is **6.58:1**, comfortable. `.summary-detail` at `opacity: .82` over navy is **8.85:1**. No contrast failures; the light-mode muted is the one to stop lowering.

**Visual overlays.** None. No reliable user-visible overlay is available for this run; see the browser note above.

## Overall Impression

This is a competent, quiet, well-mannered screen that does not yet know what it is for. The craft floor is high and the ceiling is unclaimed. Nine tiles of identical visual weight mean the design expresses no opinion about what a pet owner actually opens this app to do, and the data to form that opinion is already being fetched, then used only for a conditional banner.

The biggest opportunity is not visual. It is that the home screen has the user's pets and their due reminders in hand and renders a menu instead.

## What's Working

1. **The conditional summary card.** It renders only when `due > 0`, and the code comment says exactly why: "a card that is always there stops being read." That is a real design conviction, correctly implemented. It is the only element on the page with earned prominence.
2. **The palette derivation.** Building dark mode from the practice's navy rather than a stock grey, then noticing the navy logo would vanish and putting it on a white plate, is two levels deeper than most work gets.
3. **The copy.** "What is coming due," "Track what you have sent," "Opens our scheduling system." Plain, warm, and honest about what the button will do; that last one pre-empts a whole class of confusion.

## Priority Issues

### [P0] Both count queries fail silently, and the failure looks like good news

`useEffect` fires two Supabase queries, each terminating in `.then(({ count }) => setState(count ?? 0))`. There is no `.catch()`. If the network drops or the query errors, `due` stays `0`, the summary card never renders, and the user sees a home screen that looks completely normal and says nothing is due.

**Why it matters:** in this app "nothing due" means "no medications need refilling." A transient network error renders a confident, wrong, health-adjacent claim. The user cannot detect the failure, because absence of the card is also the correct rendering for the healthy case. This is the one issue I would fix before any visual work.

**Fix:** track three states, not one: `loading`, `error`, `count`. Render a skeleton while loading, and on error render the card in a degraded form ("Couldn't check reminders, tap to retry") rather than rendering nothing. Never let a failed fetch be indistinguishable from a zero result.

**Suggested command:** `/impeccable harden`

### [P1] The summary card pushes the entire page down after load, into the user's thumb

The card is conditional on `due > 0`, which is only known after the query resolves. Until then the nine tiles sit higher on the screen; when it resolves, everything shifts down by roughly the card's height plus its margin.

**Why it matters:** on a phone on a slow connection, the user is already reaching for "Book an appointment" when the layout jumps and they land on "Contact us" instead. This is a mis-tap generator, and it hits the primary action hardest because the primary action is the topmost tile.

**Fix:** reserve the space. Render a fixed-height placeholder for the card while loading so the tile positions never move, or render the card in a neutral loading state from first paint.

**Suggested command:** `/impeccable harden`

### [P1] Nothing on the page is primary

Nine tiles share one visual treatment: same background, same border, same radius, same shadow, same padding, same type scale. The only differentiation is the section labels and the conditional card. Every option costs the same amount of attention, so the page has no entry point and the user re-scans all nine every visit.

**Why it matters:** this is the visual noise floor problem: when everything has equal weight, nothing is findable and the interface makes the user do the prioritising it should have done. It also caps the cognitive-load score: nine visible options is past the 8+ "overloaded" threshold even though the grouping into threes is correct.

**Fix:** decide what a pet owner opens this app to do and give that one thing real weight. Booking and refills are the plausible candidates. Promote one to a full-width primary card with the accent background, demote the remaining tiles' shadow, and let the groups carry the rest.

**Suggested command:** `/impeccable layout`

### [P1] The tile that leaves the app looks exactly like the tiles that don't

"Book an appointment" renders as `<button onClick={openBooking}>`, which calls `window.open` to a Covetrus domain. Every other tile is a `<Link>` that navigates in-app. They are pixel-identical.

**Why it matters:** the user taps what looks like the app's own primary action and lands on a third-party page with different branding, a long opaque JWT in the URL, and no way back. For a less confident user that reads as "did I just get phished?", and it is the *first* tile on the page, so it is the most likely first tap. The `detail` line ("Opens our scheduling system") does real work here, but it is 13px muted text carrying the entire warning.

**Fix:** mark the boundary visually: an external-link glyph in the tile, or a distinct treatment for tiles that leave the app. Under Capacitor this is already planned to present as a sheet via `@capacitor/browser`, which solves it on native; the web path still needs the affordance.

**Suggested command:** `/impeccable clarify`

### [P2] The home screen of a pet app has no pet in it

Covered in the specificity verdict; restating as an actionable item because it is the highest-ceiling change on the page. The app has the user's pets and their due reminders and renders neither above the fold.

**Why it matters:** this is the difference between a directory and a product. It is also the cheapest available warmth: the emotional peak of a vet relationship is the animal, and showing it costs one query the app is already positioned to make.

**Fix:** lead with the pets. A row of pet avatars with names under the header, each linking to `/pets/:id`, with due-reminder state expressed per pet rather than as an anonymous aggregate count. "Ruby, heartworm due in 3 days" is a different product from "2 things coming due."

**Suggested command:** `/impeccable delight` (or `/impeccable shape` for a full recomposition)

## Persona Red Flags

Selected for a public-facing clinic app used on phones by a general audience including older clients.

**Casey (Distracted Mobile User).** The layout shift above is her exact failure mode: reaching for the top tile as the page reflows. Everything she uses most is top-anchored in a scrolling list, while the bottom of the screen, the only part her thumb reaches comfortably, holds "Send us a photo" and **Sign out**. The easiest control to hit without looking is the one that ends the session, and it has no confirmation. Tap targets themselves are fine; tiles compute to roughly 56px tall, comfortably past 44pt.

**Jordan (Confused First-Timer).** Taps the first tile, leaves the app, lands on Covetrus. Nothing told him that would happen except 13px of muted text he did not read. Second problem: `list` is the icon for both "What we do" and "My requests": two unrelated destinations wearing the same symbol, in a UI that has otherwise taught him icons are meaningful. Third: if the reminder query has silently failed, Jordan has no way to know the app is lying to him, and no help affordance to ask.

**Sam (Accessibility-Dependent User).** Better than most. `:focus-visible` is defined globally with a 2px accent outline and offset, every icon carries a text label, contrast passes AA everywhere I measured. Two real snags: tile label and detail are separated by `<br>` inside a single `<span>`, so a screen reader announces "Book an appointment Opens our scheduling system" as one unbroken run with no pause or structure; and because `due`/`open` update with no live region, a screen-reader user who is on the page when the counts resolve is never told the summary card appeared.

## Minor Observations

- **Duplicate icon.** `list` serves both "What we do" and "My requests". Give services its own glyph.
- **Non-parallel verbs.** "Order food" beside "Request medication": both are requests to the same desk with the same fulfilment path. Pick one verb.
- **`<br>` as layout.** The tile label/detail split uses `<br>` inside a span; a two-line grid child would be both cleaner and better for assistive tech.
- **Sign out styling.** `.ghost` in the footer is correctly demoted, but "correctly demoted" plus "bottom of a scrolling page on mobile" plus "no confirmation" still adds up to an accidental logout.
- **`.tile.pending`** is defined in CSS but never used by `Home.tsx`: either dead style or an unfinished loading state that would have addressed P0.
- **Staff tiles skip the section-label pattern.** Every other tile group gets an uppercase heading; the staff block gets none, so it reads as loose UI above the structured part of the page.
- **Light-mode muted is at the floor.** 4.74:1 passes, with almost nothing to spare, at 13px. Do not darken the background or lighten `--muted` further.
