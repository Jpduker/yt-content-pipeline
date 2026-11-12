# Visual and motion specification — current working direction

## Preserve
- Round pale illustrated head, small tilted dark oval eyes and expressive sparse features. No V1 egg-shaped head, visible ears, nose or cheek oval.
- Mustard/ochre jacket, dark thin limbs and hands, diagonal shoulder-bag strap, painterly texture and warm edge light.
- The actual approved face assets; do not regenerate them casually or replace them with geometric approximations.
- B's expressive character treatment and C's layered blue/amber cinematic atmosphere. Do not force every episode into the same workshop or mood.
- Same character model in full-body, medium and close-up views.

## Motion priorities
1. Correct left/right identity and independent shoulder/elbow/wrist motion.
2. No arm embedded in the torso image, extra hands, floating wrists or unwanted cross-body layering.
3. Readable silhouette and believable elbow branch throughout a gesture, not just endpoints.
4. Palm/wrist direction must follow the action without impossible bends. Props stay attached to a stable grip/pinch/contact point.
5. Torso anticipation, balance, shoulder response and settling must support the limb action.
6. Feet stay anchored during a standing gesture; walking needs a genuine gait rather than translating a leg sprite.
7. Expressions and reactions must be motivated by the story, with subtle holds rather than random idle motion.

For this facing, current rig labels are screen-left and screen-right. Anatomical labels must be explicit if turning the character. Do not mirror the whole rig to fake the other hand.

## Review before a full episode render
Render real motion—not just a still—covering: right-hand object presentation while left rests; left-only gesture while right keeps the prop; reaching/returning; recoil; close-up face/body consistency. Inspect 0.1–0.2 s frame strips around any contact or overlap. Run geometric checks, then assess actual motion separately. No test can establish that a performance feels natural.

## Production approach
Illustrated assets animated by code, layered environments, selective Three.js geometry/effects where useful. Native Canvas currently renders the proof; browser route should be verified in the studio. No need to adopt an entirely new pipeline or install every upstream package. Retain the source render(t) contract, one timing source for motion/audio, reproducible seeds and clean source/asset separation.

Use narration/dialogue with natural phrasing. Music, room tone and effects should support the scene; do not use Marvel's score. Use exact word timestamps for final captions when available. Compose vertical shots for 1080×1920 and YouTube UI clearance instead of cropping a landscape film.
