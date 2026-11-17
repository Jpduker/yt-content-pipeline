"""Meaningful pre-render checks; no external services or media generation."""
import unittest
import render_batch as rb

class BatchGeometryTests(unittest.TestCase):
    def test_native_duration_and_minimum(self):
        self.assertEqual(rb.edit_duration(49.0), 51)
        self.assertEqual(rb.edit_duration(48.0), 50)
        self.assertRaises(ValueError, rb.edit_duration, 59.0)
        self.assertRaises(ValueError, rb.edit_duration, 40.0)

    def test_scene_relative_cue_duration(self):
        self.assertEqual(rb.cue_geometry({'scene_index':2,'duration':1.5},[0,6,12,18,24,30,36,42,50],50),(12,13.5))
        self.assertRaises(ValueError,rb.cue_geometry,{'scene_index':8},list(range(9)),8)
        self.assertRaises(ValueError,rb.cue_geometry,{'scene_index':7,'duration':20},[0,6,12,18,24,30,36,42,50],50)
        self.assertRaises(ValueError,rb.cue_geometry,{'scene_index':1,'offset':-1},[0,6,12,18,24,30,36,42,50],50)

    def test_score_uses_story_semantics(self):
        self.assertEqual(rb.music_mood('Warm resolution, harmonic release'), 'resolution')
        self.assertEqual(rb.music_mood('Fast chase percussion accelerates'), 'action')
        self.assertEqual(rb.music_mood('Uneasy low tension pulse'), 'tension')
        self.assertEqual(rb.music_mood('Sparse curious piano'), 'curiosity')

    def test_score_theme_stable_and_episode_specific(self):
        self.assertEqual(rb.score_theme('episode-a'),rb.score_theme('episode-a'))
        self.assertNotEqual(rb.score_theme('episode-a'),rb.score_theme('episode-b'))

    def test_refuses_render_without_eight_frames(self):
        import json,tempfile
        from pathlib import Path
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as folder:
            p=Path(folder)/'episode-01.json'
            p.write_text(json.dumps({'scenes':[{}]*8,'duration_seconds':56}))
            with patch.object(rb,'run') as mocked:
                with self.assertRaisesRegex(RuntimeError,'Eight frames'):
                    rb.main(p)
                mocked.assert_not_called()

    def test_cue_source_cannot_escape_channel(self):
        self.assertRaises(ValueError,rb.cue_source,'../../outside.mp3')

    def test_loop_length_and_empty_source(self):
        import numpy as np
        x=np.ones((100,2))*.25
        y=rb.crossfade_loop(x,351)
        self.assertEqual(y.shape,(351,2))
        self.assertTrue(np.allclose(y,.25))
        self.assertRaises(ValueError,rb.crossfade_loop,np.zeros((0,2)),50)

if __name__=='__main__':unittest.main()
