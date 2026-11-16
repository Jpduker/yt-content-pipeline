# Score sources

pilot-v3-original-score.wav is the original four-section score composed by tools/build_sound_test.py. It is the music used in the v3 test.

eleven-music-composition-request.json is the prepared Eleven Music v2.5 request for a 33.1-second four-section instrumental score. The live request was rejected with paid_plan_required; no Eleven Music audio was generated.

Once a qualifying paid plan is available, the request can be submitted to POST /v1/music with a credential supplied securely at runtime. Preserve the returned song ID and generation evidence. Recheck the result's arrangement and re-mix it beneath narration; successful generation does not automatically mean the mix works.

Keep the current original score as the A/B reference. Do not label it as an Eleven Music or marketplace track.
