# Rules
Short, proven rules. A rule gets here from Jp's explicit instruction or a learning that held at least once in a real episode (see memory/LEARNINGS.md). Keep under 80 lines; delete rules that turn out wrong.

## Money and licences
- Free and local only: no paid API keys, no HeyGen credits, no paid cloud GPUs unless Jp says so.
- Commercial-use licences only (MIT/Apache/OFL/CC0/CC BY with credit). Every episode keeps CREDITS.md.
- Never use other brands' marks or mascots: no Claude/Anthropic logo or Clawd (several references use Claude branding), no known characters. We design our own mascots.
- References are for study only: never reuse their footage, characters, voices or audio.

## Craft (from Jp's taste)
- Build a world for the story to happen in; never a screenshot slideshow.
- New shot or strong visual change at least every ~4 s in Shorts.
- Give the video a character with readable expressions and a mini story arc.
- Captions: kinetic, word by word, keyword highlighted, burned last in the chain.
- Shorts end on a frame that loops into the first frame.
- Loudness -14 LUFS, true peak ≤ -1 dB.

## Tooling
- Everything runs inside WSL Ubuntu-24.04; workspace path has a space: always quote paths.
- Source `pipeline/env.sh` before lemo commands. Never edit inside tools/: copy a style into the episode folder.
- lemo mixes need `librosa`; demo fonts are not in git (copy from library/fonts).
- Do stills QA at key beats before any full render; full renders are slow (software WebGL ≈ 1.15 s/frame/core).
- Each video style gets its own caption style (riddles: kinetic card; stickman: karaoke chunks; tales: cartouche; spotlight-clay: typewriter title). Never reuse one caption style everywhere.
- Prefer character motion over camera motion: no slow Ken-Burns zooms on illustrated scenes; move the characters (with anticipation and follow-through) and keep the shot continuous.
- Policy/licence risks: warn clearly, then do what Jp decides for local tests; label such files LOCAL-TEST and never let them reach a final/ meant for upload.
- Narrated pieces need captions synced to the voice; no static text blocks.
- NexLev numbers: always include channel + video URLs.
- Whispers: never add TTS over a track that already has narration; never deform Vivek's character frames (no blinks/face warps).
- Hero ("You", What-If channel) = the channel image (channels/stickman/characters/hero-channel-image.jpg): bald round head, tall oval eyes, green hoodie hood down. Never change his look, outfit or hair in any shot.
- A character must look identical in wide shots and close-ups: draw heads/hair/hats/faces with one shared module (WI02 scenes/chars.js), and check a cast sheet before the contact sheet.
- Captions must clear the letterbox bars of the current and neighbouring shots.
