#!/usr/bin/env python3
"""Week 1 of The Keeper's Island (Shorts S01–S14, Mon 16 → Sun 22 Nov 2026): writes <out>/<folder>/short.json for each.
Usage: week1.py <episodes_root>.  Coordinates: see world.js (village z -4..9, path z -11 on the terrace, headland door (21.4,-20.4), rocks (12,-46))."""
import json, os, sys
ROOT = sys.argv[1]
DOOR = [21.4, -20.4]; DOOR_M = [22.5, -20.0]
def L(id, text, **k): d = { 'id': id, 'text': text }; d.update(k); return d
def shot(id, time, cam, cast=None, lines=None, **k):
    d = { 'id': id, 'time': time, 'cam': cam, 'cast': cast or {}, 'lines': lines or [] }; d.update(k); return d
S = []
# ---------------------------------------------------------------- Day 1 · Mon 16
S.append(dict(code='S01', day='2026-11-16', slot=1, title='Every night at 3:12, this lighthouse goes dark', label="THE KEEPER'S ISLAND · 1",
  hook='Every night at 3:12, the lamp goes dark. For exactly twelve seconds.', ask='Who is turning the lamp off… if the keeper never leaves it?', music={ 'mood': 'mystery' }, shots=[
  shot('map', 'night', { 'type': 'map', 'from': [-58, 54, 82], 'to': [-50, 48, 70], 'look': [8, 4, -10], 'look2': [12, 6, -14] }, {}, [
    L('n1', "On the Keeper's Island, the lamp has turned every night for a hundred years.", asr="On the Keeper's Island, the lamp has turned every night for a hundred years."),
    L('n2', 'Gus has kept it for thirty of them. He has never once missed a turn.', pause=1.0)], lead=3.2, tail=1.0),
  shot('door', 'night', { 'type': 'stage', 'az': [38, 30], 'd': [11, 10], 'h': [6, 5.6] }, { 'gus': { 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' } }, [
    L('n3', 'Tonight, at twelve minutes past three…', pause=.2), L('n4', 'it stopped.', pause=1.6)], lamp={ 'flicker': 3.6, 'len': .8, 'back': 16.4 }, events=[{ 't': 8.0, 'kind': 'horn' }], lead=1.2, tail=4.0),
  shot('dark', 'night', { 'type': 'dive', 'az': [20, 24], 'd': [6.5, 6], 'h': [2.8, 2.6] }, { 'gus': { 'at': DOOR, 'pose': 'look', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': DOOR_M, 'pose': 'sit', 'face': 'l' } }, [
    L('n5', 'Twelve seconds of dark. Then the lamp came back by itself.', pause=.6), L('n6', 'Out at sea, a horn answered. Something had been sailing toward the light.', pause=1.2)], lamp={ 'on_at': 1.0 }, lead=.8, tail=1.0),
]))
S.append(dict(code='S02', day='2026-11-16', slot=2, title='The boat on the north rocks', label="THE KEEPER'S ISLAND · 2",
  hook='By morning, there was a boat on the north rocks.', ask='Three days to prove it wasn’t him. Where would you start?', music={ 'mood': 'day' }, shots=[
  shot('rocks', 'day', { 'type': 'orbit', 'at': [13, 1.2, -45], 'az': [-150, -110], 'd': [16, 13], 'h': [7, 6] }, { 'pip': { 'at': [14.5, -47], 'pose': 'idle', 'face': 'l' } }, [
    L('n1', 'By morning the fog had lifted, and there was a boat on the north rocks.'), L('n2', 'Nobody hurt. Nobody on board, either.', pause=.9)], props=['wreck'], lead=1.4, tail=.8),
  shot('quay', 'day', { 'type': 'stage', 'at': [7.5, .9, 12.5], 'az': [-12, 2], 'd': [12, 11], 'h': [5, 4.8] }, { 'gus': { 'at': [6.2, 13], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'dunn': { 'at': [9.3, 12.8], 'pose': 'point', 'face': 'l' }, 'mabel': { 'at': [5.2, 13.4], 'pose': 'sit', 'face': 'r' } }, [
    L('n3', 'The harbour master, Dunn, had already decided whose fault it was.', pause=.3),
    L('d1', 'Your lamp went out, Gus. I have three witnesses and a hole in a hull.', dlg='DUNN'),
    L('d2', 'Three days. Prove it wasn’t you, or the council takes the key.', dlg='DUNN', pause=.8)], lead=1.0, tail=.6),
  shot('gus', 'day', { 'type': 'dive', 'at': [6.2, 1.0, 13], 'az': [-22, -16], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'gus': { 'at': [6.2, 13], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [5.2, 13.4], 'pose': 'sit', 'face': 'r' } }, [
    L('n4', 'Gus said nothing. He was not thinking about the council.', pause=.5), L('n5', 'He was thinking about the lamp. It had not failed. It had been switched off.', pause=1.0)], lead=.8, tail=1.0),
]))
# ---------------------------------------------------------------- Day 2 · Tue 17
S.append(dict(code='S03', day='2026-11-17', slot=1, title='The lamp-room clock is twelve seconds slow', label="THE KEEPER'S ISLAND · 3",
  hook='The lamp-room clock was twelve seconds slow. Nobody had touched it.', ask='Who climbs a lighthouse… from the sea?', music={ 'mood': 'mystery' }, shots=[
  shot('tower', 'day', { 'type': 'orbit', 'at': [21, 19.5, -24], 'az': [40, 10], 'd': [12, 10], 'h': [2.5, 1.5], 'fov': 28 }, { 'gus': { 'at': DOOR, 'pose': 'lookUp', 'face': 'l', 'hero': 0, 'lit': 0 } }, [
    L('n1', 'Gus climbed to the lamp room at noon. The first thing he checked was the clock.'), L('n2', 'Twelve seconds slow. Exactly twelve.', pause=.9)], lead=1.2, tail=.8),
  shot('door', 'day', { 'type': 'stage', 'az': [60, 50], 'd': [9, 8.5], 'h': [4.5, 4.2] }, { 'gus': { 'at': [20.2, -19.6], 'to': [21.6, -20.6], 'walk': [.5, 2.2], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [23, -19.4], 'pose': 'sit', 'face': 'l' } }, [
    L('n3', 'A clock does not lose twelve seconds on its own. Somebody had stopped the pendulum, and started it again.', pause=.4),
    L('n4', 'On the stairs, still damp, were footprints. Webbed ones.', pause=1.0)], props=['prints'], lead=.8, tail=.8),
  shot('prints', 'day', { 'type': 'dive', 'at': [21.6, 9.6, -20.6], 'az': [95, 100], 'd': [5, 4.6], 'h': [2.2, 2.0] }, { 'gus': { 'at': [21.6, -20.6], 'pose': 'look', 'face': 'l', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [23, -19.4], 'pose': 'sit', 'face': 'l' } }, [
    L('n5', 'Mabel, as usual, said nothing. Then she put her paw beside one.', pause=.7), L('n6', 'Too big for a gull. Far too big. Those were a diver’s fins.', pause=.3), L('n7', 'Someone had come up from the sea.', pause=.8)], lead=.6, tail=1.0),
]))
S.append(dict(code='S04', day='2026-11-17', slot=2, title='Pip saw someone on the rocks', label="THE KEEPER'S ISLAND · 4",
  hook='Pip sees everything from up there. This time, he wished he hadn’t.', ask='Would you tell the keeper what you saw… if nobody believed you?', music={ 'mood': 'day' }, shots=[
  shot('fly', 'day', { 'type': 'top', 'h': [15, 13], 'fov': 42 }, { 'pip': { 'at': [-10, 4], 'to': [14, -30], 'pose': 'fly', 'y': 15, 'hero': 1, 'fly': 1 } }, [
    L('n1', 'Pip the gull flies over the island every morning, mostly to be seen flying.'), L('n2', 'He saw the wreck. He saw Gus on the stairs. And on the north rocks, he saw a coat.', pause=.8)], lead=1.2, tail=.6),
  shot('rocks', 'day', { 'type': 'stage', 'at': [12, 1.1, -46], 'az': [-20, -35], 'd': [14, 12], 'h': [6.5, 5.5] }, { 'stranger': { 'at': [11.5, -47.5], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'pip': { 'at': [8, -40], 'to': [16, -44], 'pose': 'fly', 'y': 5, 'fly': 1 } }, [
    L('n3', 'A yellow coat, hood up, facing the lighthouse. Standing where no boat could land.', pause=1.0)], props=['wreck'], lead=.9, tail=.9),
  shot('empty', 'day', { 'type': 'stage', 'at': [12, 1.1, -46], 'az': [-35, -40], 'd': [12, 11.5], 'h': [5.5, 5.2] }, { 'pip': { 'at': [13, -44], 'pose': 'idle', 'face': 'l', 'hero': 1 } }, [
    L('n4', 'Pip screamed it to the whole harbour. Gulls are not taken seriously.', pause=.6), L('n5', 'By the time Gus looked up… the rocks were empty.', pause=.4), L('n6', 'But the coat had left something behind.', pause=.9)], props=['wreck'], lead=.7, tail=1.0),
]))
# ---------------------------------------------------------------- Day 3 · Wed 18
S.append(dict(code='S05', day='2026-11-18', slot=1, title='The stake-out', label="THE KEEPER'S ISLAND · 5",
  hook='They waited all night for 3:12. Rollo ate the sandwiches.', ask='Whose lantern was on the path… while Gus held his?', music={ 'mood': 'dusk' }, shots=[
  shot('cottage', 'dusk', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [25, 15], 'd': [11, 10], 'h': [5, 4.6] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'l' }, 'rollo': { 'at': [-2.6, -13.2], 'pose': 'idle', 'face': 'r' } }, [
    L('n1', 'That evening Gus set a watch on the lamp. Mabel came because the cottage was cold.'), L('n2', 'Rollo the mouse came for the sandwiches, and said so.', pause=.8)], lead=1.2, tail=.6),
  shot('night', 'night', { 'type': 'stage', 'at': [-1, 4.8, -14], 'az': [15, 8], 'd': [10, 9.5], 'h': [4.6, 4.4] }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'lookUp', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'l' }, 'rollo': { 'at': [-2.6, -13.2], 'pose': 'idle', 'face': 'r' } }, [
    L('n3', 'Midnight. One. Two. Mabel slept. Rollo finished the sandwiches.', pause=.5), L('n4', 'Three eleven. Gus raised his lantern so the lamp would know he was there.', pause=1.2)], lead=.8, tail=.4),
  shot('out', 'night', { 'type': 'track', 'side': 'south', 'h': 5.2, 'd': 13, 'lead': 1.5 }, { 'gus': { 'at': [-1.2, -13.6], 'pose': 'lookUp', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [.4, -13.3], 'pose': 'sit', 'face': 'r' } }, [
    L('n5', 'Three twelve. Dark.', pause=1.3), L('n6', 'And far along the cliff path, something was moving. A small light. Swinging, like a lantern.', pause=.5), L('n7', 'Gus looked down at his own. Still lit. Still in his hand.', pause=.9)], lamp={ 'out': 1.0 }, lead=.6, tail=1.0),
]))
S.append(dict(code='S06', day='2026-11-18', slot=2, title='Three cables, one cut', label="THE KEEPER'S ISLAND · 6",
  hook='Three cables. One cut. The cut one was dry.', ask='Which way did the cutter leave? Stairs, or window?', askLen=3.6, music={ 'mood': 'tense' }, shots=[
  shot('tower', 'night', { 'type': 'orbit', 'at': [21, 18.5, -24], 'az': [50, 20], 'd': [11, 9.5], 'h': [3, 2] }, { 'gus': { 'at': DOOR, 'pose': 'up', 'face': 'l', 'hero': 0 } }, [
    L('n1', 'At dawn Gus went up with his lantern. Behind the lamp run three cables.'), L('n2', 'Two were whole, and wet with sea-mist. The third was cut clean through. And it was dry.', pause=.9)], lead=1.2, tail=.8),
  shot('door', 'night', { 'type': 'stage', 'az': [45, 38], 'd': [9.5, 9], 'h': [4.6, 4.4] }, { 'gus': { 'at': [21.0, -20.4], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [22.6, -19.9], 'pose': 'sit', 'face': 'l' } }, [
    L('n3', 'Dry means cut from inside, after the mist. And whoever did it left in a hurry.', pause=.4), L('n4', 'The window was open. The stairs were… painted. Dunn had painted them that very morning.', pause=1.0)], lead=.8, tail=.6),
  shot('prints', 'night', { 'type': 'dive', 'at': [21.0, 9.6, -20.4], 'az': [110, 118], 'd': [5.2, 4.8], 'h': [2.3, 2.1] }, { 'gus': { 'at': [21.0, -20.4], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [22.6, -19.9], 'pose': 'sit', 'face': 'l' } }, [
    L('n5', 'Yellow paint. On the stairs, going down. Across the grass. Toward a door in the rock that Gus had never seen.', pause=1.0)], props=['prints'], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Day 4 · Thu 19
S.append(dict(code='S07', day='2026-11-19', slot=1, title='The door in the rock', label="THE KEEPER'S ISLAND · 7",
  hook='Thirty years on this island. Gus had never seen this door.', ask='Four marks. Who on the island would know them?', music={ 'mood': 'mystery' }, shots=[
  shot('walk', 'day', { 'type': 'track', 'side': 'south', 'h': 5.6, 'd': 14, 'lead': 2.4 }, { 'gus': { 'at': [3, -11], 'to': [12.2, -12.6], 'walk': [.4, 7.5], 'pose': 'look', 'face': 'r', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [1.5, -10.6], 'to': [10.8, -12.2], 'walk': [.6, 7.7], 'pose': 'walk', 'face': 'r' } }, [
    L('n1', 'The paint led along the cliff path, under the headland, to a door set into the rock.'), L('n2', 'Thirty years. Gus had walked past it every single day.', pause=.9)], lead=1.2, tail=.8),
  shot('hatch', 'day', { 'type': 'stage', 'at': [13.6, 5.2, -14.4], 'az': [-28, -12], 'd': [8, 7.4], 'h': [3.6, 3.4] }, { 'gus': { 'at': [12.6, -12.9], 'pose': 'fwd', 'face': 'l', 'hero': 1, 'lit': 0 }, 'mabel': { 'at': [11.4, -12.4], 'pose': 'sit', 'face': 'l' } }, [
    L('n3', 'No handle. No keyhole. Four brass marks, worn smooth, in a square.', pause=.5), L('n4', 'Mabel sniffed the gap under it. Then she sat down very fast, which she only does for two things.', pause=.3), L('n5', 'Fish. And fear.', pause=1.0)], events=[{ 't': 1.2, 'kind': 'lock' }], lead=.8, tail=.8),
  shot('close', 'day', { 'type': 'dive', 'at': [13.6, 5.0, -14.4], 'az': [-14, -8], 'd': [4.2, 4.0], 'h': [1.9, 1.8], 'fov': 28 }, { 'gus': { 'at': [12.6, -12.9], 'pose': 'fwd', 'face': 'l', 'hero': 1, 'lit': 0 } }, [
    L('n6', 'Gus had seen those four marks once before. In a story. One his grandmother used to tell to make children behave.', pause=1.0)], lead=.5, tail=1.0),
]))
S.append(dict(code='S08', day='2026-11-19', slot=2, title='Old Wren knows the marks', label="THE KEEPER'S ISLAND · 8",
  hook='Only one person on the island still tells the old tales.', ask='A mark that was never drawn… only burned. Burned into what?', askLen=3.6, music={ 'mood': 'dusk' }, shots=[
  shot('post', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [30, 20], 'd': [10, 9.4], 'h': [4.6, 4.3] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'idle', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l', 'lit': 1 }, 'mabel': { 'at': [-3.2, 8.6], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'Old Wren keeps the post office, the island’s letters, and every story nobody wants told.'), L('n2', 'Gus drew the four marks in the dust. She did not look at them for long.', pause=.6)], lead=1.2, tail=.4),
  shot('tale', 'dusk', { 'type': 'stage', 'at': [-6.5, 1.0, 7.6], 'az': [18, 12], 'd': [8.6, 8.2], 'h': [4.0, 3.8] }, { 'wren': { 'at': [-6.9, 7.4], 'pose': 'open', 'face': 'r', 'hero': 1 }, 'gus': { 'at': [-4.4, 8.2], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [-3.2, 8.6], 'pose': 'sit', 'face': 'l' } }, [
    L('d1', 'The man who sold his shadow. He paid with four marks, one for each year the sea let him live.', dlg='WREN'),
    L('d2', 'Three he carved on his door. The fourth was never drawn, Gus. It was burned.', dlg='WREN', pause=.9)], lead=.6, tail=.6),
  shot('dark', 'night', { 'type': 'dive', 'at': [-4.4, 1.0, 8.2], 'az': [-20, -15], 'd': [5.6, 5.2], 'h': [2.4, 2.2] }, { 'gus': { 'at': [-4.4, 8.2], 'pose': 'look', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [-3.2, 8.6], 'pose': 'sit', 'face': 'l' } }, [
    L('n3', 'Then she closed the shutters, which she never does before the lamp comes on.', pause=.6), L('n4', 'That night, for the first time in a hundred years, the lamp did not come on at all.', pause=1.0)], lamp='off', lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Day 5 · Fri 20
S.append(dict(code='S09', day='2026-11-20', slot=1, title='The lock opens on the third try', label="THE KEEPER'S ISLAND · 9",
  hook='The order of the marks was in the story. Gus had three tries.', ask='Something behind the door was breathing. Would you go in?', music={ 'mood': 'tense' }, shots=[
  shot('hatch', 'night', { 'type': 'stage', 'at': [13.6, 5.2, -14.4], 'az': [-26, -14], 'd': [8.5, 8], 'h': [3.8, 3.6] }, { 'gus': { 'at': [12.6, -12.9], 'pose': 'fwd', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [11.4, -12.4], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'Door, door, door, burned. Gus pressed the marks in the order of the tale.'), L('n2', 'Nothing. He pressed them backwards. Nothing.', pause=.9)], events=[{ 't': 3.2, 'kind': 'lock' }, { 't': 6.2, 'kind': 'lock' }], lead=1.2, tail=.4),
  shot('third', 'night', { 'type': 'dive', 'at': [13.6, 5.0, -14.4], 'az': [-12, -6], 'd': [4.4, 4.0], 'h': [2.0, 1.9], 'fov': 28 }, { 'gus': { 'at': [12.6, -12.9], 'pose': 'fwd', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'Then Mabel pressed the fourth one. The burned one. Alone.', pause=1.0)], events=[{ 't': 3.4, 'kind': 'lock' }, { 't': 3.9, 'kind': 'thump' }, { 't': 4.4, 'kind': 'creak' }], lead=.6, tail=2.2),
  shot('open', 'night', { 'type': 'stage', 'at': [13.6, 5.2, -14.4], 'az': [-30, -20], 'd': [7.6, 7.2], 'h': [3.4, 3.2] }, { 'gus': { 'at': [12.6, -12.9], 'pose': 'up', 'face': 'l', 'hero': 1, 'lit': .7 }, 'mabel': { 'at': [11.4, -12.4], 'pose': 'sit', 'face': 'l' } }, [
    L('n4', 'The door swung in. Cold air came out, smelling of salt and old rope.', pause=.6), L('n5', 'Gus lifted his lantern. The flame leaned toward the dark, as if something in there were breathing it in.', pause=1.0)], lead=.6, tail=1.0),
]))
S.append(dict(code='S10', day='2026-11-20', slot=2, title='One of the footprints has no shadow', label="THE KEEPER'S ISLAND · 10",
  hook='Two sets of footprints in the wet sand. Only one of them cast a shadow.', ask='Not the lamp. His lantern. What puts out a flame without wind?', askLen=3.6, music={ 'mood': 'dread' }, shots=[
  shot('tunnel', 'night', { 'type': 'stage', 'at': [13.6, 5.2, -14.4], 'az': [-24, -16], 'd': [7.4, 7], 'h': [3.3, 3.1] }, { 'gus': { 'at': [12.6, -12.9], 'to': [13.4, -13.6], 'walk': [.4, 2.4], 'pose': 'up', 'face': 'l', 'hero': 1 }, 'mabel': { 'at': [11.4, -12.4], 'to': [12.4, -13.0], 'walk': [.8, 2.6], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'Inside, the tunnel ran down toward the sound of the sea. The floor was wet sand.'), L('n2', 'And in the sand, two sets of footprints. Fins. And boots.', pause=.9)], lead=1.2, tail=.6),
  shot('shadow', 'night', { 'type': 'dive', 'at': [13.4, 5.0, -13.6], 'az': [-10, -4], 'd': [4.6, 4.2], 'h': [2.1, 2.0], 'fov': 28 }, { 'gus': { 'at': [13.4, -13.6], 'pose': 'up', 'face': 'l', 'hero': 1 } }, [
    L('n3', 'Gus held the lantern low. The fin-prints threw little shadows on the wall, the way prints do.', pause=.5), L('n4', 'The boot-prints threw none.', pause=1.4)], lead=.6, tail=.8),
  shot('out', 'night', { 'type': 'stage', 'at': [13.4, 5.2, -13.6], 'az': [-22, -16], 'd': [7, 6.8], 'h': [3.2, 3.1] }, { 'gus': { 'at': [13.4, -13.6], 'pose': 'up', 'face': 'l', 'hero': 1, 'poses': [[3.2, 'look']], 'lit': 1 }, 'mabel': { 'at': [12.4, -13.0], 'pose': 'sit', 'face': 'l' } }, [
    L('n5', 'Mabel’s fur stood up along her whole back.', pause=.6), L('n6', 'And then Gus’s lantern went out. Not the lamp. His lantern. In his hand. Without a breath of wind.', pause=1.0)], events=[{ 't': 3.2, 'kind': 'whoosh' }], lamp='off', lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Day 6 · Sat 21
S.append(dict(code='S11', day='2026-11-21', slot=1, title='The lamp went dark at noon', label="THE KEEPER'S ISLAND · 11",
  hook='The lamp went dark at noon. In broad daylight. With the whole village watching.', ask='He wasn’t looking at the lighthouse. He was looking at Gus. Why?', askLen=3.6, music={ 'mood': 'tense' }, shots=[
  shot('village', 'day', { 'type': 'stage', 'at': [-2, 1.0, 10], 'az': [-14, -4], 'd': [15, 13], 'h': [6.5, 5.8] }, { 'gus': { 'at': [-3, 11], 'pose': 'idle', 'face': 'l', 'hero': 1, 'lit': 0 }, 'dunn': { 'at': [-.2, 11.4], 'pose': 'idle', 'face': 'l' }, 'wren': { 'at': [-5.2, 10.6], 'pose': 'idle', 'face': 'r' }, 'mabel': { 'at': [-4.1, 11.3], 'pose': 'sit', 'face': 'l' } }, [
    L('n1', 'Day three. The council met on the quay at noon, because Dunn liked an audience.'), L('n2', 'Gus had no proof. He had a story about a door, and a cat who would not go near it.', pause=.9)], lamp='on', lead=1.2, tail=.4),
  shot('noon', 'day', { 'type': 'map', 'from': [-40, 30, 40], 'to': [-30, 26, 26], 'look': [14, 10, -18], 'look2': [18, 12, -22], 'fov': 34, 'band': .5 }, {}, [
    L('n3', 'Then, at twelve o’clock exactly, in full sun… the lamp went out.', pause=1.6)], lamp={ 'flicker': 3.0, 'len': .8 }, lead=.8, tail=1.2),
  shot('rocks', 'day', { 'type': 'stage', 'at': [12, 1.1, -46], 'az': [-30, -38], 'd': [13, 11.5], 'h': [6, 5.4] }, { 'stranger': { 'at': [11.5, -47.5], 'pose': 'idle', 'face': 'l', 'hero': 1 } }, [
    L('n4', 'Every head on the quay turned to the tower. Every head but one.', pause=.5), L('n5', 'On the north rocks stood the yellow coat. Facing away from the lighthouse. Facing the quay. Facing Gus.', pause=1.0)], props=['wreck'], lamp='off', lead=.6, tail=1.0),
]))
S.append(dict(code='S12', day='2026-11-21', slot=2, title='Dunn’s logbook', label="THE KEEPER'S ISLAND · 12",
  hook='Dunn’s logbook goes back sixty years. The lamp has failed before. Once.', ask='Twelve seconds, the night Gus was born. Coincidence?', music={ 'mood': 'mystery' }, shots=[
  shot('office', 'dusk', { 'type': 'stage', 'at': [9, 1.0, 12], 'az': [10, 0], 'd': [10.5, 10], 'h': [4.8, 4.5] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'idle', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'pose': 'idle', 'face': 'r', 'lit': 1 }, 'mabel': { 'at': [6.4, 13], 'pose': 'sit', 'face': 'r' } }, [
    L('n1', 'A lamp that fails in daylight is nobody’s carelessness. Even Dunn could see that.'), L('n2', 'So he did something he had never done. He opened the old logbook for Gus.', pause=.6)], lead=1.2, tail=.4),
  shot('log', 'dusk', { 'type': 'dive', 'at': [9.6, 1.0, 12.2], 'az': [-5, 0], 'd': [5.6, 5.2], 'h': [2.5, 2.3] }, { 'dunn': { 'at': [9.6, 12.2], 'pose': 'point', 'face': 'l', 'hero': 1 }, 'gus': { 'at': [7.4, 12.6], 'pose': 'idle', 'face': 'r' } }, [
    L('d1', 'Sixty years of nights, Gus. The lamp failed once before. One night. Twelve seconds.', dlg='DUNN'), L('d2', 'Look at the date.', dlg='DUNN', pause=1.2)], lead=.6, tail=.6),
  shot('gus', 'night', { 'type': 'stage', 'at': [7.4, 1.0, 12.6], 'az': [-30, -24], 'd': [7.4, 7], 'h': [3.4, 3.2] }, { 'gus': { 'at': [7.4, 12.6], 'pose': 'look', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [6.4, 13], 'pose': 'sit', 'face': 'r' }, 'dunn': { 'at': [9.6, 12.2], 'pose': 'idle', 'face': 'l' } }, [
    L('n3', 'Gus knew the date before he read it. Everyone on the island knew it.', pause=.5), L('n4', 'It was the night he was born.', pause=1.0)], lead=.6, tail=1.0),
]))
# ---------------------------------------------------------------- Day 7 · Sun 22
S.append(dict(code='S13', day='2026-11-22', slot=1, title='The horn comes from under the island', label="THE KEEPER'S ISLAND · 13",
  hook='The horn sounded again that night. There was no ship.', ask='A ship’s horn, from under the island. What is down there?', music={ 'mood': 'dread' }, shots=[
  shot('map', 'storm', { 'type': 'map', 'from': [-56, 52, 80], 'to': [-48, 46, 66], 'look': [8, 4, -10], 'look2': [10, 5, -12] }, {}, [
    L('n1', 'That night a storm came in from the north, and with it, the horn.'), L('n2', 'Long. Low. Close. The whole village went to the windows to see the ship.', pause=.6)], events=[{ 't': 1.0, 'kind': 'horn' }, { 't': 4.2, 'kind': 'flash' }, { 't': 9.0, 'kind': 'horn' }], lead=1.2, tail=.6),
  shot('jetty', 'storm', { 'type': 'stage', 'at': [-3, .6, 38], 'az': [200, 190], 'd': [12, 11], 'h': [5.6, 5.2] }, { 'gus': { 'at': [-3, 36], 'to': [-3, 40.5], 'walk': [.3, 3.6], 'pose': 'look', 'face': 'r', 'hero': 1 }, 'mabel': { 'at': [-3.6, 35], 'pose': 'sit', 'face': 'r' } }, [
    L('n3', 'There was no ship. The sea was empty to the horizon, and the horn kept coming.', pause=.7)], events=[{ 't': 2.0, 'kind': 'flash' }, { 't': 5.5, 'kind': 'horn' }], weather='rain', lead=.8, tail=.6),
  shot('down', 'storm', { 'type': 'dive', 'at': [-3, .6, 40.5], 'az': [170, 175], 'd': [5.4, 5], 'h': [2.6, 2.4] }, { 'gus': { 'at': [-3, 40.5], 'pose': 'look', 'face': 'r', 'hero': 1 } }, [
    L('n4', 'Gus knelt on the jetty and put his ear to the planks.', pause=.9), L('n5', 'It was not coming from the sea. It was coming from under the island.', pause=1.0)], events=[{ 't': 2.6, 'kind': 'horn' }, { 't': 6.0, 'kind': 'flash' }], weather='rain', lead=.6, tail=1.0),
]))
S.append(dict(code='S14', day='2026-11-22', slot=2, title='Three days are up', label="THE KEEPER'S ISLAND · 14",
  hook='Three days were up. Gus gave Dunn the key himself.', ask='Chapter two begins where the light doesn’t reach. Are you coming down?', askLen=3.8, music={ 'mood': 'dusk' }, shots=[
  shot('quay', 'dawn', { 'type': 'stage', 'at': [7.5, .9, 12.5], 'az': [-12, 2], 'd': [12, 11], 'h': [5, 4.8] }, { 'gus': { 'at': [6.2, 13], 'pose': 'fwd', 'face': 'r', 'hero': 1, 'lit': 0 }, 'dunn': { 'at': [9.3, 12.8], 'pose': 'idle', 'face': 'l' }, 'mabel': { 'at': [5.2, 13.4], 'pose': 'sit', 'face': 'r' }, 'pip': { 'at': [11, 11.5], 'pose': 'idle', 'face': 'l' } }, [
    L('n1', 'At dawn on the fourth day, Gus walked down to the quay and put the lamp key in Dunn’s hand.'), L('n2', 'Dunn did not take it. He had read the logbook too.', pause=.8)], lead=1.2, tail=.4),
  shot('talk', 'dawn', { 'type': 'dive', 'at': [7.6, 1.0, 12.9], 'az': [-6, 0], 'd': [6, 5.6], 'h': [2.6, 2.4] }, { 'gus': { 'at': [6.2, 13], 'pose': 'idle', 'face': 'r', 'hero': 1, 'lit': 0 }, 'dunn': { 'at': [9.3, 12.8], 'pose': 'idle', 'face': 'l' } }, [
    L('d1', 'Keep it. Whatever is under this island wants the keeper, not the key.', dlg='DUNN', pause=.9)], lead=.6, tail=.6),
  shot('end', 'dawn', { 'type': 'map', 'from': [-50, 44, 70], 'to': [-60, 56, 84], 'look': [10, 5, -12], 'look2': [8, 4, -10], 'fov': 38, 'band': .45 }, {}, [
    L('n3', 'So Gus went home, fed the cat, trimmed his lantern, and waited for dark.', pause=.6), L('n4', 'Because tonight he was going down the tunnel. All the way.', pause=1.0)], lamp='off', lead=.8, tail=1.2),
]))
for s in S:
    folder = os.path.join(ROOT, f"{s['day']}-{s['code'].lower()}-{s['title'].lower().replace('’','').replace('…','').replace(',','').replace('.','').replace(':','').replace(' ', '-')[:40].rstrip('-')}")
    os.makedirs(os.path.join(folder, 'voices'), exist_ok=True)
    json.dump(s, open(os.path.join(folder, 'short.json'), 'w'), indent=1, ensure_ascii=False)
    print(folder)
