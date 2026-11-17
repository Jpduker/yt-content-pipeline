# Week 22–28 Nov 2026 build (v3.2) — the repeatable pipeline
Approved (Vivek 17 Nov): KT_Test look (characters + kinetic typography), lineup in `../PLAN-2026-11-22-to-28.md`, cliffhanger test on cut-2, 5 uploads/day.

## Per day = 5 uploads (Berlin): 09:00 original A · 13:00 original B · 17:00 long-form · 18:30 cut-1 (ends on the question) · 20:30 cut-2 (ends on a cliffhanger + "full story on the channel")
| Day | Long-form folder | Originals (shorts/) |
|---|---|---|
| Sun 22 | 2026-11-22-wi13-thousand-words | 2026-11-22-o15-grandma-hug · 2026-11-22-o16-sister-thoughts |
| Mon 23 | 2026-11-23-wi14-lie-freeze | 2026-11-23-o17-dad-later · 2026-11-23-o18-pause-parents |
| Tue 24 | 2026-11-24-wi15-midnight-delete | 2026-11-24-o19-fight-shrinks · 2026-11-24-o20-hate-voice |
| Wed 25 | 2026-11-25-wi16-promise-strings | 2026-11-25-o21-future-call · 2026-11-25-o22-grandparents-glow |
| Thu 26 | 2026-11-26-wi17-mum-calls | 2026-11-26-o23-borrow-day · 2026-11-26-o24-deleted-texts |
| Fri 27 | 2026-11-27-wi18-last-bell | 2026-11-27-o25-dad-kid · 2026-11-27-o26-three-rewinds |
| Sat 28 | 2026-11-28-wi19-dog-talks | 2026-11-28-o27-shadow-hurt · 2026-11-28-o28-luck-gift |

## Steps for one video (no rework needed if followed)
1. `script.md` (v3 syntax) + `voice/voice.json` → `LIB=tools/lemo-opuscar python3 library/styles/growkaz-ifverse/v3.2/tools/build_voice.py <ep>`
2. `new_project.py <ep> 16:9|9:16 "<title>"` (style `ifs`) → `story/build_story.py` (v3.2 helpers) → `python3 story/build_story.py <ep>`
3. Cut Shorts: `tools/make_short.py` from the long-form lines (cut-2: end on the cliffhanger line, ask = "Full story on the channel").
4. Add `project|dest` lines to `render/week-2026-11-22.txt` → `tools/prep_week.sh <what-if> render/week-2026-11-22.txt` → LOOK at every `check/sheet_*.png` (face on head, nobody cut by the 9:16 crop, no overlay on a face, no fact shown twice, right cast/set) → fix → re-run.
5. `pack_week.sh` → device → Vivek double-clicks `render\render-week-2026-11-22.bat`.
6. Each day folder gets `PUBLISH.md` (titles, description, tags, pinned comment, times) + `THUMBNAILS.md` (Gemini prompts: long-form + 4 Shorts; attach the hero sheet).

## Never again (from past weeks)
- Copy the WHOLE scenes folder (prep_week does). Never mix versions.
- 9:16: speaker inside the crop (lint), cam z ≤ 1.2 on world shots, pets/props inside the crop.
- Ask/hook plates never over a face; one carrier per fact per frame (no "1,000" slam + "1000" badge together).
- Hero = green hoodie always; matte head; same cast design in every shot (CAST/HEAD only, no per-shot overrides).
- Sitting needs a seat (sofa/bed/chair in the set or `chairs=`), never on air.

## Progress (17 Nov 20:50)
- DONE: v3.2 wardrobe (8 archetypes in cast.js), sets saturate pass, render/render-week.ps1, tools/prep_week.sh, WI13 full script (2:20) + voice + shot list (QA'd sheets: seating fixed, Mum message = KT typed page, drawing = KT pops).
- DONE Sun 22: WI13 (long + cut-1 + cut-2 cliffhanger), O15, O16 scripts, voices, shot lists, QA sheets, PUBLISH.md, THUMBNAILS.md; listed in week-2026-11-22.txt.
- DONE Mon 23: WI14 (+cuts), O17, O18 (outros added by prep_week).
- DONE Tue 24: WI15 (+cuts), O19, O20.
- DONE Wed 25: WI16 (+cuts), O21, O22.
- NEXT: Thu 26 WI17 mum-calls + O23 borrow-day + O24 deleted-texts; Fri; Sat; then prep_week.sh, look at sheets, pack_week.sh, ship, commit.
- Note: the phone insert ('phone') and 'drawing' insert carry old content (Mira text / horse); use KT pages for messages and drawings instead.
- 17 Nov 20:50: Vivek asked for a like/subscribe ending on EVERY video. Built `outro` shot (gen.js) with 4 variants: A 'iris' (1930s cartoon iris-out + sign-off), B 'silent' (silent-film card), C 'button' (hero presses SUBSCRIBE, bell, thumbs-up), D 'ident' (channel card + room for YouTube end-screen elements). Samples: shorts/2026-11-17-outro-test{,-16x9}. WAITING for his pick → then add an outro shot to every video of the week (Shorts ≈ 2.5–3 s after the ask; long-forms 8–10 s so the YouTube end screen fits) before prep_week/pack.
- 17 Nov 21:30: Vivek picked endings: A ('iris') on every Short, B/C/D rotating on long-forms (add_outro.py does it by date; prep_week.sh adds it automatically when missing). Shorts capped at 59.8 s.
- Voice tags must be [A-Z]+ (no underscore/digits): build_voice silently drops other tags (O21 'AVA_OLD' -> use FUTURE).
