'use client';

import { useRef } from 'react';
import useReveal from './useReveal';
import ChapterNav from './ChapterNav';
import TeamMap from './TeamMap';
import ChapterBlocks from './ChapterBlocks';

// The article: the chapters beside a contents nav, each with a sticky margin of notes, then its name,
// standfirst, heading and body in the main column, as the other case studies lay theirs out. Chapter 01 has its
// own parts (the text, the quote, the team map); the rest are lists of blocks (ChapterBlocks.js).
// `ch` is a chapter from content.js.

// A chapter's margin: its discipline, the questions it answers and, where it produced any, its deliverables.
function Notes({ ch, className = '' }) {
  const { discipline, questions, deliverables } = ch.margin;
  return (
    <dl className={`cro-notes ${className}`} data-stagger>
      <div>
        <dt>Discipline</dt>
        <dd>{discipline}</dd>
      </div>
      {questions && (
        <div>
          <dt>Questions</dt>
          {questions.map((q) => (
            <dd key={q} className="cro-notes__q">
              {q}
            </dd>
          ))}
        </div>
      )}
      {deliverables && (
        <div>
          <dt>Deliverables</dt>
          <dd>{deliverables}</dd>
        </div>
      )}
    </dl>
  );
}

function Heading({ ch, className = '' }) {
  return (
    <>
      {ch.eyebrow && (
        <p className="cro-ch__eyebrow" data-fade>
          <span>{ch.number}</span>
          {ch.eyebrow}
        </p>
      )}
      <h2 id={`${ch.id}-title`} className={`cro-ch__h2 ${className}`} data-mask>
        {ch.heading} <em>{ch.headingEm}</em>
      </h2>
    </>
  );
}

function Text({ ch, className = '' }) {
  return (
    <div className={`cro-ch__text ${className}`}>
      {ch.paragraphs.map((p) => (
        <p key={p.slice(0, 24)} data-fade>
          {p}
        </p>
      ))}
    </div>
  );
}

function Quote({ ch, className = '' }) {
  return (
    <blockquote className={`cro-quote ${className}`}>
      <span className="cro-quote__mark" aria-hidden="true" data-fade>
        “
      </span>
      <p data-words>{ch.quote}</p>
    </blockquote>
  );
}

function Diagram({ ch, className = '' }) {
  return (
    <figure className={`cro-ch__fig ${className}`}>
      <TeamMap map={ch.map} />
      <figcaption data-fade>{ch.caption}</figcaption>
    </figure>
  );
}

function ChapterColumns({ ch }) {
  const root = useRef(null);
  useReveal(root);
  return (
    <section className="cro-ch cro-ch--cols" id={ch.id} ref={root} aria-labelledby={`${ch.id}-title`}>
      <div className="cro-ch__grid">
        <aside className="cro-ch__margin" aria-label={`About ${ch.name}`}>
          <Notes ch={ch} />
        </aside>
        <div className="cro-ch__main">
          <span className="cro-ch__ghost" data-ghost aria-hidden="true">
            {ch.number}
          </span>
          <header>
            <p className="cro-ch__index" data-fade>
              <span>{ch.number}</span>
              {ch.name}
            </p>
            {ch.standfirst && (
              <p className="cro-ch__standfirst" data-fade>
                {ch.standfirst}
              </p>
            )}
            <Heading ch={ch} />
          </header>
          {ch.blocks ? (
            <ChapterBlocks blocks={ch.blocks} />
          ) : (
            <>
              <Text ch={ch} />
              <Quote ch={ch} />
              <Diagram ch={ch} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function Article({ chapters }) {
  return (
    <div className="cro-wrap cro-article">
      <div className="cro-article__body">
        {chapters.map((ch) => (
          <ChapterColumns key={ch.id} ch={ch} />
        ))}
      </div>
      <ChapterNav chapters={chapters} />
    </div>
  );
}
