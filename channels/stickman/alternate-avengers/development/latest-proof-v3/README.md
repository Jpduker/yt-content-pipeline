# Organized V3 proof

This is the working V3 proof copied into the new series. The original historical sources remain in lab/. Its assets now load from ../../assets/characters/mustard-hero/v1/ and ../../assets/environments/.

- `film.js`: character compositing, shots, device/rain/portal effects, captions; browser render(t) interface.
- `rig.mjs`: independent two-bone arms.
- `rig.test.mjs`: five geometric checks; run `node --test rig.test.mjs`.
- `render-native.mjs`: tested native Canvas adapter, currently Linux/WSL font paths.
- `audio.py`: local Kokoro narration and original synthetic audio; discovers repository root by pipeline/ + channels/.
- `build.sh`: picture/audio rebuild after installing package.json and studio voice dependencies.
- `audio/`: cue and ASR metadata in git; WAV files saved locally in the transfer package.

The organized copy was rendered as representative stills and its tests run. Do not call the motion user-approved. See ../../PROGRESS.md and ../../STYLE.md before using this as the first Avengers Short's starting point. That Short needs a separate episode directory and native 9:16 framing.
