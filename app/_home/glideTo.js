'use client';

import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

// A click handler for a link to a place further down the page (#id): the page glides there, easing in
// and out, instead of jumping. Scrolling or tapping on the way stops it where it is. Modified clicks
// follow the link as usual, and visitors who ask for less motion go straight there.
export default function glideTo(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
  const hash = event.currentTarget.getAttribute('href');
  const target = hash?.startsWith('#') && document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  const distance = Math.abs(target.getBoundingClientRect().top);
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.to(window, {
    duration: still ? 0 : Math.min(1.8, 0.9 + distance / 4000),
    ease: 'power3.inOut',
    scrollTo: { y: target, autoKill: true },
    onComplete: () => window.history.replaceState(null, '', hash),
  });
}
