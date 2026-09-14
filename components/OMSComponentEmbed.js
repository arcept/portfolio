'use client';

import { useEffect, useRef, useState } from 'react';

// Renders one isolated component straight from the live OMS prototype
// (not a screenshot) — see products/oms/src/pages/embed-view.tsx for the
// `?embed=` views this points at. Any future change to that component
// shows up here automatically on the next prototype rebuild+sync; there is
// nothing in this repo to keep in sync by hand.
//
// Rendered at its real desktop width, then the whole iframe is scaled down
// to fit the column — same technique as PrototypeEmbed's frameWidth trick
// — so the grid always composes the way it's designed to (e.g. four cards
// across) instead of reflowing to two-across at this column's actual,
// narrower width.
//
// `autoHeight` is for embeds whose own content can change height after
// mount (e.g. a collapsible card) — the fixed `height` prop is still used as
// the pre-load estimate (avoids a layout jump while the iframe loads), but
// once loaded the frame tracks the iframe document's real scrollHeight via
// ResizeObserver. Same-origin static file, so reading contentDocument needs
// no postMessage protocol. Off by default: every other embed's `height` is
// a fixed, already-measured value, and there's no reason to add a moving
// part where nothing inside ever changes size.
export default function OMSComponentEmbed({ view, height, frameWidth = 1160, autoHeight = false }) {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(height);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => setScale(el.clientWidth / frameWidth);
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [frameWidth]);

  useEffect(() => {
    if (!autoHeight) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let bodyObserver;
    const attach = () => {
      const doc = iframe.contentDocument;
      if (!doc?.body) return;
      setContentHeight(doc.body.scrollHeight);
      bodyObserver = new ResizeObserver(() => setContentHeight(doc.body.scrollHeight));
      bodyObserver.observe(doc.body);
    };

    // Covers both the normal case (effect runs before load fires) and a
    // cached iframe that's already loaded by the time this effect runs.
    iframe.addEventListener('load', attach);
    attach();

    return () => {
      iframe.removeEventListener('load', attach);
      bodyObserver?.disconnect();
    };
  }, [autoHeight, view]);

  const effectiveHeight = autoHeight ? contentHeight : height;

  return (
    <div ref={containerRef} className="cs-oms-embed" style={{ height: effectiveHeight * scale }}>
      <iframe
        ref={iframeRef}
        src={`/case-studies/oms/rebuild/index.html?embed=${view}`}
        title={`OMS prototype — ${view.replace(/-/g, ' ')}`}
        style={{
          width: frameWidth,
          height: effectiveHeight,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      />
    </div>
  );
}
