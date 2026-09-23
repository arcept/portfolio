'use client';

import { MotionConfig } from 'motion/react';

// One place decides what "reduced motion" means on this page. With reducedMotion="user", Motion drops
// transform and layout animations for visitors who ask for that and keeps the fades, so components
// describe a single animation and never branch their rendered markup on the preference — which is
// also what keeps the server and client markup identical.
export default function AboutMotion({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
