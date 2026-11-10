# Status: where we left off
Updated: 2026-11-08 ~23:15 (session 4, Vivek). **Next session: CLAUDE.md "Team + git" first, then HANDOFF.md.**

## Done tonight
- Shared git setup (repo Jpduker/yt-content-pipeline, rules + hooks, get-tools/sync/push/first-push scripts, Mac prereqs). First push = Vivek, WSL.
- Renamed jp-cast → vivek-cast (the Whispers idea + characters are Vivek's).
- Whispers C01 v2 LOCAL TEST: talking/blinking/smiling faces, head + body motion, single shots + two-shots, word-exact captions.
- Exact timings for every future voice: pipeline/tts_timed.py (+ make_timed_kokoro.py).
- Audit of CH01 + FM01: channels/AUDIT-2026-11-08-ch01-fm01.md.
- Island style test (paper-popup + pull-tab captions): lab/2026-11-08-island-style-test-paper-popup/final/.

## Waiting on Vivek / JP
1. Vivek: run `sh pipeline/git-first-push.sh`; decide public vs private repo (character images are ignored while public).
2. Strict review of the island style test + C01 v2.
3. Which audit items to fix first in FM01; CH01 gets rebuilt in the approved island look.
4. Chatterbox repair (WSL); YouTube channels → Audio Library.

## Session 5 (2026-11-09 night, Vivek): stickman channel for the Nov 11 launch
- Afterhour replica v2 rebuilt frame-matched to the downloaded short: lab/2026-11-09-afterhour-replica-v2 (out/ has the replica + a ref|ours side-by-side, LOCAL study only).
- Style tests built: Ricks (lab/2026-11-09-ricks-style-test), Ifverse via GrowKaz kit (lab/2026-11-09-growkaz-plugin-test), Capital Case (lab/2026-11-09-capitalcase-style-test).
- All four are silent lab tests (cloud can't run Kokoro): voice + music get added in WSL once a style is picked.
- Not pushed yet: run `sh pipeline/sync.sh && sh pipeline/push.sh "stickman style tests"` in WSL (the device shell can't delete git lock files).
## Next up
1. Vivek/JP pick the launch style from the four tests → build the first full video in it (voice, music, Shorts).
