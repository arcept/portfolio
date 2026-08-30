'use client';

import { useEffect, useRef, useState } from 'react';
import StarBorder from './StarBorder/StarBorder';

// Fixed height of .proto-frame-body in globals.css — kept in sync manually
// since the scale math below needs it as a number, not a CSS value.
const FRAME_HEIGHT = 640;

export default function PrototypeEmbed({ versions, title, mobileImage, mobileImageAlt }) {
  const [activeId, setActiveId] = useState(versions[0].id);
  const [status, setStatus] = useState('loading');
  const [scale, setScale] = useState(1);
  const timeoutRef = useRef(null);
  const iframeRef = useRef(null);
  const bodyRef = useRef(null);
  const settledRef = useRef(false);

  const active = versions.find((version) => version.id === activeId) ?? versions[0];

  // Some versions (the new rebuild) declare a `frameWidth` — the desktop
  // viewport width their layout is designed for. Rather than letting the
  // iframe render at the frame's actual (narrower) box width, where it'd
  // fall back to a squeezed tablet-ish layout, render it at full desktop
  // width and scale the whole thing down to fit the box — like zooming out
  // a real browser window, not resizing it.
  useEffect(() => {
    if (!active.frameWidth) {
      setScale(1);
      return;
    }

    const el = bodyRef.current;
    if (!el) return;

    const updateScale = () => setScale(el.clientWidth / active.frameWidth);
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active.frameWidth]);

  function selectVersion(id) {
    if (id === activeId) return;
    settledRef.current = false;
    clearTimeout(timeoutRef.current);
    setStatus('loading');
    setActiveId(id);
  }

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

    // Race-condition safety net: `src` is present in the server-rendered
    // HTML, so on a fast same-origin load the browser can finish loading
    // the iframe — and fire its native `load` event — before React
    // finishes hydrating and attaches the onLoad handler below. That
    // fires into a void and leaves the status stuck on "loading" until
    // the failsafe times out. Poll readyState briefly to catch that case.
    let pollId;
    let attempts = 0;
    function pollReady() {
      attempts += 1;
      try {
        if (iframeRef.current?.contentDocument?.readyState === 'complete') {
          handleLoad();
          return;
        }
      } catch {
        // Same-origin here, so this shouldn't throw — bail out safely if it ever does.
      }
      if (!settledRef.current && attempts < 40) {
        pollId = setTimeout(pollReady, 100);
      }
    }
    pollReady();

    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(pollId);
    };
    // Re-arm the failsafe timeout and race-condition poll whenever the
    // selected version (and therefore the iframe's `src`) changes, not
    // just on mount.
  }, [activeId]);

  return (
    <section className="proto-section" id="prototype">
      <div className="wrap wrap--wide">
        <div className="proto-head">
          <div>
            <p className="text-caption" style={{ color: 'var(--chart-2)', marginBottom: '12px' }}>{active.eyebrow}</p>
            <h2 style={{ marginTop: 0 }}>See the rebuild, live</h2>
            <p className="text-body text-fog">{active.description}</p>
          </div>

          <div className="proto-head-actions">
            {versions.length > 1 && (
              <div className="proto-version-switch" role="tablist" aria-label="Prototype version">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    role="tab"
                    aria-selected={version.id === activeId}
                    className={`proto-version-btn${version.id === activeId ? ' is-active' : ''}`}
                    onClick={() => selectVersion(version.id)}
                  >
                    {version.label}
                  </button>
                ))}
              </div>
            )}

            <StarBorder as="a" href={active.fullSrc} target="_blank" rel="noopener" color="cyan" speed="5s">
              Open full prototype ↗
            </StarBorder>
          </div>
        </div>
      </div>

      <div className="wrap proto-frame-wrap">
        <div className="proto-frame">
          <div className="proto-frame-bar">
            <div className="proto-frame-dots"><span /><span /><span /></div>
            <div className="proto-frame-url">{active.url}</div>
          </div>
          <div className="proto-frame-body" ref={bodyRef}>
            {status !== 'loaded' && (
              <div className="proto-frame-status">
                {status === 'loading'
                  ? 'Loading prototype…'
                  : 'Prototype failed to load — use "Open full prototype" below.'}
              </div>
            )}
            {status !== 'error' && (
              <iframe
                ref={iframeRef}
                src={active.embedSrc}
                title={title}
                onLoad={handleLoad}
                onError={handleError}
                style={
                  active.frameWidth
                    ? {
                        opacity: status === 'loaded' ? 1 : 0,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: active.frameWidth,
                        height: FRAME_HEIGHT / (scale || 1),
                        transform: `scale(${scale})`,
                        transformOrigin: '0 0',
                      }
                    : { opacity: status === 'loaded' ? 1 : 0 }
                }
              />
            )}
          </div>
        </div>

        <div className="proto-preview">
          <img src={mobileImage} alt={mobileImageAlt} width={1280} height={750} />
        </div>

        <div className="proto-actions">
          <p className="proto-note text-caption text-fog">
            Sample data throughout is synthetic. Scroll and click inside the frame — it&apos;s the
            full app, just boxed in.
          </p>
        </div>
      </div>
    </section>
  );
}
