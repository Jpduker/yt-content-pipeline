# tools/ — upstream repos (do not edit in place)

Untouched clones. Update with `sh pipeline/update-tools.sh` (hard-resets each to upstream, then re-syncs skills).
To customise something, copy it into `library/` and change the copy.

| Tool | Commit | Licence | Role here | Active skills |
|---|---|---|---|---|
| lemo-opuscar | 3a7132b (2.0.0, 2026-11-12) | code MIT; docs CC BY-NC 4.0 + permission to use them for our own (commercial) films, never republish them; demo films CC BY 4.0 (samples CC0; piano CC BY 3.0, drums CC BY 4.0: credit them) | **Main engine**: 99 code-made film styles (2.5D Pixel Art = Island style from 2026-11), Kokoro offline voice, Whisper, CC0 music, mux | lemo-opuscar |
| hyperframes | d4e4b07 | Apache 2.0 | HTML → MP4 renderer, captions, character rigs (sparse checkout: skills/examples/themes only) | hyperframes, hyperframes-cli, hyperframes-registry |
| threejs-skills | 0e18186 | MIT | Current three.js r186 knowledge for 3D styles | 13 threejs-* |
| youtube-agent-skill | a2feb21 | MIT | Scripts, hooks, titles, Shorts, SEO, retention | 11 yt-* |
| ClaudeAnimationBase | 0ac8bf2 | MIT | p5.brush hand-painted character technique (reference) | none |
| awesome-opus5-5-videos | 92aee2f | MIT list | 703 prompts for inspiration (`data/videos.json`) | none |
| video-use | 43cfc56 | MIT | Editing helpers (render/grade) for reference | none: transcription needs paid ElevenLabs |
| earshot | 591fa3e | MIT | **Ears**: timeline/sync-to-picture, critique, loudness, 252 code-made SFX bank (`sfx`/`kit` need no models; describe/match need Hugging Face models → WSL only) | earshot, real-sound |
| claude-video | 03ceb42 | MIT | `/watch`: URL or file → timestamped frames + transcript (yt-dlp, ffmpeg, captions/WhisperX). For studying references in WSL | watch |
| creator-lab | 14f8356 | MIT | **PARKED (2026-11-08): needs paid keys; revisit once the channels earn.** Instagram Reel script research (Apify + Groq/Fireworks + Jev, **paid keys, yours**). Wrapper: `sh pipeline/creator-lab.sh`; notes in research/creator-lab/README.md | none |
| claude-video-vision | 4a4f990 | MIT | Claude Code plugin + MCP server: watch a video/YouTube URL with adaptive frame extraction + LOCAL Whisper transcription (free). Overlaps /watch; better for long videos and timed questions. Enable per session: `claude --plugin-dir tools/claude-video-vision` (MCP installs via npx on first use; Gemini/OpenAI backends need keys: don't use) | none (plugin) |
| clipwing-skills | edbefcb | **no licence file** (all rights reserved by default; fine for private use, don't redistribute) | `real-sfx`: places REAL recorded SFX from a library on exact frames, critiques sync and levels. Needs a sound library (see library/sfx/README.md) | real-sfx |

## Deliberately not used
- **hyperframes media-use, reverse-any-video, style-sampling**: route to paid HeyGen credits / Pro. Left inactive.
- **gbro-collage-broll**: needs a paid Gemini API key. Not cloned.
- **onetake**: PolyForm Noncommercial licence; a monetized channel is commercial use. Not cloned.
- **Clawd** (ClaudeAnimationBase's character): Anthropic's mascot. Use the technique with original characters only.
- **watch-skill (oxbshw)**: MIT, but overlaps claude-video and brings a whole DeepWatch/DeepSeek agent workspace + MCP server. Not cloned (2026-11-05).
