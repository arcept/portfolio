'use client';

import { useEffect, useRef, useState } from 'react';
import StarBorder from './StarBorder/StarBorder';

export default function PrototypeEmbed({ embedSrc, fullSrc, title, mobileImage, mobileImageAlt }) {
  const [status, setStatus] = useState('loading');
  const timeoutRef = useRef(null);
  const iframeRef = useRef(null);
  const settledRef = useRef(false);

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
  }, []);

  return (
    <section className="proto-section" id="prototype">
      <div className="wrap wrap--wide">
        <div className="proto-head">
          <div>
            <p className="text-caption" style={{ color: 'var(--chart-2)', marginBottom: '12px' }}>v3.0 · interactive</p>
            <h2 style={{ marginTop: 0 }}>See the rebuild, live</h2>
            <p className="text-body text-fog">
              A real dashboard, deals list, deal detail, and offer wizard, with a live role switcher
              across all five permission tiers. It&apos;s embedded below at a fixed size; open it
              full-size for the real thing.
            </p>
          </div>
          <StarBorder as="a" href={fullSrc} target="_blank" rel="noopener" color="cyan" speed="5s">
            Open full prototype ↗
          </StarBorder>
        </div>

        <div className="proto-frame">
          <div className="proto-frame-bar">
            <div className="proto-frame-dots"><span /><span /><span /></div>
            <div className="proto-frame-url">app.novatr-oms.internal · v3.0</div>
          </div>
          <div className="proto-frame-body">
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
                src={embedSrc}
                title={title}
                onLoad={handleLoad}
                onError={handleError}
                style={{ opacity: status === 'loaded' ? 1 : 0 }}
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
