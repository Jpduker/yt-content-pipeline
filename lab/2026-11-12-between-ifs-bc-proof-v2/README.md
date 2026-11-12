# Between the Ifs — artwork-led character revision 02

26-second original animation proof. This revision responds to Vivek's rejection of the procedural character in test 01 and returns to the round-faced mustard-jacket character in the original B/C reference sheet.

## What changed
- Painted character parts generated using the original A/B/C sheet as the image reference, rather than redrawing the character as geometric shapes.
- Round pale face without visible ears or nose, tilted dark eyes, black hands and thin dark legs, mustard clothing with textured folds and a shoulder bag.
- Four expressions, articulated front-arm gesture, device attachment, independent head tilt and breathing/weight shift.
- Same workshop, mini-story, narration, score and effects retained for direct comparison.

## What is and is not demonstrated
This is illustrated cutout animation, not a full 3D character. The setting is generated background art. The hand, head, torso and legs are separate image layers controlled in film.js. The clock, rain, portal and distant figure are procedural effects. The standing legs are a single layer with weight shift, not a developed walk cycle. Expression changes use illustrated replacements. No full turns, continuous lip-sync or detailed combat have been implemented. The generated parts are a new derivation of the reference, not an exact extraction of its original pixels.

## Rendering
The exact same film.js supports the Lemo browser contract (render(t), DUR, READY, EV) and the supplied native Canvas adapter. Native Canvas was used here because this host blocks Chromium socket creation. Existing production episodes are unchanged.

From this folder: install package.json dependencies with npm install; python3 audio.py builds the local Kokoro narration and synthetic music/effects (requires the studio's Kokoro assets); node render-native.mjs renders 1080p/24fps. build.sh renders and mixes. Audio.py is unchanged from test 01; voice transcripts were verified there and the audio was reused unchanged. See the first proof for detailed pipeline notes.

Assets are included in assets/. character-parts.png is the generated transparent master sheet. The eight isolated PNG parts were prepared by selecting the largest connected alpha component in each sheet cell and cropping to its bounds. They are not competitor artwork. Original reference: exec-8bc2e3f3-7d33-4f59-b0c9-f5aab4256f3a.png, the user-approved B/C concept sheet.

Caption word timing is estimated within each spoken line. Final renders are review samples, not published uploads.
