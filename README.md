# stickman-shorts

Short vertical history videos with flat round-head characters standing in stylized 3D worlds, made with three.js in the browser and rendered to mp4 frame by frame. No video editor, no After Effects: a story file, a voiceover and one command.

Six worlds come with it:

| set | look | example story |
|---|---|---|
| `hangar` | WWII hangar, sunny airfield, bomber, bullet-hole board | Survivorship bias, 1943 |
| `goldrush` | 1849 boomtown at golden hour, dust in the air | Sam Brannan sells the shovels |
| `city` | blue-hour avenue, lit towers, a steel frame going up | The Empire State Building in 410 days |
| `piazza` | Italian square in a storm, bell tower, rain, lightning | Ringing bells to stop lightning |
| `snow` | winter night, lanterns, an alchemist's table, fireworks | Gunpowder was an accident |
| `silo` | farm at sunset, grain silos, a dust explosion | Why a silo can explode |

## How a short is made

```
script ──> voiceover (any TTS or your own mic) ──> word timings (Whisper)
                                                        │
stories/<name>.json  (set, camera shots, acting, labels, fx, all anchored to words)
                                                        │
web/player.html ── headless Chrome renders 30 fps ──> work/<name>.silent.mp4
                                                        │
tools/mix.py  (voice + ducked music + whooshes/booms, -14 LUFS) ──> out/<name>.mp4
```

1. **Write a script.** 20 to 30 seconds, one surprising fact, short sentences. Put it in the story file's `script` field so it lives next to the shots.
2. **Record the voice** to `voice/<name>.mp3`. The examples used a storytelling voice from ElevenLabs; anything works.
3. **Get word timings.** `python tools/words.py voice/<name>.mp3 work/<name>.words.json`, plus `Wrong=Right` pairs to fix names Whisper mishears (`Brannon=Brannan`).
4. **Direct it** in `stories/<name>.json` (below). Preview any moment in a browser at `http://127.0.0.1:8799/web/player.html?story=<name>&t=7.5`.
5. **Build:** `tools/make.sh <name> [music.mp3] [sfx-folder]`.

## The story file

```json
{
 "title": "The bullet holes that fooled an army",
 "style": "hangar",
 "script": "In 1943, the military studied bombers ...",
 "beats": [
  {"at": 0,         "cam": "insert", "on": "plane", "push": 0.6, "label": {"text": "1943", "on": "plane"}},
  {"at": "studied", "cam": "medium", "on": ["officer", "pilot"], "do": {"pilot": "talk excited left"}},
  {"at": "put",     "cam": "insert", "on": "board", "fx": "board2"},
  {"at": "then",    "cam": "wide",   "on": ["wald", "officer"], "show": ["wald"]}
 ]
}
```

Each beat is a hard cut that lasts until the next one.

- `at`: seconds, a spoken word (`"holes"`), or the nth time it is said (`"holes#3"`). Anchoring to words keeps the picture in sync even after you re-record the voice.
- `cam`: `wide`, `medium`, `close`, `low`, `high` on a character (or a list of them, framed together), or `insert` on a named spot of the set.
- `on`: character id(s) or spot name. Each set lists its cast and spots at the bottom of its function in `web/sets.js`.
- `push` (slow dolly in, 0 to 1), `orbit` (radians around the subject), `rise` (crane up).
- `do`: `{"id": "action face look"}`. Use `-` to keep one part as it was.
  - actions: idle, walk, wave, point, talk, shrug, think, jump, cheer, sad, stir, present, hold
  - faces: neutral, happy, excited, surprised, sad, angry, smug, thinking, smirk, determined, shocked
  - look: front, left, right
- `show` / `hide`: bring a character in or take them out. `pos: {"id": [x, z]}` moves one.
- `label`: a pill that pops over a spot or a character: `text`, `on`, `dy` (height offset), `for` (seconds), `bg`, `fg`.
- `fx`: `flash`, `boom` (orange flash and camera shake), `shake`, plus the set's own: `board2` (hangar), `ring` and `lightning` (piazza), `firework` and `boom` (snow), `boom` (silo).

Captions are automatic: one word at a time from the timings, numbers in yellow.

## Characters

`web/character.js` draws every character on a 2D canvas each frame; the canvas is the texture of a plane that turns to face the camera, so they read as flat drawings standing in a lit 3D world and still cast shadows. Costume keys:

```
shirt, pants, skin
outfit: coat | suit | vest | hivis | overalls     (+ coat, tie, vest, overalls colors)
scarf, beard: mustache | full | stubble, beardColor, glasses
hat: fedora | cowboy | hardhat | helmet | pilot | beanie | straw | cap   (+ hatColor, hatBand)
```

## Making a new world

Add a function to `SETS` in `web/sets.js`. It gets a toolkit `k` (`box`, `cyl`, `ground`, `sky`, `glow`, `tex`, `particles`, `light`, `character`, `spot` and more) and returns `{ fx(t, events) }` for anything that moves. Keep shapes simple and let the lighting do the work: a three-color sky gradient, fog in the same color family as the horizon, one strong sun for shadows, a few additive glows for lamps.

## Requirements

- Node 22 or newer (uses the built-in WebSocket, no npm install)
- Google Chrome (set `CHROME=/path/to/chrome` if it is not in the default macOS location)
- ffmpeg
- Python 3 with `mlx-whisper` for timings (Apple Silicon). On other machines, swap `tools/words.py` for any Whisper build that gives word timestamps in the same `[{"w", "s", "e"}]` format.

## Rendering speed

Around 30 frames a second on an M-series Mac, so a 25 second short renders in under a minute.

## Credits

three.js (MIT) is vendored in `web/`. Music and sound effects are not included; bring your own (CC0 libraries such as Freesound work well).

MIT licensed.
