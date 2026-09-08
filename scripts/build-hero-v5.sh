#!/bin/zsh
# Home hero v5 — same four platforms as v4, new SAIBYA and ATM windows.
#
#   A  SAIBYA   saibya_hero_full 7.2–10.6   tree-lined road, low angle, driving
#                                           toward camera. The window stops at
#                                           10.6 because past that the machine
#                                           outgrows the centre strip a phone
#                                           crops the 16:9 frame down to.
#   B  NEXUS    (v4 interior 4.05–6.65)     unchanged from v4
#   C  ALTIUS   (v4 interior 7.25–9.75)     unchanged from v4
#   D  ATM      atm_suspension_run 3.4–7.0  rough grass/rubble, suspension working,
#                                           cropped 1600x900+0+180 to drop sky and
#                                           carry the machine off the copy
#
# 0.6s cross-dissolves between all four, plus a closing dissolve that lands on
# A's first frame, so the loop closes on a cut of the same kind and has no jump.
#
# Needs ffmpeg and cwebp (both from Homebrew). Run from anywhere:
#   ./scripts/build-hero-v5.sh
set -e

ROOT=${0:a:h:h}
VID="$ROOT"/public/assets/videos
OUT=$VID/home-hero-v5.mp4

ffmpeg -y -v warning -stats \
  -i "$VID/products/saibya/saibya_hero_full.mp4" \
  -i "$VID/home-hero-v4.mp4" \
  -i "$VID/products/atm/atm_suspension_run.mp4" \
  -filter_complex "
    [0:v]split=2[s0][s1];
    [1:v]split=2[h0][h1];

    [s0]trim=7.2:10.6,setpts=PTS-STARTPTS,fps=25,scale=1920:1080,format=yuv420p[a];
    [h0]trim=4.05:6.65,setpts=PTS-STARTPTS,fps=25,scale=1920:1080,format=yuv420p[b];
    [h1]trim=7.25:9.75,setpts=PTS-STARTPTS,fps=25,scale=1920:1080,format=yuv420p[c];
    [2:v]trim=3.4:7.0,setpts=PTS-STARTPTS,crop=1600:900:0:180,scale=1920:1080,fps=25,format=yuv420p[d];
    [s1]trim=6.6:7.2,setpts=PTS-STARTPTS,fps=25,scale=1920:1080,format=yuv420p[head];

    [a][b]xfade=transition=fade:duration=0.6:offset=2.8[ab];
    [ab][c]xfade=transition=fade:duration=0.6:offset=4.8[abc];
    [abc][d]xfade=transition=fade:duration=0.6:offset=6.7[abcd];
    [abcd][head]xfade=transition=fade:duration=0.6:offset=9.7[out]
  " \
  -map "[out]" -an \
  -c:v libx264 -preset slow -crf 29 -maxrate 2400k -bufsize 4800k \
  -pix_fmt yuv420p -movflags +faststart \
  "$OUT"

# Poster is the clip's own first frame, so nothing shifts when playback starts.
FRAME0=$(mktemp -t hero-v5-frame0).png
ffmpeg -y -v error -i "$OUT" -frames:v 1 -f image2 -c:v png "$FRAME0"
cwebp -q 74 -quiet "$FRAME0" \
  -o "$ROOT"/public/assets/images/home-hero-v5-poster.webp
rm -f "$FRAME0"

ls -la "$OUT"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
