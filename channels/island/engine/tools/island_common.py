"""Shared helpers for weekN.py / chapterN.py (The Keeper's Island). Start a new week with:  from island_common import *
Coordinates and the camera presets below are PROVEN in QA stills (weeks 1–4); reuse them before inventing new angles."""
import json, os
CX, CZ = -95, -95                                   # the sea-cave set (its own ring of rock, far from the island)
def C(x, z): return [CX + x, CZ + z]
def CA(x, y, z): return [CX + x, y, CZ + z]
DOOR = [21.4, -20.4]; DOOR_M = [22.5, -20.0]; HATCH = [12.6, -12.9]; HATCH_M = [11.4, -12.4]
Q = [7.6, .9, 13]; QZ = [9.5, .9, 13.4]; COT = [-1, 4.8, -14]
def L(id, text, **k): d = { 'id': id, 'text': text }; d.update(k); return d
def shot(id, time, cam, cast=None, lines=None, **k):
    d = { 'id': id, 'time': time, 'cam': cam, 'cast': cast or {}, 'lines': lines or [] }; d.update(k); return d
def mapc(**k): d = { 'type': 'map', 'from': [-58, 54, 82], 'to': [-50, 48, 70], 'look': [8, 4, -10], 'look2': [12, 6, -14] }; d.update(k); return d
# —— proven cameras (copy, then tweak az/d/h a little) ——
CAM = {
 'quay_wide':   { 'type': 'stage', 'at': QZ, 'az': [-24, -12], 'd': [11, 10], 'h': [4.8, 4.5] },
 'quay_close':  { 'type': 'dive', 'at': [10.2, 1.0, 13.6], 'az': [-15, -8], 'd': [6.2, 5.8], 'h': [2.6, 2.4] },
 'post_dusk':   { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [30, 20], 'd': [10, 9.4], 'h': [4.6, 4.3] },
 'post_day':    { 'type': 'stage', 'at': [-6.5, 1.0, 8.2], 'az': [-25, -15], 'd': [10, 9.4], 'h': [4.6, 4.3] },
 'cottage':     { 'type': 'stage', 'at': COT, 'az': [25, 15], 'd': [11, 10], 'h': [5, 4.6] },
 'path':        { 'type': 'track', 'side': 'south', 'h': 5.6, 'd': 14, 'lead': 2.4 },
 'door':        { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] },
 'jetty':       { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [11, 10.4], 'h': [5, 4.8] },
 'rocks':       { 'type': 'orbit', 'at': [11.4, 1.0, -46.8], 'az': [-40, -15], 'd': [9, 8.2], 'h': [5, 4.6] },   # stand at (10.0,-44.4)/(11.8,-43.6): in FRONT of the wreck
 'cave_out':    { 'type': 'stage', 'az': [-172, -164], 'd': [6.6, 6.2], 'h': [3.6, 3.4] },   # hero near (-94,-87.4); from the cave centre outward
 'cave_close':  { 'type': 'dive', 'az': [55, 62], 'd': [5.4, 5], 'h': [3.8, 3.6] },          # hero near (-91.8,-90.6), away from the foghorn
 'cave_wide':   { 'type': 'stage', 'az': [-60, -45], 'd': [8, 7.6], 'h': [9.6, 9.2] },
 'cave_wall':   { 'type': 'stage', 'at': [-86.6, 2.2, -90.6], 'az': [-66, -60], 'd': [12.8, 11.8], 'h': [1.5, 1.3], 'aper': 60 },
 'island_map':  mapc(**{ 'from': [-40, 34, 52], 'to': [-32, 28, 42], 'look': [16, 6, -30], 'fov': 34, 'band': .45 }),
 'gull_follow': { 'type': 'stage', 'az': [-35, -25], 'd': [9, 8], 'h': [2.4, 2] },             # follows a flying hero (Pip, y 8–9)
}
# AVOID (QA): 'top' cameras (blur/empty), stage az 150–170 at the quay or cliff (inside walls), people next to the cave foghorn (-97.5,-93.5).
def write_week(S, THUMB, root):
    for s in S: s['thumb'], s['thumbText'] = THUMB[s['code']]
    for s in S:
        slug = s['title'].lower()
        for ch in '’…,.:"?\'': slug = slug.replace(ch, '')
        folder = os.path.join(root, f"{s['day']}-{s['code'].lower()}-{slug.replace(' ', '-')[:40].rstrip('-')}")
        s['label'] = f"THE KEEPER'S ISLAND · {int(s['code'][1:])}"
        os.makedirs(os.path.join(folder, 'voices'), exist_ok=True)
        json.dump(s, open(os.path.join(folder, 'short.json'), 'w'), indent=1, ensure_ascii=False); print(folder)
