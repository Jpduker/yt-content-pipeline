# Art/motion proof 01 — checks

- Rendered through native Canvas adapter: 624 frames, 1920×1080, 24 fps, 26 seconds.
- ffprobe confirms H.264 picture and AAC stereo sound, both 26 seconds.
- Measured final AAC soundtrack: -14.8 LUFS integrated, -1.4 dBFS true peak, 7.0 LU loudness range. Full final file decoded successfully with ffmpeg.
- Inspected six representative rendered stills and a five-expression sheet. Caption alignment defect found and fixed before the full render.
- Four local narration clips independently transcribed with faster-whisper tiny.en. All intended words recovered; punctuation differences only. Results retained in audio/asr-check.json.
- Captions use line durations with estimated word distribution; this test does not claim word-perfect forced alignment.
- Background artwork is generated; character rig and effects are code-rendered. Character rendering is visibly flatter than the illustrated reference. More shading, texture integration and performance development are needed.
- No full-3D character rotation, lip-sync dialogue, detailed combat, vertical reframing or Marvel character treatment is demonstrated by this proof.
- Chromium launch was blocked by local socket restrictions. Existing browser-render compatibility is designed via the same render(t) interface, but not verified on this host. Native Canvas actually produced this delivery.
- No claim of human-equivalent full-speed audiovisual review. Selected motion states, narration transcript and technical audio/video checks were inspected.
