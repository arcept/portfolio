import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateNarration } from './validate.mjs';

const load = (rel) => JSON.parse(fs.readFileSync(new URL(rel, import.meta.url), 'utf8'));
const clone = (o) => structuredClone(o);
const real = load('../../public/case-studies/placement-hub/narration/narration.json');
const script = load('../../docs/narration/script.json');
const pageIds = ['problem', 'evidence', 'reframing', 'leadership', 'product', 'handover', 'launch'];
const okOptions = { script, pageIds, audioDuration: real.duration };
const words = (n, ci = 1) => n.chapters[ci].paragraphs[0].sentences[0].words;

test('the shipped narration is valid', () => {
  const { errors, warnings } = validateNarration(real, okOptions);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('without an audio duration it warns instead of failing', () => {
  const { errors, warnings } = validateNarration(real, { script, pageIds });
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => /audio/.test(w)));
});

test('a start time that goes backwards is an error', () => {
  const n = clone(real);
  words(n)[3].s = words(n)[1].s - 1;
  assert.ok(validateNarration(n, okOptions).errors.some((e) => /goes backwards/.test(e)));
});

test('a word that ends before it starts is an error', () => {
  const n = clone(real);
  words(n)[2].e = words(n)[2].s - 0.1;
  assert.ok(validateNarration(n, okOptions).errors.some((e) => /ends before it starts/.test(e)));
});

test('a gap between words inside a sentence is an error', () => {
  const n = clone(real);
  words(n)[2].e -= 0.05;
  assert.ok(validateNarration(n, okOptions).errors.some((e) => /next word starts/.test(e)));
});

test('a chapter that does not start at its first word is an error', () => {
  const n = clone(real);
  n.chapters[2].start += 0.5;
  assert.ok(validateNarration(n, okOptions).errors.some((e) => /first word starts/.test(e)));
});

test('an anchor that is not a section id is an error, but "top" is always fine', () => {
  const n = clone(real);
  n.chapters[1].anchor = 's1';
  const { errors } = validateNarration(n, okOptions);
  assert.ok(errors.some((e) => /anchor "s1"/.test(e)));
  assert.equal(errors.length, 1);
  assert.equal(real.chapters[0].anchor, 'top');
});

test('a duration that differs from the audio by more than 0.1 s is an error', () => {
  assert.ok(validateNarration(real, { ...okOptions, audioDuration: real.duration + 0.5 }).errors.some((e) => /audio file/.test(e)));
  assert.deepEqual(validateNarration(real, { ...okOptions, audioDuration: real.duration + 0.05 }).errors, []);
});

test('editing a word in narration.json is caught: the text must equal script.json', () => {
  const n = clone(real);
  words(n)[1].t = 'changed';
  assert.ok(validateNarration(n, okOptions).errors.some((e) => /differs from script.json|text differs/.test(e)));
});

test('a chapter missing from either file is an error', () => {
  const n = clone(real);
  n.chapters.pop();
  assert.ok(validateNarration(n, okOptions).errors.some((e) => /missing from narration.json/.test(e)));
});

test('an empty narration is rejected', () => {
  assert.ok(validateNarration({ chapters: [] }).errors.length > 0);
});
