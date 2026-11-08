---
name: pick-music
description: Choose music for an episode by emotion and context from our library (YouTube Audio Library downloads, our own scores, local-test tracks). Use for "pick music", "which track", "music for this scene", "sad/romantic/tense music".
---
1. Read `library/music/catalog.json` (rebuild with `sh pipeline/music-catalog.sh` if files were added since). Read the episode's script/beat sheet.
2. Describe the emotional arc in 3–5 beats with timestamps (e.g. 0–8 s shy hope, 8–20 s ache, 20–30 s warmth).
3. Shortlist 3 tracks whose mood folder, tempo, key and `energy_db_per_5s` curve fit that arc (a swell where the story turns, no drop to silence).
   Prefer `publishable: true`. A `local-test-only/` track may be used for a local test only: say so in the episode README and PUBLISH.md.
4. If nothing fits, tell Jp the exact YouTube Audio Library filters to use (Mood, Genre, Duration, "attribution not required") and
   the folder to save into (`library/music/yt-audio-library/<mood>/`). Alternatively write an original score with the lemo sampler.
5. Record the choice and any attribution line in the episode's CREDITS and PUBLISH.md.
