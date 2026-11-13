# HANDOFF · 2026-11-13 late (session 11) → next session: finish the week 15–21 Nov (1 long-form + 4 Shorts a day)
Paste into the new session: **"Read HANDOFF.md and finish the week (render what's left of Wed–Sat)."**

## 0. Rules first
- `sh pipeline/sync.sh` first; commit after every change (main only, as VivekSai07, no AI co-author lines). The device shell can't push: Vivek runs `git push origin main` from WSL.
- Vivek's rules: one-line policy/licence warning then build; cross-check every detail; free + local only; hero = channel image, never an outfit change; never "HD-2D" on screen; repo private.
- Cloud background commands die after their timeout: always pass `timeout: 7200000` for render queues (session 11 lost a WI07 render to the 30-min default).

## 1. What's decided
- Cadence (Vivek 2026-11-13 20:59): **1 long-form + 4 Shorts every day** from Sun 15. Calendar + titles: channels/stickman/what-if/PUBLISH-2026-11-15-to-21.md.
- Shorts rules (PLAN-2026-11-15-to-21.md v2 §2): overlay on frame 1, whole mini story, **no end cards**, a question over the final action + the same pinned comment, Related video = the long-form. Opening A (rule first) vs B (impossible thing first) alternates in the originals.
- Style **growkaz-ifverse v3.1** (library/styles/growkaz-ifverse/v3.1, SPEC.md). New: `hookText/hookT`, `ask{text,at,askY}`, `fring` (5→0 ring), `stamp`, badges `words`/`mem`, `chest` ring, promise `strings`, `grey`, `umb` umbrellas, `rain`, `floaters` (paper/mug/cup/plant/laptop/tray/bin/cabinet/splash/pigeon/coin/ash/dog), sets kitchen/stage/garden/flat, inserts comments/contacts/callscreen/drawing/hand/reply/photo/chips/tie/fridgelist/window, `vblur` (fixes blurred sets in 9:16), tools new_project.py, make_short.py --hookText/--ask/--hold.
- P2's kid is **Sami** (new family), not Theo: Theo is an adult living with the hero (WI06–09, 11).

## 2. State (cloud working copy /home/claude/yt is ephemeral: re-create from the repo if gone)
| Day | Long-form | Cuts | Originals | State |
|---|---|---|---|---|
| Sun 15 | WI06 | short-1/2 | P1, O2 | all rendered; WI06 + P1 + O2 delivered to final/; cuts re-rendering (ask plate moved lower) |
| Mon 16 | WI07 | short-1/2 | O4, P2 | queued/rendering |
| Tue 17 | WI08 | short-1/2 | P3, O6 | queued/rendering |
| Wed 18 | WI09 | to cut | O7, O8 | voiced + shot lists + sheets checked; queued |
| Thu 19 | WI10 | to cut | O9, O10 | scripts + voice done; need shot lists (frozen world = `freeze`+`grey`, timer stamp) |
| Fri 20 | WI11 | to cut | O11, O12 | scripts + voice done; need translucent figures (alpha by days ignored), shrinking (`s`), star badge |
| Sat 21 | WI12 | to cut | O13, O14 | scripts + voice done; need swap tags, door "+1s", walking shoes |
After each render: copy out/*.mp4 to <ep>/final/ with the names in PUBLISH, make_srt.py for long-forms, send with SendUserFile then device_commit_files by fileUuid.

## 3. Ask Vivek only
Listen to voiceovers (Claude can't hear); thumbnails stay his (Gemini prompts in each PUBLISH.md).
