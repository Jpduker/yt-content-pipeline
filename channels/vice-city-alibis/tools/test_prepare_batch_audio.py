import unittest
import numpy as np
import prepare_batch_audio as prep

class ProceduralCueTests(unittest.TestCase):
    def test_originals_are_stereo_finite_and_have_headroom(self):
        for name in prep.ORIGINALS:
            audio=prep.synthesize(name, .25)
            self.assertEqual(audio.shape,(round(.25*prep.SR),2))
            self.assertTrue(np.isfinite(audio).all())
            self.assertLessEqual(np.max(np.abs(audio)),.51)
            self.assertGreater(np.sqrt(np.mean(audio**2)),.001)
    def test_sources_deterministic(self):
        np.testing.assert_array_equal(prep.synthesize('caster-roll',.25),prep.synthesize('caster-roll',.25))
    def test_ready_and_blocked_episode_timing(self):
        from pathlib import Path
        folder=prep.BATCH/'2026-11-17'
        for path in sorted(folder.glob('0[3-7]-*.json')):
            d, bounds, status=prep.timing(path)
            self.assertEqual(len(bounds),9)
            self.assertTrue(all(a<b for a,b in zip(bounds,bounds[1:])))
            if path.name.startswith('07'):self.assertEqual(status,'PLANNED_NO_CURRENT_VOICE')
            else:self.assertEqual(status,'MEASURED_CURRENT_NARRATION')
    def test_all_assignments_fit_timeline_and_are_subtle(self):
        for key in ('03','04','05','06','07'):
            bounds=list(range(0,57,7))
            cues=prep.build_cues(key,bounds)
            self.assertGreater(len(cues),0)
            for cue in cues:
                start,end=prep.cue_geometry(cue,bounds,56)
                self.assertLessEqual(end,56)
                self.assertLessEqual(cue['rms'],.014)
                self.assertNotIn('siren',cue['source'])
                self.assertNotIn('phone.mp3',cue['source'])
if __name__=='__main__':unittest.main()
