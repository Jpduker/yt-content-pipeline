# YouTube studio: operating manual for Claude

Jp's faceless YouTube studio. Videos are code-rendered animation (lemo-opuscar, hyperframes, three.js), made locally and free. Claude builds and learns; Jp directs taste. The studio must get better with every video.

@memory/STATUS.md
@memory/TASTE.md
@memory/RULES.md

## Team + git (READ FIRST, every prompt)
- Two people build this studio together: **Vivek** (GitHub VivekSai07, Germany, Windows + WSL) and **JP / Jaya Prakash** (GitHub Jpduker,
  NYC, macOS). They work in turns across time zones. The Whispers channel idea and its cast (vivek-cast) are Vivek's.
  Older notes that say "Jp" before 2026-11-08 22:17 were written while Vivek was using JP's Claude account, so most of that feedback is Vivek's.
- Shared repo: https://github.com/Jpduker/yt-content-pipeline (branch **main** only).
- **Rule 1, first thing on EVERY user prompt:** `sh pipeline/sync.sh` (fetch + pull --rebase main). Do it before reading or changing anything.
- **Rule 2, after EVERY change:** `sh pipeline/push.sh "short message"` right away (commit to main, push). A Stop hook in .claude/settings.json also auto-pushes at the end of each reply as a safety net; prefer a real message yourself.
- **Rule 3:** no branches, no PRs, everything goes straight to main.
- **Rule 4:** commits carry the human's own identity (git config user.name/user.email on that machine: VivekSai07 <viveksaisurya07@gmail.com>
  or JP's own). **No AI co-authorship:** no "Co-Authored-By: Claude", no "Generated with Claude" lines, in commits or PRs.
- **Rule 5:** never commit renders or heavy files: .gitignore keeps out *.mp4/*.wav/out/, tools/ upstream clones, .claude/skills (generated),
  secrets, and the private Whispers character images. Check `git status` before pushing; a file over ~20 MB is almost always a mistake.
- New machine: `sh pipeline/get-tools.sh` (re-clones tools/ + fetches models/samples) → `bash pipeline/setup.sh`. Mac prereqs: `sh pipeline/mac-prereqs.sh`.

## Start of every session
- If HANDOFF.md exists at the root, read it first and follow it.
- STATUS, TASTE and RULES are loaded above. Open with one line: where we are and the top "Next up" item.
- "continue" / "next" from Jp means: do the top Next-up item in memory/STATUS.md.
- Read memory/LEARNINGS.md, memory/DECISIONS.md, memory/CHANNELS.md only when the task needs them.

## Workflows (each has a slash command)
| Task | Doc | Command |
|---|---|---|
| Make a video | workflows/make-video.md | /new-video |
| Study a reference clip | workflows/study-reference.md | /study-reference |
| After EVERY video or Jp feedback (mandatory) | workflows/retro.md | /retro |

The studio improves itself only through /retro. Never finish a video, or a session with feedback, without it.

## Where things go
- channels/<channel>/: one folder per channel (or channel path being tested). CHANNEL.md = plan, cast, styles, caption style, episode index.
  - channels/<channel>/<series>/<YYYY-MM-DD>-<code>-<slug>/: ONE video. Source at the top (index.html must sit there for the renderer), `final/` = the only place for publishable files (mp4, srt, poster), `out/` = render scratch, PUBLISH.md, CREDITS, build.sh.
  - channels/<channel>/characters/: that channel's original cast (sheet.md + rig code pointer).
- lab/<date>-<slug>/: style tests and proof shots not tied to a channel yet (same folder rules as an episode).
- library/: SHARED across channels: styles, voices, hooks, music, sfx, fonts (with licences).
- references/<group>/: inspiration clips by source (study only); notes and the index in references/README.md.
- research/: niche and competitor research (NexLev notes, creator-lab exports).
- tools/: upstream repos, read-only (update: `sh pipeline/update-tools.sh`). skills/: OUR skills; `sh pipeline/sync-skills.sh` copies them into .claude/skills/.
- memory/: STATUS (rewrite each session), TASTE, RULES, MILESTONES, LEARNINGS + DECISIONS (append-only), CHANNELS, CHANNEL-PLAN.
- New video: `sh pipeline/new-episode.sh <channel> <series> <code>-<slug>`.

## Environment
- Vivek: WSL Ubuntu-24.04 at `/mnt/c/Users/Vivek Sai/Downloads/YouTube` (quote paths: there is a space). JP: macOS, his own clone of the repo.
- `. pipeline/env.sh` before lemo commands. Kokoro model is in tools/lemo-opuscar/core/tts.
- NexLev MCP connector is available for niche research and channel analytics when connected.

## Memory hygiene
- STATUS.md: rewrite at the end of every session, under 40 lines.
- TASTE.md: update whenever Jp reacts; quote him and cite the clip or episode.
- RULES.md: one-line rules only, under 80 lines; promote from LEARNINGS when proven; delete wrong ones.
- Keep this file under 120 lines. Detail belongs in workflows/ and memory/.
