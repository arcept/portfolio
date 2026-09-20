"""Tests for narrate_lib.py (no speech models needed).   python3 -m unittest discover -s docs/narration -p 'test_*.py'"""
import json
import unittest
from pathlib import Path

import narrate_lib as L

HERE = Path(__file__).resolve().parent

MD = """---
title: A title
engine: elevenlabs
voice: Adam
pronounce:
  ECAT: E-C-A-T
---

Ignored preamble.

## Intro {id=intro anchor=top}
First paragraph, line one
and line two.

Second paragraph.

<!-- a comment that is not narrated -->

## The problem {id=problem}
Only one.

## Loose ends
Slug id and default anchor.
"""


class ParseTests(unittest.TestCase):
    def setUp(self):
        self.s = L.parse_markdown_script(MD)

    def test_front_matter_and_pronunciation(self):
        self.assertEqual(self.s["title"], "A title")
        self.assertEqual((self.s["engine"], self.s["voice"]), ("elevenlabs", "Adam"))
        self.assertEqual(self.s["pronounce"], {"ECAT": "E-C-A-T"})

    def test_chapters_ids_anchors(self):
        self.assertEqual([(c["id"], c["anchor"], c["label"]) for c in self.s["chapters"]],
                         [("intro", "top", "Intro"), ("problem", "problem", "The problem"), ("loose-ends", "loose-ends", "Loose ends")])

    def test_paragraphs_join_lines_and_split_on_blank_lines(self):
        self.assertEqual(self.s["chapters"][0]["paragraphs"], ["First paragraph, line one and line two.", "Second paragraph."])

    def test_text_before_the_first_chapter_and_comments_are_not_narrated(self):
        joined = " ".join(p for c in self.s["chapters"] for p in c["paragraphs"])
        self.assertNotIn("preamble", joined)
        self.assertNotIn("comment", joined)

    def test_errors_are_clear(self):
        with self.assertRaisesRegex(ValueError, "no chapters"):
            L.parse_markdown_script("just text")
        with self.assertRaisesRegex(ValueError, "unique"):
            L.parse_markdown_script("## A {id=x}\nt\n\n## B {id=x}\nt")
        with self.assertRaisesRegex(ValueError, "no text"):
            L.parse_markdown_script("## A {id=a}\n\n## B {id=b}\nt")

    def test_the_shipped_script_md_matches_script_json(self):
        md = L.parse_markdown_script((HERE / "script.md").read_text(encoding="utf-8"))
        js = json.loads((HERE / "script.json").read_text(encoding="utf-8"))
        for key in ("title", "pronounce", "chapters"):
            self.assertEqual(md[key], js[key], key)


class TextForTheVoiceTests(unittest.TestCase):
    def test_no_headings_and_chapters_separated(self):
        s = L.parse_markdown_script(MD)
        t = L.plain_text_for_voice(s)
        self.assertNotIn("Intro", t)
        self.assertNotIn("##", t)
        self.assertIn("Second paragraph.\n\n\nOnly one.", t)

    def test_spoken_variant_applies_overrides(self):
        s = {"chapters": [{"paragraphs": ["We built ECAT today."]}]}
        t = L.plain_text_for_voice(s, spoken=True, pronounce_fn=lambda w: "E-C-A-T" if w == "ECAT" else w)
        self.assertEqual(t.strip(), "We built E-C-A-T today.")


class LintTests(unittest.TestCase):
    def test_flags_digits_symbols_and_long_sentences(self):
        s = {"chapters": [{"id": "c", "paragraphs": ["It rose 30% in 2 years.", " ".join(["word"] * 40) + "."]}]}
        out = L.lint_script(s)
        self.assertTrue(any("digits" in w for w in out))
        self.assertTrue(any("symbols" in w and "%" in w for w in out))
        self.assertTrue(any("40-word sentence" in w for w in out))

    def test_clean_script_has_no_warnings(self):
        self.assertEqual(L.lint_script({"chapters": [{"id": "c", "paragraphs": ["A short clean sentence. Another one."]}]}), [])


def fake_times(units, start=1.0, dur=0.3, gap=0.4, prob=0.9):
    """One (s, e, p) per script word, evenly spaced, in the shape the aligner returns."""
    t, out = start, []
    for u in units:
        for _ in u["words"]:
            out.append((t, t + dur, prob))
            t += dur
        t += gap
    return out


class MappingTests(unittest.TestCase):
    def test_one_to_one_is_paired_directly(self):
        heard = [("a", 0, 1, 0.9), ("b", 1, 2, 0.8)]
        self.assertEqual(L.map_words_to_script(["a", "b"], heard), [(0, 1, 0.9), (1, 2, 0.8)])

    def test_a_skipped_word_gets_a_zero_confidence_time_between_its_neighbours(self):
        script = ["one", "two", "three", "four"]
        heard = [("one", 0, 1, 1.0), ("three", 2, 3, 1.0), ("four", 3, 4, 1.0)]
        times = L.map_words_to_script(script, heard)
        self.assertEqual(len(times), 4)
        self.assertEqual(times[1][2], 0.0)
        self.assertTrue(times[0][1] <= times[1][0] <= times[1][1] <= times[2][0])

    def test_matching_ignores_case_and_punctuation(self):
        script = ["Hello,", "World!", "extra"]
        heard = [("hello", 0, 1, 1.0), ("world", 1, 2, 1.0)]
        times = L.map_words_to_script(script, heard)
        self.assertEqual(times[0][:2], (0, 1))
        self.assertEqual(times[1][:2], (1, 2))
        self.assertEqual(times[2][2], 0.0)


SRT = """1
00:00:00,000 --> 00:00:02,972
Hello — thanks for taking a look at
Placement Hub.

2
00:00:03,005 --> 00:00:07,435
At Novater, <i>learners</i> had support.
"""


class SubtitleTests(unittest.TestCase):
    def test_parse_srt(self):
        cues = L.parse_srt(SRT)
        self.assertEqual(cues[0], (0.0, 2.972, "Hello — thanks for taking a look at Placement Hub."))
        self.assertEqual(cues[1], (3.005, 7.435, "At Novater, learners had support."))

    def test_parse_webvtt(self):
        cues = L.parse_srt("WEBVTT\n\n00:00:01.500 --> 00:00:02.000 align:start\nHi there\n")
        self.assertEqual(cues, [(1.5, 2.0, "Hi there")])

    def test_cues_line_up_with_the_script_word_for_word(self):
        words = "Hello — thanks for taking a look at Placement Hub. At Novatr, learners had support.".split()
        spans = L.assign_cues(words, L.parse_srt(SRT))
        self.assertEqual(spans, [(0, 10), (10, 15)])  # Novatr / Novater is a same-length change

    def test_a_cue_that_is_not_in_the_script_is_skipped_and_ranges_stay_in_order(self):
        words = "one two three four".split()
        cues = [(0, 1, "one two"), (1, 2, "extra words here"), (2, 3, "three four")]
        self.assertEqual(L.assign_cues(words, cues), [(0, 2), None, (2, 4)])


class ShapeTests(unittest.TestCase):
    def setUp(self):
        self.script = L.parse_markdown_script(MD)
        self.units = L.build_units_from_script(self.script)

    def check_rules(self, shaped):
        prev_start, prev_end = -1, -1
        for t in shaped:
            self.assertGreaterEqual(t["start"], prev_end - 1e-9, "a sentence starts before the previous one ends")
            for (s, e), nxt in zip(t["words"], t["words"][1:] + [None]):
                self.assertGreaterEqual(s, prev_start - 1e-9, "start went backwards")
                self.assertGreaterEqual(e, s, "ends before it starts")
                if nxt:
                    self.assertAlmostEqual(e, nxt[0], places=9, msg="gap inside a sentence")
                prev_start = s
            prev_end = t["end"]

    def test_clean_timings_satisfy_the_rules(self):
        self.check_rules(L.shape_timings(self.units, fake_times(self.units)))

    def test_messy_aligner_output_is_repaired(self):
        times = fake_times(self.units)
        # backwards start, negative-length word, and an overlap into the next sentence
        times[3] = (times[2][0] - 0.5, times[3][1], 0.9)
        times[5] = (times[5][0], times[5][0] - 0.2, 0.9)
        n = len(self.units[0]["words"])
        times[n - 1] = (times[n - 1][0], times[n][0] + 0.6, 0.9)
        self.check_rules(L.shape_timings(self.units, times))

    def test_sentence_bounds_are_first_start_and_last_end(self):
        shaped = L.shape_timings(self.units, fake_times(self.units))
        for t in shaped:
            self.assertEqual(t["start"], t["words"][0][0])
            self.assertEqual(t["end"], t["words"][-1][1])


class MinimumWordTests(unittest.TestCase):
    """The highlight jumps to the word that starts latest at or before the current time, so a word with no duration is never lit."""

    def units(self, *sentences):
        return [{"words": s.split()} for s in sentences]

    def durations(self, shaped):
        return [e - s for t in shaped for s, e in t["words"]]

    def test_words_the_aligner_gave_no_time_still_last_a_moment(self):
        units = self.units("The problem was here.", "And then it changed.")
        # "The" and "And" (sentence-initial) start exactly where the next word does
        times = [(1.0, 1.0, 0.9), (1.0, 1.4, 0.9), (1.4, 1.8, 0.9), (1.8, 2.2, 0.9), (3.0, 3.0, 0.9), (3.0, 3.3, 0.9), (3.3, 3.6, 0.9), (3.6, 4.0, 0.9)]
        shaped = L.shape_timings(units, times)
        self.assertTrue(all(d >= L.MIN_WORD - 1e-9 for d in self.durations(shaped)), self.durations(shaped))
        self.assertGreaterEqual(shaped[1]["start"], shaped[0]["end"] - 1e-9)

    def test_a_run_of_words_all_starting_together_is_spread_out_in_order(self):
        units = self.units("a b c d e")
        times = [(2.0, 2.0, 0.5)] * 5
        shaped = L.shape_timings(units, times)
        starts = [s for s, _e in shaped[0]["words"]]
        self.assertEqual(starts, sorted(set(starts)))
        self.assertTrue(all(d >= L.MIN_WORD - 1e-9 for d in self.durations(shaped)))

    def test_a_standalone_dash_takes_its_sliver_from_the_pause_not_from_the_word_before_it(self):
        units = self.units("Hello — thanks for looking.")
        times = [(0.3, 0.3, 0.9), (0.3, 1.18, 0.9), (1.18, 1.5, 0.9), (1.5, 1.7, 0.9), (1.7, 2.2, 0.9)]
        (t,) = L.shape_timings(units, times)
        (hello_s, hello_e), (dash_s, dash_e) = t["words"][0], t["words"][1]
        self.assertAlmostEqual(dash_e - dash_s, L.MIN_WORD, places=6)
        self.assertGreater(hello_e - hello_s, 0.5, "Hello keeps the pause it was spoken into")
        self.assertAlmostEqual(dash_e, 1.18, places=6, msg="the dash sits at the end of the pause, just before the next word")


class SpokenTokensTests(unittest.TestCase):
    def test_numbers_become_words(self):
        self.assertEqual(L.spoken_tokens("63"), ["sixty", "three"])
        self.assertEqual(L.spoken_tokens("51.5."), ["fifty", "one", "point", "five"])
        self.assertEqual(L.spoken_tokens("30%"), ["thirty", "percent"])
        self.assertEqual(L.spoken_tokens("1,"), ["one"])
        self.assertEqual(L.spoken_tokens("100"), ["one", "hundred"])

    def test_hyphens_split_and_apostrophes_stay(self):
        self.assertEqual(L.spoken_tokens("fifty-one"), ["fifty", "one"])
        self.assertEqual(L.spoken_tokens("learner’s"), ["learner's"])
        self.assertEqual(L.spoken_tokens("self-placed:"), ["self", "placed"])


class MergeSplitNumbersTests(unittest.TestCase):
    def test_fragments_are_stitched_onto_their_number(self):
        words, times = L.merge_split_numbers(["to", "51", ".5.", "and", "30", "%", "of"], [(i, i + 1) for i in range(7)])
        self.assertEqual(words, ["to", "51.5.", "and", "30%", "of"])
        self.assertEqual(times[1], (1, 3))
        self.assertEqual(times[3], (4, 6))

    def test_other_words_are_left_alone(self):
        self.assertEqual(L.merge_split_numbers(["a", ".b", "%x"], [(0, 1), (1, 2), (2, 3)])[0], ["a", ".b", "%x"])
        self.assertEqual(L.compare_text("placements to fifty-one point five and thirty percent".split(), L.merge_split_numbers("placements to 51 .5. and 30 %".split(), [(i, i + 1) for i in range(7)])[0]), [])


class CompareTextTests(unittest.TestCase):
    def test_identical_text_has_no_issues(self):
        self.assertEqual(L.compare_text("a b c".split(), "A, b! c".split()), [])

    def test_speech_to_text_habits_are_not_problems(self):
        script = "Novatr has sixty-three states, fifty-one point five percent, and Sanya wrote ECAT for learners.".split()
        heard = "Novator has 63 states. 51.5% and Sonya wrote ACAT for learner".split()
        self.assertEqual(L.compare_text(script, heard), [])

    def test_a_dropped_little_word_is_ignored(self):
        self.assertEqual(L.compare_text("we shipped it to the users".split(), "we shipped it to users".split()), [])

    def test_a_skipped_content_word_is_reported(self):
        (issue,) = L.compare_text("the quick brown fox jumps".split(), "the quick fox jumps".split())
        self.assertEqual((issue["kind"], issue["script"]), ("missing", "brown"))

    def test_a_skipped_phrase_is_reported(self):
        (issue,) = L.compare_text("one two three four five six".split(), "one two five six".split())
        self.assertEqual((issue["kind"], issue["script"]), ("missing", "three four"))

    def test_a_run_of_extra_words_is_reported_but_one_or_two_are_not(self):
        base = "we shipped it today".split()
        self.assertEqual(L.compare_text(base, "we shipped it today now".split()), [])
        self.assertEqual(L.compare_text(base, "we shipped it today and then".split()), [])
        (issue,) = L.compare_text(base, "we shipped it today players were in the field".split())
        self.assertEqual(issue["kind"], "extra")
        self.assertIn("players were in the field", issue["heard"])

    def test_extra_words_heard_in_a_silence_are_dropped_but_kept_during_speech(self):
        script = "we shipped it today".split()
        heard = "we shipped it today players were in the field".split()
        # the four extra words (indices 4..8) are timed at 10–12 s; the script is spoken 0–3 s, so that is silence
        times = [(0, .5), (.5, 1), (1, 1.5), (1.5, 3)] + [(10 + i * .5, 10.5 + i * .5) for i in range(5)]
        self.assertEqual(L.compare_text(script, heard, heard_times=times, speech_spans=[(0, 3)]), [])
        # if the same words were timed during the speech they would count
        during = [(0, .5), (.5, 1), (1, 1.5), (1.5, 3)] + [(3 - 0.1 * (5 - i), 3) for i in range(5)]
        (issue,) = L.compare_text(script, heard, heard_times=during, speech_spans=[(0, 3.2)])
        self.assertEqual(issue["kind"], "extra")

    def test_a_miss_the_aligner_found_speech_for_is_speech_to_text_dropping_it_not_the_voice(self):
        script, heard = "we shipped it today".split(), "we shipped it".split()
        solid = [(0, .4, .9), (.4, .9, .9), (.9, 1.2, .9), (1.2, 1.9, .8)]   # a normal-length, confident 'today'
        weak = solid[:3] + [(1.2, 1.205, 0.05)]                              # squeezed and unsure: really skipped
        self.assertEqual(L.compare_text(script, heard, evidence=solid), [])
        (issue,) = L.compare_text(script, heard, evidence=weak)
        self.assertEqual((issue["kind"], issue["script"]), ("missing", "today"))

    def test_a_word_replaced_by_something_unlike_it_is_reported(self):
        (issue,) = L.compare_text("we shipped it".split(), "we launched it".split())
        self.assertEqual((issue["kind"], issue["script"], issue["heard"]), ("changed", "shipped", "launched"))

    def test_the_issue_says_where(self):
        script = "a b c d e f g h i j brown k".split()
        (issue,) = L.compare_text(script, "a b c d e f g h i j k".split())
        self.assertEqual(issue["at"], 10)
        self.assertIn("brown", issue["context"])


class QualityReportTests(unittest.TestCase):
    def setUp(self):
        self.script = L.parse_markdown_script(MD)
        self.units = L.build_units_from_script(self.script)
        self.words = L.script_words(self.script)

    def report(self, raw, issues=None):
        return L.quality_report(self.units, L.shape_timings(self.units, raw), self.words, issues, raw_times=raw)

    def test_nothing_stands_out_for_clean_timings(self):
        self.assertEqual(self.report(fake_times(self.units)), [])

    def test_single_unsure_or_instant_words_are_not_noise_worth_reporting(self):
        raw = fake_times(self.units)
        raw[1] = (raw[1][0], raw[1][0], 0.02)          # one zero-length, unconfident little word
        self.assertEqual(self.report(raw), [])

    def test_a_mostly_unsure_sentence_is_reported(self):
        raw = fake_times(self.units)
        n0 = len(self.units[0]["words"])
        raw[:n0] = [(s, e, 0.05) for s, e, _p in raw[:n0]]
        self.assertTrue(any("unsure" in n for n in self.report(raw)))

    def test_a_run_of_squeezed_words_is_reported(self):
        raw = fake_times(self.units)
        for i in range(2, 7):
            raw[i] = (raw[i][0], raw[i][0] + 0.005, 0.9)
        self.assertTrue(any("squeezed" in n for n in self.report(raw)))

    def test_a_long_silence_is_reported(self):
        raw = fake_times(self.units)
        k = len(self.units[0]["words"])
        raw = raw[:k] + [(s + 5, e + 5, p) for s, e, p in raw[k:]]
        self.assertTrue(any(n.startswith("GAP") for n in self.report(raw)))

    def test_text_problems_come_first_and_read_clearly(self):
        issues = [{"kind": "missing", "script": "brown", "heard": "", "context": "the quick brown fox", "at": 3},
                  {"kind": "extra", "script": "", "heard": "players were in the field", "context": "over the lazy", "at": 9}]
        notes = self.report(fake_times(self.units), issues)
        self.assertTrue(notes[0].startswith("TEXT  the voice skipped “brown”"))
        self.assertTrue(notes[1].startswith("TEXT  extra words heard"))


if __name__ == "__main__":
    unittest.main()
