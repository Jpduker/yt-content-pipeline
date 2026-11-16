# The Wrong Getaway Car — test v2

Two voice versions of the same unofficial GTA VI fan-fiction pilot, created in response to feedback on the photograph grip, vehicle detail and narration.

## Changes

- Rebuilt the opening and photo close-up from inside the car so the image side of the print faces Lucia and can be seen by an over-the-shoulder camera.
- Both prints depict Lucia alone outside the motel; checked visible hands, thumbs, wrists and paper edges.
- Repaired the tow shot's tires, rims, flatbed support and restraints. This shot stays static to preserve the full vehicle geometry in the edit.
- Reframed the fixer scene with the vehicle wheels out of frame; the car remains empty.
- Added a dedicated cash-and-tracker discovery shot beneath the car's rear bench, replacing the waterfront bag crop.
- Kept the rainy neon Vice City-inspired world and painted crime graphic novel treatment.
- Rewrote the spoken script and generated two full narrations with ElevenLabs Eleven v4: Liam and Laura. These are voice candidates for review, not a final channel voice selection.
- Native narration timing and pitch are preserved. Only loudness normalization, captions, scene timing and the quiet sound mix are applied afterward.

## Files

`output/gta6-pilot-v2-male-liam.mp4` and `output/gta6-pilot-v2-female-laura.mp4` are delivered separately from this source archive. Each is 1080×1920 at 30 fps, with burned-in captions. SRT captions are included in `output/`.

`assets/male-liam.mp3` and `assets/female-laura.mp3` are the dry voice files. Their matching JSON files hold ElevenLabs character timings. `voice-config.json` records voice IDs and settings. `script-performance.txt` includes delivery tags; `script.txt` is the plain spoken script.

`assets/` includes eight selected frames. `image-prompts.json` records the four revision prompts and their original v1 reference paths; those paths document inputs and are not used by the renderer. The cash-discovery scene is described separately in `cash-prompt.txt`.

## Rebuild

Requires Python 3, NumPy, and FFmpeg/FFprobe with libass and libx264. Run `python build.py` from any directory. The renderer uses included assets and does not call ElevenLabs.

`eleven_worker.py` is an optional API helper. It reads an API credential from the first stdin line and keeps it in process memory; subsequent lines are JSON commands. No credential is included in these files. For future generation, supply a replacement credential securely in the local environment and do not place one in this archive.

## Scope of this test

The images are generated fan-art interpretations of Jason and Lucia and illustrative environments, not a verified reconstruction of the game map. Production checks cover framing, object continuity, captions, decoding and signal levels. Voice preference and whether the performances suit the channel remain for the user's listening review.
