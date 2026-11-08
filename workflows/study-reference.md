# Study a reference clip
1. Jp drops the clip in references/videos/ and says what he likes or dislikes about it.
2. Measure: duration, resolution, cuts (`ffmpeg ... select='gt(scene,0.30)'`), seconds per shot, loudness.
3. Contact sheets at 1 fps (5x2 tiles) and read every sheet; denser around fast moments.
4. Transcript: `sh pipeline/transcribe-refs.sh` (Whisper, word timestamps) → references/transcripts/.
5. Note in references/README.md: format, world, characters, captions, rhythm, palette, audio, CTA, what Jp liked/disliked and why.
6. Update memory/TASTE.md with evidence. Save reusable techniques to library/ (never footage, characters or logos).
