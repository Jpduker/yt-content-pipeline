# Proof 01 · "Twelve Seconds" (31 s, 2.5D pixel) — 2026-11-15
Our own island diorama + Gus + Mabel on lemo-opuscar's 2.5D Pixel Art engine (imports px/kit/fx/post_ts by absolute path from tools/lemo-opuscar/styles/hd-2d/demo; nothing of their demo's story, sets or sprites is reused).
Files: story.js (timeline), island.js (the set + cameras), cast.js (Gus, Mabel pose tables), ui.js (card, subtitles, title), mix.py (placeholder pad + ambience + Kokoro), build.sh.
Fonts: copy library/fonts/cinzel-cormorant/*.ttf into fonts/ (OFL; the cloud build fetched them from github.com/google/fonts). final/ holds the 720p24 cloud render; re-render at 1080p30 on the GPU host.
Known v1 notes: foreground grass tufts read as dark blobs in the tracking shot; Mabel is tiny at this distance (fine in 9:16); the pad is not music.
