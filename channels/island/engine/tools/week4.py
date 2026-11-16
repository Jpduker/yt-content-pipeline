#!/usr/bin/env python3
"""Week 4 of The Keeper's Island — Chapter 4 "The Shadow in the Cave" (Shorts S43–S56, Mon 7 Dec → Sun 13 Dec 2026). Usage: week4.py <shorts_root>
New this week: the Shade (cast `shade`: the shadow Crane left on the cave wall, walking on its own; pose `cap` = its true shape),
props `ring` (shot.ringAt = [x, y, z, r]) and `lightsOut` (village lights die one by one), `farlight`, `printsAt`.
Fair-play answer of the chapter: A SHADOW ALWAYS FALLS AWAY FROM ITS LIGHT (S45/S46: it cannot cross light; S52: "give it nowhere
to fall"). Light it from every side at once and there is nowhere left for it to stand. Twist: it was never Crane's shadow —
Gus's grandfather sold it to Crane in 1926 (S47/S48); it came home to the family."""
import sys
from island_common import *
ROOT = sys.argv[1]
S = []
# ---------------------------------------------------------------- Mon 7 Dec
S.append(dict(code='S43', day='2026-12-07', slot=1, title='A shadow nobody owned', hook='Noon on the quay. Seven people. Eight shadows.',
  ask='A shadow with no owner. Where does it go when the sun goes down?', askLen=3.6, music={ 'mood': 'mystery' }, shots=[
  shot('quay', 'day', { 'type': 'stage', 'at': QZ, 'az': [-24, -12], 'd': [11, 10], 'h': [4.8, 4.5] }, { 'gus': { 'at': [7.6, 13.0], 'to': [8.8, 13.3], 'walk': [.3, 2.2], 'pose': 'walk', 'face': 'r', 'hero': 1, 'lit': 0 }, 'dunn': { 'at': [6.2, 12.6], 'pose': 'idle', 'face': 'r' }, 'marlo': { 'at': [5.2, 13.4], 'pose': 'idle', 'face': 'r' }, 'mabel': { 'at': [8.0, 13.8], 'pose': 'sit', 'face': 'r' } }, [
    L('n1', 'Monday. The quay was busy for the first time since the storm. Parcels, nets, gossip.'), L('n2', 'Gus counted people out of habit. Seven. Then he counted shadows.', pause=.6)], lead=1.0),
  shot('shade', 'day', { 'type': 'dive', 'at': [10.2, 1.0, 13.6], 'az': [-15, -8], 'd': [6.2, 5.8], 'h': [2.6, 2.4] }, { 'shade': { 'at': [11.0, 13.8], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [8.8, 13.3], 'pose': 'look', 'face': 'r', 'lit': 0 } }, [
    L('n3', 'Eight. The eighth had nobody standing over it.', pause=.5), L('n4', 'It stood on its own at the empty berth where the barge had been. Upright. Wearing a bowler hat.', pause=.9)], lead=.6),
  shot('gus', 'day', { 'type': 'stage', 'at': [8.8, .9, 13.3], 'az': [-34, -24], 'd': [6.6, 6.2], 'h': [3.0, 2.8] }, { 'gus': { 'at': [8.8, 13.3], 'pose': 'look', 'face': 'r', 'hero': 1, 'lit': 0 } }, [
    L('n5', 'Nobody else on the quay saw it. Or nobody else would say.', pause=.4), L('n6', 'When Gus looked again, the berth was empty, and the noon sun shone straight through where it had stood.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S44', day='2026-12-07', slot=2, title='The end of Wren’s story', hook='Old Wren told Gus the end of the story. The part she always skipped.',
  ask='Whose family sold the shadow? And why won’t Wren say the name?', askLen=3.6, music={ 'mood': 'dusk' }, shots=[
  shot('post', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [30, 20], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l', 'lit': 1 }, 'mabel': { 'at': [-3.2, 8.6], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'The post office smelled of candle wax and other people’s letters. Wren was waiting, as if she had heard.')], lead=1.0),
  shot('tale', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [18, 12], 'd': [8.6, 8.2], 'h': [4.0, 3.8] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'open', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-3.2, 8.6], 'pose': 'sit', 'face': 'l' } }, [
    L('d1', 'The man who sold his shadow sold it to a buyer in a pale suit. Your Mr Crane.', dlg='WREN', pause=.4),
    L('d2', 'And a shadow without its master does one thing, Gus. It goes home. To the family that sold it.', dlg='WREN', pause=.9)], lead=.6),
  shot('dark', 'night', { 'type': 'dive', 'at': [-4.4, 1.0, 8.2], 'az': [-70, -62], 'd': [5.6, 5.2], 'h': [2.4, 2.2] }, { 'gus': { 'at': [-4.4, 8.2], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [-3.2, 8.6], 'pose': 'sit', 'face': 'l' } }, [
    L('n2', 'Gus asked her the man’s name.', pause=.6), L('n3', 'Wren blew out the candle instead. Some names, she said, you only say in daylight.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Tue 8 Dec
S.append(dict(code='S45', day='2026-12-08', slot=1, title='The lights went out one by one', hook='Tuesday night, the lights of the village went out. One by one. Coming closer.',
  ask='It is waiting at the edge of your light. What do you do?', askLen=3.6, music={ 'mood': 'dread' }, shots=[
  shot('village', 'night', { 'type': 'map', 'from': [-34, 26, 40], 'to': [-30, 23, 34], 'look': [0, 2, 4], 'look2': [0, 3, -6], 'fov': 34, 'band': .5 }, {}, [
    L('n1', 'At midnight the window of the post office went dark. Then the harbour office. Then the lamp by the jetty.'),
    L('n2', 'Not blown out. Swallowed. As if something had walked past each one and taken the light with it.', pause=.6)], lightsOut=2.0, lead=1.0),
  shot('step', 'night', { 'type': 'stage', 'at': COT, 'az': [25, 15], 'd': [11, 10], 'h': [5, 4.6] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'up', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'r' }, 'rollo': { 'at': [-2.6, -13.2], 'pose': 'idle', 'face': 'r' } }, [
    L('n3', 'From the cottage step, Gus watched the dark come up the cliff path. Lamp by lamp. Toward him.'), L('n4', 'Mabel’s tail went thick as a rope.', pause=.8)], lightsOut=-30, lead=.6),
  shot('edge', 'night', { 'type': 'dive', 'at': [-.2, 5.0, -13.4], 'az': [10, 4], 'd': [5.6, 5.2], 'h': [2.4, 2.2] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'up', 'face': 'r', 'hero': 1, 'lit': .7 }, 'shade': { 'at': [.5, -12.7], 'pose': 'idle', 'face': 'l' } }, [
    L('n5', 'Then his own flame leaned away from the path, the way a candle leans from a cold door.', pause=.4),
    L('n6', 'Just beyond the light, something was standing. Waiting for it to go out.', pause=1.0)], lightsOut=-30, lead=.6, tail=1.0),
]))
S.append(dict(code='S46', day='2026-12-08', slot=2, title='A ring of lanterns', hook='It could not cross the light. So Gus built a wall of it.',
  ask='Twelve lanterns burn until four. Sunrise is at eight. Then what?', askLen=3.6, music={ 'mood': 'tense' }, shots=[
  shot('ring', 'night', { 'type': 'stage', 'at': COT, 'az': [30, 18], 'd': [12, 11], 'h': [6, 5.4] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'marlo': { 'at': [.4, -13.0], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-.4, -13.9], 'pose': 'sit', 'face': 'r' } }, [
    L('n1', 'Marlo had watched the lights die from the jetty, and run the whole cliff path with every lantern off the ferry.'),
    L('n2', 'Twelve lanterns, in a ring around the cottage, an arm’s length apart.', pause=.6)], ringAt=[-1, 4.3, -14, 3.6], lightsOut=-30, lead=1.0),
  shot('press', 'night', { 'type': 'dive', 'az': [-20, -12], 'd': [6.4, 6], 'h': [2.4, 2.2] }, { 'shade': { 'at': [2.8, -12.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [-1.2, -13.6], 'pose': 'look', 'face': 'r' } }, [
    L('n3', 'At the edge of the ring, the dark stopped. It pressed against the light, the way the sea presses against a wall.', pause=.4),
    L('n4', 'And in the dark, something smiled.', pause=1.0)], ringAt=[-1, 4.3, -14, 3.6], lightsOut=-30, lead=.6),
  shot('wait', 'night', { 'type': 'stage', 'at': COT, 'az': [10, 4], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'up', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [-.4, -13.9], 'pose': 'sit', 'face': 'r' }, 'marlo': { 'at': [.4, -13.0], 'pose': 'idle', 'face': 'l' } }, [
    L('n5', 'It could not come in. Not while the lanterns burned.', pause=.5), L('n6', 'Marlo checked the oil. She did not say how much was left. She did not have to.', pause=1.0)], ringAt=[-1, 4.3, -14, 3.6], lightsOut=-30, lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Wed 9 Dec
S.append(dict(code='S47', day='2026-12-09', slot=1, title='The last name in the ledger', hook='In daylight, Wren said the name. Gus had to sit down.',
  ask='If a shadow comes home to the family, who is left in the family but Gus?', askLen=3.8, music={ 'mood': 'day' }, shots=[
  shot('garden', 'day', { 'type': 'stage', 'at': [-6.5, 1.0, 8.2], 'az': [-25, -15], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'wren': { 'at': [-6.9, 8.4], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'gus': { 'at': [-4.6, 8.8], 'pose': 'idle', 'face': 'l', 'lit': 0 }, 'mabel': { 'at': [-3.6, 9.2], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'The lanterns held until a quarter to four. Then the dark went back into the rock, as if it had somewhere to be.'),
    L('n2', 'At noon, Wren opened the wreckers’ ledger at the very last page.', pause=.6)], lead=1.0),
  shot('truth', 'day', { 'type': 'dive', 'at': [-6.0, 1.0, 8.4], 'az': [-35, -28], 'd': [5.8, 5.4], 'h': [2.6, 2.4] }, { 'wren': { 'at': [-6.9, 8.4], 'pose': 'open', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.6, 8.8], 'pose': 'look', 'face': 'l', 'lit': 0 } }, [
    L('d1', 'Nineteen twenty-six. Sold, one shadow, to S. Crane, for four years of life at sea.', dlg='WREN', pause=.4),
    L('d2', 'Signed by the last of the wreckers. Your grandfather, Gus.', dlg='WREN', pause=1.0)], lead=.6),
  shot('gus', 'day', { 'type': 'stage', 'at': [-4.6, 1.0, 8.8], 'az': [-34, -24], 'd': [6.6, 6.2], 'h': [3.0, 2.8] }, { 'gus': { 'at': [-4.6, 8.8], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('n3', 'Gus had his grandfather’s watch. His grandfather’s cap. His grandfather’s name.', pause=.4),
    L('n4', 'He had never once asked what his grandfather had been.', pause=.6), L('n5', 'Now his grandfather’s shadow had come home, looking for family.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S48', day='2026-12-09', slot=2, title='What Dunn’s father saw', hook='Dunn’s father was harbour master in 1926. He kept a diary. Dunn kept it locked.',
  ask='Crane wore a stolen shadow for a hundred years. So where is his own?', askLen=3.8, music={ 'mood': 'mystery' }, shots=[
  shot('office', 'day', { 'type': 'stage', 'at': [9, 1.0, 12], 'az': [10, 0], 'd': [10.5, 10], 'h': [4.8, 4.5] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'to': [8.2, 12.5], 'walk': [.3, 1.8], 'pose': 'walk', 'face': 'r', 'lit': 0 } }, [
    L('n1', 'Dunn had heard the name from Wren before Gus reached the quay. He was waiting with a small black diary.')], lead=1.0),
  shot('diary', 'day', { 'type': 'dive', 'at': [9.0, 1.0, 12.3], 'az': [-12, -4], 'd': [6.0, 5.6], 'h': [2.5, 2.3], 'lookOff': [0, -.6, 0] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'point', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [8.2, 12.5], 'pose': 'idle', 'face': 'r', 'lit': 0 } }, [
    L('d1', 'My father wrote it down. Your grandfather walked off his sunk boat without a mark on him. And without a shadow.', dlg='DUNN', pause=.4),
    L('d2', 'Four years later, to the day, he walked back into the sea. My father said he was smiling.', dlg='DUNN', pause=1.0)], lead=.6),
  shot('gus', 'day', { 'type': 'stage', 'at': [8.2, .9, 12.5], 'az': [-34, -24], 'd': [6.6, 6.2], 'h': [3.0, 2.8] }, { 'gus': { 'at': [8.2, 12.5], 'pose': 'look', 'face': 'r', 'hero': 1, 'lit': 0 } }, [
    L('n2', 'Four years. The price his mother paid. The smile on the cave wall.', pause=.5),
    L('n3', 'It had never been Crane’s shadow at all. Crane had only been wearing it.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Thu 10 Dec
S.append(dict(code='S49', day='2026-12-10', slot=1, title='The empty wall', hook='Gus went back into the cave. The wall was empty. It had left its hat.',
  ask='Why would a shadow hide under water?', music={ 'mood': 'tense' }, shots=[
  shot('row', 'cave', { 'type': 'stage', 'az': [-172, -164], 'd': [6.6, 6.2], 'h': [3.6, 3.4] }, { 'marlo': { 'at': [-92.6, -86.6], 'pose': 'idle', 'face': 'l' }, 'gus': { 'at': [-94, -87.4], 'pose': 'up', 'face': 'l', 'hero': 1 } }, [
    L('n1', 'Thursday, low tide. Marlo rowed them in through the crack, oars shipped, the cave glowing green around them.'),
    L('n2', 'On the wall where the smile had been, there was only wet rock.', pause=.6)], lead=1.0),
  shot('wall', 'cave', { 'type': 'dive', 'az': [-62, -56], 'd': [5.4, 5], 'h': [2.4, 2.2] }, { 'rollo': { 'at': [-89.4, -92.6], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-90.6, -93.6], 'pose': 'look', 'face': 'r' } }, [
    L('n3', 'Rollo found the only thing it had left behind.', pause=.6)], lead=.6),
  shot('trail', 'cave', { 'type': 'dive', 'az': [55, 62], 'd': [5.4, 5], 'h': [3.8, 3.6] }, { 'rollo': { 'at': [-93.0, -91.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-91.8, -90.6], 'pose': 'fwd', 'face': 'l' } }, [
    L('n4', 'A dent in the sand, the shape of a bowler hat. And a long dark stain, as if something had been dragged toward the water.', pause=.5),
    L('n5', 'Toward the deep pool at the back of the cave. The one Mabel will not go near.', pause=1.0)], props=['prints'], printsAt=[-94.4, .45, -91.2], printsCol='#101418', lead=.6, tail=1.0),
]))
S.append(dict(code='S50', day='2026-12-10', slot=2, title='Mabel and the water', hook='Mabel has never touched sea water. Today she jumped in.',
  ask='It wanted the lantern, not Gus. What does a shadow want with light?', askLen=3.6, music={ 'mood': 'dread' }, shots=[
  shot('pool', 'cave', { 'type': 'stage', 'az': [-60, -45], 'd': [8, 7.6], 'h': [9.6, 9.2] }, { 'gus': { 'at': [-91.8, -90.6], 'pose': 'fwd', 'face': 'l', 'hero': 1 }, 'marlo': { 'at': [-90.4, -89.8], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-92.8, -89.6], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'Gus knelt at the pool with his lantern. Under the surface, something darker than the water turned over.'),
    L('n2', 'Then a hand made of nothing but shadow closed around the light, and pulled.', pause=.6)], events=[{ 't': 7.0, 'kind': 'splash' }], lead=1.0),
  shot('jump', 'cave', { 'type': 'dive', 'az': [55, 62], 'd': [5.4, 5], 'h': [3.8, 3.6] }, { 'gus': { 'at': [-91.8, -90.6], 'pose': 'fwd', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [-90.6, -89.6], 'to': [-92.2, -90.4], 'walk': [3.4, 4.2], 'pose': 'walk', 'face': 'l' } }, [
    L('n3', 'Gus went with it. Knees, then hands, then the cold.', pause=.4),
    L('n4', 'And Mabel, who sits down very fast for fish and fear, did neither. She jumped.', pause=.8)], events=[{ 't': 4.2, 'kind': 'splash' }], lead=.6),
  shot('out', 'cave', { 'type': 'stage', 'az': [-172, -164], 'd': [6.6, 6.2], 'h': [3.6, 3.4] }, { 'gus': { 'at': [-94, -87.4], 'pose': 'up', 'face': 'l', 'hero': 1, 'lit': .4 }, 'mabel': { 'at': [-93.0, -87.0], 'pose': 'sit', 'face': 'l' }, 'marlo': { 'at': [-92.6, -86.6], 'pose': 'idle', 'face': 'l' } }, [
    L('n5', 'She came up with her teeth in his collar and the lantern still lit, and hauled until Marlo could grab them both.', pause=.4),
    L('n6', 'But the flame it had touched had gone thin and pale, like a lamp seen through ice.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Fri 11 Dec
S.append(dict(code='S51', day='2026-12-11', slot=1, title='One shadow too many', hook='Pip counted every shadow on the island at noon. There was one too many.',
  ask='Two shadows. Which one is really his?', music={ 'mood': 'day' }, shots=[
  shot('fly', 'day', { 'type': 'stage', 'az': [-35, -25], 'd': [9, 8], 'h': [2.4, 2] }, { 'pip': { 'at': [-4, 6], 'to': [4, -8], 'pose': 'fly', 'y': 8, 'hero': 1, 'fly': 1 } }, [
    L('n1', 'Pip had a theory. Gulls usually do. At noon he would count every person on the island, and every shadow.'),
    L('n2', 'Two hundred and six people. Two hundred and seven shadows.', pause=.6)], lead=1.0),
  shot('path', 'day', { 'type': 'track', 'side': 'south', 'h': 5.6, 'd': 14, 'lead': 2.4 }, { 'gus': { 'at': [3, -11], 'to': [12.2, -12.6], 'walk': [.4, 7.5], 'pose': 'walk', 'face': 'r', 'hero': 1, 'lit': 0 }, 'shade': { 'at': [2.0, -11.7], 'to': [11.2, -13.3], 'walk': [.4, 7.5], 'pose': 'walk', 'face': 'r' } }, [
    L('n3', 'He found the extra one on the cliff path. It was walking beside Gus, step for step, close enough to hold his hand.', pause=.4),
    L('n4', 'Gus had two shadows now. One of them wore a hat.', pause=.8)], lead=.6),
  shot('report', 'day', { 'type': 'stage', 'at': [-1.2, 4.8, -13.4], 'az': [20, 12], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'pip': { 'at': [.6, -13.2], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-2.4, -13.2], 'pose': 'sit', 'face': 'r' } }, [
    L('n5', 'Pip told Gus. Gus did not turn around.', pause=.4),
    L('n6', 'He said he had felt it since the pool. Cold, on his left side, like standing too close to the sea.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S52', day='2026-12-11', slot=2, title='She came back to the jetty', hook='At midnight, the woman in the yellow coat came back. She had one thing to say.',
  ask='A shadow has to fall away from a light. How do you give it nowhere to fall?', askLen=3.8, music={ 'mood': 'mystery' }, shots=[
  shot('jetty', 'night', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [11, 10.4], 'h': [5, 4.8] }, { 'stranger': { 'at': [-2.6, 38.4], 'pose': 'idle', 'face': 'l', 'shadow': True }, 'gus': { 'at': [-3.4, 35.2], 'to': [-3.0, 36.8], 'walk': [.3, 2.6], 'pose': 'walk', 'face': 'r', 'hero': 1 } }, [
    L('n1', 'Gus had not seen his mother since the ferry came home. At midnight she was at the end of the jetty, facing the sea.'),
    L('n2', 'Her shadow lay on the boards beside her, small and ordinary. She seemed to be keeping an eye on it.', pause=.6)], lead=1.0),
  shot('warn', 'night', { 'type': 'dive', 'at': [-2.8, .6, 37.6], 'az': [-170, -176], 'd': [5.6, 5.2], 'h': [2.6, 2.4] }, { 'stranger': { 'at': [-2.6, 38.4], 'pose': 'idle', 'face': 'l', 'hero': 1, 'shadow': True }, 'gus': { 'at': [-3.0, 36.8], 'pose': 'idle', 'face': 'r' } }, [
    L('d1', 'It wants a keeper, Gus. It belonged to one once. It will take yours, and your light with it.', dlg='THE STRANGER', pause=.4),
    L('d2', 'A shadow must fall away from its light. Give it nowhere to fall.', dlg='THE STRANGER', pause=1.0)], lead=.6),
  shot('gone', 'night', { 'type': 'dive', 'at': [-3.0, .6, 36.8], 'az': [-20, -12], 'd': [5.6, 5.2], 'h': [2.6, 2.4] }, { 'gus': { 'at': [-3.0, 36.8], 'pose': 'look', 'face': 'r', 'hero': 1 } }, [
    L('n3', 'Then she stepped off the end of the jetty, and the sea closed over her like a door.', pause=.5),
    L('n4', 'Gus stood there while the lamp came round three times. Nowhere to fall.', pause=1.0)], events=[{ 't': 1.2, 'kind': 'splash' }], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Sat 12 Dec
S.append(dict(code='S53', day='2026-12-12', slot=1, title='Light from every side', hook='A shadow needs one dark side. They decided to take it away.',
  ask='Would you stand in the middle of the ring?', music={ 'mood': 'dusk' }, shots=[
  shot('board', 'dusk', mapc(**{ 'from': [-40, 34, 52], 'to': [-32, 28, 42], 'look': [16, 6, -30], 'fov': 34, 'band': .45 }), {}, [
    L('n1', 'Saturday at dusk, they worked it out on the back of a ferry timetable.'),
    L('n2', 'Every light throws a shadow on its far side. Light something from every side at once, and there is no far side left.', pause=.6)], lead=1.0),
  shot('path', 'dusk', { 'type': 'track', 'side': 'south', 'h': 5.4, 'd': 13.5, 'lead': 2.0 }, { 'gus': { 'at': [-1.5, -11], 'to': [6, -11.4], 'walk': [.4, 9], 'pose': 'walk', 'face': 'r', 'hero': 1 }, 'marlo': { 'at': [-3, -10.6], 'to': [4.5, -11], 'walk': [.5, 9], 'pose': 'walk', 'face': 'r' }, 'dunn': { 'at': [-4.2, -10.6], 'to': [3.2, -11], 'walk': [.6, 9.1], 'pose': 'walk', 'face': 'r' } }, [
    L('n3', 'The tower above. The under-lamp below. Twelve lanterns in a ring. Wren’s candle, Dunn’s harbour lamp, Marlo’s ferry lights.', pause=.4),
    L('n4', 'And Gus’s lantern in the middle. As bait.', pause=.8)], lead=.6),
  shot('door', 'dusk', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] }, { 'gus': { 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' } }, [
    L('n5', 'Wren asked who would stand in the middle when the dark came for its keeper.', pause=.4),
    L('n6', 'Gus said that was the job. It always had been.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S54', day='2026-12-12', slot=2, title='Nowhere to fall', hook='Three twelve. The old hour. Every light on the island was already burning.',
  ask='A shadow with nowhere to fall. What happens to it?', music={ 'mood': 'dread' }, shots=[
  shot('island', 'night', mapc(**{ 'from': [-50, 44, 70], 'to': [-44, 38, 60], 'look': [10, 5, -12], 'look2': [14, 6, -16], 'fov': 36, 'band': .45 }), {}, [
    L('n1', 'At three o’clock the island looked like a birthday cake. Every window, every lantern, the tower, the ferry, all burning at once.'),
    L('n2', 'At the foot of the tower, Gus stood alone in the ring, and waited.', pause=.6)], lamp='on', lead=1.0),
  shot('come', 'night', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [11, 10.4], 'h': [5.2, 4.8] }, { 'gus': { 'at': [21.0, -19.6], 'pose': 'up', 'face': 'r', 'hero': 1 }, 'shade': { 'at': [25.6, -16.8], 'to': [23.4, -18.2], 'walk': [.5, 5.0], 'pose': 'walk', 'face': 'l' } }, [
    L('n3', 'At three twelve, the dark came up out of the door in the rock and crossed the grass toward him.', pause=.4),
    L('n4', 'It reached the first lantern, and its edge went thin as paper.', pause=.8)], ringAt=[21.2, 9.2, -19.4, 3.2], lamp='on', lead=.6),
  shot('turn', 'night', { 'type': 'dive', 'at': [22.2, 9.8, -19.0], 'az': [55, 62], 'd': [6, 5.6], 'h': [2.4, 2.2] }, { 'shade': { 'at': [23.4, -18.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [21.0, -19.6], 'pose': 'up', 'face': 'r' } }, [
    L('n5', 'Light from the tower. Light from below. Light from every side.', pause=.4),
    L('n6', 'The shadow turned, and turned, looking for somewhere to fall. There was nowhere left.', pause=1.0)], ringAt=[21.2, 9.2, -19.4, 3.2], lamp='on', lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Sun 13 Dec
S.append(dict(code='S55', day='2026-12-13', slot=1, title='The keeper’s cap', hook='Cornered in the light, the shadow changed shape. Gus knew that shape.',
  ask='It was his grandfather all along. So who did Crane’s own shadow go to?', askLen=3.8, music={ 'mood': 'dusk' }, shots=[
  shot('shape', 'night', { 'type': 'dive', 'at': [22.2, 9.8, -19.0], 'az': [55, 62], 'd': [6, 5.6], 'h': [2.4, 2.2] }, { 'shade': { 'at': [22.6, -18.6], 'pose': 'cap', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [21.0, -19.6], 'pose': 'look', 'face': 'r' } }, [
    L('n1', 'In the middle of all that light, the bowler hat came apart like smoke.'),
    L('n2', 'What was left wore a flat cap with a peak. A keeper’s cap. The one hanging by Gus’s door.', pause=.8)], ringAt=[21.2, 9.2, -19.4, 3.2], lamp='on', lead=1.0),
  shot('name', 'night', { 'type': 'stage', 'at': [21.6, 9.8, -19.2], 'az': [30, 22], 'd': [7.6, 7.2], 'h': [3.2, 3.0] }, { 'gus': { 'at': [21.0, -19.6], 'pose': 'fwd', 'face': 'r', 'hero': 1 }, 'shade': { 'at': [22.6, -18.6], 'pose': 'cap', 'face': 'l' } }, [
    L('n3', 'Gus said the only word he could think of.', pause=.5), L('d1', 'Grandad.', dlg='GUS', pause=1.0),
    L('n4', 'The shadow knelt, the way a tired man kneels, and the smile went out of it.', pause=.8)], ringAt=[21.2, 9.2, -19.4, 3.2], lamp='on', lead=.6),
  shot('home', 'night', mapc(**{ 'from': [-30, 24, 30], 'to': [-26, 20, 22], 'look': [16, 4, -20], 'look2': [14, 3, -24], 'fov': 34, 'band': .45 }), {}, [
    L('n5', 'Then it slid down the steps, under the door in the rock, and away toward the sea. Not hunting. Going home.', pause=.4),
    L('n6', 'At four the lanterns burned out one by one, and there was nothing left in the dark to wait for them.', pause=1.0)], lamp='on', lead=.6, tail=1.0),
]))
S.append(dict(code='S56', day='2026-12-13', slot=2, title='Still writing', hook='Dawn on the north rocks. For the first time in a week, Gus had one shadow.',
  ask='Crane is gone. So who is still writing in his ledger?', music={ 'mood': 'mystery' }, shots=[
  shot('rocks', 'dawn', { 'type': 'orbit', 'at': [11.4, 1.0, -46.8], 'az': [-40, -15], 'd': [9, 8.2], 'h': [5, 4.6] }, { 'stranger': { 'at': [10.0, -44.4], 'pose': 'idle', 'face': 'r', 'shadow': True }, 'gus': { 'at': [11.8, -43.6], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('n1', 'Sunday at dawn, Gus walked out to the north rocks. She was there, the way he knew she would be.'),
    L('n2', 'Two people. Two shadows. He counted twice.', pause=.6)], props=['wreck'], lead=1.0),
  shot('talk', 'dawn', { 'type': 'dive', 'at': [10.9, 1.0, -44.0], 'az': [-35, -26], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'stranger': { 'at': [10.0, -44.4], 'pose': 'idle', 'face': 'r', 'shadow': True }, 'gus': { 'at': [11.8, -43.6], 'pose': 'idle', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('d1', 'Your grandfather sold his shadow to Crane. Crane must have sold his own to someone, long before.', dlg='THE STRANGER', pause=.4),
    L('d2', 'A man does not live a hundred years on one shadow, Gus.', dlg='THE STRANGER', pause=1.0)], props=['wreck'], lead=.6),
  shot('barge', 'day', { 'type': 'stage', 'at': [13.6, .9, 17.6], 'az': [-58, -50], 'd': [11, 10.4], 'h': [4.6, 4.4] }, { 'dunn': { 'at': [12.2, 15.6], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [11.0, 15.2], 'pose': 'look', 'face': 'r', 'lit': 0 } }, [
    L('n3', 'That morning Dunn found Crane’s grey barge drifting empty outside the harbour, and towed it in.', pause=.4),
    L('n4', 'In the wheelhouse, the ledger lay open at a new page. One line, in a thin sloping hand, the ink still wet.', pause=.6),
    L('n5', 'The Keeper’s Island. Payable to the bearer.', pause=1.2)], props=['barge'], lead=.6, tail=1.0),
]))
THUMB = {
 'S43': ('noon on a small stone quay, a tall pitch-black silhouette of a man in a bowler hat standing upright on its own with a faint pale smile, villagers not noticing, an old keeper in a sea-green coat staring', 'NO OWNER'),
 'S44': ('an old woman in a violet shawl and round spectacles blowing out a candle in a cosy post office at dusk, an old keeper leaning in to listen', 'SAY THE NAME'),
 'S45': ('night on a cliff path, village lights going dark one by one toward a small cottage, an old keeper holding up a lantern, a black silhouette with a faint smile at the edge of the light', "IT'S COMING"),
 'S46': ('a ring of twelve glowing lanterns on the grass around a small stone cottage at night, darkness pressing in at the edge, a smiling black silhouette outside the ring', "DON'T LET THEM GO OUT"),
 'S47': ('an old leather ledger open on a garden table in daylight, an old woman pointing at the last entry dated 1926, an old keeper with his hand over his mouth', '1926'),
 'S48': ('a harbour master in a black peaked cap and red muffler holding out an old black diary on a sunny quay, an old keeper in sea-green reading over his shoulder', 'MY FATHER SAW'),
 'S49': ('inside a green glowing sea cave, a tiny mouse beside a dent in the sand shaped like a bowler hat, a dark stain trailing into black water', 'IT LEFT THE HAT'),
 'S50': ('a grey cat leaping toward a dark glowing pool in a sea cave to grab an old keeper by the collar, a shadowy hand reaching up from the water toward his lantern', 'SHE JUMPED'),
 'S51': ('noon on a green cliff path, an old keeper in a sea-green coat walking with two shadows on the grass, one of them wearing a bowler hat, a seagull staring from above', 'ONE TOO MANY'),
 'S52': ('midnight at the end of a wooden jetty, a woman in a yellow hooded coat seen from behind facing the black sea, an old keeper with a lantern behind her', 'NOWHERE TO FALL'),
 'S53': ('dusk on a headland, villagers placing lanterns in a wide circle around a lighthouse, an old keeper standing in the centre holding his lantern', 'THE BAIT'),
 'S54': ('a lighthouse at night surrounded by a ring of lanterns, a black smiling silhouette trapped in the circle of light facing an old keeper', '3:12'),
 'S55': ("a black silhouette kneeling in a ring of lantern light at the foot of a lighthouse, its outline wearing a flat keeper's cap, an old keeper reaching out", 'GRANDAD?'),
 'S56': ("dawn on a stone quay, an empty grey barge towed in, inside its wheelhouse a ledger open at a fresh page with wet ink reading The Keeper's Island", 'STILL WRITING'),
}
write_week(S, THUMB, ROOT)
