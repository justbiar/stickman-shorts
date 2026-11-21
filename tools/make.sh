#!/bin/sh
# Build one short end to end:  tools/make.sh hangar [music.mp3] [sfx-folder]
# Needs: voice/<name>.mp3 (your voiceover), stories/<name>.json, Chrome, ffmpeg, node 22+, python with mlx-whisper.
set -e
cd "$(dirname "$0")/.."
NAME=$1; MUSIC=$2; SFX=$3; PORT=${PORT:-8799}
mkdir -p work out
[ -f "work/$NAME.words.json" ] || python tools/words.py "voice/$NAME.mp3" "work/$NAME.words.json"
curl -s -o /dev/null "http://127.0.0.1:$PORT/web/player.html" || { python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 & sleep 1; }
for try in 1 2 3; do   # headless Chrome now and then fails to start; just try again
  node tools/render.mjs "http://127.0.0.1:$PORT/web/player.html?story=$NAME" "work/$NAME.silent.mp4" 30 && [ -s "work/$NAME.silent.mp4" ] && break
done
python3 tools/mix.py "$NAME" ${MUSIC:+--music "$MUSIC"} ${SFX:+--sfx "$SFX"}
