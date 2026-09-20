// The transcript, as plain markup. A Server Component: it is rendered into the page's HTML at build time, so
// the whole narration reads as ordinary text with JavaScript off, and the player only *enhances* it — the
// lyric highlight and click-to-seek attach to these elements by their data attributes.
//
//   .nr-chapter[data-c]          a chapter, with a header and a "Go to section" link
//     p.nr-p                     a paragraph
//       .nr-s[data-s]            a sentence
//         .nr-w[data-w]          a word (data-w is its index in the whole narration)
//
// The indices are the same flat order timeline.mjs builds, which is what lets the two line up.

import { sectionNumbers } from './timeline.mjs';

export default function NarrationTranscript({ narration }) {
  const numbers = sectionNumbers(narration.chapters);
  let wordIndex = 0;
  let sentenceIndex = 0;

  return narration.chapters.map((chapter, ci) => (
    <section key={chapter.id} className="nr-chapter" data-c={ci} aria-labelledby={`nr-h-${chapter.id}`}>
      <header className="nr-chapter__head">
        <h3 className="nr-chapter__title" id={`nr-h-${chapter.id}`}>
          {numbers[ci] !== null && <b>{String(numbers[ci]).padStart(2, '0')} </b>}
          {chapter.label}
        </h3>
        {chapter.anchor !== 'top' && (
          <a className="nr-goto" href={`#${chapter.anchor}`}>
            Go to section<span className="nr-sr"> {chapter.label}</span>
          </a>
        )}
      </header>
      {chapter.paragraphs.map((paragraph, pi) => (
        <p key={pi} className="nr-p">
          {paragraph.sentences.map((sentence, si) => {
            const sIdx = sentenceIndex++;
            return (
              <span key={si}>
                <span className="nr-s" data-s={sIdx}>
                  {sentence.words.map((word, wi) => {
                    const idx = wordIndex++;
                    return (
                      <span key={wi}>
                        {wi > 0 ? ' ' : null}
                        <span className="nr-w" data-w={idx}>
                          {word.t}
                        </span>
                      </span>
                    );
                  })}
                </span>
                {si < paragraph.sentences.length - 1 ? ' ' : null}
              </span>
            );
          })}
        </p>
      ))}
    </section>
  ));
}
