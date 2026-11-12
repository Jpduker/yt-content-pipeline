# Alternate Avengers — Between the Ifs

This is a NEW SERIES inside **Between the Ifs**, whose existing repository folder is `channels/stickman/`. It is not a replacement for the original green-hoodie/black-headed cast, and not another channel. User decisions through 2026-11-12 are recorded here. `HANDOFF.md` was deliberately not edited.

## Read first
1. `SERIES.md`: approved direction, promise, audience and series boundaries.
2. `PROGRESS.md`: what was built, what Vivek liked/rejected, what is unverified.
3. `STYLE.md`: preserve the approved visuals while improving motion.
4. `RESEARCH.md`: channel study, evidence limits and source URLs.
5. `ASSETS.md`: canonical files and which experiments are obsolete.
6. `episodes/2026-11-12-aa01-doom-saves-the-multiverse-short-test/BRIEF.md`: next 9:16 experiment for Fable.

## Layout
- `assets/characters/mustard-hero/v1/`: canonical original protagonist assets, NOT the original channel's green-hoodie character.
- `assets/references/`: original A/B/C art direction, approved character master and body-repair sheet.
- `assets/environments/`: reusable workshop art.
- `development/latest-proof-v3/`: working browser/native-Canvas source, joint rig, tests, narration/score source and captions. Assets are referenced from the canonical directories above.
- `development/previews/`: three rendered tests and motion strips, saved locally but ignored by git.
- `episodes/`: new videos; first Avengers fan Short is a brief/script only, not a finished film.

All earlier source experiments remain in `lab/2026-11-12-between-ifs-bc-proof*` for history. V1's procedural face is rejected. V2's look was liked, but its arm mechanism was criticized. V3 is the latest technical baseline; **Vivek has not approved its movement**. Do not call it production-ready.

## Verify the organized copy
From repository root:
```
node --test channels/stickman/alternate-avengers/development/latest-proof-v3/rig.test.mjs
```
Install the proof's `package.json` dependencies before running `render-native.mjs`. The current machine used a native Canvas adapter because Chromium socket creation was blocked. The HTML still exposes the Lemo `render(t)`, `DUR`, `EV`, `READY` interface. Browser integration remains unverified; prove it in the actual studio environment. Native font paths currently target Linux/WSL.

The source and assets are committed. MP4/WAV outputs remain local, per repository rules. The transfer archive also carries them for import to Vivek's Windows folder; models, upstream checkouts and `node_modules` are not included.
