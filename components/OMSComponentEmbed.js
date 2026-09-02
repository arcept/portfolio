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
export default function OMSComponentEmbed({ view, height, frameWidth = 1160 }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => setScale(el.clientWidth / frameWidth);
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [frameWidth]);

  return (
    <div ref={containerRef} className="cs-oms-embed" style={{ height: height * scale }}>
      <iframe
        src={`/case-studies/oms/rebuild/index.html?embed=${view}`}
        title={`OMS prototype — ${view.replace(/-/g, ' ')}`}
        style={{
          width: frameWidth,
          height,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      />
    </div>
  );
}
