# The kit: what exists, what's reusable, how to use it

Canonical implementations: the Placement Hub case study (the original) and OMS (the first port). Read
their files rather than trusting memory — they are the source of truth and this document only maps them.

```
app/case-study-kit/                 SHARED KIT — styles (all selectors scoped; see gotchas.md)
  article.css   section/panel layout, prose, tables, notes, stats, columns, embeds — tokens only
  themes.css    dark + light tokens; remaps the site tokens for light chrome
  blocks.css    .px-num .px-peek .px-gallery/.px-tile .px-seq .px-lb
  hero.css      page width, progress bar, hero layout/hierarchy/entrance, light wash
  story.css     .st (the 2-minute story) — themed by --st-* vars
components/case-study-kit/          SHARED KIT — components
  Motion.js     Reveal, MaskText, Statement, Quote, Count, useReduce, EASE
  Blocks.js     Section, Table, Note, Stats, BigStat, Columns, Embed, Placeholder (+ mobile-only Disclosure)
  Shots.js      Gallery, Sequence (+ Lightbox)
  Peek.js       expandable with a fade
  Num.js        inline counting figure
  HeroFacts.js  lead facts (+ optional collapsed rest)
  HeroBackdrop.js  theme-aware hero background (takes the case study's shader colours)
  ScrollProgress.js  reading-progress line
  ScrollRise.js scroll-linked lift/scale wrapper for the prototype embed
  Story.js      the 2-minute story engine: <StoryLauncher steps={…}>
  StoryVisuals.js  generic step visuals: List, Bars, BigStat, Quote, Cycle, Stats, BeforeAfter (+ storyMotion)
components/theme/
  theme.js  useCsTheme.js  ThemeSwitch.js   the single-page dark/light mechanism (see theming.md)

app/case-study-<name>/              PER CASE STUDY — the only things a port writes
  page.js       wrapper, hero, prototype embed, article grid, footer
  sections.js   the sections' content (server component), written with the kit's blocks
  <Name>Story.js  client module: the steps (with the page's own visuals) → <StoryLauncher steps={STEPS}>
  <name>.css    only what is this page's own (custom widgets + their light overrides). Optional.
```

Site components a page reuses unchanged: `Nav` (its `actions` slot takes the switch), `Footer`,
`CaseStudyNav` (contents nav; supports `projectFiles`), `PrototypeEmbed` (props: `versions[{frameWidth,…}]`,
`heading`, `note`, `frameBackground`, `mobileImage`, `mobileImageAlt`), `VelarisBackground`.

## Per-page knobs (set on the page, not in the kit)
- **Colour**: `<div className="ph-page" style={{'--ph-wash-a':'#8b5cf6','--ph-wash-b':'#6366f1'}}>` — the
  light theme's hero wash and tint. `<HeroBackdrop colors={[bright, mid, dark, bg]} />` — the dark shader.
  Pick the case study's existing hero colours (OMS: violet, Placement Hub: blue).
- **Fonts**: `localFont` with `variable: '--font-display'` and `Newsreader` with `variable: '--font-serif'`;
  put both variable classes on `<main className="lx pcs …">` and pass them to the story as `fontClass`.

## Hoisting
Done (commit "Hoist the case study kit into shared folders"). A case study never copies kit files; it
imports them. If you need something the kit lacks, add it to the kit (with a Placement Hub regression run),
not to the page — unless it is genuinely this page's own widget, in which case it goes in `<name>.css`.

## Block API (use these when writing a page's sections)

```jsx
<Section id number="02" eyebrow="Evidence" category="Discipline · discipline · discipline"
         questions={['The one question this section answers?']}
         artifacts="What came out of it · shown under the label 'Deliverables'"
         heading="Sentence-case heading, no full stop">
  {/* every direct child is scroll-revealed automatically unless it animates itself */}
  <Statement>The one sentence that carries the argument.</Statement>      // serif, words light up on scroll
  <div><p>Body…</p><p className="lx-subheading">Sub-heading</p><ul className="lx-list">…</ul></div>
  <Quote>A quotation or a principle, as a plain string.</Quote>
  <Table columns={[{label:'Stage'},{label:'CSAT',num:true}]} bars={{col:1,max:100}}
         rows={[['Acquisition','82'],['Completion',{v:'55.5',tone:'bad'}]]} />   // numbers count up
  <Note label="On attribution" tone="flag">…</Note>                    // quiet aside; flag = amber caveat
  <BigStat value={30} suffix="%" label="of all placements…" />
  <Stats columns={2} items={[{value:63,label:'…'},{prefix:'< ',value:1,suffix:' hour',label:'was 1–2 days',desc:'…'},
                            {trend:'down',value:18,suffix:'%',label:'…'},{text:'4 → 3 days',label:'…'}]} />
  <Columns items={[{label:'The Interview Ladder',title:'One-line statement',desc:'A sentence of explanation.'}]} />   // "cards", without boxes
  <Embed caption={<><strong>Lead.</strong> Explanation.</>}><LiveIframeComponent /></Embed>  // a live embed, framed
  <Peek label="The five learner types" more="Show all five">…</Peek>   // long secondary detail
  <Gallery columns={3} fit="cover|contain|natural" caption? maxWidth?
           items={[{src,alt,width,height,caption,fit?},{placeholder:'…',caption:'…'}]} />
  <Sequence wide? items={[{src,alt,width,height,label,caption}]} />       // auto-cycling walk-through
  <Placeholder>Visual still to come</Placeholder>
  <p className="lx-credit"><b>Project · Company</b><br/>Design leadership: …</p>
</Section>
```

Choosing `fit`: `cover` (default, 5:4 frame cropped to the top) for full-screen screenshots; `contain` (whole
image inside a 5:4 frame on the theme surface) for cropped UI panels; `natural` (frame takes the image's own
shape) for wide diagrams and strips, which 5:4 would crop or shrink to a sliver — pair it with `columns={1}`
and a `maxWidth` (e.g. `720px`) so a lone tall chart doesn't fill the column. `caption` (on the Gallery)
explains a set of images together; per-item `caption` is shown under the tile and in the lightbox.

Inline inside paragraphs: `<Num to={30} suffix="%" />` (green, counts up, no layout shift) and
`<strong>…</strong>` (brighter + heavier) for the phrases a skimming reader should catch.

Hero, in `page.js`: `HeroFacts` (`lead` = the facts a reader needs first, `more` = the rest and `moreLabel` —
both optional; with three or fewer facts show them all and pass no `more`),
`StoryLauncher` beside the primary button, `HeroBackdrop`, `ScrollProgress` above the `Nav`,
`<ThemeSwitch />` passed as `Nav`'s `actions`. Copy the structure of `app/case-study-placement/page.js`.

## The story module (`<Name>Story.js`)
```jsx
'use client';
import StoryLauncher from '@/components/case-study-kit/Story';
import { BarsVisual, ListVisual, QuoteVisual, StatsVisual, BigStatVisual, CycleVisual, BeforeAfterVisual,
         storyMotion } from '@/components/case-study-kit/StoryVisuals';
const STEPS = [{ id: 'section-id', kicker: 'Nav label', title: '…', body: '…', visual: <ListVisual … /> }];
export default function XStory(props) { return <StoryLauncher steps={STEPS} {...props} />; }
```
When no generic visual fits, write one in this module using `storyMotion.list/item` and style it from the
`--st-*` variables in `<name>.css` (OMS: struck-through rejected options, status badges, offer arithmetic).
