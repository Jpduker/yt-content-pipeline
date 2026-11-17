# ReachMora 2D long-form: what we took (2026-11-17)
Source: `C:\Users\Vivek Sai\Downloads\reachmora-2d-longform` (skia-python + ffmpeg explainer engine, "made by ReachMora"; credits aivxer for the puppet/lighting code). Rendered its own example unchanged with our Kokoro narrator: `The_Marshmallow_Test_and_Your_Money.mp4` (2:08, 31 shots, 97 % word alignment).
Licence/policy: we copy techniques only. No ReachMora or RicksClips characters, layouts, series names or assets; our hero and cast stay ours. Fonts: Permanent Marker (Apache 2.0, @fontsource).

## What it does well (and what we adopted in v3.2)
| Technique | Theirs | Ours (v3.2) |
|---|---|---|
| Word-timed hand-lettered pop-ins | `labels` cued to a spoken word | `pops=[P('14 WORDS LEFT', 'L002:3', 'red', x, y, sz)]`, overshoot pop + bob + auto `pop` SFX |
| Rubber stamp with camera shake | `stamp` | `slam=dict(t='SILENT', at='L004:5')`, ink grain, 0.4 s shake, `hit`+`kick` SFX |
| Polaroid freeze ending | `polaroid` | `polaroid=dict(at='L013+0.9', caption=..., ring=[x, y, r])`, flash + `ding` |
| Camera never still | push-in on every shot | default scene push 1.03 → 1.08, face push .05 → .08 |
| Whip-pans on place changes | auto | already had `'whip'`; now used on every change of place |
| Bright day vs moody night | day/night sets | `day=True` on a shot skips the night vignette and lifts the image |
| Pacing | shots 3–8 s, never 2 of a kind in a row, every number on screen, reaction close-up after each claim | same rules in our shot lists; every counter change gets a pop |

## Not adopted
- Their puppets (skin faces, outfits): our silhouette hero is the brand.
- Explainer kinds (chart, counter, list, versus): we tell stories, not lessons. A `versus` split could suit a future "two choices" beat.
- Their auto music bed: ours already mixes music + SFX + ambience.

## Kit changes (render kit `make-2d-video/kit`)
- `engine/player.js` loads Permanent Marker; `package.json` pins `@fontsource/permanent-marker` 5.3.0.
- `render.mjs`: `PW_CHROME` env var overrides the browser path (the cloud sandbox ships a newer Chromium than the kit's Playwright).

## Sample
`2026-11-22-wi13-thousand-words` (44 s, 12 shots, -14.4 LUFS, postcheck OK): cold open + start of Act 1 of WI13.
