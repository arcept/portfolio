'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { MaskText, Reveal, useReduce } from './LxMotion';

// Height of .lx-frame__body in light.css — kept in sync by hand, since the scale maths needs it as
// a number rather than a CSS value.
const FRAME_HEIGHT = 800;

// The live prototype in an iframe. Same loading safeguards as components/PrototypeEmbed.js (the
// iframe can fire `load` before React hydrates, or never fire it at all), restyled for the light
// system and given a scroll-driven entrance: the frame rises and grows to full size as it arrives.
export default function LxPrototype({ eyebrow, heading, description, url, src, fullSrc, frameWidth, title, note, mobileImage, mobileImageAlt }) {
  const [status, setStatus] = useState('loading');
  const [scale, setScale] = useState(1);
  const bodyRef = useRef(null);
  const iframeRef = useRef(null);
  const settledRef = useRef(false);
  const timeoutRef = useRef(null);
  const stageRef = useRef(null);
  const reduce = useReduce();

  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'start 0.35'] });
  const rise = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const grow = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  // Render the app at its designed desktop width, then scale the whole frame down to fit — like
  // zooming out a browser window rather than squeezing the layout.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || !frameWidth) return undefined;
    const update = () => setScale(el.clientWidth / frameWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [frameWidth]);

  function handleLoad() {
    if (settledRef.current) return;
    settledRef.current = true;
    clearTimeout(timeoutRef.current);
    setStatus('loaded');
  }

  function handleError() {
    if (settledRef.current) return;
    settledRef.current = true;
    clearTimeout(timeoutRef.current);
    setStatus('error');
  }

  useEffect(() => {
    timeoutRef.current = setTimeout(handleError, 9000);
    let pollId;
    let attempts = 0;
    function poll() {
      attempts += 1;
      try {
        if (iframeRef.current?.contentDocument?.readyState === 'complete') {
          handleLoad();
          return;
        }
      } catch {
        /* same-origin here; bail quietly if that ever changes */
      }
      if (!settledRef.current && attempts < 40) pollId = setTimeout(poll, 100);
    }
    poll();
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(pollId);
    };
  }, []);

  return (
    <section className="lx-proto" id="prototype">
      <div className="lx-wrap">
        <div className="lx-proto__preview">
          <img src={mobileImage} alt={mobileImageAlt} width={1280} height={750} />
        </div>

        <div className="lx-proto__head">
          <div>
            <Reveal>
              <p className="lx-eyebrow lx-eyebrow--plain">{eyebrow}</p>
            </Reveal>
            <MaskText text={heading} className="lx-h2" />
            <Reveal delay={0.1}>
              <p className="lx-proto__desc">{description}</p>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <a className="lx-btn lx-btn--ghost" href={fullSrc} target="_blank" rel="noopener">
              Open full prototype <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
        </div>
      </div>

      <div className="lx-proto__stage" ref={stageRef}>
        <motion.div className="lx-frame" style={reduce ? undefined : { y: rise, scale: grow, opacity: fade }}>
          <div className="lx-frame__bar">
            <span className="lx-frame__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="lx-frame__url">{url}</span>
            <span className="lx-frame__live">
              <i aria-hidden="true" /> Live
            </span>
          </div>
          <div className="lx-frame__body" ref={bodyRef}>
            {status !== 'loaded' && (
              <div className="lx-frame__status">{status === 'loading' ? 'Loading prototype…' : 'Prototype failed to load — use "Open full prototype".'}</div>
            )}
            {status !== 'error' && (
              <iframe
                ref={iframeRef}
                src={src}
                title={title}
                onLoad={handleLoad}
                onError={handleError}
                style={{
                  opacity: status === 'loaded' ? 1 : 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: frameWidth,
                  height: FRAME_HEIGHT / (scale || 1),
                  transform: `scale(${scale})`,
                  transformOrigin: '0 0',
                }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <div className="lx-wrap">
        <Reveal>
          <p className="lx-proto__note">{note}</p>
        </Reveal>
      </div>
    </section>
  );
}
