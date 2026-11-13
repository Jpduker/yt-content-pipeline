# growkaz-ifverse v3.1 · spec (2026-11-13, session 11)
Frozen copy of v3 + the changes below. Episodes from WI06 (15 Nov) use v3.1. Never edit v3.
Source of the requirements: channels/stickman/what-if/PLAN-2026-11-15-to-21.md §2/§7, shorts/PILOTS-2026-11-15-to-17.md, Vivek 2026-11-13 ("1 long-form + 4 Shorts a day").

## Requirements
R1 Shorts have no end cards. `make_short.py` stops adding the "Full story on the channel" card.
R2 Every Short can show an overlay at its start (`--hookText`, ≤ 5 words, 0 – ~2.6 s) and a question over its final action (`--ask`, last ~2 s, plus a 1.2 s hold on the final frame's action).
R3 A cut Short can be rebuilt for newcomers from several line ranges (rule lines first, then the scene), already supported; cuts start on a line that states the rule or shows its effect.
R4 Original Shorts are authored directly as 9:16 projects (`config.aspect = 9:16`) with the same shot builders; `vx` pins the vertical frame; `hookText` / `ask` work the same way (shot params).
R5 New cast (one signature item each, same faces): THEO (younger brother; navy tee, blue headphones round his neck #4a8fe8; s≈.86), DEV (grey tee, orange scarf), PIA (kid; red hair clip, bun; s≈.78), DAD (Mira's dad; brown cardigan, grey moustache and side hair), INTERN (green lanyard). Hero unchanged (strict).
R6 New badge kind `words`: white counter (red ≤ 10), same placement/animation as `num`. `num` accepts "∞" (wobbles).
R7 New sets: `kitchen` (fridge, counter, table, window; options juice, drawing), `stage` (school/showcase hall; variants front / backstage; audience rows), `garden` (grass, fence, small goal).
R8 New inserts: `comments` (thread typing, counter spinning), `contacts` (list, clock, pixel-break deletion at `delAt`), `callscreen` (ringing → "Unknown number" → connected timer), `drawing` (fridge drawing, rotates right way up at `flipAt`), `hand` (digits written on a palm), `float` (office objects floating in zero gravity).
R9 Freeze ring overlay `fring: [t0, t1]` counts 5 → 0 over the shot fraction (time-compressed on screen).
R10 Overlays stay inside the frame (premise + question boxes are clamped to the 9:16 safe area: y 140–1550).

## Acceptance
- A sheet of each new set, cast member, badge and insert, read by eye before any render.
- P1 first frame shows the overlay, counters and the silent woman; P3 first 3 s show the deletion.
- `make_short` output has no `shortEnd` shot; the last shot carries `ask`.
