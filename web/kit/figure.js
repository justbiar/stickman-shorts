// One parametric stick figure with several body types and costumes. Draws in 2D with a Pen.
//   drawFigure(pen, x, y, size, spec, pose, expression, { look, t, talk, blink }) -> { hand, head }
//   x, y = point between the feet on the ground; size = standing height in px
//
// spec.body:  "line"   classic stick figure (A1, B1, B7)
//             "torso"  round head on a small colored body (A2, A4, A5, B2, B6)
//             "rubber" thin noodle limbs, white gloves, two hair tufts (A7)
//             "glow"   soft luminous white-gray figure (B3)
//             "chunky" thick white limbs and gloves, round head (B4, B5)
// costume keys: shirt, pants, outfit (tee|hoodie|suit|kimono|fur|egypt|robe|dress|apron), hood, tie, sash,
//               hair (tufts|topknot|spiky|bob|ponytail|messy|bald), hairColor, hat (beanie|cap|fedora|kasa|nemes|crown|headband|hardhat),
//               hatColor, beard (full|mustache|stubble), beardColor, glasses, gloves (true|color), skin, headScale, lw, ink
import { drawFace } from "./face.js";

export function drawFigure(pen, x, y, size, spec = {}, pose, expr = "neutral", o = {}) {
  const c = pen.ctx, s = size / 700, ink = spec.ink || pen.ink;
  const body = spec.body || "line", look = o.look || "front", side = look !== "front", dir = look === "left" ? -1 : 1;
  const lw = spec.lw || (body === "rubber" ? 7 : body === "chunky" ? 9 : body === "glow" ? 7 : 11) * s;
  const headR = (spec.headScale || (body === "line" ? 1 : body === "rubber" ? 1.05 : 1.12)) * 82 * s;
  const legL = 245 * s, thigh = legL * .52, shin = legL * .48, torsoH = 175 * s, upper = 105 * s, fore = 98 * s;
  const sit = pose.sit || 0;
  let legs = pose.legs; if (sit) legs = legs.map(([h, k], i) => [h * (1 - sit) + (i ? 1.35 : 1.5) * sit, k * (1 - sit) + (i ? 1.35 : 1.5) * sit]);
  const hipX = x + (pose.lean || 0) * 30 * s * dir;
  let hipY = y - legL + (pose.bounce || 0) * s; if (sit) hipY = hipY * (1 - sit) + (y - shin - 10 * s) * sit;
  const seg = (px, py, ang, len) => [px + Math.sin(ang) * len * dir, py + Math.cos(ang) * len];
  const bodyCol = spec.skin || "#ffffff";
  c.save();
  if (pose.rot) { c.translate(x, y - 20 * s); c.rotate(pose.rot * dir); c.translate(-x, -(y - 20 * s)); }
  if (pose.squash) { c.translate(x, y); c.scale(1 + pose.squash * .6, 1 - pose.squash); c.translate(-x, -y); }
  if (body === "glow") { c.shadowColor = "rgba(255,255,255,.85)"; c.shadowBlur = 26 * s; }

  const limb = (pts, w = lw, col = ink) => {
    if (body === "rubber") return pen.curve(pts, w, col);
    if (body === "glow") { pen.line(pts, w * 3.6, "#c9ccd6"); return pen.line(pts, w * 2.6, "#f4f5f8"); }
    if (body === "chunky") { pen.line(pts, w * 3.2, ink); return pen.line(pts, w * 2.0, bodyCol); }
    return pen.line(pts, w, col);
  };
  // ---- legs ----
  const spread = side ? 0 : 16 * s;
  const feet = [];
  legs.forEach(([h, k], i) => {
    const sx = hipX + (i ? spread : -spread), knee = seg(sx, hipY, h, thigh), foot = seg(knee[0], knee[1], h - Math.abs(k), shin);
    const mid = body === "rubber" ? [(sx + foot[0]) / 2 + Math.sin(h) * 30 * s * dir, (hipY + foot[1]) / 2] : knee;
    limb([[sx, hipY], mid, foot]); feet.push(foot);
    const fx = side ? foot[0] + 14 * s * dir : foot[0] + (i ? 9 : -9) * s;
    if (body === "line" && !spec.shoes) return;
    c.beginPath(); c.ellipse(fx, foot[1] - 4 * s, (side ? 22 : 17) * s, 9 * s, 0, 0, 7); c.fillStyle = spec.shoes || ink; c.fill();
  });
  // ---- torso ----
  const lean = pose.lean || 0, shX = hipX + Math.sin(lean) * torsoH * dir, shY = hipY - Math.cos(lean) * torsoH;
  const tw = (side ? 54 : 72) * s;
  c.save(); c.translate(hipX, hipY); c.rotate(lean * dir);
  if (body === "line" || body === "rubber") { if (body === "rubber") pen.curve([[0, 0], [6 * s * dir, -torsoH * .5], [0, -torsoH]], lw); else pen.line([[0, 0], [0, -torsoH]], lw); }
  else if (body === "glow") { pen.line([[0, -8 * s], [0, -torsoH + 10 * s]], 46 * s, "#c9ccd6"); pen.line([[0, -8 * s], [0, -torsoH + 10 * s]], 38 * s, "#f4f5f8"); }
  else if (body === "chunky") { pen.rect(-tw / 2, -torsoH - 4 * s, tw, torsoH + 14 * s, spec.shirt || "#ffffff", ink, lw * .9, 26 * s); }
  else { pen.rect(-tw / 2, -torsoH - 4 * s, tw, torsoH + 16 * s, spec.shirt || "#e8e8e8", ink, lw * .8, [24 * s, 24 * s, 12 * s, 12 * s]); pen.rect(-tw / 2, -8 * s, tw, 26 * s, spec.pants || "#3a3f4a", ink, lw * .8, 8 * s); }
  outfit(pen, spec, tw, torsoH, s, side, dir, ink, lw);
  c.restore();
  // ---- arms (back arm behind the body in side view) ----
  let hand = null;
  const arm = i => {
    const [sa, ea] = pose.arms[i]; const sx = shX + (side ? 0 : (i ? -1 : 1) * (body === "line" || body === "rubber" || body === "glow" ? 4 : tw / 2 - 6 * s)), sy = shY + 14 * s;
    const el = seg(sx, sy, sa, upper), hd = seg(el[0], el[1], sa + ea, fore);
    const mid = body === "rubber" ? [(sx + hd[0]) / 2 + Math.cos(sa) * 18 * s, (sy + hd[1]) / 2 - Math.sin(sa) * 10 * s] : el;
    limb([[sx, sy], mid, hd], lw * (body === "line" ? 1 : .9));
    const g = spec.gloves || body === "rubber" || body === "chunky";
    if (g) { pen.circle(hd[0], hd[1], (body === "rubber" ? 15 : 17) * s, typeof spec.gloves === "string" ? spec.gloves : "#ffffff", ink, lw * .55); }
    else if (body === "torso") pen.circle(hd[0], hd[1], 11 * s, bodyCol, ink, lw * .5);
    if (i === 0) hand = hd;
  };
  if (side) arm(1);
  // ---- head ----
  const hx = shX + Math.sin(pose.head || 0) * 10 * s * dir, hy = shY - headR - (body === "line" || body === "rubber" ? 2 : 10) * s;
  c.save(); c.translate(hx, hy); c.rotate((pose.head || 0) * dir);
  hatBack(pen, spec, headR, s, dir, side, ink, lw);
  const headFill = body === "glow" ? "#f4f5f8" : bodyCol;
  pen.circle(0, 0, headR, headFill, body === "glow" ? "#c9ccd6" : ink, lw * (body === "glow" ? 1.2 : 1));
  hair(pen, spec, headR, s, dir, side, ink, lw);
  facialHair(pen, spec, headR, s, dir, side, ink);
  drawFace(pen, headR, expr, { dir, side, talk: o.talk, t: o.t, blink: o.blink, ink: spec.faceInk || ink, eyeWhite: headFill });
  if (spec.glasses) { c.lineWidth = lw * .45; c.strokeStyle = ink; for (const gx of side ? [headR * .02 * dir, headR * .4 * dir] : [-headR * .3, headR * .3]) { c.beginPath(); c.arc(gx, -headR * .02, headR * .2, 0, 7); c.stroke(); } }
  hat(pen, spec, headR, s, dir, side, ink, lw);
  c.restore();
  if (side) arm(0); else { arm(1); arm(0); }
  c.restore();
  return { hand, head: [hx, hy, headR], feet };
}

function outfit(pen, sp, tw, th, s, side, dir, ink, lw) {
  const o = sp.outfit; if (!o) return; const c = pen.ctx, w = tw, h = th;
  if (o === "tee") pen.rect(-w / 2, -h - 4 * s, w, h * .75, sp.shirt || "#f2c230", ink, lw * .8, 20 * s);
  if (o === "hoodie") { pen.rect(-w / 2 - 6 * s, -h - 6 * s, w + 12 * s, h + 20 * s, sp.hood || "#e8862a", ink, lw * .8, [28 * s, 28 * s, 10 * s, 10 * s]);
    pen.rect(-w * .3, -h * .38, w * .6, h * .24, null, ink, lw * .45, 8 * s); pen.line([[-8 * s, -h], [-6 * s, -h + 38 * s]], lw * .4); pen.line([[8 * s, -h], [6 * s, -h + 38 * s]], lw * .4); }
  if (o === "suit") { pen.rect(-w / 2 - 4 * s, -h - 6 * s, w + 8 * s, h + 30 * s, sp.coat || "#2b2f3a", ink, lw * .8, [24 * s, 24 * s, 6 * s, 6 * s]);
    pen.poly([[-12 * s, -h - 4 * s], [12 * s, -h - 4 * s], [0, -h + 48 * s]], "#ffffff", ink, lw * .4); pen.poly([[-5 * s, -h + 4 * s], [5 * s, -h + 4 * s], [4 * s, -h + 50 * s], [0, -h + 58 * s], [-4 * s, -h + 50 * s]], sp.tie || "#c0302a", null, 0); }
  if (o === "kimono" || o === "robe") { pen.poly([[-w / 2 - 4 * s, -h - 4 * s], [w / 2 + 4 * s, -h - 4 * s], [w / 2 + 26 * s, 60 * s], [-w / 2 - 26 * s, 60 * s]], sp.shirt || "#3a5a8a", ink, lw * .8);
    if (o === "kimono") { pen.line([[-14 * s, -h], [10 * s, -h * .45]], lw * .5); pen.line([[14 * s, -h], [-4 * s, -h * .55]], lw * .5); pen.rect(-w / 2 - 8 * s, -h * .42, w + 16 * s, 22 * s, sp.sash || "#c8a23a", ink, lw * .5); } }
  if (o === "fur") { pen.poly([[-w / 2, -h + 10 * s], [w / 2, -h - 6 * s], [w / 2 + 6 * s, 26 * s], [w * .1, 40 * s], [-w / 2 - 6 * s, 30 * s]], sp.shirt || "#a8743a", ink, lw * .8);
    c.fillStyle = "rgba(60,30,10,.55)"; for (const [a, b] of [[-.2, -.7], [.25, -.45], [-.1, -.2], [.2, .05]]) { c.beginPath(); c.ellipse(a * w, b * h, 7 * s, 5 * s, .4, 0, 7); c.fill(); } }
  if (o === "egypt") { pen.poly([[-w / 2 - 2 * s, -10 * s], [w / 2 + 2 * s, -10 * s], [w / 2 + 14 * s, 54 * s], [-w / 2 - 14 * s, 54 * s]], "#f4efe2", ink, lw * .7);
    pen.rect(-w / 2 - 2 * s, -14 * s, w + 4 * s, 12 * s, "#d8a83a", ink, lw * .4); c.save(); c.beginPath(); c.ellipse(0, -h, w * .62, 30 * s, 0, 0, Math.PI); c.fillStyle = "#2f8a8a"; c.fill(); c.lineWidth = lw * .5; c.strokeStyle = ink; c.stroke();
    c.beginPath(); c.ellipse(0, -h, w * .42, 18 * s, 0, 0, Math.PI); c.fillStyle = "#d8a83a"; c.fill(); c.restore(); }
  if (o === "dress") pen.poly([[-w / 2, -h], [w / 2, -h], [w / 2 + 30 * s, 50 * s], [-w / 2 - 30 * s, 50 * s]], sp.shirt || "#d84a6a", ink, lw * .8);
  if (o === "apron") pen.rect(-w / 2 + 6 * s, -h * .6, w - 12 * s, h * .6 + 26 * s, sp.apron || "#f2f2f2", ink, lw * .6, 6 * s);
}

function hatBack(pen, sp, r, s, dir, side, ink, lw) {
  if (sp.outfit === "hoodie" && sp.hood !== false && !sp.hoodDown) pen.circle(side ? -r * .12 * dir : 0, r * .04, r * 1.24, sp.hood || "#e8862a", ink, lw * .8);
  if (sp.hat === "nemes") { pen.poly([[-r * 1.15, -r * .4], [r * 1.15, -r * .4], [r * 1.25, r * 1.1], [r * .75, r * 1.0], [-r * .75, r * 1.0], [-r * 1.25, r * 1.1]], "#2f6fb0", ink, lw * .7); }
  if (sp.hair === "bob") pen.rect(-r * 1.08, -r * .95, r * 2.16, r * 1.8, sp.hairColor || "#3a2a20", ink, lw * .8, r * .8);
  if (sp.hair === "ponytail") pen.circle(-r * 1.05 * dir, r * .2, r * .35, sp.hairColor || "#3a2a20", ink, lw * .8);
}

function hair(pen, sp, r, s, dir, side, ink, lw) {
  const c = pen.ctx, h = sp.hair; if (!h || h === "bald") return; const col = sp.hairColor || ink;
  if (h === "tufts") { pen.curve([[-r * .15, -r * .95], [-r * .35, -r * 1.35], [-r * .1, -r * 1.55]], lw * .9); pen.curve([[r * .12, -r * .97], [r * .1, -r * 1.4], [r * .38, -r * 1.5]], lw * .9); return; }
  if (h === "topknot") { pen.circle(side ? -r * .3 * dir : 0, -r * 1.05, r * .2, col, ink, lw * .6); c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); pen.rect(-r * 1.1, -r * 1.1, r * 2.2, r * .55, col, null, 0); c.restore(); pen.circle(0, 0, r, null, ink, lw); return; }
  c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); c.beginPath();
  if (h === "spiky") { c.moveTo(-r, -r * .1); for (let i = 0; i <= 6; i++) c.lineTo(-r + i * r / 3, -r * (i % 2 ? 1.2 : .62)); c.lineTo(r, -r * .1); c.lineTo(r, -r * 1.3); c.lineTo(-r, -r * 1.3); }
  else { const fr = side ? r * .25 * dir : 0; c.moveTo(-r, -r * .05); c.quadraticCurveTo(-r * .4 + fr, -r * .6, fr, -r * .4); c.quadraticCurveTo(r * .5 + fr, -r * .25, r, -r * .02); c.lineTo(r, -r * 1.2); c.lineTo(-r, -r * 1.2); }
  c.closePath(); c.fillStyle = col; c.fill(); c.restore(); pen.circle(0, 0, r, null, ink, lw);
  if (h === "messy") for (let k = -2; k <= 2; k++) pen.line([[k * r * .3, -r * .95], [k * r * .38 + r * .1, -r * 1.22]], lw * .6);
}

function facialHair(pen, sp, r, s, dir, side, ink) {
  // Same rule as character.js: beard is a jaw band below the mouth, mustache sits high, stubble is a shade. Never a line at mouth height.
  const c = pen.ctx, ox = side ? r * .3 * dir : 0, col = sp.beardColor || "#4a3424";
  if (sp.beard === "stubble") { c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); c.fillStyle = "rgba(40,40,48,.13)"; c.beginPath(); c.ellipse(ox * .5, r * .62, r * .78, r * .42, 0, 0, 7); c.fill(); c.restore(); }
  if (sp.beard === "full") { const a0 = .22, a1 = Math.PI - .22; c.beginPath(); c.moveTo(Math.cos(a0) * r, Math.sin(a0) * r); c.arc(0, r * .04, r * 1.06, a0, a1); c.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    c.quadraticCurveTo(ox - r * .3, r * .62, ox, r * .66); c.quadraticCurveTo(ox + r * .3, r * .62, Math.cos(a0) * r, Math.sin(a0) * r); c.fillStyle = col; c.fill(); c.lineWidth = Math.max(2, r * .06); c.strokeStyle = ink; c.stroke(); }
  if (sp.beard === "mustache" || sp.beard === "full") { const y = r * .21, w = r * (side ? .2 : .27); c.beginPath(); c.moveTo(ox - w, y + r * .04); c.quadraticCurveTo(ox - w * .5, y - r * .07, ox, y - r * .01); c.quadraticCurveTo(ox + w * .5, y - r * .07, ox + w, y + r * .04); c.quadraticCurveTo(ox, y + r * .02, ox - w, y + r * .04); c.fillStyle = col; c.fill(); c.lineWidth = Math.max(2, r * .05); c.strokeStyle = ink; c.stroke(); }
}

function hat(pen, sp, r, s, dir, side, ink, lw) {
  const h = sp.hat; const col = sp.hatColor; const sx = side ? r * .08 * dir : 0;
  if (sp.outfit === "hoodie" && sp.hood !== false && !sp.hoodDown) { const c = pen.ctx; c.save(); c.beginPath(); c.arc(0, 0, r * 1.24, 0, 7); c.arc(side ? r * .12 * dir : 0, r * .06, r * .98, 0, 7, true); c.fillStyle = sp.hood || "#e8862a"; c.fill("evenodd"); c.restore(); pen.circle(side ? r * .12 * dir : 0, r * .06, r * .98, null, ink, lw * .5); }
  if (!h) return;
  if (h === "beanie") { pen.poly([[-r * 1.0, -r * .3], [-r * .85, -r * .85], [-r * .3, -r * 1.12], [r * .3, -r * 1.12], [r * .85, -r * .85], [r * 1.0, -r * .3]], col || "#d8302a", ink, lw * .8); pen.rect(-r * 1.05, -r * .48, r * 2.1, r * .3, col || "#d8302a", ink, lw * .8, r * .12); }
  if (h === "cap") { pen.poly([[-r * .95, -r * .3], [-r * .7, -r * .9], [r * .7, -r * .9], [r * .95, -r * .3]], col || "#2a5aa8", ink, lw * .8); pen.rect(sx + (side ? r * .3 * dir : r * .05), -r * .42, r * .9 * (side ? dir : 1), r * .16, col || "#2a5aa8", ink, lw * .7, 4 * s); }
  if (h === "fedora") { pen.rect(sx - r * 1.25, -r * .72, r * 2.5, r * .2, col || "#2b2b33", ink, lw * .8, r * .1); pen.rect(sx - r * .72, -r * 1.42, r * 1.44, r * .76, col || "#2b2b33", ink, lw * .8, [r * .35, r * .35, 3, 3]); pen.rect(sx - r * .72, -r * .9, r * 1.44, r * .15, sp.hatBand || "#1b1b22", null, 0); }
  if (h === "kasa") pen.poly([[sx - r * 1.6, -r * .45], [sx, -r * 1.45], [sx + r * 1.6, -r * .45]], col || "#d8b46a", ink, lw * .8);
  if (h === "nemes") { pen.rect(-r * 1.05, -r * 1.05, r * 2.1, r * .6, "#2f6fb0", ink, lw * .7, [r * .9, r * .9, 0, 0]); const c = pen.ctx; c.fillStyle = "#d8a83a"; for (let k = 0; k < 4; k++) c.fillRect(-r * 1.0, -r * 1.0 + k * r * .15, r * 2.0, r * .06); }
  if (h === "crown") pen.poly([[-r * .7, -r * .75], [-r * .7, -r * 1.35], [-r * .35, -r * 1.05], [0, -r * 1.45], [r * .35, -r * 1.05], [r * .7, -r * 1.35], [r * .7, -r * .75]], col || "#f2c230", ink, lw * .7);
  if (h === "headband") pen.rect(-r * 1.02, -r * .62, r * 2.04, r * .2, col || "#d8302a", ink, lw * .6, r * .08);
  if (h === "hardhat") { const c = pen.ctx; c.beginPath(); c.arc(sx, -r * .35, r * .95, Math.PI, 0); c.closePath(); c.fillStyle = col || "#f2c230"; c.fill(); c.lineWidth = lw * .8; c.strokeStyle = ink; c.stroke(); pen.rect(sx - r * 1.18, -r * .45, r * 2.36, r * .18, col || "#f2c230", ink, lw * .7, 6 * s); }
}
