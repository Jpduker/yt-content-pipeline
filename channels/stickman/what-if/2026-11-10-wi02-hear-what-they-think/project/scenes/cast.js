// WI02 cast (DIRECTION.md cast bible). One signature colour item each; extras plain ink.
export const GREEN = '#3fb950', YELLOW = '#f2c21a', ORANGE = '#e8743b', BLUE = '#3a6ea5', PURPLE = '#8a5ad6', PINK = '#f29ac0';
export const CAST = {
  YOU:      { top: 'hoodie', color: GREEN, head: 'none' },              // = channel image: bald round head, green hoodie (STRICT)
  MIRA:     { top: 'trench', color: YELLOW, head: 'ponytail' },         // yellow jacket
  MIRA_EVE: { top: 'tshirt', color: '#3a3040', head: 'ponytail' },      // evening: no jacket
  BARISTA:  { top: 'none', head: 'capBack', headColor: ORANGE },
  BOSS:     { top: 'suit', color: '#2a2a36', color2: BLUE, head: 'none' },
  COLL:     { top: 'none', head: 'headband', headColor: PURPLE },
  TRAIN:    { top: 'none', head: 'beanie', headColor: PINK },
  X1: { top: 'none', head: 'none' }, X2: { top: 'none', head: 'cap', headColor: '#2a2430' }, X3: { top: 'none', head: 'curly' },
  X4: { top: 'none', head: 'bun' }, X5: { top: 'none', head: 'beanie', headColor: '#2a2430' },
};
// thought-thread colour per thinker
export const THREAD = { MIRA: YELLOW, MIRA_EVE: YELLOW, BARISTA: ORANGE, BOSS: '#6ea0e0', COLL: '#b48cf0', TRAIN: PINK };
