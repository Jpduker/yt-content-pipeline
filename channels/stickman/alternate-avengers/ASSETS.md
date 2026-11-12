# Asset registry

All image assets here were generated for this project; no Ifverse artwork or movie frames are included. A generated fan interpretation of a Marvel character is not a blanket rights clearance.

| Path | Role | Status |
|---|---|---|
| `references/01-original-ABC-direction.png` | Original A/B/C concept sheet | B/C selected by Vivek; primary art target |
| `references/02-approved-character-sprite-master.png` | Four heads + original body components | Character appearance liked; original whole-arm/torso mechanism superseded |
| `references/03-body-repair-master.png` | Arm-free torso, sleeve segments, hand poses | Technical repair source; use with V3 rig |
| `characters/mustard-hero/v1/curious.png`, `happy.png`, `awe.png`, `fear.png` | Approved illustrated expression layers | Preserved byte-for-byte from V2 |
| `characters/mustard-hero/v1/torso-clean.png` | Jacket/strap/bag without a painted full arm | Active V3 part |
| `characters/mustard-hero/v1/upper-sleeve.png`, `lower-sleeve.png` | Straight segments for two-bone rig | Active V3 parts |
| `characters/mustard-hero/v1/hand-rest.png`, `hand-open.png`, `hand-closed.png` | Independent hand poses | Active / available |
| `characters/mustard-hero/v1/legs.png` | Standing lower-body layer | Does not constitute a walk cycle |
| `environments/workshop-blue-hour.png` | Painted workshop and rainy street | Original proof background |

Paths in the table are relative to this series' `assets/` directory. The organized `development/latest-proof-v3/film.js` loads these canonical paths. The three old `lab/` prototypes retain their own local copies for reproducibility/history.

New Doom/Avengers assets must go under `assets/characters/<character>/<version>/` with reference/model sheets and provenance. Do not add them to `channels/stickman/characters/stick-you/` or replace the original series cast. No such Marvel character assets have been produced yet.
