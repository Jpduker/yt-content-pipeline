> **PARKED (2026-11-08):** Jp can't pay for API keys yet. Installed, not used. Revisit when the channels earn money.

# creator-lab: Instagram Reel script research (tools/creator-lab, MIT, commit 14f8356)
Pulls a public creator's Reels (Apify), transcribes the SPEECH (Fireworks or Groq Whisper), classifies each script with TypeSafe Jev
(topic, opening move, hook mechanism, structure, evidence, emotion, specificity, CTA) and shows which patterns get more views.
Local web app on http://127.0.0.1:5190, no npm dependencies.

## What it costs (all paid by you, per provider; check each provider's current pricing before a run)
- Apify Instagram Reel Scraper: per-run spend cap you set in the form.
- Transcription: Groq Whisper (the code estimates $0.04 per audio hour) or Fireworks.
- Jev classification: the code estimates $0.042 per million input tokens.
These are the code's own estimates, not quotes. Start with a 20-Reel pilot.

## Fit for us (honest)
- Great for SPOKEN reels (explainers, story-time, stickman-style narration): hooks, structures, CTAs, what correlates with views.
- Weak for our poetic/music reels: it skips reels with fewer than 6 spoken words ("music-only and very short speech are excluded"),
  and it does not read on-screen text. zarwhisper-type reels would mostly be skipped. For those, we study by hand (frames + text) or
  add an on-screen-text step later.
- Use it for patterns, not to copy scripts: rewriting someone's story beat for beat is a copyright and "reused content" risk on YouTube.

## Setup (WSL, once)
1. Put your keys in `research/creator-lab/.env` (copy `.env.example` next to this file; never commit or share it).
2. `sh pipeline/creator-lab.sh doctor` then `sh pipeline/creator-lab.sh start`, open http://127.0.0.1:5190.
3. Exports: use the app's JSON export and save it into `research/creator-lab/exports/<handle>-<date>.json`; Claude reads them from there.
