// WI02 cast (DIRECTION.md cast bible). One signature colour item each; extras plain ink.
export const GREEN = '#3e9c4c', YELLOW = '#f2c21a', ORANGE = '#e8743b', BLUE = '#3a6ea5', PURPLE = '#8a5ad6', PINK = '#f29ac0';
export const CAST = {
  YOU:      { top: 'hoodie', color: GREEN, head: 'none' },              // = channel image: bald round head, green hoodie (STRICT)
  MIRA:     { top: 'trench', color: YELLOW, head: 'ponytail' },         // yellow jacket
  MIRA_EVE: { top: 'tshirt', color: '#3a3040', head: 'ponytail' },      // evening: no jacket
  BARISTA:  { top: 'none', head: 'capBack', headColor: ORANGE },
  BOSS:     { top: 'suit', color: '#3e3c46', color2: BLUE, head: 'none' },   // v3.2: charcoal suit (Gemini sheet)
  COLL:     { top: 'none', head: 'headband', headColor: PURPLE },
  TRAIN:    { top: 'none', head: 'beanie', headColor: PINK },
  MIRA_HOME: { top: 'tshirt', color: '#c9a227', head: 'ponytail' },     // at home: mustard tee (yellow stays her colour)
  MUM:      { top: 'tshirt', color: '#d8504a', head: 'none' },          // red cardigan, bun, glasses
  NEIGH:    { top: 'none', head: 'none' },                              // teal flat cap
  DRIVER:   { top: 'suit', color: '#22303c', color2: '#1f8a8a', head: 'none' },   // teal peaked cap + tie
  LIFT:     { top: 'tshirt', color: '#9a8ad0', head: 'none' },          // lilac top, curls
  THEO:     { top: 'tshirt', color: '#2a3a5a', head: 'none' },          // younger brother: navy tee, blue headphones round his neck (v3.1)
  DEV:      { top: 'tshirt', color: '#5a5a66', head: 'none' },          // P1: grey tee, orange scarf
  PIA:      { top: 'tshirt', color: '#e8d8c0', head: 'none' },          // P1: Dev's little sister, red hair clip
  DAD:      { top: 'tshirt', color: '#7a5a3a', head: 'none' },          // P3: Mira's dad, brown cardigan, grey moustache
  INTERN:   { top: 'tshirt', color: '#f0a040', head: 'none' },          // orange tee, teal lanyard
  SAMI:     { top: 'tshirt', color: '#d8504a', head: 'none' },          // P2: 9, red tee + blue cap
  MA:       { top: 'tshirt', color: '#2a8a8a', head: 'none' },          // P2: Sami's mum, teal cardigan, curls
  BRO:      { top: 'tshirt', color: '#3a3040', head: 'none' },          // P2: Sami's big brother, orange beanie
  OMAR:     { top: 'suit', color: '#24304a', color2: '#d8403a', head: 'none' },   // O4: dad, navy suit, red tie
  LILA:     { top: 'tshirt', color: '#8a5ad6', head: 'none' },          // O4: 7, purple top, bun
  NEW:      { top: 'tshirt', color: '#f29ac0', head: 'none' },          // O6: the next new intern, pink, pink lanyard
  WALT:     { top: 'tshirt', color: '#c8d84a', head: 'none' },          // O7: street sweeper, hi-vis vest, grey flat cap
  ZOE:      { top: 'tshirt', color: '#d8504a', head: 'none' },          // O7: 8, red coat, bun
  ELI:      { top: 'trench', color: '#6a6a74', head: 'none' },          // O8: grey coat
  JAY:      { top: 'tshirt', color: '#3a8a5a', head: 'none' },          // O9: 10, green tee (not the hero's hoodie green: darker)
  GRANDPA:  { top: 'tshirt', color: '#8a6a4a', head: 'none' },          // O9: brown cardigan, flat cap
  JO:       { top: 'tshirt', color: '#2a8a8a', head: 'none' },          // WI09: school friend, blue cap
  SAM:      { top: 'tshirt', color: '#e05a9a', head: 'none' },          // WI09: group chat friend, curls
  ROSA:     { top: 'trench', color: '#d8403a', head: 'none' },          // WI10: the stranger in the red coat
  LEO:      { top: 'suit', color: '#1e1c26', color2: '#d8403a', head: 'none' },   // O10: best man, red bow tie
  DAVE:     { top: 'suit', color: '#5a5a66', color2: '#3a6ea5', head: 'none' },   // O10: groom, glasses
  NADIA:    { top: 'tshirt', color: '#f4f0e8', head: 'none' },          // O10: bride, white dress
  PIP:      { top: 'tshirt', color: '#f29ac0', head: 'none' },          // O11: pink cardigan
  CLEANER:  { top: 'tshirt', color: '#3a6ea5', head: 'none' },          // O11: blue overalls, beanie
  GUS:      { top: 'tshirt', color: '#8a7a5a', head: 'none' },          // O12: cardigan
  INES:     { top: 'trench', color: '#f2c21a', head: 'none' },          // O13: yellow raincoat (not Mira: curls, no ponytail)
  RAJ:      { top: 'suit', color: '#2a3040', color2: '#e8a030', head: 'none' },   // O14: suit, mustard tie
  TIA:      { top: 'tshirt', color: '#3a6ea5', head: 'none' },          // O14: 9, football kit
  KID:      { top: 'tshirt', color: '#f29ac0', head: 'none' },          // toddler / child extra
  X1: { top: 'none', head: 'none' }, X2: { top: 'none', head: 'cap', headColor: '#2a2430' }, X3: { top: 'none', head: 'curly' },
  X4: { top: 'none', head: 'bun' }, X5: { top: 'none', head: 'beanie', headColor: '#2a2430' },
};
// thought-thread colour per thinker
export const THREAD = { THEO: '#4a8fe8', DEV: '#e8743b', PIA: '#d8504a', DAD: '#c8a070', MIRA: YELLOW, MIRA_EVE: YELLOW, BARISTA: ORANGE, BOSS: '#6ea0e0', COLL: '#b48cf0', TRAIN: PINK };
