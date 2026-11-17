// The homepage's cursor effect, in two parts that can each be switched off here (false), with nothing
// else to change:
//   CURSOR_EFFECT — the visitor's own pointer drawn as a named cursor ("You"), in each section's colour,
//     with Manik's comments on hover (NamedCursor.js, cursor.js). Off: the normal system pointer.
//   HERO_RIPPLE — the hero's dot grid made live: it leans away from the pointer and ripples with the
//     scroll (HeroRipple.js). Off: the plain CSS dots.
// Phones (and any screen without a mouse) only ever get the ripple.
export const CURSOR_EFFECT = true;
export const HERO_RIPPLE = true;
