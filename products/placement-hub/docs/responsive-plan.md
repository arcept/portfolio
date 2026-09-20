# Responsive / mobile readiness — audit and plan

## Ground rule: desktop must not change

Every responsive rule is added as a `max-*` variant (`max-xl:`, `max-lg:`, `max-md:`). Tailwind
compiles those to `@media (width < …)`, so on screens of 1280px and wider none of them apply and
the existing desktop classes are left exactly as they were. Nothing is rewritten mobile-first.

| Tier | Width | What changes |
| --- | --- | --- |
| Desktop | ≥ 1280 | Nothing. Verified by pixel-diffing screenshots against a pre-change baseline. |
| Small laptop / tablet landscape | 1024–1279 | Page gutter 120px → 32px so the 440px sidebar doesn't crush the main column. |
| Tablet | 768–1023 | Two-column pages stack: main content, then the sidebar cards, full width. |
| Phone | < 768 | 16px gutters, cards restack, tap-friendly controls, modals fit the screen, overlays go full width. |

## What the audit found (before any change)

Measured with headless Chrome at 390 / 768 / 1024 / 1280 / 1440, checking horizontal overflow and
listing every element that pokes outside the viewport.

- **Phone (390px):** the page is 584px wide, so everything is cut off on the right. The top bar
  collapses (logo, "Placement Hub" and the user name overlap), and the layout keeps a 440px sidebar
  next to the content.
- **Profile page:** 1433px wide at *every* width from 390 to 1280. Broken on ordinary laptops too.
- **Job description page:** overflows at 768px (991px wide).
- **Root causes (all fixed-width layouts):**
  - `px-[120px]` gutters on every page shell, the top bar, the navbar and the footer
  - a `w-[440px]` sidebar beside a `flex-1` column, with no way to stack
  - fixed-width modals (`w-[560px]`, `w-[640px]`, fixed heights) and popovers (`w-[440px]`, `w-[380px]`)
  - card rows built as `[content flex-1] [fixed-width badge / date column]` (`w-40`, `w-[200px]`)
  - `grid-cols-3` / `grid-cols-2` grids with no single-column fallback
  - non-wrapping rows of tabs and chips, and desktop-only offsets (`pl-[72px]`, `sticky top-[132px]`)
- **Not a problem:** the viewport meta tag was already correct; pagination already hides its labels
  on small screens.

## Plan

1. **Page shells** (`AppShell`, Job Description, Profile, footer): responsive gutters; sidebar drops
   below the content under 1024px.
2. **Top bar and navbar:** compact top bar on phones (avatar only, no name), scrollable tab row that
   stays sticky while the top bar scrolls away.
3. **Home and Jobs:** banners, nudge card, application cards, job cards, filter tabs and sort row
   restack on phones.
4. **Job Description:** header card, CTA bar, offer / rejected-offer cards, tracker, side panel.
5. **Profile:** header, tabs, about / skills / experience / education / certifications blocks.
6. **Interest form:** single-column questions and choice cards on phones.
7. **Overlays:** Apply / Accept / Reject modals fit the screen and scroll; notification panel, toast
   and QA simulator stop overflowing.
8. **Safety net:** `overflow-x: clip` on small screens so one stray element can never cause a
   sideways scroll, plus `dvh` heights for modals (mobile browser chrome).

## How each step is verified

- Overflow check at 390 / 768 / 1024 for every page and overlay (target: zero horizontal overflow).
- Screenshot pixel-diff of desktop widths (1440 and 1280) against the pre-change baseline
  (target: identical).
- Visual review of the phone screenshots.

## Outcome

- **Overflow:** zero horizontal overflow and zero elements outside the viewport on every page and
  overlay (Home, Jobs, Job Description, Apply / Accept / Reject modals, Profile, Interest Form,
  account menu, notification panel, offer and rejected-offer pages) at 320, 360, 390, 430, 768 and
  1024px.
- **Desktop:** screenshots at 1440px are pixel-identical to the pre-change baseline (differences
  are ≤17px, the same as re-running the baseline against itself). At 1280px everything is identical
  except the Profile page, which was 1433px wide (horizontal scroll) and now fits.
- **Deliberate exception below 1440px:** the Profile page's fixed `w-[600px]` skills block and the
  certificate image row are relaxed only under 1440px (`max-[1439px]:`), which removes the sideways
  scroll on 1280–1439px laptops without moving anything at 1440px and above.

## Known and left alone

- On a 1440px screen the Profile sidebar's right edge sits ~113px past the header's right edge
  (its column is forced wider by the fixed-width skills block). Fixing it would change desktop
  rendering, so it is untouched.
- Only tested in Chrome. Real-device testing on iOS Safari and Android is still worth doing.
- Landscape phones (~844×390) get the tablet layout; there is no dedicated treatment.
