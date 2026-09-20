"""Shared helpers for the narration kit.

The contract between every renderer (Kokoro, ElevenLabs, anything later) and the
player builder is `narration.json`:

{
  "engine": "kokoro", "voice": "am_michael", "audio": "narration.mp3",
  "duration": 241.3,
  "chapters": [
    {"id": "problem", "label": "The problem", "anchor": "s1", "start": 12.0, "end": 41.2,
     "paragraphs": [
       {"sentences": [
          {"start": 12.0, "end": 16.4,
           "words": [{"t": "A", "s": 12.0, "e": 12.1}, ...]}]}]}]
}

Display words are the script's own words (whitespace-split), so the transcript
on the page is exactly what was written. Pronunciation overrides only change what
the voice *says*, never what the reader *sees*, and always map one word to one word,
which keeps timings aligned.
"""
import json
import re

PUNCT_EDGE = re.compile(r"^([^\w]*)(.*?)([^\w]*)$", re.UNICODE)


def load_script(path="script.json"):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def split_sentences(paragraph):
    parts = re.split(r"(?<=[.!?])\s+", paragraph.strip())
    return [p for p in parts if p]


def spoken_word(word, pronounce):
    """Apply a pronunciation override to one display word, keeping its punctuation."""
    m = PUNCT_EDGE.match(word)
    pre, core, post = m.groups()
    # possessives: Sanya's -> Sahn-ya's
    base, suffix = (core[:-2], core[-2:]) if core.endswith(("’s", "'s")) else (core, "")
    if base in pronounce:
        core = pronounce[base] + suffix
    return (pre + core + post).replace("’", "'").replace("‘", "'")


def build_units(script):
    """Flatten the script into sentence units, remembering chapter / paragraph structure."""
    pron = script.get("pronounce", {})
    units = []
    for ci, ch in enumerate(script["chapters"]):
        for pi, par in enumerate(ch["paragraphs"]):
            for si, sent in enumerate(split_sentences(par)):
                words = sent.split()
                units.append({
                    "ci": ci, "pi": pi, "si": si,
                    "text": sent,
                    "words": words,
                    "say": " ".join(spoken_word(w, pron) for w in words),
                })
    return units


def assemble_narration(script, units, timings, meta):
    """timings[i] = {"start", "end", "words": [(s, e), ...]} for units[i]."""
    chapters = []
    for ci, ch in enumerate(script["chapters"]):
        chapters.append({"id": ch["id"], "label": ch["label"], "anchor": ch.get("anchor", ""),
                         "start": None, "end": None, "paragraphs": []})
    cur_par = {}
    for u, t in zip(units, timings):
        ch = chapters[u["ci"]]
        key = (u["ci"], u["pi"])
        if key not in cur_par:
            cur_par[key] = {"sentences": []}
            ch["paragraphs"].append(cur_par[key])
        cur_par[key]["sentences"].append({
            "start": round(t["start"], 3), "end": round(t["end"], 3),
            "words": [{"t": w, "s": round(s, 3), "e": round(e, 3)}
                      for w, (s, e) in zip(u["words"], t["words"])],
        })
        if ch["start"] is None:
            ch["start"] = round(t["start"], 3)
        ch["end"] = round(t["end"], 3)
    out = dict(meta)
    out["title"] = script.get("title", "")
    out["chapters"] = chapters
    return out


def save_json(obj, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
