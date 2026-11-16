# Sound test v3

Uses the exact approved v2 Liam performance and video stream. Only the audio mix changes.

Four music states: curiosity, tension, controlled momentum, sly payoff.
Generated ElevenLabs effects: rain, paper, phone, tow truck, sirens, zipper.
Rain is filtered inside the car and opens up outside; distant sirens become softer across the water. Music lowers under speech and dips for the final line.

Music is an original composed score from the included build script because Eleven Music API generation returned a paid-plan requirement. It is not a marketplace download or an Eleven Music output.

The free-plan voice/SFX files are review assets; see docs/RELEASE_STATUS.md before commercial distribution.

Build: python tools/build_sound_test.py from the channel root, with FFmpeg/FFprobe, NumPy and SciPy installed.

A/B baseline: ../pilot-v2/gta6-pilot-v2-male-liam.mp4
The baseline has the previous sparse audio treatment; v3 contains the new music/ambience/foley mix.
