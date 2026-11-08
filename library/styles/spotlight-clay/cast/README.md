# spotlight-clay cast v1 (2026-11-08), WAITING FOR JP'S APPROVAL before the v3 remake
Fixes Jp's v2 notes: (a) male vs female unclear → silhouette + hair + outfit + colour; (b) bodies/bricks passed through each other → CHECK.
- cast.js: makeCast('him' | 'her') on top of the v2 rig (rig-v2.js, unchanged joints, so POSE / walkPose / applyPose still work).
  HIM: broad shoulders, short hair + fringe, slate-blue top, dark trousers, brown shoes. HER: narrow shoulders, wider hips,
  long hair down the back + gold-tied ponytail, lashes, terracotta top + A-line skirt. secondary(P, vx, t) = ponytail/skirt follow-through.
- collide.js: checkFrame(figures, boxes) → list of interpenetrations (capsule–capsule, capsule–box). v3 plan: window.CHECK(t) runs it
  each frame over the whole film; a render is allowed only when every frame reports 0 (tolerance 4 mm).
- sheets/: him + her turnarounds (front, 3/4, side, back, 3 expressions) and the pair with the CHECK self-test
  (0 overlaps standing apart, 24 caught when pushed together).
Render the sheets: index.html?kind=him | her | pair (three.js 0.170 at /node_modules, same importmap as the lab piece).
