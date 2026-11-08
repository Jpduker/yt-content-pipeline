# YouTube video-gen workspace

Code-rendered animation pipeline, local and free (no per-clip cost). Claude writes the scenes
(canvas / three.js / HTML), headless Chrome renders them frame by frame, Kokoro speaks, Whisper times
the captions, CC0 music scores it, ffmpeg muxes. Fits a 4GB GTX 1650: no AI video generation.

## Start
1. One-time, inside WSL Ubuntu-24.04 in this folder: `bash pipeline/wsl-prereqs.sh`, then `bash pipeline/setup.sh`.
2. Open Claude Code **in this folder** so the project skills in `.claude/skills/` load.
3. New video: `sh pipeline/new-episode.sh <channel> <series> <code>-<slug>`, then work ins## Layout
| Path | What lives there |
|---|---|
| `channels/` | **Everything per channel.** `channels/README.md` lists the channels and paths being tested |
| `channels/<channel>/CHANNEL.md` | That channel's plan, cast, styles, caption style and episode index |
| `channels/<channel>/<series>/<date>-<code>-<slug>/` | One video: source files at the top, `final/` = publishable mp4/srt/poster, `PUBLISH.md`, `CREDITS`, `build.sh` |
| `channels/<channel>/characters/` | That channel's original characters |
| `lab/` | Style tests and proof shots that don't belong to a channel yet |
| `library/` | Shared: styles (`MY-STYLES.md`), voices, hooks, music, sfx, fonts |
| `references/<group>/` | Inspiration clips grouped by source, study only; notes in `references/README.md` |
| `research/` | NexLev notes, creator-lab exports |
| `memory/` | STATUS, TASTE, RULES, MILESTONES, LEARNINGS, DECISIONS, CHANNELS, CHANNEL-PLAN |
| `workflows/`, `skills/` | How we work; our slash commands |
| `pipeline/` | Setup, env, new-episode, sync-skills, align_words, templates |
| `tools/` | Upstream repos, untouched (`tools/README.md`) |
| `logs/` | Setup logs |
| `Claude outputs/` | Delivery inbox the Claude app writes into; safe to empty |

**Finished videos live only in each episode's `final/` folder.** There is no separate output folder.

eady to upload |

## Rules
- Free and local only: no paid API keys, no HeyGen credits.
- Original characters, voices and stories. No known IP, no Clawd, no copied videos.
- Every episode keeps a `CREDITS.md` for CC BY audio and fonts.
- After every video: `/retro`. That is how the studio improves itself.
