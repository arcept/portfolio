'use client';

import { useEffect, useState } from 'react';

// Whether the browser runs CSS scroll-driven animations (Chrome, and Safari from 26). Where it does,
// the hero's zoom-out is done in CSS (home.css), in step with the scroll itself; where it doesn't,
// in JavaScript from the scroll position. False until mounted, so the server and the first client
// render agree.
export default function useScrollTimeline() {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(CSS.supports('animation-timeline: view()')), []);
  return supported;
}
