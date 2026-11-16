#!/usr/bin/env python3
"""Week 3 of The Keeper's Island — Chapter 3 "The Fourth Ship" (Shorts S29–S42, Mon 30 Nov → Sun 6 Dec 2026). Usage: week3.py <shorts_root>
New this week: Silas Crane (salvage merchant), his grey barge (prop `barge`), the contract, the Lantern ferry; the Stranger regains her shadow (cast `shadow: True`).
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
Q = [7.6, .9, 13]   # quay
def mapc(**k): d = { 'type': 'map', 'from': [-58, 54, 82], 'to': [-50, 48, 70], 'look': [8, 4, -10], 'look2': [12, 6, -14] }; d.update(k); return d
# ---------------------------------------------------------------- Mon 30 Nov
S.append(dict(code='S29', day='2026-11-30', slot=1, title='A grey ship in the harbour', hook='The morning after the storm, a ship nobody had called sailed into the harbour.',
  ask='How does a stranger know about a mark burned in a rock last night?', music={ 'mood': 'mystery' }, shots=[
  shot('rocks', 'dawn', { 'type': 'orbit', 'at': [11.4, 1.0, -46.8], 'az': [-30, -5], 'd': [9, 8.4], 'h': [5, 4.6] }, { 'gus': { 'at': [12.6, -45.6], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('n1', 'Gus left the yellow coat where he found it, folded, with the stone on top. In case she came back for it.'), L('n2', 'He kept the key.', pause=.6)], props=['wreck', 'coat'], lead=1.0),
  shot('barge', 'day', { 'type': 'stage', 'at': [13, .9, 17], 'az': [-40, -25], 'd': [15, 13.5], 'h': [6.5, 6] }, { 'crane': { 'at': [11.4, 13.8], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'dunn': { 'at': [8.6, 13.2], 'pose': 'idle', 'face': 'r' } }, [
    L('n3', 'By nine, a grey salvage barge was tied up at the quay. No flag. No port painted on the stern.'), L('n4', 'A man in a pale suit stepped off it as if he owned the stones he walked on.', pause=.6)], props=['barge'], lead=.8),
  shot('dunn', 'day', { 'type': 'dive', 'at': [10, 1.0, 13.5], 'az': [-10, -4], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'crane': { 'at': [11.4, 13.8], 'pose': 'offer', 'face': 'l', 'hero': 1 }, 'dunn': { 'at': [8.6, 13.2], 'pose': 'idle', 'face': 'r' } }, [
    L('d1', 'Silas Crane. Salvage. I am looking for the keeper.', dlg='CRANE', pause=.4), L('d2', 'Tell him I have come about the fourth mark.', dlg='CRANE', pause=1.0)], props=['barge'], lead=.6, tail=1.0),
]))
S.append(dict(code='S30', day='2026-11-30', slot=2, title='The man in the pale suit', hook='Silas Crane made Gus an offer. He already knew the answer.',
  ask='"Your mother’s debt." Who told him?', music={ 'mood': 'tense' }, shots=[
  shot('meet', 'day', { 'type': 'stage', 'at': [9.5, .9, 13.4], 'az': [-20, -8], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'crane': { 'at': [11.0, 13.8], 'pose': 'idle', 'face': 'l' }, 'gus': { 'at': [8.4, 13.2], 'to': [9.4, 13.4], 'walk': [.2, 2.0], 'pose': 'walk', 'face': 'r', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [7.6, 13.6], 'pose': 'sit', 'face': 'r' } }, [
    L('n1', 'Gus came down to the quay with Mabel. Mabel took one look at the man and sat down very fast.')], props=['barge'], lead=1.0),
  shot('offer', 'day', { 'type': 'dive', 'at': [10.2, 1.0, 13.6], 'az': [-15, -8], 'd': [5.8, 5.4], 'h': [2.6, 2.4] }, { 'crane': { 'at': [11.0, 13.8], 'pose': 'offer', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [9.4, 13.4], 'pose': 'idle', 'face': 'r', 'lit': 0 } }, [
    L('d1', 'I buy what the sea leaves behind. Your rocks have been generous lately.', dlg='CRANE'),
    L('d2', 'Sell me the salvage rights, keeper, and I will forget your mother’s debt.', dlg='CRANE', pause=1.0)], props=['barge'], lead=.6),
  shot('gus', 'day', { 'type': 'stage', 'at': [9.4, .9, 13.4], 'az': [-34, -24], 'd': [6.6, 6.2], 'h': [3.0, 2.8] }, { 'gus': { 'at': [9.4, 13.4], 'pose': 'look', 'face': 'r', 'hero': 1, 'lit': 0 } }, [
    L('n2', 'Nobody on the island knew about the debt. Nobody but Gus, a cat, a mouse…', pause=.4), L('n3', 'and the woman who had walked back into the sea.', pause=1.0)], props=['barge'], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Tue 1 Dec
S.append(dict(code='S31', day='2026-12-01', slot=1, title='Pip spies on the barge', hook='Gulls are not allowed on the barge. Pip took that personally.',
  ask='The same horn, above the water and below it. Who has been calling whom?', music={ 'mood': 'day' }, shots=[
  shot('fly', 'day', { 'type': 'top', 'h': [15, 13], 'fov': 42 }, { 'pip': { 'at': [-4, 6], 'to': [14, 19], 'pose': 'fly', 'y': 12, 'hero': 1, 'fly': 1 } }, [
    L('n1', 'Pip circled the barge four times before anyone noticed. Nobody ever notices gulls.'), L('n2', 'On the fifth pass, he landed on the wheelhouse.', pause=.6)], props=['barge'], lead=1.0),
  shot('deck', 'day', { 'type': 'stage', 'at': [15, .6, 18.5], 'az': [-60, -45], 'd': [11, 10], 'h': [5.5, 5] }, { 'pip': { 'at': [15.4, 17.6], 'pose': 'idle', 'face': 'l', 'hero': 1, 'y': 1.6 } }, [
    L('n3', 'Bolted to the roof was a brass horn. Old. Green at the seams.', pause=.4), L('n4', 'Exactly like the one in the cave under the lighthouse.', pause=1.0)], props=['barge'], lead=.6),
  shot('report', 'day', { 'type': 'stage', 'at': [-1.2, 4.8, -13.4], 'az': [20, 12], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'pip': { 'at': [.6, -13.2], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-2.4, -13.2], 'pose': 'sit', 'face': 'r' } }, [
    L('n5', 'The horn under the island never needed a ship. It needed someone at sea to answer it.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S32', day='2026-12-01', slot=2, title='Wren’s drawing from 1926', hook='Wren keeps a drawing of the man who bought a shadow. It is a hundred years old.',
  ask='Same suit, same face, a hundred years apart. What is Silas Crane?', music={ 'mood': 'dusk' }, shots=[
  shot('post', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [30, 20], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l' } }, [
    L('n1', 'When Gus said the name Crane, Old Wren went to the back room and came out with a frame, face down.')], lead=1.0),
  shot('tale', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [16, 10], 'd': [8.6, 8.2], 'h': [4.0, 3.8] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'open', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l' } }, [
    L('d1', 'The man who sold his shadow did not sell it to the sea, Gus. He sold it to a buyer. My grandmother drew him.', dlg='WREN'),
    L('d2', 'Pale suit. Black hat. A silver cane. Nineteen twenty-six.', dlg='WREN', pause=.8)], lead=.6),
  shot('frame', 'night', { 'type': 'dive', 'at': [-5.8, 1.0, 7.8], 'az': [-15, -10], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'look', 'face': 'l', 'hero': 1 } }, [
    L('n2', 'She turned the frame over.', pause=1.0), L('n3', 'The man in the drawing was smiling the same thin smile Gus had seen on the quay that morning.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Wed 2 Dec
S.append(dict(code='S33', day='2026-12-02', slot=1, title='Through the crack by sea', hook='There is a second way into the cave. Only a ferry pilot would know it.',
  ask='Fresh fin-prints, after the stranger was gone. Who else swims into that cave?', music={ 'mood': 'tense' }, shots=[
  shot('jetty', 'night', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [11, 10.4], 'h': [5, 4.8] }, { 'marlo': { 'at': [-2.4, 37.6], 'pose': 'wave', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [-3.4, 35.2], 'to': [-3.0, 37.0], 'walk': [.3, 2.4], 'pose': 'walk', 'face': 'r' } }, [
    L('n1', 'Marlo had been thinking about the crack in the cliff since Pip found it.'), L('n2', 'At low tide, she said, a small boat fits through. She had done it at sixteen, on a dare.', pause=.6)], lead=1.0),
  shot('cave', 'cave', { 'type': 'stage', 'az': [-172, -164], 'd': [6.6, 6.2], 'h': [3.6, 3.4] }, { 'marlo': { 'at': [-92.6, -86.6], 'pose': 'idle', 'face': 'l' }, 'gus': { 'at': [-94, -87.4], 'pose': 'up', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'They came in under the rock, oars shipped, the cave glowing green around them.'), L('n4', 'The under-lamp was cold. The foghorn was cold. But the sand…', pause=.6)], lead=.6),
  shot('prints', 'cave', { 'type': 'dive', 'az': [-30, -24], 'd': [6, 5.6], 'h': [4.6, 4.4] }, { 'gus': { 'at': [-95.4, -90.4], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'marlo': { 'at': [-94, -89.6], 'pose': 'idle', 'face': 'l' } }, [
    L('n5', 'Fin-prints. Dozens. Walking up from the water to the horn, and back.', pause=.5), L('n6', 'Made since the storm. Since she left.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S34', day='2026-12-02', slot=2, title='The contract in the sand', hook='Rollo found paper in the cave. Rollo cannot read. Gus can.',
  ask='The debt was never owed to the sea. So who is Silas Crane collecting for?', askLen=3.8, music={ 'mood': 'dread' }, shots=[
  shot('rollo', 'cave', { 'type': 'dive', 'az': [55, 62], 'd': [5.4, 5], 'h': [3.8, 3.6] }, { 'rollo': { 'at': [-93.0, -91.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-91.8, -90.6], 'pose': 'fwd', 'face': 'l' } }, [
    L('n1', 'Rollo had come along in Gus’s coat pocket, uninvited. He found the paper wedged under a crate, and tried to eat it.'), L('n2', 'Gus got it back. Mostly.', pause=.6)], lead=1.0),
  shot('read', 'cave', { 'type': 'dive', 'az': [62, 70], 'd': [5.8, 5.4], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-91.8, -90.6], 'pose': 'fwd', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'Old paper, salt-stained. Four ships for four years of life. Payable to the bearer.', pause=.5),
    L('n4', 'Signed with an M. Witnessed in a thin, sloping hand: S. Crane.', pause=1.0)], lead=.6),
  shot('wide', 'cave', { 'type': 'stage', 'az': [-60, -45], 'd': [8, 7.6], 'h': [9.6, 9.2] }, { 'gus': { 'at': [-91.8, -90.6], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'marlo': { 'at': [-90.4, -89.8], 'pose': 'idle', 'face': 'l' }, 'rollo': { 'at': [-93.0, -91.4], 'pose': 'idle', 'face': 'r' } }, [
    L('n5', 'Payable to the bearer. Whoever holds the paper is owed the ships.', pause=.4), L('n6', 'And the bearer had just sailed into their harbour.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Thu 3 Dec
S.append(dict(code='S35', day='2026-12-03', slot=1, title='Dunn’s confession', hook='Dunn hid the boat’s name for a reason. Today he told it.',
  ask='Which ship is the fourth? Look at who is sailing this weekend.', music={ 'mood': 'mystery' }, shots=[
  shot('office', 'day', { 'type': 'stage', 'at': [9, 1.0, 12], 'az': [-10, 0], 'd': [10.5, 10], 'h': [4.8, 4.5] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'pose': 'idle', 'face': 'r', 'lit': 0 } }, [
    L('n1', 'Gus put the contract on Dunn’s desk, next to the locket. Dunn looked at the signature and sat down.')], lead=1.0),
  shot('confess', 'day', { 'type': 'dive', 'at': [8.6, 1.0, 12.4], 'az': [-5, 2], 'd': [5.6, 5.2], 'h': [2.5, 2.3] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'point', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'pose': 'look', 'face': 'r', 'lit': 0 } }, [
    L('d1', 'Crane came to me thirty years ago. Money, to look away when a wreck washed up. I was young. I took it.', dlg='DUNN'),
    L('d2', 'He wrote to me last week. Saturday, he said. Don’t stand in the way of Saturday.', dlg='DUNN', pause=.8)], lead=.6),
  shot('board', 'day', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [11, 10.4], 'h': [5, 4.8] }, { 'marlo': { 'at': [-2.4, 37.6], 'pose': 'idle', 'face': 'l', 'hero': 1 } }, [
    L('n2', 'Saturday, one boat leaves the island. The winter ferry, full, carrying everyone’s Christmas home from the mainland.', pause=.4),
    L('n3', 'Marlo’s ferry. Her name is the Lantern.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S36', day='2026-12-03', slot=2, title='The council sides with Crane', hook='Crane brought a paper to the council. The council loves paper.',
  ask='Mabel never wanders off. So where is she?', music={ 'mood': 'dusk' }, shots=[
  shot('quay', 'dusk', { 'type': 'stage', 'at': [9, .9, 13.2], 'az': [-15, -5], 'd': [13, 12], 'h': [5.8, 5.4] }, { 'crane': { 'at': [11.2, 13.8], 'pose': 'offer', 'face': 'l', 'hero': 1 }, 'dunn': { 'at': [9.2, 13.0], 'pose': 'idle', 'face': 'r' }, 'wren': { 'at': [7.2, 13.4], 'pose': 'idle', 'face': 'r' }, 'gus': { 'at': [5.6, 13.0], 'pose': 'idle', 'face': 'r', 'lit': 1 } }, [
    L('n1', 'At dusk Crane addressed the council on the quay, with documents, stamps and a very good pen.'),
    L('n2', 'Salvage rights, he said. A small fee. And the keeper should rest, after such a hard month.', pause=.6)], props=['barge'], lead=1.0),
  shot('vote', 'dusk', { 'type': 'dive', 'at': [10.4, 1.0, 13.6], 'az': [-10, -4], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'crane': { 'at': [11.2, 13.8], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'dunn': { 'at': [9.2, 13.0], 'pose': 'idle', 'face': 'r' } }, [
    L('d1', 'All in favour. Thank you. Keeper, the council thanks you for your service.', dlg='CRANE', pause=.8)], props=['barge'], lead=.6),
  shot('cottage', 'night', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [10, 4], 'd': [9.5, 9], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'rollo': { 'at': [-2.6, -13.2], 'pose': 'idle', 'face': 'r' } }, [
    L('n3', 'Gus walked home without a word. He set down two bowls by the door, as he had every night for eleven years.', pause=.5),
    L('n4', 'Only one was eaten. Mabel had not come home.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Fri 4 Dec
S.append(dict(code='S37', day='2026-12-04', slot=1, title='Mabel on the barge', hook='Pip found Mabel. She was not lost. She was working.',
  ask='Three names crossed out. Will the fourth be?', music={ 'mood': 'tense' }, shots=[
  shot('fly', 'night', { 'type': 'stage', 'at': [14, 2.4, 19], 'az': [-50, -40], 'd': [10, 9], 'h': [3.6, 3.2] }, { 'pip': { 'at': [13.2, 17.6], 'pose': 'fly', 'y': 2.4, 'hero': 1, 'fly': 1 } }, [
    L('n1', 'Pip searched all night. At four in the morning he found her, on the one deck on the island no cat should be on.')], props=['barge'], lead=1.0),
  shot('deck', 'night', { 'type': 'stage', 'at': [15, .6, 18.5], 'az': [-60, -45], 'd': [10, 9.4], 'h': [5.5, 5] }, { 'mabel': { 'at': [15.2, 18.4], 'pose': 'sit', 'face': 'l', 'hero': 1, 'y': .8 }, 'gus': { 'at': [11.6, 14.4], 'to': [12.8, 15.4], 'walk': [.4, 2.6], 'pose': 'walk', 'face': 'r' } }, [
    L('n2', 'Mabel was sitting on Crane’s desk, in the wheelhouse, on top of a ledger. She would not move.', pause=.4), L('n3', 'So Gus read what she was sitting on.', pause=.8)], props=['barge'], lead=.6),
  shot('ledger', 'night', { 'type': 'dive', 'at': [12.8, 1.0, 15.4], 'az': [-20, -14], 'd': [5.6, 5.2], 'h': [2.6, 2.4] }, { 'gus': { 'at': [12.8, 15.4], 'pose': 'fwd', 'face': 'r', 'hero': 1 } }, [
    L('n4', 'Four ships. The Keeper’s Daughter, crossed out. The Saltgrass, crossed out. The Wenna Grey, crossed out.', pause=.5),
    L('n5', 'And the fourth, not yet. The Lantern. Saturday. Three twelve.', pause=1.0)], props=['barge'], lead=.6, tail=1.0),
]))
S.append(dict(code='S38', day='2026-12-04', slot=2, title='The stolen key', hook='Marlo would not cancel the ferry. And the key was gone.',
  ask='Crane has both keys now. How do you stop a light you cannot reach?', askLen=3.8, music={ 'mood': 'dread' }, shots=[
  shot('jetty', 'dusk', { 'type': 'dive', 'at': [-2.8, .6, 36.8], 'az': [-170, -175], 'd': [5.6, 5.2], 'h': [2.6, 2.4] }, { 'marlo': { 'at': [-2.4, 37.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [-3.2, 36.2], 'pose': 'idle', 'face': 'r' } }, [
    L('d1', 'Forty families are waiting on that boat, Gus. If I don’t sail, Crane just waits for the next one.', dlg='MARLO'),
    L('d2', 'So we don’t stop the ferry. We stop him.', dlg='MARLO', pause=.8)], lead=1.0),
  shot('cottage', 'night', { 'type': 'stage', 'at': [-1.4, 4.8, -14.6], 'az': [25, 15], 'd': [9, 8.6], 'h': [4.4, 4.2] }, { 'gus': { 'at': [-1.6, -14.4], 'pose': 'up', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [-.2, -14.0], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'Gus came home to a broken window and a drawer pulled out onto the floor.'), L('n2', 'The coat was still on its hook. The locket was still in his pocket.', pause=.6)], lead=.6),
  shot('drawer', 'night', { 'type': 'dive', 'at': [-1.6, 4.8, -14.4], 'az': [15, 22], 'd': [5.4, 5], 'h': [2.4, 2.2] }, { 'gus': { 'at': [-1.6, -14.4], 'pose': 'look', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'Only one thing was missing.', pause=1.0), L('n4', 'The brass key to the lamp below.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Sat 5 Dec
S.append(dict(code='S39', day='2026-12-05', slot=1, title='The plan', hook='Two lights wreck a ship. Two lights can also bring one home.',
  ask='Would you trust a lamp you didn’t light yourself?', askLen=3.6, music={ 'mood': 'day' }, shots=[
  shot('board', 'day', { 'type': 'track', 'side': 'south', 'h': 5.0, 'd': 12.5, 'lead': .6 }, { 'gus': { 'at': [0, -11], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'marlo': { 'at': [1.3, -10.6], 'pose': 'idle', 'face': 'l' }, 'wren': { 'at': [-1.3, -10.8], 'pose': 'idle', 'face': 'r' }, 'dunn': { 'at': [2.6, -11.2], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [.6, -11.7], 'pose': 'sit', 'face': 'r' }, 'rollo': { 'at': [-.5, -11.8], 'pose': 'idle', 'face': 'r' }, 'pip': { 'at': [-2.2, -11.4], 'pose': 'fly', 'y': 2.6, 'fly': 1 } }, [
    L('n1', 'They met at noon on the cliff path: a keeper, a ferry pilot, a postmistress, a harbour master, a gull, a cat and a mouse.'),
    L('n2', 'Crane would light the low lamp to pull the ferry onto the rocks. So they would give the ferry a third light.', pause=.6)], props=['wreck', 'barge'], lead=1.0),
  shot('path', 'day', { 'type': 'track', 'side': 'south', 'h': 5.4, 'd': 13.5, 'lead': 2.0 }, { 'gus': { 'at': [-1.5, -11], 'to': [6, -11.4], 'walk': [.4, 9], 'pose': 'walk', 'face': 'r', 'hero': 1, 'lit': 0 }, 'marlo': { 'at': [-3, -10.6], 'to': [4.5, -11], 'walk': [.5, 9], 'pose': 'walk', 'face': 'r' }, 'mabel': { 'at': [-4.2, -10.6], 'to': [3.2, -11], 'walk': [.6, 9.1], 'pose': 'walk', 'face': 'r' } }, [
    L('n3', 'Gus’s own lantern, held at the cliff edge at exactly the right height, lined up with the tower.', pause=.4),
    L('n4', 'A new safe line, away from the rocks. Marlo would steer by it, and by nothing else.', pause=.8)], lead=.6),
  shot('sky', 'dusk', mapc(**{ 'from': [-40, 34, 52], 'to': [-32, 28, 42], 'look': [16, 6, -34], 'fov': 34, 'band': .45 }), {}, [
    L('n5', 'At four, the sky over the north turned the colour of a bruise.', pause=.4), L('n6', 'The storm was coming early.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S40', day='2026-12-05', slot=2, title='Twelve seconds and no lamp', hook='Three eleven. The ferry’s lights in the rain. Gus at the cliff edge.',
  ask='Twelve seconds. One lantern. Is it enough?', music={ 'mood': 'tense' }, shots=[
  shot('ship', 'storm', mapc(**{ 'look': [16, 4, -36], 'look2': [18, 5, -40] }), {}, [
    L('n1', 'The Lantern came out of the rain at three ten, every window lit, forty families aboard.'), L('n2', 'On the cliff, Gus raised his lantern to the line.', pause=.6)], props=['ship'], events=[{ 't': 2.5, 'kind': 'flash' }, { 't': 6.0, 'kind': 'horn' }], weather='rain', lead=1.0),
  shot('cliff', 'storm', { 'type': 'stage', 'at': [14.4, 5.0, -12.0], 'az': [170, 178], 'd': [8, 7.6], 'h': [3.6, 3.4] }, { 'gus': { 'at': [14.4, -12.0], 'pose': 'up', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [13.2, -11.6], 'pose': 'sit', 'face': 'r' } }, [
    L('n3', 'Three eleven. Far below, under the rock, a low light opened its eye.', pause=.6), L('n4', 'Three twelve.', pause=.6)], lamp={ 'flicker': 7.2, 'len': .9 }, events=[{ 't': 1.4, 'kind': 'flash' }], weather='rain', lead=.6),
  shot('dark', 'storm', { 'type': 'dive', 'at': [14.4, 4.9, -12.0], 'az': [170, 176], 'd': [5, 4.6], 'h': [2.4, 2.2] }, { 'gus': { 'at': [14.4, -12.0], 'pose': 'up', 'face': 'r', 'hero': 1, 'lit': .5 } }, [
    L('n5', 'The tower went dark. And the wind took his lantern down to an ember.', pause=1.2)], lamp='off', events=[{ 't': 2.0, 'kind': 'flash' }], weather='rain', lead=.6, tail=1.4),
]))
# ---------------------------------------------------------------- Sun 6 Dec
S.append(dict(code='S41', day='2026-12-06', slot=1, title='She came back for the coat', hook='Under the island, Crane had his hand on the lamp. Then someone else came out of the sea.',
  ask='Crane fell into the dark. Why did his shadow stay on the wall?', askLen=3.6, music={ 'mood': 'dread' }, shots=[
  shot('crane', 'cave', { 'type': 'stage', 'az': [-25, -15], 'd': [7.4, 7], 'h': [8.8, 8.4] }, { 'crane': { 'at': [-92.6, -95.8], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'stranger': { 'at': [-93.8, -86.6], 'to': [-93.4, -93.6], 'walk': [3.0, 8.0], 'pose': 'walk', 'face': 'r' } }, [
    L('n1', 'In the cave, Silas Crane stood at the under-lamp with the stolen key, counting, the way she used to.'),
    L('n2', 'He did not hear the water move behind him. A yellow coat, the one Gus had left on the rocks.', pause=.6)], under='on', events=[{ 't': 3.0, 'kind': 'splash' }], lead=1.0),
  shot('shutter', 'cave', { 'type': 'dive', 'az': [-150, -158], 'd': [6, 5.6], 'h': [4.4, 4.2] }, { 'stranger': { 'at': [-93.4, -93.6], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'crane': { 'at': [-92.6, -95.8], 'pose': 'idle', 'face': 'l' } }, [
    L('d1', 'The paper said bearer, Silas. Tonight, I am bearing it.', dlg='THE STRANGER'),
    L('n3', 'She put the contract into the flame of the low lamp, and the lamp went out with it.', pause=.8)], under=6.0, events=[{ 't': 5.2, 'kind': 'match' }], lead=.6),
  shot('shadow', 'cave', { 'type': 'stage', 'at': [-86.6, 2.2, -90.6], 'az': [-66, -60], 'd': [12.8, 11.8], 'h': [1.5, 1.3], 'aper': 60 }, { 'stranger': { 'at': [-90.2, -93.4], 'pose': 'idle', 'face': 'r', 'hero': 1 } }, [
    L('n4', 'There was a sound like a wave pulling back across stones. When the green light settled, Crane was gone.', pause=.6),
    L('n5', 'Only his shadow was left, on the cave wall. And it was still smiling.', pause=1.0)], under='off', props=['cshadow'], lead=.6, tail=1.0),
]))
S.append(dict(code='S42', day='2026-12-06', slot=2, title='A shadow at dawn', hook='The ferry came home. And on the north rocks, a woman stood in the sunrise.',
  ask='Crane’s shadow is still in the cave. What does a shadow do without its owner?', askLen=3.8, music={ 'mood': 'dusk' }, shots=[
  shot('ferry', 'dawn', { 'type': 'stage', 'at': [-3, .6, 36], 'az': [-150, -160], 'd': [12, 11], 'h': [5.4, 5] }, { 'marlo': { 'at': [-2.4, 37.6], 'pose': 'wave', 'face': 'l', 'hero': 1 }, 'dunn': { 'at': [-3.2, 34.4], 'pose': 'idle', 'face': 'r' }, 'wren': { 'at': [-3.8, 33.4], 'pose': 'idle', 'face': 'r' } }, [
    L('n1', 'Gus’s lantern held for twelve seconds on an ember and a prayer. It was enough. The Lantern came home on the new line.'),
    L('n2', 'Forty families. Every Christmas parcel. Marlo did not stop waving for an hour.', pause=.6)], lead=1.0),
  shot('rocks', 'dawn', { 'type': 'orbit', 'at': [11.4, 1.0, -46.8], 'az': [-40, -15], 'd': [9, 8.2], 'h': [5, 4.6] }, { 'stranger': { 'at': [10.0, -44.4], 'pose': 'idle', 'face': 'r', 'shadow': True }, 'gus': { 'at': [11.8, -43.6], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('n3', 'She was waiting on the rocks where the coat had been, facing the sunrise.', pause=.4),
    L('n4', 'And for the first time, on the wet stone beside her, there was a shadow.', pause=1.0)], props=['wreck'], lead=.6),
  shot('end', 'dawn', mapc(**{ 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38, 'band': .45 }), {}, [
    L('n5', 'The debt was paid in paper, not ships. The lamp turned all night and did not miss once.', pause=.5),
    L('n6', 'But under the island, on a wall of wet rock, a smiling shadow was learning to move on its own.', pause=1.0)], lead=.8, tail=1.2),
]))
THUMB = {
 'S29': ('a grey salvage barge with no flag tied up at a small stone quay at morning; a tall thin man in a pale cream suit, black bowler hat and silver cane stepping off it', 'WHO CALLED HIM?'),
 'S30': ('on a quay, a pale man in a cream suit and bowler hat holding out a paper to an old keeper in a sea-green coat; a grey cat sitting bolt upright', 'HE KNOWS'),
 'S31': ('a white seagull perched on a barge wheelhouse beside an old green-brass foghorn, harbour in daylight', 'THE SAME HORN'),
 'S32': ('an old woman in a violet shawl turning over a framed pencil drawing of a smiling man in a bowler hat, candlelight', '1926'),
 'S33': ('a small rowing boat slipping through a narrow crack in a sea cliff into a glowing green cave, a ferry pilot in an orange knit cap at the oars', 'THE SECRET WAY IN'),
 'S34': ('in a glowing sea cave, a tiny mouse holding a torn salt-stained paper contract, an old keeper reading it by lantern', 'PAYABLE TO THE BEARER'),
 'S35': ('a harbour master in a red muffler with his head in his hands at a desk, a locket and an old contract in front of him', 'HE TOOK THE MONEY'),
 'S36': ('dusk on a quay, a pale man in a cream suit addressing villagers with a raised paper, an old keeper alone at the edge', 'OUTVOTED'),
 'S37': ('a grey cat sitting on an open ledger in a ship wheelhouse at night, three ship names crossed out, the fourth not', 'THE FOURTH NAME'),
 'S38': ('a broken cottage window at night, a drawer pulled out, an empty velvet slot where a brass key lay', 'THE KEY IS GONE'),
 'S39': ('noon on a cliff path, a keeper, a ferry pilot, an old woman, a harbour master, a gull, a cat and a mouse gathered over a drawn map', 'THE PLAN'),
 'S40': ('storm at night, a ferry full of lit windows near black rocks, an old keeper on a cliff edge holding up a lantern with a tiny ember', '12 SECONDS'),
 'S41': ('in a green-lit sea cave, a figure in a yellow hooded coat seen from behind burning a paper in a small lamp flame, a pale man in a cream suit recoiling', 'PAID IN FULL'),
 'S42': ('sunrise on black sea rocks, a woman in a yellow coat seen from behind with a long shadow on the wet stone, an old keeper watching', 'HER SHADOW'),
}
for s in S: s['thumb'], s['thumbText'] = THUMB[s['code']]
for s in S:
    slug = s['title'].lower()
    for ch in '’…,.:"?\'': slug = slug.replace(ch, '')
    folder = os.path.join(ROOT, f"{s['day']}-{s['code'].lower()}-{slug.replace(' ', '-')[:40].rstrip('-')}")
    s['label'] = f"THE KEEPER'S ISLAND · {int(s['code'][1:])}"
    os.makedirs(os.path.join(folder, 'voices'), exist_ok=True)
    json.dump(s, open(os.path.join(folder, 'short.json'), 'w'), indent=1, ensure_ascii=False); print(folder)
