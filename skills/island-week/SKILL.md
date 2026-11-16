---
name: island-week
description: Prepare next week's content kit for the Island channel (The Keeper's Island): brief the plot, write 14 Shorts + the long-form chapter, build voices/mixes/PUBLISH files and a render kit for Vivek's GPU. Use for "prep next week", "island week", "next chapter for the island".
---
# Island week
Follow `channels/island/ISLAND-WORKFLOW.md` exactly (read it first, then `channels/island/WORLD.md` and the latest `channels/island/QA-*.md`).
1. Brief Vivek on the next chapter's plot (≤ 12 lines + the 14 day-by-day titles).
2. Copy the last `engine/tools/weekN.py` + `chapterN.py`, write the new week, add any new character/place to the engine and to WORLD.md.
3. Run `engine/tools/make_kit.sh` in the cloud (background), write `extra/WEEK.md` + `extra/PUBLISH-CH.md`.
4. Check the QA stills and multi-time chapter stills; fix before delivering.
5. Deliver the kit into `channels/island/`, tell Vivek which two .bat files to double-click.
6. After his feedback: update WORLD.md §7 (log) and canon, commit as VivekSai07 (no AI co-author).
Never render picture in the cloud. Keep usage lean: no extra research unless asked.
