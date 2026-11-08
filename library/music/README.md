# Music library (shared by every channel)
| Folder | What goes in | Can we publish with it? |
|---|---|---|
| yt-audio-library/<mood>/ | Tracks downloaded from YouTube Studio → Audio Library | Yes on YouTube. If the track says "attribution required", copy its credit line into the episode's PUBLISH.md description. |
| (lemo sampler) | Our own scores played on real sampled instruments (episode music.py) | Yes, we own them |
| local-test-only/ | Anything else Jp wants to try (e.g. commercial songs taken from reels) | **No.** Local tests only. Replace before upload, or add the song inside YouTube's own Shorts editor at upload time. |

## Adding YouTube Audio Library tracks (free; needs a YouTube channel, since the library lives in YouTube Studio)
1. YouTube Studio → Audio library → filter Mood (Sad, Romantic, Calm, Dramatic, Inspirational…), Genre, Duration, and "Attribution not required" first.
2. Download into `library/music/yt-audio-library/<mood>/` (lowercase mood folder, e.g. `romantic/`). Keep the original file name.
3. Optional sidecar `<file>.json`: `{"title": "...", "artist": "...", "attribution": "exact credit line or null", "notes": "..."}`.
4. Run `sh pipeline/music-catalog.sh` (WSL). It measures every track (length, tempo, key, loudness, where it swells) into
   `library/music/catalog.json` + `CATALOG.md`, so any Claude session can pick music by emotion with /pick-music.
Claude can also browse the Audio Library for you in your Chrome (Claude in Chrome), but every download needs your OK.
