# Make a video (v0)
First draft, written from the demo render. Refine it through /retro after every episode.

1. **Brief.** `sh pipeline/new-episode.sh <channel> <series> <code>-<slug>` (style tests: `lab - <slug>`); read channels/<channel>/CHANNEL.md; fill brief.md: idea, channel/format, style, characters, voice, length, aspect (Shorts 1080x1920, ≤60 s). Check TASTE and RULES first.
2. **Script.** /yt-script into script.md. Hook in the first 2 s, a visual change every ≤4 s, a mini story arc, an in-world CTA, and for Shorts a last frame that loops to the first.
3. **Style.** Pick from library/styles/MY-STYLES.md. Read the style's STYLE.md and lemo's TECHNIQUE.md. Copy what you need into the episode folder; never build inside tools/.
4. **Characters.** Reuse channels/<channel>/characters/ or design a new original one (sheet.md + rig). Never brand mascots.
5. **Voice.** Lines in lines.json → Kokoro (`core/tts/tts.py`), verify with `core/tts/asr_check.py`. Record the voice choice in library/voices/.
6. **Music and SFX.** Synthesize (lemo score) or use CC0/CC BY libraries; log every asset in CREDITS.md.
7. **Build scenes.** Use the lemo-opuscar skill; for 3D use the threejs-* skills; captions per RULES.
8. **Stills QA.** `core/render/still.mjs` at every key beat; fix before the full render.
9. **Render.** `core/render/video.mjs` → mix → mux at -14 LUFS. Log render time per frame.
10. **QA.** Contact sheet of the final + listen through: sync, captions, loudness, loop.
11. **Jp review.** Show the video; quote his reaction in RETRO.md. Publishable files go in the episode's final/ (nowhere else); add the row to CHANNEL.md's episode index.
12. **/retro.** Mandatory.
