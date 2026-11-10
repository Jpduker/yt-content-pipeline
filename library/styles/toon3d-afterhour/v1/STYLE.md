# toon3d-afterhour v1 (frozen 2026-11-10)
Frame-matched rebuild of Afterhour Theory's short (first 24 s). three.js r170 (vendor/), Poppins Bold captions.
- Cast kit: toon.js → makeGuy({hair:'ridge'|'curly'|'short'|'none', hairCol, body, legs, hands, badge, spec:'shades'|'glasses'}), pose(P,{expr,armL,armR,turn,nod,sit,...}).
  Expressions: smug, grin, evil, annoyed, happy, shock, neutral, side. Black ink outline = inverted hull (ink()).
- Look: navy hub room + pink dusk windows, cyan neon + yellow rings, bloom .4/.4/.96, ACES, vignette; heads emissive .32 so they stay white.
- Camera: shot list of keyframes [t, pos, look, fov, ease]; motion blur = sub-frame accumulation on whips; dissolves and white flash in render().
  Framing lesson: medium shots need ~5–7 m camera distance for a 1.95 m figure at fov 40.
- Captions: ONE word/short chunk, Poppins 700 50 px, white + 11 px dark stroke, y = 70.5% H.
- Render: page contract window.render(t)/DUR; cloud 2 workers ≈ 1.7 s/frame at 1080x1920.
