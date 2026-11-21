"""Put sound on a rendered short:  python tools/mix.py hangar [--music track.mp3] [--sfx folder]
Reads work/<name>.silent.mp4 (+ its .json timeline from render.mjs) and voice/<name>.mp3, writes out/<name>.mp4.
  voice   delayed by the story's "delay" (default 0.4 s), the loudest layer
  music   optional, looped, about 20 dB under the voice and ducked further while the narrator talks
  sfx     optional folder with whoosh*.wav and boom*.wav: a soft whoosh on every cut, a boom on boom/lightning fx
Everything is normalized to -14 LUFS (the usual target for Shorts, Reels and TikTok)."""
import argparse, glob, json, os, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("name"); ap.add_argument("--music"); ap.add_argument("--sfx")
ap.add_argument("--music-db", type=float, default=-20); ap.add_argument("--sfx-db", type=float, default=-14)
a = ap.parse_args()
story = json.load(open(f"stories/{a.name}.json"))
silent, voice, out = f"work/{a.name}.silent.mp4", f"voice/{a.name}.mp3", f"out/{a.name}.mp4"
tl = json.load(open(silent + ".json")); dur = tl["duration"]; delay = story.get("delay", .4)
os.makedirs("out", exist_ok=True)

ins, chains, mix = ["-i", silent, "-i", voice], [], []
chains.append(f"[1:a]adelay={int(delay * 1000)}:all=1,apad,atrim=0:{dur:.3f},asplit=2[v][key]")
mix.append("[v]")
if a.music:
    ins += ["-stream_loop", "-1", "-i", a.music]
    chains.append(f"[2:a]atrim=0:{dur:.3f},volume={a.music_db}dB,afade=t=in:d=0.6,afade=t=out:st={max(0, dur - 1.2):.3f}:d=1.2[m0]")
    chains.append("[m0][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[m]")
    mix.append("[m]")
else:
    chains.append("[key]anullsink")
if a.sfx:
    pick = lambda pat: sorted(glob.glob(os.path.join(a.sfx, pat)))
    whoosh, boom = pick("whoosh*.wav"), pick("boom*.wav")
    hits = [(c["t"], whoosh, -6) for c in tl["cuts"] if c["t"] > .2] + [(e["t"], boom, 0) for e in tl["events"] if e["name"] in ("boom", "lightning")]
    for i, (t, files, gain) in enumerate(hits):
        if not files: continue
        ins += ["-i", files[i % len(files)]]; idx = sum(1 for x in ins if x == "-i") - 1
        chains.append(f"[{idx}:a]aformat=channel_layouts=stereo,volume={a.sfx_db + gain}dB,adelay={int(max(0, t - .12) * 1000)}:all=1[s{i}]")
        mix.append(f"[s{i}]")
chains.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.89,aresample=48000[a]")
cmd = ["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(chains), "-map", "0:v", "-map", "[a]",
       "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}", "-movflags", "+faststart", out]
subprocess.run(cmd, check=True); print(out)
