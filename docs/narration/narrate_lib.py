"""The pure logic behind narrate.py: no speech models, no files, so it is fast to test.

  parse_markdown_script(text)     script.md  ->  script dict (the shape script.json has)
  lint_script(script)             warnings about things that read badly aloud
  map_words_to_script(...)        recognised/aligned words  ->  one (start, end, prob) per SCRIPT word
  shape_timings(units, times)     per-word times -> per-sentence timings that satisfy narration.json's rules
  compare_text(script_words, heard_words)   what the voice skipped, added or changed
  quality_report(...)             things to look at before publishing

The narration.json rules this must satisfy (checked again by scripts/validate-narration.mjs): word starts never
go backwards; a word never ends before it starts; inside a sentence each word ends exactly where the next one
starts (so the highlight never flickers off); the chapter starts at its first word.
"""
import difflib
import re

WORD_CHARS = re.compile(r"[^\w']+", re.UNICODE)


# ----------------------------------------------------------------------------- the script (Markdown)

def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def _parse_front_matter(lines):
    """`key: value` lines, and one level of nested `key:` + indented `k: v` lines (for `pronounce`)."""
    meta, current = {}, None
    for raw in lines:
        if not raw.strip() or raw.strip().startswith("#"):
            continue
        indented = raw[:1] in (" ", "\t")
        key, _, value = raw.strip().partition(":")
        key, value = key.strip(), value.strip()
        if indented and current is not None:
            meta[current][key] = value
        elif value == "":
            meta[key] = {}
            current = key
        else:
            meta[key] = value
            current = None
    return meta


def parse_markdown_script(text):
    """Parse script.md.

        ---
        title: Making Placement Visible: the short version
        engine: elevenlabs
        voice: Adam
        pronounce:
          ECAT: E-C-A-T
        ---

        ## Intro {id=intro anchor=top}
        A paragraph. Paragraphs are separated by a blank line.

        ## The problem {id=problem}
        ...

    A chapter's `id` defaults to a slug of its heading and its `anchor` (the page section it belongs to) defaults
    to the id. Use anchor=top for a chapter that belongs to no section (the intro). <!-- comments --> are ignored.
    """
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S).replace("\r\n", "\n")
    meta = {}
    m = re.match(r"\s*---\n(.*?)\n---\n", text, flags=re.S)
    if m:
        meta = _parse_front_matter(m.group(1).split("\n"))
        text = text[m.end():]

    chapters, current, buffer = [], None, []

    def flush():
        if current is not None and buffer:
            current["paragraphs"].append(" ".join(buffer).strip())
        buffer.clear()

    for line in text.split("\n"):
        heading = re.match(r"^##\s+(.*?)\s*(\{(.*?)\})?\s*$", line)
        if heading:
            flush()
            label, attrs = heading.group(1), dict(re.findall(r"(\w+)=(\S+)", heading.group(3) or ""))
            cid = attrs.get("id") or _slug(label)
            current = {"id": cid, "label": label, "anchor": attrs.get("anchor", cid), "paragraphs": []}
            chapters.append(current)
        elif current is None:
            continue  # anything before the first chapter (a title line, notes) is not narrated
        elif line.strip() == "":
            flush()
        else:
            buffer.append(line.strip())
    flush()

    if not chapters:
        raise ValueError("script.md has no chapters: start each one with a '## Heading' line")
    ids = [c["id"] for c in chapters]
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        raise ValueError("chapter ids must be unique; repeated: " + ", ".join(dupes))
    empty = [c["id"] for c in chapters if not c["paragraphs"]]
    if empty:
        raise ValueError("chapters with no text: " + ", ".join(empty))

    script = {"title": meta.get("title", ""), "pronounce": meta.get("pronounce", {}) or {}, "chapters": chapters}
    for key in ("engine", "voice"):
        if meta.get(key):
            script[key] = meta[key]
    return script


def script_words(script):
    """Every display word in reading order (whitespace-split, punctuation attached) — what appears on the page."""
    return [w for ch in script["chapters"] for par in ch["paragraphs"] for w in par.split()]


def plain_text_for_voice(script, spoken=False, pronounce_fn=None):
    """The text to paste into the voice tool: paragraphs separated by blank lines, chapters by a bigger gap and
    no headings (a heading would be read aloud). With spoken=True, pronunciation overrides are applied."""
    blocks = []
    for ch in script["chapters"]:
        paras = ch["paragraphs"]
        if spoken and pronounce_fn:
            paras = [" ".join(pronounce_fn(w) for w in p.split()) for p in paras]
        blocks.append("\n\n".join(paras))
    return "\n\n\n".join(blocks) + "\n"


# ----------------------------------------------------------------------------- writing for the ear

SYMBOLS = re.compile(r"[%&/+=<>@#*_~|]")
DIGITS = re.compile(r"\d")


def sentences_of(paragraph):
    return [p for p in re.split(r"(?<=[.!?])\s+", paragraph.strip()) if p]


def lint_script(script, max_sentence_words=32):
    """Warnings for things that tend to sound wrong or make alignment harder. Never blocks."""
    out = []
    for ch in script["chapters"]:
        for pi, par in enumerate(ch["paragraphs"], 1):
            where = f'{ch["id"]}, paragraph {pi}'
            if DIGITS.search(par):
                out.append(f"{where}: has digits — spell numbers out ('fifty-one point five'), or the voice may read them oddly")
            found = sorted(set(SYMBOLS.findall(par)))
            if found:
                out.append(f"{where}: has symbols {' '.join(found)} — write them as words")
            for s in sentences_of(par):
                n = len(s.split())
                if n > max_sentence_words:
                    out.append(f"{where}: a {n}-word sentence ('{s[:48]}…') — shorter sentences narrate and highlight better")
    return out


def script_stats(script, words_per_minute=150):
    words = script_words(script)
    chars = sum(len(p) for ch in script["chapters"] for p in ch["paragraphs"])
    return {
        "chapters": len(script["chapters"]),
        "paragraphs": sum(len(ch["paragraphs"]) for ch in script["chapters"]),
        "words": len(words),
        "characters": chars,
        "estimated_seconds": round(len(words) / words_per_minute * 60),
    }


# ----------------------------------------------------------------------------- units (sentences)

def build_units_from_script(script):
    """Sentences in order, each remembering its chapter and paragraph. Same splitting as the kit's common.py,
    so the shape matches what the kit's renderers produce."""
    units = []
    for ci, ch in enumerate(script["chapters"]):
        for pi, par in enumerate(ch["paragraphs"]):
            for si, sent in enumerate(sentences_of(par)):
                units.append({"ci": ci, "pi": pi, "si": si, "text": sent, "words": sent.split()})
    return units


# ----------------------------------------------------------------------------- words -> times

def normalise(word):
    return WORD_CHARS.sub("", word.lower().replace("’", "'"))


def map_words_to_script(script_ws, heard):
    """Give every SCRIPT word a (start, end, probability).

    `heard` is a list of (word, start, end, probability) from the aligner, in order. When it lines up 1:1 with the
    script (the normal case, since the aligner is given the script) they are paired directly. Otherwise the two
    are matched by their normalised text, and script words the aligner has no time for are spread evenly across
    the gap between their neighbours (probability 0, so the report flags them).
    """
    if len(heard) == len(script_ws):
        return [(h[1], h[2], h[3]) for h in heard]

    a = [normalise(w) for w in script_ws]
    b = [normalise(h[0]) for h in heard]
    times = [None] * len(script_ws)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k][1], heard[j1 + k][2], heard[j1 + k][3])
    # fill the holes: spread evenly between the nearest timed neighbours
    n = len(times)
    i = 0
    while i < n:
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < n and times[j] is None:
            j += 1
        left = times[i - 1][1] if i > 0 else 0.0
        right = times[j][0] if j < n else (times[i - 1][1] if i > 0 else 0.0) + 0.3 * (j - i)
        right = max(right, left)
        span = (right - left) / (j - i)
        for k in range(i, j):
            times[k] = (left + span * (k - i), left + span * (k - i + 1), 0.0)
        i = j
    return times


def _srt_seconds(stamp):
    hours, minutes, rest = stamp.strip().split(":")
    return int(hours) * 3600 + int(minutes) * 60 + float(rest.replace(",", "."))


def parse_srt(text):
    """[(start, end, text)] from a subtitle file (SRT, or the near-identical WebVTT), in seconds. Tags are dropped."""
    cues = []
    for block in re.split(r"\r?\n\s*\r?\n", text.strip()):
        lines = block.splitlines()
        arrow = next((i for i, line in enumerate(lines) if "-->" in line), None)
        if arrow is None:
            continue
        start, end = lines[arrow].split("-->")
        body = re.sub(r"<[^>]+>", "", " ".join(line.strip() for line in lines[arrow + 1:] if line.strip()))
        if body:
            cues.append((_srt_seconds(start), _srt_seconds(end.split()[0]), body))
    return cues


def assign_cues(script_ws, cues):
    """Which script words each subtitle cue covers: a list, one entry per cue, of (first, last + 1) or None.

    The subtitles are generated from the same text as the script, so they line up word for word, except where
    the text was spelled differently for the voice (Novatr / Novater): a same-length change still lines up.
    The ranges never overlap and always run in order.
    """
    cue_words, owner = [], []
    for ci, (_, _, text) in enumerate(cues):
        for word in text.split():
            cue_words.append(word)
            owner.append(ci)
    a = [normalise(w) for w in script_ws]
    b = [normalise(w) for w in cue_words]
    spans = [None] * len(cues)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                ci = owner[j1 + k]
                lo, hi = spans[ci] or (i1 + k, i1 + k)
                spans[ci] = (min(lo, i1 + k), max(hi, i1 + k + 1))
    floor = 0
    for ci, span in enumerate(spans):
        if span is None:
            continue
        lo, hi = max(span[0], floor), span[1]
        spans[ci] = (lo, hi) if hi > lo else None
        floor = max(floor, hi)
    return spans


MIN_WORD = 0.05  # seconds: the shortest a word is allowed to last, so the highlight never skips one


def _is_mark(word):
    """A token with no letters or digits in it: a standalone dash, say. It can't be heard, only shown."""
    return not re.search(r"[A-Za-z0-9]", word)


def shape_timings(units, times):
    """Per-word (start, end, prob) -> per-sentence {"start","end","words":[(s,e)...],"probs":[...]} that follow
    narration.json's rules. `times` is one entry per script word, in the same order as the units' words.

    Word starts are forced to be non-decreasing; inside a sentence each word ends where the next begins; and a
    sentence never starts before the previous one has ended (an aligner can overlap them by a few ms).

    Every word also lasts at least MIN_WORD. An aligner sometimes gives a word no time at all (often the first
    word of a sentence), which would make the highlight skip it. A word that is too short is started a little
    earlier, taking the time from the word before it; a standalone mark such as a dash takes its sliver from
    the pause it sits in, not from a spoken word."""
    out, k, floor = [], 0, 0.0
    for u in units:
        n = len(u["words"])
        chunk = times[k:k + n]
        k += n
        starts = []
        for idx, (s, _e, _p) in enumerate(chunk):
            s = max(s, floor)
            starts.append(s)
            floor = s
        # a mark is heard as nothing: put it at the end of its pause, just before the next word
        for i in range(n - 2, -1, -1):
            if _is_mark(u["words"][i]):
                starts[i] = max(starts[i - 1] if i else starts[i], starts[i + 1] - MIN_WORD)
        end_last = max(chunk[-1][1], starts[-1] + MIN_WORD)
        # too short? start earlier (backwards), then make sure nothing moved before the sentence's floor or
        # crowds the next word (forwards)
        for i in range(n - 2, -1, -1):
            starts[i] = min(starts[i], starts[i + 1] - MIN_WORD)
        prior = out[-1]["end"] if out else 0.0
        for i in range(n):
            starts[i] = max(starts[i], prior if i == 0 else starts[i - 1] + MIN_WORD)
        end_last = max(end_last, starts[-1] + MIN_WORD)
        ends = [starts[i + 1] if i + 1 < n else end_last for i in range(n)]
        out.append({"start": starts[0], "end": ends[-1], "words": list(zip(starts, ends)), "probs": [p for _s, _e, p in chunk]})
        floor = max(floor, ends[-1])
    return out


# ----------------------------------------------------------------------------- checking the voice read it right
#
# The check listens to the audio (speech-to-text) and compares that with the script. Speech-to-text writes numbers
# as digits, spells names its own way ("Novator", "Sonya") and now and then imagines words in a silence, so a plain
# word-for-word comparison drowns the real problems in noise. Instead both sides are turned into the same
# plain spoken words (digits expanded), near-identical words count as the same word, and only content that
# is really missing, added or different is reported.

_ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def int_words(n):
    """0..999999 in words, as separate tokens ('fifty five', not 'fifty-five')."""
    if n < 20:
        return [_ONES[n]]
    if n < 100:
        return [_TENS[n // 10]] + ([_ONES[n % 10]] if n % 10 else [])
    if n < 1000:
        return [_ONES[n // 100], "hundred"] + (int_words(n % 100) if n % 100 else [])
    return int_words(n // 1000) + ["thousand"] + (int_words(n % 1000) if n % 1000 else [])


def spoken_tokens(word):
    """A written word -> the plain lower-case words a voice would say for it: 'fifty-one' -> fifty, one;
    '51.5' -> fifty one point five; '30%' -> thirty percent; 'learner’s' -> learner's."""
    out = []
    for m in re.finditer(r"\d+(?:\.\d+)?%?|[^\W\d_]+(?:['’][^\W\d_]+)*", word.replace("’", "'"), flags=re.UNICODE):
        t = m.group(0)
        if t[0].isdigit():
            pct = t.endswith("%")
            whole, _, frac = t.rstrip("%").partition(".")
            out += int_words(int(whole)) if len(whole) < 7 else list(whole)
            if frac:
                out += ["point"] + [_ONES[int(d)] for d in frac]
            if pct:
                out.append("percent")
        else:
            out.append(t.lower())
    return out


def merge_split_numbers(words, times):
    """Speech-to-text often splits '51.5' into '51' + '.5.' and '30%' into '30' + '%'. Stitch such fragments back
    onto the number before them (words and their (start, end) times stay in step)."""
    out_w, out_t = [], []
    for w, t in zip(words, times):
        glue = re.match(r"^\.\d|^%", w)
        if glue and out_w and re.search(r"\d", out_w[-1]):
            out_w[-1] += w
            out_t[-1] = (out_t[-1][0], t[1])
        else:
            out_w.append(w)
            out_t.append(t)
    return out_w, out_t


def _tokens(words):
    """[(token, index of the word it came from)]"""
    return [(t, i) for i, w in enumerate(words) for t in spoken_tokens(w)]


def _similar(a, b, threshold=0.72):
    return a == b or difflib.SequenceMatcher(None, a, b).ratio() >= threshold


def _overlap_fraction(span, spans):
    """How much of `span` (start, end) lies inside any of `spans`, 0..1."""
    start, end = span
    if end <= start:
        return 0.0
    covered = sum(max(0.0, min(end, e) - max(start, s)) for s, e in spans)
    return min(1.0, covered / (end - start))


def compare_text(script_ws, heard_ws, context=4, min_extra_run=3, heard_times=None, speech_spans=None, min_speech=0.3, evidence=None):
    """Where the voice's words really differ from the script. Returns dicts
    {"kind": "missing" | "extra" | "changed", "script": str, "heard": str, "at": script word index, "context": str}.

    Ignored on purpose: digits vs spelled-out numbers, spelling variants of a name or plural ("Novator"), and
    single dropped little words ("the", "a"). Reported: script words that are absent (two or more together, or
    any longer word), a run of three or more words the voice added, and words replaced by something unlike them.

    With `heard_times` (a (start, end) per heard word) and `speech_spans` (where the aligned script is being spoken),
    extra words that fall in a silence are dropped: they cannot be the voice, they are speech-to-text imagining
    words where there is only quiet.

    With `evidence` (the aligner's raw (start, end, probability) per script word), a "missing" or "changed" report
    is dropped when the aligner clearly found speech for those words (decent confidence, a normal length): then it
    was speech-to-text that dropped or misheard them (it often loses the last word), not the voice that skipped them."""
    a, b = _tokens(script_ws), _tokens(heard_ws)
    ta, tb = [t for t, _ in a], [t for t, _ in b]
    issues = []

    def context_of(i):
        return " ".join(script_ws[max(0, i - context): i + context + 1])

    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(a=ta, b=tb, autojunk=False).get_opcodes():
        if tag == "equal":
            continue
        miss, extra = ta[i1:i2], tb[j1:j2]
        if tag == "replace":
            # forgive near-matches inside the block: greedily pair each script token with a similar heard token
            unused = list(extra)
            still = []
            for t in miss:
                hit = next((u for u in unused if _similar(t, u)), None)
                if hit is None:
                    still.append(t)
                else:
                    unused.remove(hit)
            miss, extra = still, unused
        at = a[i1][1] if i1 < len(a) else max(len(script_ws) - 1, 0)
        if miss and evidence:
            word_ids = sorted({a[k][1] for k in range(i1, i2)})
            if word_ids and all(evidence[w][2] >= 0.3 and (evidence[w][1] - evidence[w][0]) >= 0.06 for w in word_ids):
                miss = []
        if miss and (len(miss) >= 2 or len(miss[0]) >= 4):
            kind = "changed" if extra else "missing"
            issues.append({"kind": kind, "at": at, "script": " ".join(miss), "heard": " ".join(extra), "context": context_of(at)})
        elif len(extra) >= min_extra_run:
            if heard_times and speech_spans:
                heard_words_idx = sorted({b[j][1] for j in range(j1, j2)})
                span = (heard_times[heard_words_idx[0]][0], heard_times[heard_words_idx[-1]][1])
                if _overlap_fraction(span, speech_spans) < min_speech:
                    continue
            issues.append({"kind": "extra", "at": at, "script": "", "heard": " ".join(extra), "context": context_of(at)})
    return issues


def quality_report(units, shaped, script_ws, text_issues=None, raw_times=None, unsure_prob=0.25, unsure_share=0.5, squeezed_run=4, squeezed=0.04, long_word=1.8, long_gap=2.5):
    """Review notes, most important first. Empty means nothing stands out.

    Word-by-word confidence is deliberately NOT reported: an aligner is unsure about names and little words all the
    time. What is reported is a whole sentence it was mostly unsure about, or a run of words squeezed into almost
    no time (the mark of words the voice never said). `raw_times` is what the aligner returned per script word;
    lengths are judged on those because shaping stretches every word to reach the next one."""
    notes = []
    for issue in text_issues or []:
        if issue["kind"] == "extra":
            notes.append(f"TEXT  extra words heard: “{issue['heard']}”  (near “…{issue['context']}…”). Speech-to-text sometimes imagines words in a silence; listen here before regenerating.")
        elif issue["kind"] == "missing":
            notes.append(f"TEXT  the voice skipped “{issue['script']}”  (…{issue['context']}…)")
        else:
            notes.append(f"TEXT  the script says “{issue['script']}” but the voice seems to say “{issue['heard']}”  (…{issue['context']}…)")

    k = 0
    prev_end = None
    for u, t in zip(units, shaped):
        n = len(u["words"])
        raw = raw_times[k:k + n] if raw_times else [(s, e, p) for (s, e), p in zip(t["words"], t["probs"])]
        k += n
        probs = [r[2] for r in raw]
        if probs and sum(1 for p in probs if p < unsure_prob) / len(probs) >= unsure_share and len(probs) >= 3:
            notes.append(f"TIME  the aligner was unsure about “{u['text'][:60]}” at {t['start']:.1f}s — check this stretch by ear")
        run = 0
        for w, r in zip(u["words"], raw):
            run = run + 1 if (r[1] - r[0]) < squeezed and re.search(r"\w", w) else 0
            if run == squeezed_run:
                notes.append(f"TIME  {squeezed_run}+ words in a row are squeezed into almost no time near “{w}” at {t['start']:.1f}s — the voice may have skipped them")
        for w, r in zip(u["words"], raw):
            if r[1] - r[0] > long_word:
                notes.append(f"TIME  “{w}” lasts {r[1] - r[0]:.1f}s at {r[0]:.1f}s — usually a pause the aligner attributed to it")
        if prev_end is not None and t["start"] - prev_end > long_gap:
            notes.append(f"GAP   {t['start'] - prev_end:.1f}s of silence before “{u['text'][:40]}…” at {t['start']:.1f}s")
        prev_end = t["end"]
    return notes
