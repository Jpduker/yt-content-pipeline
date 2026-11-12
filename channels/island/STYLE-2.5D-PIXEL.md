# The Keeper's Island × lemo-opuscar "2.5D Pixel Art" (formerly "HD-2D") · decision 2026-11-12
Vivek watched the style's demo (https://lemomo-ai.github.io/lemo-opuscar/styles/hd-2d/) and chose it for the Island channel. Start: in a later week, after the What-If batches.
Library copy: tools/lemo-opuscar/styles/hd-2d (STYLE.md = the style prompt, DEMO.md = how their demo was made, demo/ = engine code). Updated to lemo-opuscar 2.0.0 (3a7132b) on 2026-11-12.

## What the style is (summary of its STYLE.md)
Flat pixel sprites standing like paper cut-outs inside a lit, fogged, real 3D diorama (three.js), seen from a high 3/4 camera through a tilt-shift band.
Light is the subject: practical lights throw sprite shadows, fog, bloom, heavy vignette. Sprites step (4-frame walks), everything else glides at 60 fps.
RPG grammar: chapter cards, a framed dialogue box with typed text, serif subtitles (Cinzel + Cormorant, OFL). Storybook narrator (Kokoro, slow ~.82–.90).

## Why it fits the Island
One world, one mystery, chapters, a keeper, a lighthouse: the style's native moves ("lights popping on one by one", "the carried light as a meter", "RPG grammar", "weather passes over the diorama") are the Island's plot devices.

## Rules for us (warnings, then we build)
- **Name:** never call our films or channel "HD-2D" (Square Enix's term and trademark). Use "2.5D pixel" in our notes if needed; nothing on screen.
- **Don't copy their demo:** their film is a lighthouse story too (*The Lampbearer*: a girl carries the last flame to the lighthouse). DEMO.md says: don't reuse its story, arc, shots, props or timings. Our Island keeps its own cast (Gus the keeper, Pip, Mabel, Rollo), its own mystery and its own lighthouse design. No lantern-relay quest.
- **Never reference the games** the look comes from (characters, places, UI ornaments, music, names).
- **Licence (lemo-opuscar 2.0.0 LICENSE, read 2026-11-12):** films we make are ours, commercial included, no credit needed. Code is MIT. The docs (STYLE.md/DEMO.md) are CC BY-NC 4.0 plus an extra permission to follow and adapt them for our own films, including commercial ones, and to keep adapted copies in the project files shared with the people working on the film (Vivek, JP). Not allowed: publishing or selling the docs or adapted copies. → keep our repo private (it already must be, for the GrowKaz kit).
- Their demo music is Scott Buckley "Precipice" (CC BY 4.0): fine with credit, but pick our own track; never reuse their edit.

## Before the first Island film
1. In WSL: `cd tools/lemo-opuscar && sh plugin/skills/lemo-opuscar/scripts/setup.sh` (quick check, lists missing tools), then `… setup.sh deps` (and `deps voice`).
2. Render a 20–30 s proof of one Island set (the harbour at dusk) to measure render speed: three.js + 2× supersampling + DOF is far heavier than our 2D kit (5 fps at 1080p). If the cloud container is too slow, render 1080p30 instead of 60.
3. Then /study-reference on the demo film for grammar only, write the Island's own STYLE notes, and Vivek approves a 20–30 s proof before any chapter.
