"""Small offline checks for dated-batch packaging; never generates media."""
import importlib.util,json,tempfile,unittest
from pathlib import Path
TOOL=Path(__file__).resolve().parents[1]/'tools/package_dated_batch.py'
spec=importlib.util.spec_from_file_location('dated_package',TOOL)
pkg=importlib.util.module_from_spec(spec);spec.loader.exec_module(pkg)
class DatedPackageTests(unittest.TestCase):
 def test_direct_episode_sources_only(self):
  with tempfile.TemporaryDirectory() as t:
   d=Path(t)/'2026-11-17';d.mkdir();(d/'episode.json').write_text(json.dumps({'id':'x','title':'Episode','script':'Words','scenes':[]}));(d/'validation.json').write_text('{}');a=d/'episode-audio';a.mkdir();(a/'provenance.json').write_text(json.dumps({'id':'ignore','scenes':[]}));self.assertEqual([p.name for p,e in pkg.discover(Path(t))],['episode.json'])
 def test_stale_provenance_never_validates_video(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t)/'episode.json';p.write_text('{}');a=p.parent/'episode-audio';a.mkdir();(a/'voice.mp3').write_bytes(b'review');(a/'provenance.json').write_text(json.dumps({'request':{'text':'old script'}}));r=p.parent/'episode-review';r.mkdir();(r/'cut.mp4').write_bytes(b'review');(r/'verification.json').write_text('{"full_decode":"passed"}')
   m=pkg.media_status(p,{'script':'new script','voice':{}});self.assertEqual(m['status'],'STALE_AUDIO');self.assertFalse(m['audio_matches_current_script_and_voice'])
 def test_plan_without_mp4_is_not_video(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t)/'episode.json';p.write_text('{}');self.assertEqual(pkg.media_status(p,{'script':'text','voice':{}})['status'],'PLANNED')
 def test_failed_generation_is_reported_without_inventing_audio(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t)/'episode.json';p.write_text('{}');a=p.parent/'episode-audio';a.mkdir();(a/'generation-status.json').write_text('{"error":401}');m=pkg.media_status(p,{'script':'text','voice':{}});self.assertEqual(m['status'],'AUDIO_GENERATION_BLOCKED');self.assertFalse(m['audio_exists'])
 def test_upload_title_overrides_old_title_options(self):
  record={'media':{'status':'PLANNED'},'planned_seconds':56,'path':'2026-11-19/story.json'}
  episode={'title':'Internal title','upload_title':'New hook | GTA6 | 11.ai','title_options':['Old spoiler | 11.ai'],'thumbnail_headline':'TWO SEATS','description':'Public teaser.','tags':['GTA6'],'hook':'Hook'}
  copy=pkg.upload_copy('2026-11-19',[(record,episode)])
  self.assertIn('New hook | GTA6 | 11.ai',copy);self.assertNotIn('Old spoiler',copy)
if __name__=='__main__':unittest.main()
