// The hero's entrance order, in seconds after the loading curtain has lifted (or, with no curtain, once
// the fonts and the first screen's pictures are in; HomeIntro.js). One place, so the parts arrive in
// the order they read: the faint ground, the name band behind, the portrait opening out of it, its
// signature and "Hello", then the headline, the buttons, and last the two side projects peeking in.
// (The handwriting inside the portrait's stickers keeps its own times: NameSticker.js 1.2s, Hello.js 2.6s.)
export const ENTER = {
  band: 0.2,
  portrait: 0.45,
  headline: 1.15,
  actions: 1.55,
  objects: 1.85, // the first; the next follows OBJECT_GAP later
};
export const OBJECT_GAP = 0.14;
