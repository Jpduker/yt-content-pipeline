"""The Keeper's Island — the INTRO (meet the world before Chapter 1). Two videos, spoiler-free beyond the Chapter 1 premise:
  s00: a 9:16 Short (≈ 55 s) to post first and pin; ch00: a 16:9 welcome film (≈ 2.5 min) = channel trailer + first long-form.
Usage: intro.py <out_root>   (writes <out_root>/2026-11-16-s00-.../short.json and <out_root>/2026-11-16-ch00-.../short.json)"""
import sys, os, json
from island_common import *
ROOT = sys.argv[1]
def T(name, role, t=None, big=True, d=3.6): return { 'name': name, 'role': role, 't': t, 'big': big, 'd': d } if t is not None else { 'name': name, 'role': role, 'big': big, 'd': d }
def nt(**c):   # cast entries that should not trigger an automatic tag (the shot's own tags introduce them)
    for v in c.values(): v['tag'] = False
    return c
# ——————————————————————————— 16:9 welcome film
L_ = []
L_ += [shot('open', 'night', mapc(**{ 'from': [-70, 60, 96], 'to': [-50, 46, 70], 'look': [10, 4, -12], 'look2': [14, 8, -18], 'fov': 34 }), {}, [
    L('o1', 'Somewhere off the edge of the map, there is an island with one lighthouse, one keeper, and a lamp that has not missed a single night in thirty years.'),
    L('o2', 'Until now.', pause=1.0)], lamp='on', lead=1.6, tail=.6, mood='mystery')]
L_ += [shot('card', 'night', mapc(**{ 'from': [-60, 56, 84], 'to': [-58, 55, 82] }), {}, [], card={ 'label': 'WELCOME  TO', 'title': 'The Keeper’s Island' }, lamp='on', min=4.6, lead=0, tail=0, mood='mystery')]
# the places
L_ += [shot('p-light', 'dusk', CAM['door'], nt(gus={ 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 1 }), [
    L('p1', 'This is the lighthouse. Every night its lamp turns, and every ship that passes steers by it.', pause=.4)], tags=[T('THE LIGHTHOUSE', 'the only light between the ships and the rocks', .6)], lamp='on', lead=.8, mood='dusk'),
  shot('p-path', 'day', CAM['path'], nt(gus={ 'at': [-1.5, -11], 'to': [6, -11.4], 'walk': [.3, 8], 'pose': 'walk', 'face': 'r', 'hero': 1, 'lit': 0 }), [
    L('p2', 'A cliff path runs from the lighthouse past the keeper’s cottage, and down to the village.', pause=.3)], tags=[T('THE CLIFF PATH', 'and the keeper’s cottage', .6)], lead=.6, mood='day'),
  shot('p-village', 'day', CAM['post_day'], {}, [
    L('p3', 'The village. Two hundred people, one post office, and no secrets. Or so they think.', pause=.4)], tags=[T('THE VILLAGE', 'two hundred people, one post office', .6)], lead=.6, mood='day'),
  shot('p-harbour', 'day', CAM['quay_wide'], {}, [
    L('p4', 'The harbour, where the boats come in and the gossip goes out.', pause=.3)], tags=[T('THE HARBOUR', 'the quay, the harbour office and the jetty', .6)], lead=.6, mood='day'),
  shot('p-rocks', 'dusk', CAM['rocks'], {}, [
    L('p5', 'And the north rocks. Where ships go when the light fails.', pause=.9)], props=['wreck'], tags=[T('THE NORTH ROCKS', 'where ships go when the light fails', .6)], lead=.6, mood='dread')]
# the people
L_ += [shot('gus', 'day', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [36, 28], 'd': [8.4, 7.8], 'h': [4, 3.8] }, nt(gus={ 'at': DOOR, 'pose': 'idle', 'face': 'l', 'hero': 1, 'lit': 0 }, mabel={ 'at': DOOR_M, 'pose': 'sit', 'face': 'l' }), [
    L('g1', 'Gus has kept this lamp for thirty years. He is sixty, stubborn and kind, and he has never once let it go dark.'),
    L('g2', 'He talks to his cat. She does not talk back. Mostly.', pause=.5)], tags=[T('GUS', 'the lighthouse keeper', .7)], tagsSeen=['gus'], lead=.8, mood='day'),
  shot('mabel', 'day', { 'type': 'dive', 'at': [22.5, 9.6, -20.0], 'az': [30, 24], 'd': [4.6, 4.2], 'h': [2.0, 1.8] }, nt(mabel={ 'at': DOOR_M, 'pose': 'sit', 'face': 'l', 'hero': 1 }, gus={ 'at': DOOR, 'pose': 'idle', 'face': 'l', 'lit': 0 }), [
    L('m1', 'Mabel is that cat. She sleeps nineteen hours a day, and in the other five she notices everything.'),
    L('m2', 'If Mabel suddenly sits down, pay attention. She only does that for two things. Fish, and fear.', pause=.6)], tags=[T('MABEL', 'his cat · the real detective', .7)], tagsSeen=['mabel', 'gus'], lead=.6, mood='day'),
  shot('pip', 'day', CAM['gull_follow'], nt(pip={ 'at': [-4, 6], 'to': [6, -6], 'pose': 'fly', 'y': 8, 'hero': 1, 'fly': 1 }), [
    L('i1', 'Pip is a gull, and a show-off. From up there he sees every boat, every footprint, and every fib on the island.', pause=.4)], tags=[T('PIP', 'a gull who sees everything', .7)], tagsSeen=['pip'], lead=.6, mood='day'),
  shot('rollo', 'day', { 'type': 'dive', 'at': [20.6, 9.6, -19.9], 'az': [30, 24], 'd': [4.2, 3.9], 'h': [1.8, 1.6] }, nt(rollo={ 'at': [20.4, -19.8], 'pose': 'idle', 'face': 'r', 'hero': 1 }, gus={ 'at': DOOR, 'pose': 'idle', 'face': 'l', 'lit': 0 }, mabel={ 'at': DOOR_M, 'pose': 'sit', 'face': 'l' }), [
    L('r1', 'Rollo is a mouse. Mostly hungry, sometimes brave, and small enough to get into places nobody else can.', pause=.4)], tags=[T('ROLLO', 'a very hungry mouse', .7)], tagsSeen=['rollo', 'gus'], lead=.6, mood='day'),
  shot('wren', 'day', CAM['post_day'], nt(wren={ 'at': [-6.9, 8.4], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }), [
    L('w1', 'Old Wren runs the post office. She has run it for fifty years, and she knows every old story this island would rather forget.', pause=.4)], tags=[T('OLD WREN', 'the postmistress · keeper of old tales', .7)], tagsSeen=['wren'], lead=.6, mood='day'),
  shot('dunn', 'day', { 'type': 'stage', 'at': [9, 1.0, 12], 'az': [10, 0], 'd': [10, 9.4], 'h': [4.6, 4.4] }, nt(dunn={ 'at': [9.6, 12.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }), [
    L('d1', 'Dunn is the harbour master. He runs this harbour by the book, and he does not trust Gus. Not one bit.', pause=.4)], tags=[T('DUNN', 'the harbour master', .7)], tagsSeen=['dunn'], lead=.6, mood='day'),
  shot('marlo', 'day', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [10, 9.4], 'h': [4.6, 4.4] }, nt(marlo={ 'at': [-2.6, 36.4], 'pose': 'idle', 'face': 'l', 'hero': 1 }), [
    L('a1', 'And Marlo, twenty-two, pilots the ferry to the mainland. Nobody on the council listens to her. They should.', pause=.5)], tags=[T('MARLO', 'the ferry pilot', .7)], tagsSeen=['marlo'], lead=.6, mood='day')]
# the mystery
L_ += [shot('stranger', 'night', CAM['rocks'], nt(stranger={ 'at': [10.0, -44.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }), [
    L('s1', 'And then there is someone nobody on the island has met. Someone in a yellow coat, who comes up out of the sea at night.'),
    L('s2', 'Who she is, and what she wants, is the mystery.', pause=1.0)], props=['wreck'], tags=[T('THE STRANGER', 'who is she?', 1.0)], tagsSeen=['stranger'], lead=.8, mood='dread'),
  shot('how', 'dusk', CAM['island_map'], {}, [
    L('h1', 'Every day, two short pieces of the story. Every Sunday, the whole chapter, with scenes you have not seen.'),
    L('h2', 'Every clue is on screen before it matters. When the story says pause, pause. See if you can solve it before Gus does.', pause=.6)], lead=.6, mood='mystery'),
  shot('start', 'night', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] }, { 'gus': { 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' } }, [
    L('e1', 'It starts tonight. At twelve minutes past three.', pause=.4), L('e2', 'When the lamp goes dark.', pause=1.2)], lamp='on', lead=.6, tail=.4, mood='dread'),
  shot('title', 'night', mapc(**{ 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38 }), {}, [],
       title={ 'title': 'THE KEEPER’S ISLAND', 'tag': 'Chapter I · Twelve Seconds of Dark — starts now', 'credit': 'Original story, characters and music · Voices: Kokoro TTS' }, lamp='on', min=7.5, lead=0, tail=0, mood='mystery')]
LONG = { 'code': 'CH00', 'title': 'Welcome to the Keeper’s Island', 'label': None, 'hook': None, 'ask': None, 'music': { 'mood': 'mystery' }, 'shots': L_ }
# ——————————————————————————— 9:16 Short
SH = dict(code='S00', day='2026-11-16', slot=0, title='Welcome to the Keeper’s Island', hook='One island. One lamp. And the people who live in its light.',
  ask='Starting tonight: who is the woman in the yellow coat?', askLen=3.6, music={ 'mood': 'mystery' }, shots=[
  shot('map', 'night', mapc(**{ 'from': [-58, 54, 82], 'to': [-46, 44, 64] }), {}, [
    L('n1', 'This is the Keeper’s Island. One lighthouse, two hundred people, and a lamp that has not missed a night in thirty years.', pause=.4)], lamp='on', lead=1.0),
  shot('home', 'day', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [36, 28], 'd': [9, 8.4], 'h': [4.4, 4.2] }, { 'gus': { 'at': DOOR, 'pose': 'idle', 'face': 'l', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' }, 'rollo': { 'at': [20.4, -19.8], 'pose': 'idle', 'face': 'r' } }, [
    L('n2', 'Gus keeps the lamp. Mabel, his cat, keeps an eye on Gus.', pause=.3), L('n3', 'And Rollo, the mouse, keeps an eye on the sandwiches.', pause=.5)], lead=.6),
  shot('quay', 'day', CAM['quay_wide'], { 'dunn': { 'at': [9.8, 13.1], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'wren': { 'at': [8.6, 12.9], 'pose': 'idle', 'face': 'r', 'lit': 0 }, 'marlo': { 'at': [11.0, 13.5], 'pose': 'idle', 'face': 'l' }, 'pip': { 'at': [10.4, 14.6], 'pose': 'fly', 'y': 2.0, 'fly': 1 } }, [
    L('n4', 'Dunn runs the harbour. Old Wren knows every old story. Marlo pilots the ferry. And Pip, the gull, sees everything.', pause=.5)], lead=.6),
  shot('rocks', 'night', CAM['rocks'], { 'stranger': { 'at': [10.0, -44.4], 'pose': 'idle', 'face': 'r', 'hero': 1 } }, [
    L('n5', 'And someone in a yellow coat has started coming up out of the sea.', pause=1.0)], props=['wreck'], lead=.6, tail=1.0),
])
SH['thumb'] = 'a tiny island at night seen from above, a white lighthouse beam sweeping, a village, a harbour, a keeper with a lantern and a grey cat at the lighthouse door'; SH['thumbText'] = 'MEET THE ISLAND'
SH['label'] = "THE KEEPER'S ISLAND"
for name, data in [('2026-11-16-s00-welcome-to-the-keepers-island', SH), ('2026-11-16-ch00-welcome-to-the-keepers-island', LONG)]:
    os.makedirs(os.path.join(ROOT, name, 'voices'), exist_ok=True); json.dump(data, open(os.path.join(ROOT, name, 'short.json'), 'w'), indent=1, ensure_ascii=False); print(os.path.join(ROOT, name))
