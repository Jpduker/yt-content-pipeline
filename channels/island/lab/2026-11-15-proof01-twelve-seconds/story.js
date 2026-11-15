// The Keeper's Island · proof 01 "Twelve Seconds" — timeline (seconds): shots, narration, events. Single source of truth.
export const DUR = 31.0;
export const SHOTS = [
  { id: 'card',   a: 0,    b: 3.6 },    // chapter card
  { id: 'wide',   a: 3.6,  b: 12.2 },   // very high, very far: the whole island as a map, band on the lighthouse
  { id: 'path',   a: 12.2, b: 20.0 },   // lateral tracking: Gus + Mabel on the cliff path, grass passing blurred in front
  { id: 'door',   a: 20.0, b: 31.0 },   // medium-high 3/4 at the lighthouse door; the lamp dies; title
];
export const T = {
  lhFlicker: 22.6, lhOut: 23.4,   // the lamp flickers, then goes dark
  titleIn: 26.4,
};
export const VO = [
  { id: 'n1', t: 4.6,  sub: 'On the Keeper’s Island, the lamp has turned every night for a hundred years.' },
  { id: 'n2', t: 13.0, sub: 'Gus has kept it for thirty of them. He has never once missed a turn.' },
  { id: 'n3', t: 20.6, sub: 'Tonight, at twelve minutes past three…' },
  { id: 'n4', t: 24.2, sub: 'it stopped.' },
];
export const shotAt = t => SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
