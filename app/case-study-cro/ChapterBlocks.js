'use client';

import { useRef } from 'react';
import { ScrollTrigger, gsap, prefersStill, useIsoLayoutEffect } from './gsap';
import FormDemo from './FormDemo';
import FunnelExplorer from './FunnelExplorer';
import ReviewLoop from './ReviewLoop';

// A chapter's body, block by block (the block types are listed in content.js). The plain scroll-ins come from
// the chapter's own useReveal (data-fade, data-words); the pieces with motion of their own run it here or in
// their own components.

// Numbered steps down a rail that fills as they're read; each lights as the fill reaches it.
function Steps({ items }) {
  const root = useRef(null);
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (prefersStill()) {
      el.classList.add('is-still');
      return undefined;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-fill]',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 } }
      );
      el.querySelectorAll('[data-step]').forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 62%',
          onEnter: () => step.classList.add('is-on'),
          onLeaveBack: () => step.classList.remove('is-on'),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <ol className="cro-practice" ref={root}>
      <span className="cro-practice__rail" aria-hidden="true">
        <span data-fill />
      </span>
      {items.map(({ title, body }, i) => (
        <li key={title} className="cro-practice__step" data-step>
          <span className="cro-practice__num">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="cro-practice__title">{title}</h3>
          <p className="cro-practice__body">{body}</p>
        </li>
      ))}
    </ol>
  );
}

function Shift({ label, text }) {
  return (
    <aside className="cro-shift">
      <p className="cro-kicker" data-fade>
        {label}
      </p>
      <p className="cro-shift__text" data-words>
        {text}
      </p>
    </aside>
  );
}

function Moves({ items }) {
  return (
    <ol className="cro-moves">
      {items.map(({ title, body, signal }, i) => (
        <li key={title} className="cro-move" data-fade>
          <span className="cro-move__num" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="cro-move__title">{title}</h3>
            <p className="cro-move__body">{body}</p>
            <p className="cro-move__signal">
              <span className="sr-only">Read by: </span>
              {signal}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Detail({ label, title, text, caption }) {
  return (
    <section className="cro-detail" aria-label={label}>
      <p className="cro-kicker" data-fade>
        {label}
      </p>
      <h3 className="cro-detail__title" data-fade>
        {title}
      </h3>
      <p className="cro-detail__text" data-fade>
        {text}
      </p>
      <FormDemo caption={caption} />
    </section>
  );
}

function Caveat({ title, text }) {
  return (
    <aside className="cro-caveat" data-fade>
      <h3 className="cro-caveat__title">{title}</h3>
      <p>{text}</p>
    </aside>
  );
}

export default function ChapterBlocks({ blocks }) {
  return (
    <div className="cro-blocks">
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`;
        switch (block.type) {
          case 'p':
            return (
              <p key={key} className="cro-blocks__p" data-fade>
                {block.text}
              </p>
            );
          case 'steps':
            return <Steps key={key} items={block.items} />;
          case 'shift':
            return <Shift key={key} label={block.label} text={block.text} />;
          case 'moves':
            return <Moves key={key} items={block.items} />;
          case 'detail':
            return <Detail key={key} {...block} />;
          case 'funnel':
            return <FunnelExplorer key={key} caption={block.caption} />;
          case 'caveat':
            return <Caveat key={key} title={block.title} text={block.text} />;
          case 'loop':
            return <ReviewLoop key={key} stages={block.stages} />;
          case 'statement':
            return (
              <p key={key} className="cro-statement" data-words>
                {block.text}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
