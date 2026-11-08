# C01 "You stole my heart" (local test) — brief, 2026-11-08
Script (Jp's, verbatim):
"You stole my heart, but I'll let you keep it, because some things are worth losing if it's to the right person. From the moment you walked in, my world rearranged itself around you, quietly, completely. I didn't choose this, it chose me. Every ordinary day with you feels like something out of a story I never want to end so keep my heart I was only ever holding it for you"
Music: library/music/local-test-only/caribbean-blue-orchestral__from-reel-hczccyti7j7g.mp3 → filename must contain LOCAL-TEST.
Characters: channels/whispers/characters/vivek-cast (HIM speaks; HER is the "you").
Format: 9:16 1080×1920, ~35–45 s (follow the music phrase; cut on a phrase end). Voice: HIM, soft male, Chatterbox emotion ~0.6
(fallback Kokoro am_echo .85). Captions: style #5 "ink whisper", word-timed from voices/words.json (align_words.py). Music under voice per mix rules.
Beats (line → picture → motion), suggested:
1 "You stole my heart, but I'll let you keep it," → HIM by the night window with phone (pose 1) → breath, phone glow flicker, city bokeh drifting, rain on glass.
2 "because some things are worth losing if it's to the right person." → slow light shift warm; he looks up from the phone.
3 "From the moment you walked in, my world rearranged itself around you," → HER enters (sweater, hair), room light literally re-arranges (lamps/bokeh drift toward her).
4 "quietly, completely." → hold; hair sway, a blink, music swell.
5 "I didn't choose this, it chose me." → close faces (closeup turnaround), eyes meet.
6 "Every ordinary day with you feels like something out of a story I never want to end" → sunset encounter (pose 3), golden particles.
7 "so keep my heart, I was only ever holding it for you" → her hand to chest (pose 4) → soft smile; last caption lingers; fade on the music cadence.
Motion approach (no zooms; Jp wants the picture to move with emotion and music): 2.5D puppet from the stills —
cut the figures out (rembg, free, WSL), depth map (Depth-Anything-V2-Small, free, WSL) → three.js plane with depth displacement for gentle
parallax, mesh-warp breathing, noise-driven hair sway (masked), blinks painted from the closeup sheet, light/particle layers keyed to the
music's energy curve (pipeline/music_catalog.py gives it). If a needed pose is missing, Jp can generate it in Gemini from the sheets.
