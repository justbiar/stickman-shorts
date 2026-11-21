"""Word timings for a voiceover:  python tools/words.py voice/hangar.mp3 work/hangar.words.json
Runs Whisper locally (mlx-whisper on Apple Silicon) and writes [{"w": "word", "s": start, "e": end}, ...]."""
import json, re, sys
import mlx_whisper

src, out = sys.argv[1:3]
r = mlx_whisper.transcribe(src, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", language="en", word_timestamps=True)
words = [{"w": x["word"].strip(), "s": round(x["start"], 2), "e": round(x["end"], 2)} for s in r["segments"] for x in s.get("words", [])]
# Whisper sometimes splits "3,000" into "3" + ",000": glue tokens that start with punctuation back on
merged = []
for w in words:
    if merged and re.match(r"^[,.%]\w", w["w"]): merged[-1].update(w=merged[-1]["w"] + w["w"], e=w["e"])
    else: merged.append(w)
words = merged
# spelling fixes for names Whisper hears wrong:  python tools/words.py in.mp3 out.json Brannon=Brannan flower=flour
for fix in sys.argv[3:]:
    a, b = fix.split("=")
    for w in words: w["w"] = re.sub(rf"\b{re.escape(a)}\b", b, w["w"])
json.dump(words, open(out, "w"), indent=0)
print(out, len(words), "words,", words[-1]["e"] if words else 0, "s")
