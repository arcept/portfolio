import { disclosure, sectionNumbers } from './timeline.mjs';
import NarrationPlayerShell from './NarrationPlayerShell';
import NarrationTranscript from './NarrationTranscript';
import './narration.css';

// The narration player: controls, chapter chips, scrubber and the lyric transcript. A Server Component that
// reads the narration data (import it in the page, so it is bundled at build time) and hands the transcript
// to the client shell as already-rendered markup.
//
//   import narration from '…/narration/narration.json';
//   <NarrationProvider src="…/narration.json"> <NarrationPlayer narration={narration} /> </NarrationProvider>
//
// It starts loading the narration data when it comes on screen (the panel opening), so playback can begin
// instantly from the next tap. `fontClass` carries the page's serif font variable, since the player renders
// outside the article.

export default function NarrationPlayer({ narration, fontClass = '', className = '' }) {
  const meta = {
    title: narration.title,
    duration: narration.duration,
    engine: narration.engine,
    disclosure: disclosure(narration.engine),
    chapters: narration.chapters.map((c, i) => ({ id: c.id, label: c.label, anchor: c.anchor, start: c.start, number: sectionNumbers(narration.chapters)[i] })),
  };
  return (
    <NarrationPlayerShell meta={meta} className={`${fontClass} ${className}`.trim()}>
      <NarrationTranscript narration={narration} />
    </NarrationPlayerShell>
  );
}
