// Faces. Every expression is eyes + brows + exactly ONE mouth + optional extras (sweat, tears, blush, symbols).
// Facial hair is drawn by figure.js and kept out of the mouth zone, so a face never shows two mouths.
//   drawFace(pen, r, name, { dir, side, talk, t, blink })   r = head radius, origin = head center

export const EXPRESSIONS = {
  neutral:   { eyes: "dot",    brow: 0,    mouth: "line" },
  happy:     { eyes: "happy",  brow: .3,   mouth: "smile" },
  joy:       { eyes: "happy",  brow: .5,   mouth: "open-smile", extras: ["blush"] },
  laugh:     { eyes: "squeeze",brow: .6,   mouth: "laugh", extras: ["tears-joy"] },
  grin:      { eyes: "dot",    brow: .4,   mouth: "teeth" },
  excited:   { eyes: "wide",   brow: .9,   mouth: "open-smile", extras: ["sparkle"] },
  smug:      { eyes: "half",   brow: .2,   mouth: "smirk" },
  smirk:     { eyes: "dot",    brow: .2,   mouth: "smirk", browOne: true },
  wink:      { eyes: "wink",   brow: .3,   mouth: "smile" },
  love:      { eyes: "heart",  brow: .4,   mouth: "smile", extras: ["blush"] },
  sad:       { eyes: "dot",    worry: 1,   mouth: "frown" },
  cry:       { eyes: "closed", worry: 1.2, mouth: "wail", extras: ["tears"] },
  angry:     { eyes: "dot",    brow: -1,   mouth: "frown" },
  furious:   { eyes: "dot",    brow: -1.4, mouth: "shout", extras: ["vein"] },
  surprised: { eyes: "wide",   brow: 1.2,  mouth: "o" },
  shocked:   { eyes: "pin",    brow: 1.5,  mouth: "gasp", extras: ["lines"] },
  scared:    { eyes: "pin",    worry: 1.3, mouth: "wobble", extras: ["sweat"] },
  worried:   { eyes: "dot",    worry: .9,  mouth: "wobble" },
  nervous:   { eyes: "dot",    worry: .6,  mouth: "teeth-tight", extras: ["sweat"] },
  thinking:  { eyes: "up",     brow: .6,   mouth: "side", browOne: true },
  confused:  { eyes: "dot",    brow: .7,   mouth: "wobble", browOne: true, extras: ["question"] },
  determined:{ eyes: "dot",    brow: -.7,  mouth: "line" },
  tired:     { eyes: "half",   worry: .4,  mouth: "line", extras: ["bags"] },
  sleepy:    { eyes: "closed", brow: 0,    mouth: "small-o", extras: ["zzz"] },
  bored:     { eyes: "half",   brow: -.1,  mouth: "side" },
  dead:      { eyes: "x",      brow: 0,    mouth: "wobble" },
  dizzy:     { eyes: "spiral", brow: .3,   mouth: "wobble" },
  evil:      { eyes: "dot",    brow: -1.2, mouth: "teeth", extras: ["shadow"] },
  disgusted: { eyes: "squeeze",brow: -.5,  mouth: "tongue" },
  idea:      { eyes: "wide",   brow: 1,    mouth: "open-smile", extras: ["bulb"] },
  blank:     { eyes: "dot",    brow: 0,    mouth: "none" },
};
export const EXPRESSION_NAMES = Object.keys(EXPRESSIONS);

export function drawFace(pen, r, name = "neutral", o = {}) {
  const c = pen.ctx, f = EXPRESSIONS[name] || EXPRESSIONS.neutral, ink = o.ink || pen.ink, t = o.t || 0;
  const side = !!o.side, dir = o.dir || 1, ox = side ? r * .3 * dir : 0;
  const ex = side ? [r * .0, r * .38].map(x => x * dir + ox * .3) : [-r * .3 + ox, r * .3 + ox];
  const ey = -r * .02, er = r * .085, lw = Math.max(2, r * .075);
  const blink = o.blink && f.eyes !== "closed";
  c.save(); c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = ink; c.fillStyle = ink;
  // ---- eyes ----
  ex.forEach((x, i) => {
    const type = blink ? "closed" : f.eyes === "wink" ? (i === 1 ? "closed" : "dot") : f.eyes;
    c.lineWidth = lw; c.beginPath();
    if (type === "dot") { c.ellipse(x, ey, er, er * 1.55, 0, 0, 7); c.fill(); }
    else if (type === "pin") { c.arc(x, ey, r * .17, 0, 7); c.fillStyle = o.eyeWhite || "#fff"; c.fill(); c.stroke(); c.beginPath(); c.arc(x, ey, r * .035, 0, 7); c.fillStyle = ink; c.fill(); }
    else if (type === "wide") { c.arc(x, ey, r * .16, 0, 7); c.fillStyle = o.eyeWhite || "#fff"; c.fill(); c.stroke(); c.beginPath(); c.arc(x + (side ? r * .04 * dir : 0), ey + r * .02, r * .075, 0, 7); c.fillStyle = ink; c.fill(); }
    else if (type === "happy") { c.arc(x, ey + r * .06, r * .11, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    else if (type === "squeeze") { const s = i ? -1 : 1; c.moveTo(x - r * .1 * s, ey - r * .08); c.lineTo(x + r * .08 * s, ey); c.lineTo(x - r * .1 * s, ey + r * .08); c.stroke(); }
    else if (type === "closed") { c.arc(x, ey - r * .02, r * .1, Math.PI * .15, Math.PI * .85); c.stroke(); }
    else if (type === "half") { c.ellipse(x, ey + r * .03, er * 1.1, er * .9, 0, 0, Math.PI); c.fill(); c.beginPath(); c.moveTo(x - r * .13, ey + r * .02); c.lineTo(x + r * .13, ey + r * .02); c.stroke(); }
    else if (type === "up") { c.ellipse(x + r * .02, ey - r * .06, er, er * 1.4, 0, 0, 7); c.fill(); }
    else if (type === "x") { const s = r * .09; c.moveTo(x - s, ey - s); c.lineTo(x + s, ey + s); c.moveTo(x + s, ey - s); c.lineTo(x - s, ey + s); c.stroke(); }
    else if (type === "heart") { heart(c, x, ey, r * .14, o.accent || "#e0384a"); }
    else if (type === "spiral") { for (let a = 0; a < 12; a += .3) { const rr = a / 12 * r * .15; const px = x + Math.cos(a + t * 6) * rr, py = ey + Math.sin(a + t * 6) * rr; a ? c.lineTo(px, py) : c.moveTo(px, py); } c.lineWidth = lw * .7; c.stroke(); }
  });
  // ---- brows ----
  if (f.brow !== undefined || f.worry) ex.forEach((x, i) => {
    const b = f.brow || 0, inner = (i === 0 ? 1 : -1) * (side ? -dir : 1);
    let by = ey - r * .3 - Math.max(0, b) * r * .07, tilt = b < 0 ? -b * r * .1 * inner : 0;
    if (f.worry) tilt = -r * .09 * inner * f.worry;
    if (f.browOne && i === 1) { by -= r * .1; tilt = 0; }
    c.beginPath(); c.lineWidth = lw * 1.05; c.moveTo(x - r * .13, by - tilt); c.lineTo(x + r * .13, by + tilt); c.stroke();
  });
  // ---- the one mouth ----
  const mx = ox * .9, my = r * .42, w = r * (side ? .22 : .3);
  let m = f.mouth; const talk = o.talk || 0;
  if (talk > .08 && !["shout", "laugh", "wail", "gasp"].includes(m)) m = "talk";
  const fillM = o.mouthColor || "#3a1d24"; c.lineWidth = lw; c.beginPath();
  if (m === "line") { c.moveTo(mx - w * .8, my); c.lineTo(mx + w * .8, my); c.stroke(); }
  else if (m === "smile") { c.moveTo(mx - w, my - r * .04); c.quadraticCurveTo(mx, my + r * .2, mx + w, my - r * .04); c.stroke(); }
  else if (m === "frown") { c.moveTo(mx - w * .8, my + r * .07); c.quadraticCurveTo(mx, my - r * .1, mx + w * .8, my + r * .07); c.stroke(); }
  else if (m === "smirk") { c.moveTo(mx - w * .8, my + r * .02); c.quadraticCurveTo(mx + w * .2, my + r * .08, mx + w * .9, my - r * .08); c.stroke(); }
  else if (m === "side") { c.moveTo(mx - w * .2, my + r * .02); c.lineTo(mx + w * .7, my - r * .02); c.stroke(); }
  else if (m === "o" || m === "small-o") { c.ellipse(mx, my + r * .02, r * (m === "o" ? .1 : .06), r * (m === "o" ? .14 : .07), 0, 0, 7); c.fillStyle = fillM; c.fill(); c.stroke(); }
  else if (m === "gasp") { c.ellipse(mx, my + r * .05, r * .14, r * .2, 0, 0, 7); c.fillStyle = fillM; c.fill(); c.stroke(); }
  else if (m === "open-smile" || m === "laugh") { const h = m === "laugh" ? r * .32 + Math.abs(Math.sin(t * 18)) * r * .06 : r * .26; c.moveTo(mx - w, my - r * .06); c.quadraticCurveTo(mx, my + h, mx + w, my - r * .06); c.closePath(); c.fillStyle = fillM; c.fill(); c.stroke();
    c.save(); c.clip(); c.beginPath(); c.ellipse(mx, my + h * .55, w * .5, h * .25, 0, 0, 7); c.fillStyle = "#e0606e"; c.fill(); c.restore(); }
  else if (m === "teeth" || m === "teeth-tight") { const h = m === "teeth" ? r * .18 : r * .12; c.roundRect(mx - w, my - h * .4, w * 2, h, h * .45); c.fillStyle = "#fff"; c.fill(); c.stroke(); c.beginPath(); c.moveTo(mx - w, my + h * .1); c.lineTo(mx + w, my + h * .1); c.lineWidth = lw * .5; c.stroke(); }
  else if (m === "shout" || m === "wail") { const h = r * (m === "shout" ? .3 : .24); c.moveTo(mx - w * .8, my + (m === "wail" ? h * .5 : -h * .2)); c.quadraticCurveTo(mx, my - h * (m === "wail" ? .4 : .5), mx + w * .8, my + (m === "wail" ? h * .5 : -h * .2)); c.quadraticCurveTo(mx, my + h * 1.1, mx - w * .8, my + (m === "wail" ? h * .5 : -h * .2)); c.fillStyle = fillM; c.fill(); c.stroke(); }
  else if (m === "wobble") { c.moveTo(mx - w * .8, my); for (let k = 1; k <= 6; k++) c.lineTo(mx - w * .8 + k * w * .27, my + (k % 2 ? -1 : 1) * r * .04); c.stroke(); }
  else if (m === "tongue") { c.moveTo(mx - w * .7, my); c.lineTo(mx + w * .7, my); c.stroke(); c.beginPath(); c.ellipse(mx + w * .2, my + r * .08, r * .08, r * .1, 0, 0, Math.PI); c.fillStyle = "#e0606e"; c.fill(); c.stroke(); }
  else if (m === "talk") { const h = r * (.04 + .16 * talk); c.ellipse(mx, my + r * .02, w * .55, h, 0, 0, 7); c.fillStyle = fillM; c.fill(); c.stroke(); }
  // ---- extras ----
  for (const x of f.extras || []) extra(c, x, r, { ex, ey, mx, my, ink, t, lw, side, dir, accent: o.accent });
  c.restore();
}

function heart(c, x, y, s, color) { c.save(); c.beginPath(); c.moveTo(x, y + s * .9); c.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .6, y - s * 1.2, x, y - s * .35); c.bezierCurveTo(x + s * .6, y - s * 1.2, x + s * 1.6, y - s * .2, x, y + s * .9); c.fillStyle = color; c.fill(); c.restore(); }

function extra(c, name, r, o) {
  const { ex, ey, ink, t, lw } = o; c.save(); c.lineWidth = lw * .8; c.strokeStyle = ink;
  if (name === "blush") { c.fillStyle = "rgba(240,110,120,.45)"; for (const x of ex) { c.beginPath(); c.ellipse(x, ey + r * .22, r * .12, r * .06, 0, 0, 7); c.fill(); } }
  if (name === "sweat") { const y = -r * .45 + (t * 40 % (r * .4)); c.beginPath(); c.moveTo(r * .78, y); c.quadraticCurveTo(r * .95, y + r * .25, r * .78, y + r * .28); c.quadraticCurveTo(r * .62, y + r * .25, r * .78, y); c.fillStyle = "#8fd0ff"; c.fill(); c.stroke(); }
  if (name === "tears" || name === "tears-joy") { c.fillStyle = "#8fd0ff"; for (const x of ex) { const k = (t * 1.6 + (x > 0 ? .5 : 0)) % 1; c.beginPath(); c.ellipse(x + (name === "tears-joy" ? (x > 0 ? 1 : -1) * r * .15 : 0), ey + r * .15 + k * r * .5, r * .05, r * .08, 0, 0, 7); c.fill(); } }
  if (name === "vein") { const x = r * .45, y = -r * .55; c.strokeStyle = "#d0303a"; c.lineWidth = lw; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { c.beginPath(); c.moveTo(x + a * r * .04, y + b * r * .04); c.lineTo(x + a * r * .14, y + b * r * .02); c.moveTo(x + a * r * .04, y + b * r * .04); c.lineTo(x + a * r * .02, y + b * r * .14); c.stroke(); } }
  if (name === "lines") { for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * r * .25, -r * 1.15); c.lineTo(k * r * .3, -r * 1.4); c.stroke(); } }
  if (name === "question") { c.font = `900 ${r * .7}px "Avenir Next", sans-serif`; c.fillStyle = ink; c.textAlign = "center"; c.fillText("?", r * 1.1, -r * .7 + Math.sin(t * 4) * r * .05); }
  if (name === "zzz") { c.font = `800 ${r * .35}px "Avenir Next", sans-serif`; c.fillStyle = ink; for (let k = 0; k < 3; k++) { const p = (t * .6 + k / 3) % 1; c.globalAlpha = 1 - p; c.fillText("z", r * (.9 + p * .6), -r * (.6 + p * .9)); } }
  if (name === "sparkle") { c.strokeStyle = "#f2b81f"; for (const [x, y] of [[-r * 1.05, -r * .5], [r * 1.05, -r * .65]]) { const s = r * (.12 + .04 * Math.sin(t * 9)); c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke(); } }
  if (name === "bags") { for (const x of ex) { c.beginPath(); c.arc(x, ey + r * .12, r * .09, Math.PI * .2, Math.PI * .8); c.lineWidth = lw * .5; c.stroke(); } }
  if (name === "shadow") { c.beginPath(); c.arc(0, 0, r * .96, 0, 7); c.clip(); c.fillStyle = "rgba(20,10,30,.22)"; c.fillRect(-r, -r, r * 2, r * .55); }
  if (name === "bulb") { const y = -r * 1.55; c.beginPath(); c.arc(0, y, r * .3, 0, 7); c.fillStyle = "#ffd84a"; c.fill(); c.stroke(); c.beginPath(); c.rect(-r * .12, y + r * .26, r * .24, r * .14); c.fillStyle = "#9aa0a8"; c.fill(); c.stroke();
    c.strokeStyle = "#f2b81f"; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .45; c.beginPath(); c.moveTo(Math.cos(a) * r * .42, y + Math.sin(a) * r * .42); c.lineTo(Math.cos(a) * r * .58, y + Math.sin(a) * r * .58); c.stroke(); } }
  c.restore();
}
