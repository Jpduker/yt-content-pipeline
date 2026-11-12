# Research and technical findings — session record, 2026-11-12

## Ifverse channel study
Reference: https://www.youtube.com/@IfverseTales

Direct YouTube retrieval was throttled. The study used indexed public channel snapshots and mirrored descriptions/chapter lists. It did not involve a reliable full viewing of the videos, a thumbnail audit, private retention data, traffic sources or earnings. Several third-party analysis pages were promotional or internally inconsistent; their causal claims and revenue estimates were not treated as proof.

Snapshots around Nov 11–12 listed roughly 61–62K subscribers, 35 uploads and 9.6M views. One index listed account creation Jan 26, 2022. The reaction-time video was indexed as published Oct 7, 2026. Therefore one month of visible publishing does not prove the creator/account began from zero a month earlier.

| Indexed video | Approximate snapshot views | Source |
|---|---:|---|
| Reaction time 10× faster | 4.68M | https://zolotube.com/watch?v=MroF1XmHOZw |
| 500 IQ | 1.48M | https://zolotube.com/watch?v=4kHPfx6Gy00 |
| One second feels like ten | 694K | https://zolotube.com/watch?v=9iB2XSmhxKo |
| Use 500 IQ to disappear | 556K | https://zolotube.com/watch?v=-GFNcSZYgtY |
| Use 500 IQ to save a sister | 250K | https://zolotube.com/watch?v=CYW8XHpodwM |
| Childhood with adult memories | 421K | https://zolotube.com/watch?v=ZqJioegj8IM |

Counts were retrieved at different times. They are historical approximate observations, not live analytics. The leading two accounted for roughly 64% of the reported total, illustrating concentration in a few hits rather than universal virality. Sequels had smaller totals; unequal age limits causal comparisons. The catalogue includes Shorts and compilation films, so 35 uploads are not necessarily 35 independently produced original stories.

Interpretation worth testing: one instantly understandable impossible rule; direct personal advantage; familiar demonstration; escalating consequences; hidden limitation; emotionally meaningful choice. These are storytelling hypotheses, not verified explanations of this channel's retention. Shorts-to-long conversion was not established. Publishing frequency alone was not shown to cause growth. No viral or monetization guarantee was made.

Snapshot references: https://youtubesubhub.com/@IfverseTales ; https://famexniches.online/c/ifversetales ; https://outlierkit.com/channel/ifversetales ; https://dna.seedflows.ai/channel/ifversetales . Treat outside audience/revenue claims cautiously.

## YouTube metadata findings
- Tags generally have minimal discovery impact; useful especially for misspellings. Title, thumbnail and description matter more: https://support.google.com/youtube/answer/146402
- A video's location tag supports browsing/searching videos associated with a place; it is not a documented general virality boost: https://support.google.com/youtube/answer/7638112
- Channel-country changes are not a targeting shortcut for reaching that country's viewers: https://support.google.com/youtube/answer/141805
- Recommendations consider viewer relevance and response, including choosing to watch and continued viewing: https://support.google.com/youtube/answer/11914225
- Clear, accurate titles and readable thumbnails are important: https://support.google.com/youtube/answer/12340300

## Fan fiction and originality
Vivek wants entertaining imagined plots that can be true or false relative to future films. These do not require evidentiary film claims. Use explicit fan-fiction/speculation framing; do not invent leaks or claim invented scenes are official footage. Niche and broad ideas differ from protected expression: https://www.copyright.gov/help/faq/faq-general.html . Adding one's own music does not automatically clear another creator's script, art or film material. Monetization's reused/inauthentic-content review is separate from copyright: https://support.google.com/youtube/answer/1311392 . This record is not an individual legal clearance.

Marvel's official material connects Avengers, Fantastic Four and X-Men with Doomsday, which supports recognizable subjects for speculation; it does not confirm our plots: https://www.marvel.com/articles/movies/fantastic-four-first-steps-avengers-doomsday-kevin-feige . The channel should not depend entirely on one film's launch cycle.

## Existing pipeline assessment
Inspected README, HANDOFF, CLAUDE, tools inventory, growkaz-ifverse v2 STYLE, WI02 chars.js and shots/t3.js. The studio already mixes 2D characters with selected Three.js establishing shots. Lemo is already in the tool inventory; no wholesale pipeline replacement is needed.

Upstream Lemo references: https://github.com/lemomo-ai/lemo-opuscar ; `TECHNIQUE.md` (deterministic render(t), timeline-based picture/voice/music/SFX); `MY-STYLES.md` (custom style and proof workflow); `styles/scifi-toon/STYLE.md`; `styles/cel-anime-80s/STYLE.md` (background/character/light separation). Borrow techniques, not stories or demo art. The repo's recorded older pin and newer upstream differ. Do not blindly upgrade the studio. Current upstream code/docs/assets have different license terms; consult LICENSE, including its additional permission to use docs for one's films.

The generated B/C images were visual targets, not renderer output. V1 demonstrated why a generic geometric redraw failed to preserve their appeal. V2 improved fidelity with illustrated parts but lacked proper joints. V3 corrected that architecture with explicit two-bone chains. A more capable director/rig implementation may improve it further. Actual performance must be reviewed, not inferred from the five passing geometric checks.
