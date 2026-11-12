# Between the Ifs — B/C art and motion proof 01

Authorized exploratory test, 26 seconds, 1920×1080 at 24 fps. Original mini-story: a mustard-jacket protagonist tries a time device and discovers somebody else moving after time stops. This is a style proof, not an Avengers episode or a finished production style.

## What is real animation

The character, hand/arm articulation, facial expressions, device, rain, motes, portal fissure, moving silhouette, shot composition and captions are drawn by `film.js` at exact times. The workshop background is generated illustration, not a procedurally modeled 3D set. Camera moves are not arbitrary 3D rotations. No generated video is used.

The same head and costume code is shared across close-ups, full-body shots and the expression sheet. This is the first rig iteration: artwork/background integration and subtle performance remain refinement targets. The breathing requirement is conveyed through narration/acting, not physically simulated. Word highlight timing is estimated within each spoken line, not forced aligned.

## Existing-pipeline compatibility

`index.html` exposes `window.render(t)`, `window.DUR`, `window.EV`, `window.READY`, matching Lemo-Opuscar's HTML frame-render interface. The existing episodes and their frozen styles are unchanged. New source is isolated under `lab/`.

Browser route (from repository root, with Lemo installed):

```sh
python3 lab/2026-11-12-between-ifs-bc-proof/audio.py
node tools/lemo-opuscar/core/render/video.mjs lab/2026-11-12-between-ifs-bc-proof --fps 24 --workers 2 --out lab/2026-11-12-between-ifs-bc-proof/out/picture.mp4
```

The current execution host blocks Chromium's local socket creation. This delivery therefore uses an additional native Canvas adapter that runs the exact same `film.js` drawing functions, not browser screenshots. The browser route is provided for the existing studio environment but was not successfully exercised on this host.

Native route:

```sh
npm install --prefix /path/to/render-runtime @napi-rs/canvas
CANVAS_MODULE=/path/to/render-runtime/node_modules/@napi-rs/canvas node lab/2026-11-12-between-ifs-bc-proof/render-native.mjs --stills
CANVAS_MODULE=/path/to/render-runtime/node_modules/@napi-rs/canvas node lab/2026-11-12-between-ifs-bc-proof/render-native.mjs
```

Native adapter font paths currently target Linux. On macOS/Windows, register local DejaVu fonts or change those two paths. The HTML route uses installed Trebuchet/sans-serif, so exact typography may differ.

Voice requires `kokoro-onnx`, `onnxruntime`, `soundfile`, `numpy`, `scipy` and the upstream Kokoro voice assets (`sh tools/lemo-opuscar/tools/fetch.sh voice`, invoked from the library root as documented). Score and effects are original synthesis with a fixed random seed. Narrator is local Kokoro `am_fenrir`.

Final mix:

```sh
ffmpeg -y -i out/picture.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1:LRA=11 -ar 48000 -c:a aac -b:a 192k -t 26 -movflags +faststart between-the-ifs-test.mp4
```

Run the last command inside this proof's folder. Deliverables are review samples, not a scheduled or published upload.
