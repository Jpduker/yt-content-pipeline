#!/usr/bin/env python3
"""Week 2 of The Keeper's Island — Chapter 2 "The Tunnel" (Shorts S15–S28, Mon 23 → Sun 29 Nov 2026). Usage: week2.py <shorts_root>
New this week: the sea-cave set (world.js CAVE), the under-lamp, Marlo the ferry pilot, the Stranger speaks once, a ship in the storm.
Fair-play answer of the chapter: LEADING LIGHTS — two lights that line up mark a safe channel; someone built a second, lower light
and moved the line onto the north rocks. When the top lamp goes dark for twelve seconds, ships steer by the low light alone."""
import json, os, sys
ROOT = sys.argv[1]
CX, CZ = -95, -95
def C(x, z): return [CX + x, CZ + z]
def CA(x, y, z): return [CX + x, y, CZ + z]
DOOR = [21.4, -20.4]; DOOR_M = [22.5, -20.0]; HATCH = [12.6, -12.9]; HATCH_M = [11.4, -12.4]
def L(id, text, **k): d = { 'id': id, 'text': text }; d.update(k); return d
def shot(id, time, cam, cast=None, lines=None, **k):
    d = { 'id': id, 'time': time, 'cam': cam, 'cast': cast or {}, 'lines': lines or [] }; d.update(k); return d
CAVECAM = lambda at, az, d=(8, 7.4), h=(9, 8.6): { 'type': 'stage', 'az': list(az), 'd': list(d), 'h': list(h) }   # cave shots follow the hero (the ring walls are tall)
S = []
# ---------------------------------------------------------------- Mon 23
S.append(dict(code='S15', day='2026-11-23', slot=1, title='Under the lighthouse there is a harbour', hook='Gus walked into the dark. The stairs kept going down.',
  ask='A harbour no map shows. Who has been sailing in here?', music={ 'mood': 'dread' }, shots=[
  shot('hatch', 'night', { 'type': 'stage', 'at': [13.6, 5.2, -14.4], 'az': [-24, -14], 'd': [8.5, 8], 'h': [3.8, 3.6] }, { 'gus': { 'at': HATCH, 'to': [13.4, -13.6], 'walk': [.5, 3.2], 'pose': 'up', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': HATCH_M, 'to': [12.4, -13.0], 'walk': [.8, 3.4], 'pose': 'walk', 'face': 'l' } }, [
    L('n1', 'Mabel went first. Cats do not wait for permission.'), L('n2', 'Gus relit his lantern with a shaking match and followed her down.', pause=.6)], lead=1.0),
  shot('stairs', 'cave', CAVECAM(CA(-7, 1.5, -5), (-60, -40), (8, 7.5), (9.5, 9)), { 'gus': { 'at': C(-8.4, -6.2), 'to': C(-6.4, -4.2), 'walk': [.4, 4.0], 'pose': 'up', 'face': 'r', 'hero': 1, 'y': 3.2 }, 'mabel': { 'at': C(-7, -4.8), 'pose': 'sit', 'face': 'r' } }, [
    L('n3', 'Ninety-one steps. He counted every one.'), L('n4', 'At the bottom the tunnel opened, and the lantern light fell away into a space far too big to be inside an island.', pause=.6)], under=None, lead=.8),
  shot('cave', 'cave', CAVECAM(CA(0, .4, 1), (-20, 10), (8, 7.6), (10, 9.4)), { 'gus': { 'at': C(-5.6, -3.4), 'pose': 'up', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': C(-4.6, -2.8), 'pose': 'sit', 'face': 'r' } }, [
    L('n5', 'Water, glowing green. A beach of black sand. Crates, rope, a jetty of old wood.', pause=.4), L('n6', 'A harbour. Under the lighthouse. And the sand was full of fresh footprints.', pause=.9)], props=[], lead=.6, tail=1.0),
]))
S.append(dict(code='S16', day='2026-11-23', slot=2, title='A second lamp under the first', hook='Someone built a lighthouse under the lighthouse.',
  ask='Why would anyone need a second lamp… pointed at the rocks?', music={ 'mood': 'mystery' }, shots=[
  shot('plinth', 'cave', CAVECAM(CA(2.5, .8, -2), (10, 30), (7, 6.4), (8.4, 8)), { 'gus': { 'at': C(-.5, -1.6), 'to': C(1.4, -2.0), 'walk': [.3, 2.6], 'pose': 'up', 'face': 'r', 'hero': 1 } }, [
    L('n1', 'On a stone block at the water’s edge stood something Gus knew better than his own face.'), L('n2', 'A lamp. Brass, lens, wick. A keeper’s lamp, smaller and older than his own.', pause=.6)], lead=1.0),
  shot('touch', 'cave', { 'type': 'dive', 'at': CA(2.2, .8, -2.2), 'az': [35, 45], 'd': [6.5, 6], 'h': [4.6, 4.4] }, { 'gus': { 'at': C(1.4, -2.0), 'pose': 'fwd', 'face': 'r', 'hero': 1 } }, [
    L('n3', 'He laid his hand on the glass.', pause=.4), L('n4', 'It was warm.', pause=1.2), L('n5', 'Somebody had lit this lamp tonight, while the real one was dark.', pause=.4)], lead=.6),
  shot('crack', 'cave', CAVECAM(CA(4, .6, 2), (-40, -55), (8, 7.6), (9.4, 9)), { 'gus': { 'at': C(1.4, -2.0), 'pose': 'look', 'face': 'r', 'hero': 1 } }, [
    L('n6', 'And its lens was not pointed at the sky. It faced a crack in the rock, a slit that opened onto the sea…', pause=.5), L('n7', 'straight at the north rocks.', pause=1.0)], under=0.2, lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Tue 24
S.append(dict(code='S17', day='2026-11-24', slot=1, title='Pip finds the slit in the cliff', hook='From the sea, the cliff has an eye. Only gulls had ever seen it.',
  ask='Two lights, one high, one low. Which one would you steer by?', music={ 'mood': 'day' }, shots=[
  shot('fly', 'day', { 'type': 'stage', 'az': [-35, -25], 'd': [9, 8], 'h': [2.4, 2] }, { 'pip': { 'at': [-2, -26], 'to': [12, -42], 'pose': 'fly', 'y': 8, 'hero': 1, 'fly': 1 } }, [
    L('n1', 'At sunrise Pip was sent out with one job. Find where that light comes out.'), L('n2', 'He circled the north cliff eleven times, mostly to be admired.', pause=.6)], lead=1.0),
  shot('cliff', 'day', { 'type': 'stage', 'at': [12, 1.5, -44], 'az': [-150, -135], 'd': [14, 12.5], 'h': [5.5, 5] }, { 'pip': { 'at': [10.5, -42.5], 'pose': 'idle', 'face': 'r', 'hero': 1 } }, [
    L('n3', 'On the twelfth, he saw it. A slit in the rock just above the waterline, black, the width of a door.', pause=.4),
    L('n4', 'From out at sea, a light in there would sit low and steady. Right below the lighthouse.', pause=.8)], props=['wreck'], lead=.8),
  shot('report', 'day', { 'type': 'stage', 'at': [-1.2, 4.8, -13.4], 'az': [20, 12], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'pip': { 'at': [.6, -13.2], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-2.4, -13.2], 'pose': 'sit', 'face': 'r' } }, [
    L('n5', 'Gus went very quiet. Every keeper knows what two lights, one above the other, mean to a sailor.', pause=.5), L('n6', 'They mean: line us up, and you are safe.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S18', day='2026-11-24', slot=2, title='The wreckers’ light', hook='A hundred years ago, this island lived on shipwrecks.',
  ask='Whose name would you expect in a wrecker’s ledger?', music={ 'mood': 'dusk' }, shots=[
  shot('post', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [30, 20], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l' } }, [
    L('n1', 'Old Wren did not look surprised. She looked like someone who had been waiting sixty years for this visit.')], lead=1.0),
  shot('tale', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [16, 10], 'd': [8.6, 8.2], 'h': [4.0, 3.8] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'open', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l' } }, [
    L('d1', 'Before the tower, this island had wreckers. A false light on a stormy night, and the sea brought them a ship.', dlg='WREN'),
    L('d2', 'They kept a ledger of every wreck. And every name that lit the lamp.', dlg='WREN', pause=.6)], lead=.6),
  shot('book', 'night', { 'type': 'dive', 'at': [-5.8, 1.0, 7.8], 'az': [-15, -10], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'look', 'face': 'l', 'hero': 1 } }, [
    L('n2', 'She opened it at the last page. One line, sixty years old, in careful, familiar handwriting.', pause=.5), L('n3', 'It was his grandfather’s.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Wed 25
S.append(dict(code='S19', day='2026-11-25', slot=1, title='Waiting in the dark harbour', hook='This time, they would be waiting when the lamp went out.',
  ask='Someone just walked out of the sea. Would you stay hidden?', music={ 'mood': 'tense' }, shots=[
  shot('hide', 'cave', CAVECAM(CA(-4, .6, -5), (-20, -10), (7.6, 7.2), (9, 8.6)), { 'gus': { 'at': C(-4.6, -5.2), 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': .25 }, 'mabel': { 'at': C(-5.4, -4.6), 'pose': 'sit', 'face': 'r' }, 'rollo': { 'at': C(-3.6, -5.6), 'pose': 'idle', 'face': 'r' } }, [
    L('n1', 'Three o’clock. Gus, Mabel, and Rollo, who had insisted, crouched behind the crates.'), L('n2', 'The lantern was turned down to a bead. Nobody breathed loudly. Rollo had brought snacks.', pause=.8)], lead=1.0),
  shot('water', 'cave', CAVECAM(CA(0, -.6, 6), (10, 25), (8, 7.4), (8.6, 8.2)), { 'stranger': { 'at': C(1.0, 9.2), 'to': C(1.2, 5.0), 'walk': [2.0, 6.0], 'pose': 'walk', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'Three eleven. The water moved.', pause=1.0), L('n4', 'Something rose out of it. A hood. Shoulders. A yellow coat, streaming wet, walking up the shelf as if the sea were a staircase.', pause=.4)],
    events=[{ 't': 2.0, 'kind': 'splash' }], lead=.6),
  shot('light', 'cave', CAVECAM(CA(2.5, .8, -2), (-30, -40), (7.4, 7), (8.8, 8.4)), { 'stranger': { 'at': C(2.2, -.6), 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': C(-4.6, -5.2), 'pose': 'look', 'face': 'r', 'lit': .25 } }, [
    L('n5', 'Three twelve. Far above, the real lamp went dark.', pause=.6), L('n6', 'And down here, the stranger lit the other one.', pause=1.0)], under=6.2, events=[{ 't': 6.2, 'kind': 'match' }], lead=.6, tail=1.0),
]))
S.append(dict(code='S20', day='2026-11-25', slot=2, title='Rollo sneezes', hook='Twelve seconds of silence. Rollo lasted nine.',
  ask='A locket with Gus’s face… as a baby. Who keeps that?', music={ 'mood': 'tense' }, shots=[
  shot('wait', 'cave', CAVECAM(CA(-1, .6, -3.5), (-15, -5), (8, 7.6), (9.2, 8.8)), { 'stranger': { 'at': C(2.2, -.6), 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': C(-4.6, -5.2), 'pose': 'look', 'face': 'r', 'hero': 1, 'lit': .25 }, 'rollo': { 'at': C(-3.6, -5.6), 'pose': 'idle', 'face': 'r' } }, [
    L('n1', 'The stranger stood by the lamp and counted. Gus could see the hood move. One. Two. Three.'), L('n2', 'Nine seconds in, Rollo sneezed.', pause=1.2)], under='on', lead=1.0),
  shot('turn', 'cave', { 'type': 'dive', 'az': [-80, -90], 'd': [7, 6.4], 'h': [3.6, 3.4] }, { 'stranger': { 'at': C(2.2, -.6), 'to': C(1.6, 6.5), 'walk': [1.6, 5.0], 'pose': 'walk', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'The hood turned. Not toward the noise. Toward Gus. As if the stranger had known all along exactly where he was.', pause=.4),
    L('n4', 'Then a splash, a ring of green light on the water, and nothing.', pause=.6)], under='on', events=[{ 't': 5.0, 'kind': 'splash' }], lead=.6),
  shot('sand', 'cave', { 'type': 'dive', 'at': CA(1.6, .4, 4.2), 'az': [-20, -12], 'd': [5.4, 5], 'h': [3.8, 3.6] }, { 'rollo': { 'at': C(1.0, 3.8), 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': C(-.2, 3.0), 'pose': 'fwd', 'face': 'r' } }, [
    L('n5', 'Rollo, ashamed, ran to the waterline to make up for it. He came back dragging something on a chain.', pause=.4),
    L('n6', 'A silver locket. Inside, a tiny painted face Gus had only ever seen in his mother’s photographs.', pause=.4), L('n7', 'His own. As a baby.', pause=1.0)], under='on', lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Thu 26
S.append(dict(code='S21', day='2026-11-26', slot=1, title='The boat that belonged to nobody', hook='The wrecked boat had a name. Dunn had been hiding it.',
  ask='A boat named for a keeper, crewed by nobody. What was it carrying?', music={ 'mood': 'mystery' }, shots=[
  shot('office', 'day', { 'type': 'stage', 'at': [9, 1.0, 12], 'az': [-10, 0], 'd': [10.5, 10], 'h': [4.8, 4.5] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'pose': 'idle', 'face': 'r', 'lit': 0 } }, [
    L('n1', 'Gus put the locket on Dunn’s desk and said nothing. It worked better than shouting.'), L('n2', 'Dunn sighed, unlocked a drawer, and took out the wrecked boat’s registry plate.', pause=.6)], lead=1.0),
  shot('plate', 'day', { 'type': 'dive', 'at': [8.6, 1.0, 12.4], 'az': [-5, 2], 'd': [5.6, 5.2], 'h': [2.5, 2.3] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'point', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'pose': 'look', 'face': 'r', 'lit': 0 } }, [
    L('d1', 'No owner. No port. No crew. Just a name painted on the bow.', dlg='DUNN'), L('d2', 'She was called the Keeper’s Daughter.', dlg='DUNN', pause=1.0)], lead=.6),
  shot('rocks', 'day', { 'type': 'orbit', 'at': [13, 1.2, -45], 'az': [-140, -115], 'd': [15, 13], 'h': [6.5, 5.8] }, { 'pip': { 'at': [14.5, -47], 'pose': 'idle', 'face': 'l' } }, [
    L('n3', 'Gus never had a sister. His mother was the keeper’s only daughter.', pause=.5), L('n4', 'And she was lost at sea the night he was born.', pause=1.0)], props=['wreck'], lead=.6, tail=1.0),
]))
S.append(dict(code='S22', day='2026-11-26', slot=2, title='Marlo saw two lights', hook='The ferry pilot saw the wreck happen. Nobody asked her.',
  ask='Which light was lying? The high one, or the low one?', music={ 'mood': 'dusk' }, shots=[
  shot('jetty', 'dusk', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [11, 10.4], 'h': [5, 4.8] }, { 'marlo': { 'at': [-2.4, 37.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [-3.4, 34.6], 'to': [-3.2, 36.2], 'walk': [.3, 2.4], 'pose': 'walk', 'face': 'r', 'lit': 1 } }, [
    L('n1', 'Marlo runs the ferry. She is twenty-two, she has crossed this water four thousand times, and nobody on the council has ever asked her a thing.')], lead=1.0),
  shot('talk', 'dusk', { 'type': 'dive', 'at': [-2.8, .6, 36.8], 'az': [-170, -175], 'd': [5.6, 5.2], 'h': [2.6, 2.4] }, { 'marlo': { 'at': [-2.4, 37.2], 'pose': 'wave', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [-3.2, 36.2], 'pose': 'idle', 'face': 'r' } }, [
    L('d1', 'That night I was out late. I saw the lamp go dark. Twelve seconds. Then I saw the other one.', dlg='MARLO'),
    L('d2', 'Low, by the water. Steady. And that boat turned toward it like it had been told to.', dlg='MARLO', pause=.8)], lead=.6),
  shot('map', 'night', { 'type': 'map', 'from': [-40, 34, 52], 'to': [-30, 28, 40], 'look': [14, 6, -24], 'look2': [16, 8, -30], 'fov': 34, 'band': .45 }, {}, [
    L('n2', 'Two lights. One high, one low. Gus closed his eyes and saw the whole thing at once.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Fri 27
S.append(dict(code='S23', day='2026-11-27', slot=1, title='Leading lights', hook='Sailors have trusted this trick for three hundred years. Someone turned it into a trap.',
  ask='Now you know how. But who would wreck a ship named for her own family?', askLen=3.8, music={ 'mood': 'mystery' }, shots=[
  shot('board', 'day', { 'type': 'map', 'from': [-40, 34, 52], 'to': [-32, 28, 42], 'look': [16, 6, -34], 'fov': 34, 'band': .45 }, {}, [
    L('n1', 'Here is the trick. A ship coming home lines up two lights, one behind and above the other.'),
    L('n2', 'When the high light sits right on top of the low one, you are in the safe channel. Every sailor knows it.', pause=.5)], props=['wreck'], lead=1.0),
  shot('trap', 'day', { 'type': 'map', 'from': [40, 26, -70], 'to': [34, 22, -62], 'look': [16, 6, -30], 'look2': [18, 8, -28], 'fov': 34, 'band': .5 }, {}, [
    L('n3', 'But move the low light, and the safe line moves with it. Put it in the cliff, and the line runs straight onto the north rocks.', pause=.4),
    L('n4', 'And if the high lamp goes dark for twelve seconds, a sailor has only one light left to trust.', pause=.8)], props=['wreck'], lead=.6),
  shot('gus', 'day', { 'type': 'stage', 'at': [21.4, 9.8, -20.4], 'az': [40, 30], 'd': [10, 9.4], 'h': [5, 4.6] }, { 'gus': { 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' } }, [
    L('n5', 'Whoever did this was no wrecker. Only a keeper knows the lamp that well.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S24', day='2026-11-27', slot=2, title='The second key', hook='The under-lamp has a lock. Only a keeper’s key fits it.',
  ask='Sixty years in a safe, and gone the week the wrecks began. Who took it?', askLen=3.8, music={ 'mood': 'tense' }, shots=[
  shot('lock', 'cave', { 'type': 'dive', 'at': CA(2.4, .8, -2.2), 'az': [30, 38], 'd': [6.2, 5.8], 'h': [4.6, 4.4] }, { 'gus': { 'at': C(1.4, -2.0), 'pose': 'fwd', 'face': 'r', 'hero': 1 } }, [
    L('n1', 'Back in the cave, Gus tried his own lamp key in the old brass door. It turned like it had been waiting.'), L('n2', 'Two locks. Two keys. One for the lamp above, one for the lamp below.', pause=.6)], events=[{ 't': 2.8, 'kind': 'lock' }], lead=1.0),
  shot('post', 'night', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [24, 16], 'd': [9.4, 9], 'h': [4.4, 4.2] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'The second key, said the island, had always lived in the post office safe.', pause=.4), L('n4', 'Wren opened the safe without being asked.', pause=.8)], lead=.6),
  shot('empty', 'night', { 'type': 'dive', 'at': [-6.2, 1.0, 7.6], 'az': [8, 2], 'd': [5.4, 5], 'h': [2.5, 2.3] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'open', 'face': 'r', 'hero': 1 } }, [
    L('n5', 'Empty. A clean square in the dust where a key had lain for sixty years.', pause=.4), L('d1', 'I know who has it, Gus. I gave it to her myself.', dlg='WREN', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Sat 28
S.append(dict(code='S25', day='2026-11-28', slot=1, title='Wren’s promise', hook='Wren kept one secret for sixty years. Today she broke her promise.',
  ask='If your mother were alive, and lighting false lamps… what would you do?', askLen=3.8, music={ 'mood': 'dusk' }, shots=[
  shot('garden', 'day', { 'type': 'stage', 'at': [-6.5, 1.0, 8.2], 'az': [-25, -15], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'wren': { 'at': [-6.9, 8.4], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'gus': { 'at': [-4.6, 8.8], 'pose': 'idle', 'face': 'l', 'lit': 0 }, 'mabel': { 'at': [-3.6, 9.2], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'They sat in the sun outside the post office, and for a long time Wren just held the locket.')], lead=1.0),
  shot('truth', 'day', { 'type': 'dive', 'at': [-6.0, 1.0, 8.4], 'az': [-35, -28], 'd': [5.8, 5.4], 'h': [2.6, 2.4] }, { 'wren': { 'at': [-6.9, 8.4], 'pose': 'open', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.6, 8.8], 'pose': 'look', 'face': 'l', 'lit': 0 } }, [
    L('d1', 'The night you were born, a ship hit the rocks. Your mother rowed out to it alone. She never came back.', dlg='WREN'),
    L('d2', 'Except she did, Gus. This autumn. She came to my door in a yellow coat, and asked me for the key.', dlg='WREN', pause=.8)], lead=.6),
  shot('gus', 'day', { 'type': 'stage', 'at': [-4.6, 1.0, 8.8], 'az': [-34, -24], 'd': [6.6, 6.2], 'h': [3.0, 2.8] }, { 'gus': { 'at': [-4.6, 8.8], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('n2', 'Gus had spent his whole life keeping a light for a mother he thought the sea had taken.', pause=.5), L('n3', 'The sea had given her back. And she had come home to put the light out.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S26', day='2026-11-28', slot=2, title='A ship in the storm', hook='Storm. Three o’clock. A real ship this time, with people on it.',
  ask='Douse the false light, or relight the true one? He can only reach one in time.', askLen=3.8, music={ 'mood': 'tense' }, shots=[
  shot('ship', 'storm', { 'type': 'map', 'from': [-56, 52, 80], 'to': [-48, 46, 66], 'look': [16, 4, -36], 'look2': [18, 5, -40] }, {}, [
    L('n1', 'The storm came in at midnight. At three, through the rain, a ship’s lights. A real ferry, full of passengers, coming home.'),
    L('n2', 'At three eleven, Gus watched the top lamp flicker.', pause=.6)], props=['ship'], lamp={ 'flicker': 9.4, 'len': .9 }, events=[{ 't': 3.0, 'kind': 'flash' }, { 't': 6.5, 'kind': 'horn' }], weather='rain', lead=1.0),
  shot('run', 'storm', { 'type': 'track', 'side': 'south', 'h': 5.6, 'd': 13.5, 'lead': 2.4 }, { 'gus': { 'at': [3, -11], 'to': [12.2, -12.6], 'walk': [.2, 5.0], 'pose': 'walk', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [1.6, -10.6], 'to': [10.8, -12.2], 'walk': [.3, 5.2], 'pose': 'walk', 'face': 'r' } }, [
    L('n3', 'He could run up ninety-one steps to the tower, or down ninety-one steps to the cave.', pause=.4), L('n4', 'Twelve seconds. One staircase.', pause=.8)], lamp='off', events=[{ 't': 1.6, 'kind': 'flash' }], weather='rain', lead=.6),
  shot('hatch', 'storm', { 'type': 'dive', 'at': [13.6, 5.0, -14.4], 'az': [-14, -8], 'd': [5, 4.6], 'h': [2.6, 2.4] }, { 'gus': { 'at': [13.4, -13.6], 'pose': 'up', 'face': 'l', 'hero': 1 } }, [
    L('n5', 'He chose down.', pause=1.2)], lamp='off', events=[{ 't': .6, 'kind': 'flash' }, { 't': 2.0, 'kind': 'creak' }], weather='rain', lead=.6, tail=1.2),
]))
# ---------------------------------------------------------------- Sun 29
S.append(dict(code='S27', day='2026-11-29', slot=1, title='The keeper and the stranger', hook='Mother and son, a hand apart, and a lamp between them.',
  ask='She called him "little one". After sixty years. Would you forgive her?', askLen=3.8, music={ 'mood': 'dread' }, shots=[
  shot('face', 'cave', CAVECAM(CA(1.6, .8, -1.6), (-25, -15), (7.4, 7), (8.8, 8.4)), { 'stranger': { 'at': C(2.4, -.8), 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': C(-.6, -1.2), 'to': C(.8, -1.6), 'walk': [.4, 2.4], 'pose': 'up', 'face': 'r' } }, [
    L('n1', 'She was there, by the low lamp, hand on the shutter, watching the ship come on through the crack.'),
    L('n2', 'Gus did not shout. He set his lantern down on the sand.', pause=.6)], under='on', lead=1.0),
  shot('speak', 'cave', { 'type': 'dive', 'at': CA(1.6, .8, -1.4), 'az': [-150, -158], 'd': [6, 5.6], 'h': [4.4, 4.2] }, { 'stranger': { 'at': C(2.4, -.8), 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': C(.8, -1.6), 'pose': 'fwd', 'face': 'r', 'hero': 1 } }, [
    L('d1', 'You kept it lit, little one. Sixty years. I watched you every night.', dlg='THE STRANGER'),
    L('d2', 'The sea has my debt. A ship for every year it gave me. Four ships. Then I am free.', dlg='THE STRANGER', pause=.6)], under='on', lead=.6),
  shot('douse', 'cave', CAVECAM(CA(2, .8, -1.6), (-40, -55), (7.6, 7.4), (9, 8.8)), { 'stranger': { 'at': C(2.4, -.8), 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': C(1.6, -2.2), 'pose': 'up', 'face': 'r', 'hero': 1 } }, [
    L('n3', 'Gus put his hand on the hot shutter, next to hers.', pause=.4), L('n4', 'Then the man who has never let a light go out, closed one.', pause=1.0)], under='on', events=[{ 't': 7.0, 'kind': 'thump' }], lead=.6, tail=1.2),
]))
S.append(dict(code='S28', day='2026-11-29', slot=2, title='The coat on the rocks', hook='The ferry made it home. By morning, the stranger was gone.',
  ask='Four marks, four ships. One is still owed. Who pays it?', askLen=3.6, music={ 'mood': 'dusk' }, shots=[
  shot('ferry', 'dawn', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [12, 11], 'h': [5.4, 5] }, { 'marlo': { 'at': [-2.4, 37.2], 'pose': 'wave', 'face': 'l', 'hero': 1 }, 'dunn': { 'at': [-3.2, 34.4], 'pose': 'idle', 'face': 'r' } }, [
    L('n1', 'Thirty-one passengers walked off the ferry at dawn and never knew how close they had come.'), L('n2', 'Marlo knew. She waved at the lighthouse until her arm hurt.', pause=.6)], lead=1.0),
  shot('coat', 'dawn', { 'type': 'orbit', 'at': [11.4, 1.0, -46.8], 'az': [-40, -10], 'd': [9, 8], 'h': [5, 4.6] }, { 'gus': { 'at': [12.6, -45.6], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [13.6, -45.2], 'pose': 'sit', 'face': 'l' } }, [
    L('n3', 'On the north rocks, Gus found the yellow coat, folded neatly, a stone on top so the wind would not take it.', pause=.4),
    L('n4', 'Under the stone, the brass key. And a fourth mark, freshly burned into the rock.', pause=.8)], props=['wreck', 'coat'], lead=.6),
  shot('end', 'dawn', { 'type': 'map', 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38, 'band': .45 }, {}, [
    L('n5', 'Four marks. Three ships. The sea was still owed one.', pause=.6), L('n6', 'And Gus had just taken away the only person who knew how to pay it.', pause=1.0)], lead=.8, tail=1.2),
]))
for s in S:
    slug = s['title'].lower()
    for ch in '’…,.:"?\'': slug = slug.replace(ch, '')
    folder = os.path.join(ROOT, f"{s['day']}-{s['code'].lower()}-{slug.replace(' ', '-')[:40].rstrip('-')}")
    s['label'] = f"THE KEEPER'S ISLAND · {int(s['code'][1:])}"
    os.makedirs(os.path.join(folder, 'voices'), exist_ok=True)
    json.dump(s, open(os.path.join(folder, 'short.json'), 'w'), indent=1, ensure_ascii=False); print(folder)
