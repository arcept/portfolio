'use client';

import { useEffect, useRef, useState } from 'react';

export default function PrototypeEmbed({ embedSrc, fullSrc, title, mobileImage, mobileImageAlt }) {
  const [status, setStatus] = useState('loading');
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s));
    }, 9000);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  function handleLoad() {
    clearTimeout(timeoutRef.current);
    setStatus('loaded');
  }

  function handleError() {
    clearTimeout(timeoutRef.current);
    setStatus('error');
  }

  return (
    <section className="proto-section" id="prototype">
      <div className="wrap wrap--wide">
        <div className="proto-head">
          <p className="text-caption" style={{ color: 'var(--chart-2)', marginBottom: '12px' }}>v3.0 · interactive</p>
          <h2 style={{ marginTop: 0 }}>See the rebuild, live</h2>
          <p className="text-body text-fog">
            Before committing to a full rebuild, I wanted confidence in the direction — so I built
            a click-through prototype of the v3.0 UI: a real dashboard, deals list, deal detail,
            and offer wizard, with a live role switcher across all five permission tiers. It&apos;s
            embedded below at a fixed size; open it full-size for the real thing.
          </p>
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
          <a className="btn btn--primary" href={fullSrc} target="_blank" rel="noopener">
            Open full prototype ↗
          </a>
        </div>
      </div>
    </section>
  );
}
