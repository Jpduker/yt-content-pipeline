# Between the Ifs — body mechanics revision 03

This revision addresses Vivek's feedback that the left arm overlaps the body and behaves like a second right arm. The approved face artwork is unchanged.

## Root cause and repair
The previous torso sprite contained a painted sleeve; the animated presenting arm was an entire bent image rotated at one shoulder. There was no independent elbow or wrist chain, and left-arm shot inputs were ignored.

This version uses an arm-free torso and separate textured upper-sleeve, lower-sleeve and hand sprites. rig.mjs computes independent shoulder/elbow/wrist chains with 64/63-unit bones. Each side has its own input and constrained wrist target. The far arm draws behind the torso except a small shoulder seam cover; the near arm draws in front. The watch is attached in the near hand's grip frame. Feet stay fixed rather than rocking the complete leg image. Left-arm gesture amplitude is deliberately restrained.

Sides in code refer explicitly to the screen-left and screen-right limbs, not inferred anatomical names during camera cuts. No whole-rig mirroring is used in this proof.

## Verification
Run node --test rig.test.mjs. Five checks cover fixed lengths, independent controls, keeping the left wrist outside the torso, unreachable targets and the presenting elbow's bend direction. The last check initially reproduced an upward-folding elbow; the branch was corrected before the final render. Representative motion strips were inspected across the lift, left gesture and reaction.

## Rebuild
The film still exposes render(t), DUR, READY and EV for the studio's Lemo browser pipeline. The native Canvas adapter actually rendered this delivery because this host cannot create Chromium's local sockets. npm install followed by sh build.sh regenerates picture and sound, given the existing studio Kokoro model assets and Python packages. The current native adapter's font paths target Linux.

Background, story and audio are unchanged from revision 02. Caption word highlights are estimated within the spoken-line durations. This remains a 2D illustrated cutout rig: no full turns, walk cycle, continuous lip-sync or combat animation is claimed.
