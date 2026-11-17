"""growkaz-ifverse v3.1: set up <ep>/project (scenes copied from this style version + config). Run after build_voice.py.
Usage: python3 new_project.py <episode> 16:9|9:16 "<title>" """
import sys, os, json, shutil
EP, AS, TITLE = sys.argv[1], sys.argv[2], sys.argv[3]
P = os.path.join(EP, 'project'); lib = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../project/scenes')
if os.path.exists(P + '/scenes'): shutil.rmtree(P + '/scenes')
shutil.copytree(lib, P + '/scenes'); os.makedirs(P + '/story', exist_ok=True)
v = AS == '9:16'
json.dump({"title": TITLE, "aspect": AS, "resolution": "1080p", "fps": 24, "style": "ifs", "duration": 10, "captions": False, "bars": "none" if v else "wide",
           "fadeIn": .15 if v else .6, "fadeOut": .3 if v else 1.2, "music": {"enabled": True, "gainDb": -19}, "sfx": {"enabled": True, "gainDb": 0},
           "loudness": -14, "voiceover": "input/voiceover.wav", "myCaptions": True}, open(P + '/config.json', 'w'), indent=1)
print('project ready:', P)
