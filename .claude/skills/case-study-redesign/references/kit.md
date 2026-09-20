# The kit: what exists, what's reusable, how to use it

Canonical implementation: the Placement Hub case study. Read these files rather than trusting memory —
they are the source of truth and this document only maps them.

```
app/case-study-placement/
  page.js        PAGE-SPECIFIC  wrapper, hero, prototype embed, article grid, footer
  sections.js    PAGE-SPECIFIC  the seven sections' content, written with the blocks below
  article.css    KIT            section/panel layout, prose, tables, notes, stats — tokens only
  themes.css     KIT            dark + light tokens; remaps the site tokens for light chrome
  blocks.css     KIT            .px-num .px-peek .px-gallery/.px-tile .px-seq .px-lb
  hero.css       KIT            page width, progress bar, hero layout/hierarchy/entrance
  story.css      KIT            .st (the 2-minute story) — themed by --st-* vars
components/placement/
  Motion.js      KIT  Reveal, MaskText, Statement, Quote, Count, useReduce, EASE
  Blocks.js      KIT  Section, Table, Note, Stats, BigStat, Placeholder (+ mobile-only Disclosure)
  Shots.js       KIT  Gallery, Sequence (+ Lightbox)
  Peek.js        KIT  expandable with a fade
  Num.js         KIT  inline counting figure
  HeroFacts.js   KIT  lead facts + collapsed rest
  HeroBackdrop.js KIT theme-aware hero background
  ScrollProgress.js KIT  reading-progress line
  ScrollRise.js  KIT  scroll-linked lift/scale wrapper for the prototype embed
  Story.js       KIT* the 2-minute story engine   (*imports ./storySteps — see "Hoisting")
  storySteps.js  PAGE-SPECIFIC  STEPS = [{ id, kicker, title, body, visual }]
components/theme/
  theme.js       KIT  THEME_KEY/ATTR, resolveTheme, themeGateScript()
  useCsTheme.js  KIT  hook: 'dark' | 'light' | null (null until mounted)
  ThemeSwitch.js KIT  the switch; owns attaching/removing the attribute
```

Site components the page reuses unchanged: `Nav` (its `actions` slot takes the switch), `Footer`,
`CaseStudyNav` (contents nav), `PrototypeEmbed` (props: `versions[{frameWidth,…}]`, `heading`, `note`,
`frameBackground`, `mobileImage`, `mobileImageAlt`), `VelarisBackground`.

## Hoisting (do this the first time a second page adopts the kit)

Today the kit lives under `case-study-placement` and `components/placement`. The class names (`.ph-*`,
`.pcs`, `.px-*`, `.lx-*`, `.st-*`) are page-agnostic on purpose, so hoisting is a move, not a rewrite:

1. Move the five KIT stylesheets to a shared folder (e.g. `app/case-study-kit/`) and the KIT components to
   `components/case-study-kit/`; fix imports (`@/components/placement/…`). Leave `sections.js`,
   `storySteps.js`, `page.js` with their case study.
2. Make the story generic: `Story.js` must not import `./storySteps`. Change `StoryLauncher` to take a
   `steps` prop, and give each case study a tiny client module that imports its own steps and renders
   `<StoryLauncher steps={STEPS} …>`. (Steps hold JSX visuals, so they must be defined in a client module —
   a server component can't pass them as props.)
3. Every selector is already scoped (`.ph-page`, `.pcs`, `.st`, `.px-*`, `html[data-cs-theme=…] …`), so
   importing the CSS from two pages is safe. Keep it that way — a bare element selector would leak into
   the other case studies, because Next serves imported CSS globally.
4. Re-run the Placement Hub through `scripts/verify.mjs` before touching the next page: the move must be a
   no-op for it.

Do the hoist in its own commit, separate from the first port.

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
  <Stats items={[{value:63,label:'…'},{value:45,prefix:'~',label:'…'}]} />
  <Peek label="The five learner types" more="Show all five">…</Peek>   // long secondary detail
  <Gallery columns={3} items={[{src,alt,width,height,caption},{placeholder:'…',caption:'…'}]} />
  <Sequence wide? items={[{src,alt,width,height,label,caption}]} />       // auto-cycling walk-through
  <Placeholder>Visual still to come</Placeholder>
  <p className="lx-credit"><b>Project · Company</b><br/>Design leadership: …</p>
</Section>
```

Inline inside paragraphs: `<Num to={30} suffix="%" />` (green, counts up, no layout shift) and
`<strong>…</strong>` (brighter + heavier) for the phrases a skimming reader should catch.

Hero, in `page.js`: `HeroFacts` (`lead` = the 3 facts a reader needs first, `more` = the rest, `moreLabel`),
`StoryLauncher` beside the primary button, `HeroBackdrop`, `ScrollProgress` above the `Nav`,
`<ThemeSwitch />` passed as `Nav`'s `actions`. Copy the structure of `app/case-study-placement/page.js`.
