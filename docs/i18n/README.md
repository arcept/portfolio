# Languages (Placement Hub)

The case study can be read in **English** (the default), **German** and **Italian**, chosen from the menu beside the
theme switch. It is one page: the words are swapped in place, with no reload and no extra pages.

## How it works

- **English is the page itself.** It is written in `app/case-study-placement/sections.js`, `PlacementBody.js` and
  `PlacementStory.js`, so it is in the HTML and needs nothing loaded.
- **Every translatable piece has a key**: `t('problem.heading', 'Placement support felt invisible')` for a string,
  `<T k="problem.p1">…English with <strong>markup</strong>…</T>` for rich text, and `t.list('product.seq1', [...])` for a
  list of objects (a table's columns, a gallery): the dictionary supplies only the text fields, by position, and everything
  else (image paths, sizes, flags) stays as the English list has it.
- **A language is two dictionaries**, loaded the first time it is chosen (English visitors download nothing extra):
  `components/i18n/ui.<code>.js` (buttons and labels shared by every case study) and
  `app/case-study-placement/i18n/<code>.js` (this case study's own words). A key a dictionary does not have shows the English,
  so a language can be added a piece at a time.
- **The choice** lasts for the visit and can be set by a link: `?lang=de`. English is always the starting point: the
  browser's own language is deliberately not consulted. `<html lang>` follows the choice.
- **Numbers** are formatted by the page (decimal comma, and `30 %` in German), so numeric table cells stay as plain English-format
  figures (`'79.7'`) in the dictionaries, and the counters show `79,7`.

## Editing

- **Change English wording**: edit it where it is written. Its key stays the same, so **update the German and Italian entry for
  that key too**; nothing warns about a stale translation.
- **Add a new block to the page**: give it a key like the ones beside it, then add the key to each dictionary.
- **Check the dictionaries**: `npm run check:i18n` lists keys a language is missing (it shows English) and keys nothing uses
  (a typo or a removed piece). Add `-- --strict` to fail on missing ones.
- **Check the whole thing in a browser**: `node scripts/verify-i18n.mjs` (needs `playwright-core`, like `verify-narration.mjs`).

## Adding a language

1. Copy `components/i18n/ui.de.js` and `app/case-study-placement/i18n/de.js` to the new code and translate the values.
2. Add the language to `LANGUAGES` and `LOADERS` in `app/case-study-placement/PlacementLang.js` (label, short code, flag emoji).
3. If it has a flag, add a small SVG for it to `FLAGS` in `components/i18n/LangSwitch.js`; without one it shows the globe.
4. Add it to `dictionaries` in `scripts/check-i18n.mjs`.

## Not translated (on purpose)

- The site nav (Work, About, Contact) and footer belong to the whole site, which is English.
- Screenshots, and the live prototype, have English text in them. Their alt text and captions are translated and quote the
  on-screen English labels.
- The narration: audio and transcript are English. Its buttons and controls are translated, with an "EN" tag and a note that the
  audio is in English.
- The page's meta description (search results) stays English; the tab title is translated.

## Narration in another language, later

The player picks its audio by language: `NARRATION_BY_LANGUAGE` in `app/case-study-placement/page.js` is a map from language to
`narration.json`, and a language without an entry uses English. To add German audio:

1. Write the German script and record it; run it through `docs/narration/WORKFLOW.md` (the alignment step takes any script), and
   publish the result to its own folder, e.g. `public/case-studies/placement-hub/narration/de/`.
2. Add `de: '/case-studies/placement-hub/narration/de/narration.json?v=…'` to `NARRATION_BY_LANGUAGE`.
3. In the German dictionary, remove the `nr.audioTag` and `nr.audioNote` entries (they only exist to say the audio is English).
4. The transcript is currently rendered on the server from the English data, so it would still show English words. To show the
   German transcript, `NarrationPlayer` / `NarrationTranscript` need to render it from the chosen language's data on the
   client. That is the one piece not yet built.
