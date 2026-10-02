'use client';

import { useRef, useState } from 'react';
import { ScrollTrigger, gsap, prefersStill, useIsoLayoutEffect } from './gsap';
import useReveal from './useReveal';
import { BRIEF } from './content';

// "In brief" laid out so the illustrations support the words rather than lead them: the text always sits on
// the page, never over an image, and the detail is always shown. Three ways, compared on the switcher
// (?brief=; directions.js), beside the image cards (BriefTiles.js):
//   index  the five beats as a list, all readable at once; one image panel beside it, held in view, shows the
//          beat being read (the one at the middle of the window, or the one pointed at), crossfading between them.
//          `even` sets the statement and the detail at one size, the statement heavier
//   rows   five full-width rows (label, statement, detail) with a small, muted thumbnail at the end of each,
//          coming to full colour when its row is pointed at
//   top    five cards, each with a short image band on top and its words below on the card
//   scroll as Split's: a stepper of the five labels held on the left, lit and filling as each beat is read and
//          clickable; the beats a screen each in the middle, in Split's type; the image panel held on the right,
//          crossfading with the beat being read

const num = (i) => String(i + 1).padStart(2, '0');

function Head() {
  return (
    <header className="cro-bx-head">
      <p className="cro-kicker" data-fade>
        In brief
      </p>
      <h2 id="brief-title" className="cro-h2" data-mask>
        A page problem revealed <em>a decision problem.</em>
      </h2>
    </header>
  );
}

function Tag({ i, label }) {
  return (
    <p className="cro-bx-tag">
      <span>{num(i)}</span>
      {label}
    </p>
  );
}

// A beat's layers (its `layers` in content.js): logos as supplied, each a white block with rounded corners,
// scattered over and around its image, some breaking out past the frame's edges. They pop in one after another
// when shown, float gently, and shift with the pointer by their depth (--mx, --my, set by the panel).
function Layers({ layers = [], active = true }) {
  if (!layers.length) return null;
  return (
    <span className={`cro-bx-layers${active ? ' is-active' : ''}`} aria-hidden="true">
      {layers.map(({ src, name, x, y, w, tilt, depth }, k) => (
        <span
          key={name}
          className="cro-bx-layer"
          style={{ '--x': `${x}%`, '--y': `${y}%`, '--w': `${w}%`, '--wn': w, '--tilt': `${tilt}deg`, '--depth': depth, '--k': k }}
        >
          <span className="cro-bx-layer__tag">
            <img src={src} alt="" width="600" height="214" loading="lazy" decoding="async" />
          </span>
        </span>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------- index

export function BriefIndexImage({ even = false }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  useReveal(root);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const ctx = gsap.context(() => {
      el.querySelectorAll('[data-beat]').forEach((beat, i) => {
        ScrollTrigger.create({
          trigger: beat,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
      if (!prefersStill()) {
        gsap.from('[data-panel]', {
          clipPath: 'inset(12% 8% 12% 8% round 20px)',
          autoAlpha: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: el.querySelector('[data-panel]'), start: 'top 80%', once: true },
        });
      }
    }, el);
    return () => ctx.revert();
  }, []);

  // The pointer over the panel, from −1 to 1 each way, for the layers' depth.
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const untilt = (e) => {
    e.currentTarget.style.setProperty('--mx', 0);
    e.currentTarget.style.setProperty('--my', 0);
  };

  return (
    <section className={`cro-bx is-index${even ? ' is-even' : ''}`} id="brief" ref={root} aria-labelledby="brief-title">
      <div className="cro-wrap">
        <Head />
        <div className="cro-bx-index">
          <ol className="cro-bx-index__list">
            {BRIEF.map(({ label, line, body, image }, i) => (
              <li
                key={label}
                className={`cro-bx-index__beat${i === active ? ' is-active' : ''}`}
                data-beat
                data-fade
                onPointerEnter={() => setActive(i)}
              >
                {image && (
                  <span className="cro-bx-index__thumb" aria-hidden="true">
                    <span className="cro-bx-index__thumb-img">
                      <img src={image} alt="" width="720" height="960" loading="lazy" decoding="async" />
                    </span>
                    <Layers layers={BRIEF[i].layers} />
                  </span>
                )}
                <div className="cro-bx-index__text">
                  <Tag i={i} label={label} />
                  <h3 className="cro-bx-line">{line}</h3>
                  <p className="cro-bx-body">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="cro-bx-index__aside" aria-hidden="true">
            <div className="cro-bx-index__stage" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="cro-bx-index__panel" data-panel>
                {BRIEF.map(({ label, image }, i) =>
                  image ? (
                    <img
                      key={label}
                      className={i === active ? 'is-active' : undefined}
                      src={image}
                      alt=""
                      width="720"
                      height="960"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null
                )}
              </div>
              {BRIEF.map((beat, i) => (
                <Layers key={beat.label} layers={beat.layers} active={i === active} />
              ))}
            </div>
            <p className="cro-bx-index__caption">
              <span>{num(active)}</span>
              {BRIEF[active].label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- rows

export function BriefRows() {
  const root = useRef(null);
  useReveal(root);
  return (
    <section className="cro-bx is-rows" id="brief" ref={root} aria-labelledby="brief-title">
      <div className="cro-wrap">
        <Head />
        <ol className="cro-bx-rows" data-stagger>
          {BRIEF.map(({ label, line, body, image }, i) => (
            <li key={label} className="cro-bx-row">
              <Tag i={i} label={label} />
              <h3 className="cro-bx-line">{line}</h3>
              <p className="cro-bx-body">{body}</p>
              {image && (
                <span className="cro-bx-row__thumb" aria-hidden="true">
                  <img src={image} alt="" width="720" height="960" loading="lazy" decoding="async" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- top

export function BriefTop() {
  const root = useRef(null);
  useReveal(root);
  return (
    <section className="cro-bx is-top" id="brief" ref={root} aria-labelledby="brief-title">
      <div className="cro-wrap">
        <Head />
        <ol className="cro-bx-top" data-stagger>
          {BRIEF.map(({ label, line, body, image }, i) => (
            <li key={label} className="cro-bx-card">
              {image && (
                <span className="cro-bx-card__band" aria-hidden="true">
                  <img src={image} alt="" width="720" height="960" loading="lazy" decoding="async" />
                </span>
              )}
              <div className="cro-bx-card__text">
                <Tag i={i} label={label} />
                <h3 className="cro-bx-line">{line}</h3>
                <p className="cro-bx-body">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BriefIndexEven() {
  return <BriefIndexImage even />;
}

// ---------------------------------------------------------------- scroll

export function BriefScroll() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  useReveal(root);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const steps = [...el.querySelectorAll('[data-step]')];
    const ctx = gsap.context(() => {
      el.querySelectorAll('[data-beat]').forEach((beat, i) => {
        ScrollTrigger.create({
          trigger: beat,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
          onUpdate: (self) => steps[i]?.style.setProperty('--p', prefersStill() ? 1 : self.progress.toFixed(3)),
          onLeave: () => steps[i]?.style.setProperty('--p', 1),
          onLeaveBack: () => steps[i]?.style.setProperty('--p', 0),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const go = (e, i) => {
    const beat = root.current.querySelectorAll('[data-beat]')[i];
    if (!beat) return;
    e.preventDefault();
    const r = beat.getBoundingClientRect();
    window.scrollTo({ top: r.top + window.scrollY - window.innerHeight * 0.5 + 40, behavior: prefersStill() ? 'auto' : 'smooth' });
  };
  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const untilt = (e) => {
    e.currentTarget.style.setProperty('--mx', 0);
    e.currentTarget.style.setProperty('--my', 0);
  };

  return (
    <section className="cro-bx is-scroll" id="brief" ref={root} aria-labelledby="brief-title">
      <div className="cro-wrap">
        <Head />
        <div className="cro-bxs">
          <nav className="cro-bxs__steps" aria-label="In brief">
            <ol>
              {BRIEF.map(({ label }, i) => (
                <li key={label} className={i === active ? 'is-active' : undefined} data-step>
                  <a href={`#beat-${i + 1}`} onClick={(e) => go(e, i)} aria-current={i === active ? 'step' : undefined}>
                    {label}
                  </a>
                  <span className="cro-bxs__bar" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </nav>

          <div className="cro-bxs__beats">
            {BRIEF.map(({ label, line, body, image, layers }, i) => (
              <article key={label} id={`beat-${i + 1}`} className={`cro-bxs__beat${i === active ? ' is-active' : ''}`} data-beat>
                {image && (
                  <span className="cro-bxs__thumb" aria-hidden="true">
                    <span className="cro-bx-index__thumb-img">
                      <img src={image} alt="" width="720" height="960" loading="lazy" decoding="async" />
                    </span>
                    <Layers layers={layers} />
                  </span>
                )}
                <div className="cro-bxs__text">
                  <p className="cro-bxs__tag">{label}</p>
                  <h3 className="cro-bxs__line" data-mask>
                    {line}
                  </h3>
                  <p className="cro-bxs__body" data-fade>
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="cro-bxs__aside" aria-hidden="true">
            <div className="cro-bx-index__stage" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="cro-bx-index__panel">
                {BRIEF.map(({ label, image }, i) =>
                  image ? (
                    <img
                      key={label}
                      className={i === active ? 'is-active' : undefined}
                      src={image}
                      alt=""
                      width="720"
                      height="960"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null
                )}
              </div>
              {BRIEF.map((beat, i) => (
                <Layers key={beat.label} layers={beat.layers} active={i === active} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

