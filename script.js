// Shared across every page — the scroll-reveal effect (see the
// "Motion" block in styles.css for the two CSS states this toggles
// between). This is the whole mechanism: no animation library, no
// build step, ~15 lines of plain JS.

(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // If the browser can't do IntersectionObserver (very old browsers),
  // or the visitor has asked for reduced motion, just show everything
  // immediately instead of leaving it invisible.
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    els.forEach(function (el) { el.classList.add('reveal--visible'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        io.unobserve(entry.target); // reveal once, not every scroll pass
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(function (el) { io.observe(el); });
})();
