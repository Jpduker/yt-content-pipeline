# Audio bible

## Priority and perspective
Speech is the anchor. Keep narrator centered, clear and close. Preserve approved voice identity and native cadence.
Ambience establishes the physical environment. Music carries the emotional arc. Foley marks visible actions.
Inside a closed car, rain is quieter and filtered; outside at the docks it is wider and brighter; across the water, police sirens are distant and subdued.

## V3 cue map
| Time | Situation | Music | Ambience / effects |
|---|---|---|---|
| 0–10.84s | Photo and suspicious call | Sparse minor-key plucks, curiosity | Filtered rain, subtle paper, brief phone vibration |
| 10.84–15.88s | Cash and tracker | Darker harmony, growing pulse | Interior rain; avoid an unrelated loud hit |
| 15.88–24.68s | Tow truck and reversed trap | Controlled rhythmic momentum | Wider rain, wet-road engine, approaching distant sirens |
| 24.68–33.10s | Waterfront payoff | Sly, warmer resolution | Softer outside rain, far siren, bag zipper; music dips for last line |

## Mixing goals
Targets are starting points, not a claim about a universal platform standard.
Normalize speech near -16 LUFS with true peak headroom. Keep music and ambience clearly below it; let them breathe briefly in pauses.
Use a smoothed speech envelope to lower backgrounds automatically, with natural releases rather than obvious pumping.
Low-pass interior rain; keep meaningful SFX brief and tied to on-screen or narrated action.
Do not use constant braams, gunshots or loud whooshes as substitutes for tension.
The measured median speech/background separation is about 14 dB in active half-second speech windows; quieter windows still need human listening review. Check phone speaker, headphones and a low playback volume. Human listening approval is still needed; decoder and level checks cannot judge musical taste.
Export dry voice, score, ducked music, ambience, effects and full mix.

## Asset provenance
Liam/Laura: ElevenLabs eleven_v4 with settings in audio/voice-roster.json.
Rain/paper/phone/tow-truck/siren/zipper: ElevenLabs eleven_text_to_sound_v3, with per-file request metadata alongside the files.
Music: original deterministic D-minor/F-major-colored composition built by tools/build_sound_test.py. It has four timed sections with keys, pads, bass and sparse percussion. It is not an Eleven Music generation.
Eleven Music request failed with 402 paid_plan_required. Marketplace browsing/access was not established.
Lara's profile is saved in the roster; API synthesis failed with a paid-plan requirement after successful library addition.
See RELEASE_STATUS.md for commercial-use status. No API key is stored.
