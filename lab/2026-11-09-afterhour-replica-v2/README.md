# Afterhour replica v2 (lab, 2026-11-09)
Shot-for-shot rebuild of the first 24 s of Afterhour Theory's short (references/videos/afterhour-theory/znWzWYHoLOg.mp4),
matched frame by frame against 4 fps sheets of the downloaded file (cut list: ffmpeg scene > 0.22 → only 16 hard cuts in 170 s;
the rest are continuous camera flights, whips with motion blur, a dissolve and a white flash).
- Sets: hub war room (pink dusk windows, rocket tower outside, glass front wall, globe on ring platform with mini kart track),
  money pyramid behind glass + trillion sign, stadium track with block crowd, data-centre aerial.
- Cast (toon.js): white egg head + painted face, ridged hair, bean torso, stick legs, black ink outline (inverted hull).
- Camera keys + caption word timings copied from the reference; names/brands are invented (Max Ryder, KAI, NovaMind, Halcyon, TITAN).
- Build: node /home/claude/tools/video.mjs <this dir> out.mp4 30 2 1080x1920   (or lemo/hyperframes page contract: window.render(t)).
- No voice yet (Kokoro only runs in WSL): captions carry the line; lines are in film.js WORDS.

Credits: three.js r170 (MIT, vendor/). Fonts: Poppins / Lora (SIL OFL 1.1, Google Fonts). Renders in out/ are lab tests; the side-by-side file contains the reference footage = LOCAL study only, never upload.
