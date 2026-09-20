// Checks that a narration.json is safe for the player to trust. Pure: takes parsed data, returns problems.
// Run against the real files by scripts/validate-narration.mjs (npm run validate:narration).
//
// What it enforces (the contract in docs/narration/claude-code-brief_narration-player.md, section 3):
//   • times never go backwards, and a word never ends before it starts;
//   • inside a sentence each word's end is the next word's start (so the highlight never flickers off);
//   • a chapter starts where its first word does;
//   • every chapter anchor other than "top" is a real section id on the page;
//   • the duration matches the audio file;
//   • the words on screen are exactly the script's words (timings are tied to them, so text is never
//     edited in narration.json — it is edited in script.json and re-rendered).

const EPS = 1e-3;

const squash = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * @param {import('./timeline.mjs').Narration} narration
 * @param {{ script?: { title?: string, chapters: { id: string, paragraphs: string[] }[] },
 *           pageIds?: string[], audioDuration?: number }} [options]
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateNarration(narration, { script, pageIds, audioDuration } = {}) {
  const errors = [];
  const warnings = [];

  if (!narration || !Array.isArray(narration.chapters) || narration.chapters.length === 0) {
    return { errors: ['narration has no chapters'], warnings };
  }
  for (const key of ['engine', 'voice', 'audio', 'title']) {
    if (typeof narration[key] !== 'string' || !narration[key]) errors.push(`missing "${key}"`);
  }
  if (!(narration.duration > 0)) errors.push('"duration" must be a positive number of seconds');

  const seenIds = new Set();
  let prevStart = -Infinity;
  let prevSentenceEnd = -Infinity;
  let lastEnd = 0;

  narration.chapters.forEach((chapter, ci) => {
    const where = `chapter "${chapter.id}"`;
    if (seenIds.has(chapter.id)) errors.push(`${where}: duplicate id`);
    seenIds.add(chapter.id);

    let firstWordStart = null;
    chapter.paragraphs.forEach((paragraph, pi) => {
      paragraph.sentences.forEach((sentence, si) => {
        const at = `${where}, paragraph ${pi + 1}, sentence ${si + 1}`;
        if (sentence.words.length === 0) errors.push(`${at}: no words`);
        if (sentence.end < sentence.start) errors.push(`${at}: ends before it starts`);
        if (sentence.start < prevSentenceEnd - EPS) errors.push(`${at}: starts before the previous sentence ends`);
        prevSentenceEnd = sentence.end;

        sentence.words.forEach((word, wi) => {
          if (firstWordStart === null) firstWordStart = word.s;
          if (word.s < prevStart - EPS) errors.push(`${at}, word "${word.t}": start goes backwards (${word.s} < ${prevStart})`);
          if (word.e < word.s) errors.push(`${at}, word "${word.t}": ends before it starts`);
          const next = sentence.words[wi + 1];
          if (next && Math.abs(word.e - next.s) > EPS) {
            errors.push(`${at}, word "${word.t}": ends at ${word.e} but the next word starts at ${next.s}`);
          }
          prevStart = word.s;
          lastEnd = Math.max(lastEnd, word.e);
        });
      });
    });

    if (firstWordStart === null) errors.push(`${where}: no words`);
    else if (Math.abs(chapter.start - firstWordStart) > EPS) {
      errors.push(`${where}: starts at ${chapter.start} but its first word starts at ${firstWordStart}`);
    }

    if (chapter.anchor !== 'top' && pageIds && !pageIds.includes(chapter.anchor)) {
      errors.push(`${where}: anchor "${chapter.anchor}" is not a section id on the page (page has: ${pageIds.join(', ')})`);
    }
    if (chapter.anchor !== 'top' && !pageIds) warnings.push(`${where}: anchor not checked (no page ids given)`);
  });

  if (narration.duration < lastEnd - EPS) errors.push(`"duration" ${narration.duration} is shorter than the last word's end ${lastEnd}`);

  if (audioDuration === undefined) {
    warnings.push('duration not compared with the audio file (no audio duration available, e.g. ffprobe is not installed)');
  } else if (Math.abs(audioDuration - narration.duration) > 0.1) {
    errors.push(`"duration" is ${narration.duration}s but the audio file is ${audioDuration}s`);
  }

  if (script) {
    if (script.title && script.title !== narration.title) errors.push(`title differs from script.json ("${narration.title}" vs "${script.title}")`);
    narration.chapters.forEach((chapter) => {
      const source = script.chapters.find((c) => c.id === chapter.id);
      if (!source) {
        errors.push(`chapter "${chapter.id}" is not in script.json`);
        return;
      }
      if (source.paragraphs.length !== chapter.paragraphs.length) {
        errors.push(`chapter "${chapter.id}": ${chapter.paragraphs.length} paragraphs but script.json has ${source.paragraphs.length}`);
        return;
      }
      chapter.paragraphs.forEach((paragraph, pi) => {
        const shown = squash(paragraph.sentences.map((s) => s.words.map((w) => w.t).join(' ')).join(' '));
        if (shown !== squash(source.paragraphs[pi])) {
          errors.push(`chapter "${chapter.id}", paragraph ${pi + 1}: text differs from script.json — edit script.json and re-render, never narration.json`);
        }
      });
    });
    script.chapters.forEach((c) => {
      if (!narration.chapters.some((n) => n.id === c.id)) errors.push(`script.json chapter "${c.id}" is missing from narration.json`);
    });
  } else {
    warnings.push('text not compared with script.json (none given)');
  }

  return { errors, warnings };
}
