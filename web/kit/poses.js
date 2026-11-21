// Body poses. A pose is a handful of angles; an action is a function of time that returns a pose.
// Angles are radians from "hanging straight down"; positive swings toward screen-right (mirrored when facing left).
//   arms: [[shoulder, elbow], [shoulder, elbow]]   arm 0 = front / screen-right arm, arm 1 = back / screen-left arm
//   legs: [[hip, knee], [hip, knee]]               knee bends backwards by |knee|
//   bounce (px up/down), lean (body tilt), head (head tilt), rot (whole figure, for falls and lying down), sit (0..1)

const S = Math.sin, C = Math.cos, PI = Math.PI;
export const BASE = { bounce: 0, lean: 0, head: 0, rot: 0, sit: 0, legs: [[.06, 0], [-.06, 0]], arms: [[.14, .1], [-.14, -.1]] };
const P = o => ({ ...BASE, ...o });
const breathe = t => 2.5 * S(t * 2.2);

export const ACTIONS = {
  // standing
  idle:      t => P({ bounce: breathe(t), arms: [[.14 + .02 * S(t * 2.2), .1], [-.14, -.1]] }),
  stand:     t => P({}),
  wave:      t => P({ bounce: breathe(t), head: .08, arms: [[2.0, .7 + .45 * S(t * 11)], [-.15, -.1]] }),
  wave2:     t => P({ bounce: -3 * Math.abs(S(t * 6)), arms: [[2.0, .7 + .4 * S(t * 11)], [-2.0, -.7 - .4 * S(t * 11 + 1)]] }),
  point:     t => P({ lean: .04, arms: [[1.55, 0], [-.15, -.1]] }),
  pointUp:   t => P({ head: -.1, arms: [[2.1, .75], [-.15, -.1]] }),
  pointDown: t => P({ head: .15, lean: .08, arms: [[.7, 0], [-.15, -.1]] }),
  talk:      t => P({ bounce: 2 * S(t * 4), head: .05 * S(t * 2.1), arms: [[.7 + .25 * S(t * 3.1), .9 + .3 * S(t * 2.3)], [-.3 - .15 * S(t * 2.7), -.4]] }),
  explain:   t => P({ bounce: 2 * S(t * 3), arms: [[1.0 + .3 * S(t * 3), 1.0], [-1.0 - .3 * S(t * 3 + 1), -1.0]] }),
  present:   t => P({ arms: [[1.3, -.3], [-1.3, .3]] }),
  shrug:     t => { const k = Math.min(1, t * 4); return P({ bounce: -4 * k, head: .12 * k, arms: [[.9 * k, -1.6 * k], [-.9 * k, 1.6 * k]] }); },
  think:     t => P({ head: -.12, arms: [[1.0, 1.9], [.4, 1.2]] }),
  chinRub:   t => P({ head: -.1, arms: [[1.0, 1.95 + .1 * S(t * 6)], [.4, 1.2]] }),
  crossArms: t => P({ bounce: breathe(t) * .5, arms: [[-.5, 2.2], [.5, -2.2]] }),
  hipsHands: t => P({ arms: [[.7, -1.9], [-.7, 1.9]] }),
  facepalm:  t => P({ head: .25, lean: .06, arms: [[1.2, 2.25], [-.1, -.1]] }),
  headHold:  t => P({ head: .1 * S(t * 9), arms: [[2.2, 1.9], [-2.2, -1.9]] }),
  scratch:   t => P({ head: .1, arms: [[2.2, 1.8 + .15 * S(t * 18)], [-.15, -.1]] }),
  clap:      t => { const k = Math.abs(S(t * 9)); return P({ bounce: -2 * k, arms: [[.9, .8 + .5 * k], [-.9, -.8 - .5 * k]] }); },
  bow:       t => { const k = Math.min(1, t * 2); return P({ lean: .7 * k, head: .3 * k, arms: [[.2, 0], [-.2, 0]] }); },
  salute:    t => P({ arms: [[2.3, 2.3], [-.1, -.05]] }),
  phone:     t => P({ head: .18, arms: [[.9, 1.3], [-.2, -.1]] }),
  phoneEar:  t => P({ head: -.05, arms: [[1.7, 2.6], [-.15, -.1]] }),
  hold:      t => P({ bounce: breathe(t), arms: [[1.2, 1.0], [-.2, -.1]] }),
  holdUp:    t => P({ head: -.15, arms: [[2.15, .6], [-2.15, -.6]] }),
  carry:     t => P({ bounce: 3 * S(t * 7), lean: -.05, arms: [[1.6, 1.4], [-1.6, -1.4]] }),
  push:      t => P({ lean: .45, legs: [[-.4, .2], [.35, .3]], arms: [[1.55, .1], [1.45, .1]] }),
  pull:      t => P({ lean: -.35, legs: [[.45, .1], [-.2, .3]], arms: [[1.5, 0], [1.35, 0]] }),
  type:      t => P({ sit: 1, head: .1, arms: [[1.2, 1.2 + .15 * S(t * 20)], [1.0, 1.3 + .15 * S(t * 20 + 2)]] }),
  stir:      t => P({ bounce: 2 * S(t * 5), arms: [[1.1 + .25 * S(t * 5), .5 + .3 * C(t * 5)], [-.3, -.2]] }),
  count:     t => P({ head: .2, arms: [[1.0, 1.4 + .2 * Math.round(S(t * 4))], [.6, 1.6]] }),
  // emotion
  cheer:     t => P({ bounce: -6 * Math.abs(S(t * 6)), arms: [[2.15, .55 + .2 * S(t * 9)], [-2.15, -.55 - .2 * S(t * 9)]] }),
  jump:      t => { const ph = (t % .9) / .9, up = Math.max(0, S(ph * PI)); return P({ bounce: -90 * up + (ph < .1 ? 10 : 0), legs: [[.25 * up, .5 * up], [-.25 * up, .5 * up]], arms: [[2.0 * up + .2, .6 * up], [-2.0 * up - .2, -.6 * up]] }); },
  dance:     t => P({ bounce: -8 * Math.abs(S(t * 8)), lean: .15 * S(t * 4), head: .15 * S(t * 4), legs: [[.3 * S(t * 8), .3 * Math.max(0, S(t * 8))], [-.3 * S(t * 8), .3 * Math.max(0, -S(t * 8))]], arms: [[2 + .6 * S(t * 4), .8], [-1 - .6 * S(t * 4), -1.2]] }),
  sad:       t => P({ lean: -.06, head: .3, bounce: 5, arms: [[.05, 0], [-.05, 0]] }),
  slump:     t => P({ lean: .3, head: .4, bounce: 18, legs: [[.1, .25], [-.1, .25]], arms: [[.15, 0], [-.05, 0]] }),
  scared:    t => P({ bounce: 2 * S(t * 40), lean: -.12, head: -.05, arms: [[1.6, 1.8], [-1.6, -1.8]], legs: [[.2, .1], [-.2, .1]] }),
  shiver:    t => P({ bounce: 1.5 * S(t * 50), head: .03 * S(t * 47), arms: [[-.4, 2.4], [.4, -2.4]] }),
  angry:     t => P({ bounce: 2 * S(t * 18), lean: .1, arms: [[.5, -1.4], [-.5, 1.4]] }),
  stomp:     t => { const k = Math.max(0, S(t * 7)); return P({ bounce: -6 * k, legs: [[.5 * k, .6 * k], [-.06, 0]], arms: [[.5, -1.4], [-.5, 1.4]] }); },
  facepalm2: t => P({ head: .35, lean: .1, arms: [[1.5, 2.4], [1.2, 2.3]] }),
  shocked:   t => P({ bounce: -14, lean: -.15, head: -.1, arms: [[1.9, .6], [-1.9, -.6]], legs: [[.2, 0], [-.2, 0]] }),
  laugh:     t => P({ bounce: 3 * S(t * 16), lean: -.12 + .06 * S(t * 16), head: -.15, arms: [[.6, 1.9], [-.6, -1.9]] }),
  // moving (used with a position tween)
  walk:      t => { const p = t * 7.2; return P({ bounce: -5 * Math.abs(S(p)), lean: .05, legs: [[.42 * S(p), .35 * Math.max(0, -C(p))], [-.42 * S(p), .35 * Math.max(0, C(p))]], arms: [[-.4 * S(p), .25], [.4 * S(p), .25]] }); },
  run:       t => { const p = t * 12; return P({ bounce: -12 * Math.abs(S(p)), lean: .3, legs: [[.85 * S(p), .9 * Math.max(0, -C(p)) + .2], [-.85 * S(p), .9 * Math.max(0, C(p)) + .2]], arms: [[-1.0 * S(p), 1.6], [1.0 * S(p), 1.6]] }); },
  sneak:     t => { const p = t * 4; return P({ bounce: 16 - 4 * Math.abs(S(p)), lean: .25, legs: [[.35 * S(p) + .2, .6], [-.35 * S(p) + .2, .6]], arms: [[1.2, 1.8], [.8, 1.6]] }); },
  flee:      t => { const p = t * 14; return P({ bounce: -10 * Math.abs(S(p)), lean: .35, head: -.2, legs: [[.9 * S(p), 1.0 * Math.max(0, -C(p)) + .2], [-.9 * S(p), 1.0 * Math.max(0, C(p)) + .2]], arms: [[2.1, .6 + .3 * S(p * 2)], [-2.1, -.6 - .3 * S(p * 2)]] }); },
  climb:     t => { const p = t * 5; return P({ legs: [[.6 + .3 * S(p), .9], [.2 - .3 * S(p), .6]], arms: [[2.1 + .15 * S(p), .6], [-2.1 + .15 * S(p), -.6]] }); },
  // ground
  sit:       t => P({ sit: 1, bounce: breathe(t) * .4, arms: [[.6, 1.2], [.4, 1.3]] }),
  sitThink:  t => P({ sit: 1, head: -.12, arms: [[1.0, 1.95], [.5, 1.3]] }),
  sitSad:    t => P({ sit: 1, lean: .25, head: .4, arms: [[.5, 1.4], [.3, 1.5]] }),
  kneel:     t => P({ bounce: 70, legs: [[.0, 1.57], [1.2, 1.2]], arms: [[1.3, .6], [1.1, .6]] }),
  pray:      t => P({ bounce: 70, head: .2, legs: [[.0, 1.57], [1.2, 1.2]], arms: [[.9, 1.7], [.7, 1.8]] }),
  lie:       t => P({ rot: -PI / 2, bounce: breathe(t) * .3, arms: [[.1, 0], [-.1, 0]] }),
  sleep:     t => P({ rot: -PI / 2, head: -.2, bounce: breathe(t) * .3, legs: [[.3, .5], [.1, .4]], arms: [[.6, 1.2], [.2, .3]] }),
  fall:      t => { const k = Math.min(1, t * 2.5); return P({ rot: -PI / 2 * k, bounce: -30 * S(k * PI), arms: [[2.4 * k, .4], [-2.0 * k, -.4]], legs: [[.5 * k, .2], [-.3 * k, .2]] }); },
  knocked:   t => P({ rot: -PI / 2, arms: [[2.5, .2], [-2.3, -.3]], legs: [[.5, .1], [-.4, .2]] }),
  flattened: t => P({ rot: 0, squash: .35, arms: [[1.5, 0], [-1.5, 0]], legs: [[.7, 0], [-.7, 0]] }),
  // fighting / physical
  punch:     t => { const k = Math.max(0, S(t * 10)); return P({ lean: .15 * k, legs: [[.35, .1], [-.3, .2]], arms: [[1.57 * (.6 + .4 * k), 1.6 * (1 - k)], [.9, 2.2]] }); },
  kick:      t => { const k = Math.max(0, S(t * 8)); return P({ lean: -.2 * k, legs: [[1.5 * k, .2 * (1 - k)], [-.1, 0]], arms: [[1.2, 1.4], [-1.4, -.6]] }); },
  throw:     t => { const k = Math.min(1, (t % 1.2) * 2.5); return P({ lean: .2 * k - .1, arms: [[-1.6 + 4.2 * k, .5], [-.8, -.4]], legs: [[.3, .1], [-.3, .2]] }); },
  dragged:   t => P({ rot: .9, lean: 0, bounce: -20, head: -.3, arms: [[3.0, 0], [2.6, .2]], legs: [[.3 + .1 * S(t * 10), .2], [-.2, .3]] }),
};
export const ACTION_NAMES = Object.keys(ACTIONS);
