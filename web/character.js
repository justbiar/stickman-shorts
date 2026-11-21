// Flat 2D stick character, redrawn every frame on its own canvas (no 3D model, no shading).
// White round face with a thick dark outline, black oval eyes, graphic brows, simple mouth,
// flat hair and shirt, very thin black line limbs, small rounded hands, minimal feet.
// Turns are new drawings (front / left / right), not a rotated solid.
export const CW = 512, CH = 768;           // canvas size; the character stands on y = GROUND
const GROUND = 744, INK = "#1b1b22", LW = 7;

const lerp = (a, b, t) => a + (b - a) * t;
export function mixPose(a, b, t) {
  const o = {};
  for (const k in a) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => Array.isArray(v) ? v.map((w, j) => lerp(w, b[k][i][j], t)) : lerp(v, b[k][i], t)) : (typeof a[k] === "number" ? lerp(a[k], b[k], t) : (t < .5 ? a[k] : b[k]));
  return o;
}
// pose: angles in radians, 0 = hanging straight down, positive = toward the character's front (+x when facing right)
export const BASE = { bounce: 0, lean: 0, head: 0, legs: [[.05, 0], [-.05, 0]], arms: [[.12, .1], [-.12, -.1]] };

export function drawCharacter(ctx, c, pose, face, look) {
  // c: {shirt, pants, hair, hairStyle, skin}; face: {brow, eyes, mouth, talk}; look: "front" | "left" | "right"
  ctx.clearRect(0, 0, CW, CH);
  const dir = look === "left" ? -1 : 1, side = look !== "front";
  const legL = 210, thigh = legL * .52, shin = legL * .48, torsoH = 150, torsoW = side ? 50 : 66, headR = 74;
  const hipX = CW / 2 + pose.lean * 30 * dir, hipY = GROUND - legL + pose.bounce;
  const line = (pts, w = LW) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]);
    ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.stroke(); };
  const seg = (x, y, ang, len) => [x + Math.sin(ang) * len * dir, y + Math.cos(ang) * len];
  // legs: side view swings in the plane; front view spreads a little sideways
  const spread = side ? 0 : 14;
  pose.legs.forEach(([h, k], i) => {
    const sx = hipX + (i ? spread : -spread), knee = seg(sx, hipY, h, thigh), foot = seg(knee[0], knee[1], h - Math.abs(k), shin);
    line([[sx, hipY], knee, foot], LW);
    ctx.beginPath(); const fx = side ? foot[0] + 12 * dir : foot[0] + (i ? 8 : -8);   // minimal foot
    ctx.ellipse(fx, Math.min(foot[1], GROUND - 6), side ? 16 : 13, 7, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
  });
  // torso: small narrow flat shape, tilts with lean
  const shY = hipY - torsoH, shX = hipX + Math.sin(pose.lean) * torsoH * dir;
  ctx.save(); ctx.translate(hipX, hipY); ctx.rotate(pose.lean * dir);
  ctx.beginPath(); ctx.roundRect(-torsoW / 2, -torsoH - 4, torsoW, torsoH + 16, [22, 22, 12, 12]); ctx.fillStyle = c.shirt; ctx.fill(); ctx.lineWidth = LW - 1; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-torsoW / 2, -6, torsoW, 26, 8); ctx.fillStyle = c.pants; ctx.fill(); ctx.stroke();
  drawOutfit(ctx, c, torsoW, torsoH, side, dir);
  ctx.restore();
  // arms: back arm first (behind body in side view), then head, then front arm
  const arm = (i) => { const [s, e] = pose.arms[i]; const sx = shX + (side ? 0 : (i ? 1 : -1) * (torsoW / 2 - 4)), sy = shY + 14;
    const el = seg(sx, sy, s, 92), hd = seg(el[0], el[1], s + e, 84); line([[sx, sy], el, hd], LW - 1.5);
    ctx.beginPath(); ctx.arc(hd[0], hd[1], 12, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); };
  if (side) arm(1);
  // head
  const hx = shX + Math.sin(pose.head) * 10 * dir, hy = shY - headR - 10;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(pose.head * dir);
  drawHair(ctx, c, headR, dir, side, true);
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI * 2); ctx.fillStyle = c.skin || "#ffffff"; ctx.fill(); ctx.lineWidth = LW + 1; ctx.strokeStyle = INK; ctx.stroke();
  drawHair(ctx, c, headR, dir, side, false);
  drawFacialHair(ctx, c, headR, dir, side);
  drawFace(ctx, face, headR, dir, side);
  drawHat(ctx, c, headR, dir, side);
  ctx.restore();
  if (side) arm(0); else { arm(0); arm(1); }
}

function drawHair(ctx, c, r, dir, side, back) {
  ctx.fillStyle = c.hair; ctx.strokeStyle = INK; ctx.lineWidth = LW;
  if (back) { if (c.hairStyle === "bob") { ctx.beginPath(); ctx.roundRect(-r * 1.08, -r * .9, r * 2.16, r * 1.75, r * .8); ctx.fill(); ctx.stroke(); }
    if (c.hairStyle === "ponytail") { ctx.beginPath(); ctx.ellipse(-r * 1.05 * dir, r * .1, r * .32, r * .55, .4 * dir, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    return; }
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  ctx.beginPath();
  if (c.hairStyle === "spiky") { ctx.moveTo(-r, -r * .1); for (let i = 0; i <= 6; i++) ctx.lineTo(-r + i * r / 3, -r * (i % 2 ? 1.25 : .75)); ctx.lineTo(r, -r * .1); }
  else { const fr = side ? r * .25 * dir : 0; ctx.moveTo(-r, -r * .05); ctx.quadraticCurveTo(-r * .4 + fr, -r * .55, fr, -r * .35); ctx.quadraticCurveTo(r * .5 + fr, -r * .2, r, -r * .02); ctx.lineTo(r, -r * 1.2); ctx.lineTo(-r, -r * 1.2); }
  ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = LW + 1; ctx.stroke();
}

// face: brow -1 angry … 0 neutral … 1 raised; eyes "open" | "happy" | "closed" | "wide"; mouth "smile" | "grin" | "flat" | "frown" | "o"; talk 0..1 opens the mouth
function drawFace(ctx, f, r, dir, side) {
  const ox = side ? r * .32 * dir : 0, ex = side ? [r * .02, r * .42] : [-r * .3, r * .3];
  const eyeX = ex.map(x => (side ? x * dir : x) + (side ? 0 : 0) + ox * .2);
  ctx.fillStyle = "#16161c"; ctx.strokeStyle = "#16161c";
  eyeX.forEach((x, i) => {
    if (side && i === 0 && dir === 0) return;
    const ey = -r * .02, open = f.eyes !== "closed" && f.eyes !== "happy";
    if (open) { const s = f.eyes === "wide" ? 1.25 : 1; ctx.beginPath(); ctx.ellipse(x + ox * .4, ey, r * .085 * s, r * .15 * s, 0, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.beginPath(); ctx.lineWidth = 6; ctx.lineCap = "round"; if (f.eyes === "happy") ctx.arc(x + ox * .4, ey + 6, r * .1, Math.PI * 1.1, Math.PI * 1.9); else { ctx.moveTo(x + ox * .4 - r * .1, ey); ctx.lineTo(x + ox * .4 + r * .1, ey); } ctx.stroke(); }
    // brow: graphic stroke above each eye; tilt and lift by f.brow
    const b = f.brow || 0, inner = (i === 0 ? 1 : -1) * (side ? -dir : 1);
    ctx.beginPath(); ctx.lineWidth = 6.5; ctx.lineCap = "round";
    let by = ey - r * .32 - b * r * .1, tilt = (b < 0 ? -b : 0) * r * .12 * inner * -1 + (b > .5 ? -r * .03 : 0);
    if (f.worry) tilt = r * .1 * inner * f.worry;                       // worried / sad: inner ends go up
    ctx.moveTo(x + ox * .4 - r * .13, by - tilt); ctx.lineTo(x + ox * .4 + r * .13, by + tilt); ctx.stroke();
  });
  // mouth
  const mx = ox * .7, my = r * .42, w = r * (side ? .26 : .34), talk = f.talk || 0;
  ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath();
  if (talk > .05 || f.mouth === "o") { const h = f.mouth === "o" ? r * .16 : r * (.04 + .14 * talk); ctx.ellipse(mx, my, f.mouth === "o" ? r * .1 : w * .55, h, 0, 0, Math.PI * 2); ctx.fillStyle = "#2a1820"; ctx.fill(); ctx.stroke(); return; }
  if (f.mouth === "grin") { ctx.moveTo(mx - w, my - 6); ctx.quadraticCurveTo(mx, my + r * .32, mx + w, my - 6); ctx.closePath(); ctx.fillStyle = "#2a1820"; ctx.fill(); ctx.stroke(); return; }
  const curve = f.mouth === "smile" ? r * .2 : f.mouth === "frown" ? -r * .16 : 0;
  ctx.moveTo(mx - w, my); ctx.quadraticCurveTo(mx, my + curve, mx + w, my); ctx.stroke();
}

// ---------- actions → pose at time t (seconds since the action started) ----------
const S = Math.sin;
export const ACTIONS = {
  idle: t => ({ ...BASE, bounce: 2 * S(t * 2.4), arms: [[.12 + .02 * S(t * 2.4), .1], [-.12, -.1]] }),
  walk: t => { const p = t * 7.2; return { ...BASE, bounce: -5 * Math.abs(S(p)), lean: .05,
    legs: [[.42 * S(p), .35 * Math.max(0, -Math.cos(p))], [-.42 * S(p), .35 * Math.max(0, Math.cos(p))]], arms: [[-.4 * S(p), .25], [.4 * S(p), .25]] }; },
  wave: t => ({ ...BASE, bounce: 2 * S(t * 3), head: .08, arms: [[2.6, .6 + .45 * S(t * 11)], [-.15, -.1]] }),
  point: t => ({ ...BASE, lean: .04, arms: [[1.5, 0], [-.15, -.1]] }),
  talk: t => ({ ...BASE, bounce: 2 * S(t * 4), head: .05 * S(t * 2.1), arms: [[.7 + .25 * S(t * 3.1), .9 + .3 * S(t * 2.3)], [-.3 - .15 * S(t * 2.7), -.4]] }),
  shrug: t => { const k = Math.min(1, t * 4); return { ...BASE, bounce: -4 * k, head: .12 * k, arms: [[.9 * k, -1.6 * k], [-.9 * k, 1.6 * k]] }; },
  think: t => ({ ...BASE, head: -.12, arms: [[1.0, 1.9], [.4, 1.2]] }),
  jump: t => { const ph = (t % .9) / .9, up = Math.max(0, S(ph * Math.PI)); return { ...BASE, bounce: -90 * up + (ph < .1 ? 10 : 0),
    legs: [[.25 * up, .5 * up], [-.25 * up, .5 * up]], arms: [[2.7 * up + .2, .2], [-2.7 * up - .2, -.2]] }; },
  cheer: t => ({ ...BASE, bounce: -6 * Math.abs(S(t * 6)), arms: [[2.8, .2 + .2 * S(t * 9)], [-2.8, -.2 - .2 * S(t * 9)]] }),
  sad: t => ({ ...BASE, lean: -.08, head: -.25, bounce: 4, arms: [[.05, 0], [-.05, 0]] }),
};
export const FACES = {
  neutral: { brow: 0, eyes: "open", mouth: "flat" }, happy: { brow: .4, eyes: "happy", mouth: "smile" }, excited: { brow: 1, eyes: "wide", mouth: "grin" },
  surprised: { brow: 1.2, eyes: "wide", mouth: "o" }, sad: { brow: .1, worry: 1, eyes: "open", mouth: "frown" }, angry: { brow: -1, eyes: "open", mouth: "frown" },
  smug: { brow: .3, eyes: "open", mouth: "smile" }, thinking: { brow: .6, eyes: "open", mouth: "flat" },
};

// ---------- "bean" style: head and body are one tall flat shape, costume drawn over the lower part ----------
// c: {style:"bean", body:"#fff", outfit:{type:"coat"|"robe"|"apron", color, trim}, hair:{type:"wig"|"bun"|"bald"|"short", color},
//     hat:{type:"none"|"scholar"|"crown", color}, beard:"none"|"white"|"stubble"|"mustache", collar:"#fff"}
export function drawBean(ctx, c, pose, face, look) {
  ctx.clearRect(0, 0, CW, CH);
  const dir = look === "left" ? -1 : 1, side = look !== "front";
  const H0 = 560, Wd = side ? 200 : 220, cx = CW / 2 + pose.lean * 40 * dir, base = GROUND - 8 + pose.bounce * .6, top = base - H0;
  // egg: a round head dome flowing into a slightly wider, soft-bottomed body
  const R = Wd * .5, hc = top + R * 1.05;
  const bean = () => { ctx.beginPath(); ctx.moveTo(cx - R, hc); ctx.ellipse(cx, hc, R, R * 1.05, 0, Math.PI, Math.PI * 2);
    ctx.bezierCurveTo(cx + R * 1.02, hc + H0 * .25, cx + R * 1.12, base - H0 * .22, cx + R * .95, base - 6); ctx.quadraticCurveTo(cx, base + 18, cx - R * .95, base - 6);
    ctx.bezierCurveTo(cx - R * 1.12, base - H0 * .22, cx - R * 1.02, hc + H0 * .25, cx - R, hc); ctx.closePath(); };
  ctx.save(); ctx.translate(cx, base); ctx.rotate(pose.lean * .5 * dir); ctx.translate(-cx, -base);
  // hair behind (wig sides, bun)
  const hy = top + H0 * .2;
  if (c.hair?.type === "wig") { ctx.fillStyle = c.hair.color; for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(cx + s * Wd * (.5 + .04 * (k % 2)), top + 70 + k * 46, 34, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); } }
  if (c.hair?.type === "bun") { ctx.beginPath(); ctx.arc(cx - 10 * dir, top - 18, 30, 0, Math.PI * 2); ctx.fillStyle = c.hair.color; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
  // back arm
  const arm = (i) => { const [s, e] = pose.arms[i]; const sx = cx + (i ? 1 : -1) * Wd * (side ? .18 : .46), sy = top + H0 * .52;
    const seg = (x, y, ang, len) => [x + Math.sin(ang) * len * dir * (side ? 1 : (i ? 1 : -1)), y + Math.cos(ang) * len];
    const el = seg(sx, sy, s, 95), hd = seg(el[0], el[1], s + e, 88);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(el[0], el[1]); ctx.lineTo(hd[0], hd[1]); ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(hd[0], hd[1], 13, 0, Math.PI * 2); ctx.fillStyle = c.body || "#fff"; ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); return hd; };
  let hands = [];
  if (side) hands[1] = arm(1);
  // the bean
  bean(); ctx.fillStyle = c.body || "#ffffff"; ctx.fill();
  // outfit, clipped to the bean
  ctx.save(); bean(); ctx.clip(); const o = c.outfit || { type: "robe", color: "#5b4b9a" };
  ctx.fillStyle = o.color;
  if (o.type === "apron") { ctx.fillRect(cx - Wd * .34, base - H0 * .42, Wd * .68, H0 * .5); ctx.fillStyle = o.trim || "#4a3326"; ctx.fillRect(cx - Wd * .6, base - H0 * .45, Wd * 1.2, 16); }
  else { const y0 = base - H0 * (o.type === "coat" ? .5 : .56); ctx.fillRect(cx - Wd, y0, Wd * 2, H0); if (o.trim) { ctx.fillStyle = o.trim; ctx.fillRect(cx - 9, y0, 18, H0); for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(cx + 22 * (side ? dir : 1), y0 + 40 + k * 44, 7, 0, Math.PI * 2); ctx.fill(); } }
    if (c.collar) { ctx.fillStyle = c.collar; ctx.beginPath(); ctx.moveTo(cx - 46, y0 - 4); ctx.lineTo(cx + 46, y0 - 4); ctx.lineTo(cx + 14, y0 + 70); ctx.lineTo(cx, y0 + 40); ctx.lineTo(cx - 14, y0 + 70); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); } }
  ctx.restore();
  bean(); ctx.lineWidth = LW + 1; ctx.strokeStyle = INK; ctx.stroke();
  // hair on top (short, wig cap)
  ctx.save(); bean(); ctx.clip();
  if (c.hair?.type === "wig" || c.hair?.type === "short") { ctx.fillStyle = c.hair.color; ctx.beginPath(); ctx.moveTo(cx - Wd * .7, hy + 10); ctx.quadraticCurveTo(cx - Wd * .1 + (side ? 30 * dir : 0), top + 40, cx + Wd * .25, top + 70); ctx.quadraticCurveTo(cx + Wd * .5, top + 50, cx + Wd * .7, hy + 4); ctx.lineTo(cx + Wd, top - 20); ctx.lineTo(cx - Wd, top - 20); ctx.closePath(); ctx.fill(); }
  ctx.restore(); bean(); ctx.lineWidth = LW + 1; ctx.strokeStyle = INK; ctx.stroke();
  // face (reuse the stick face, scaled to the bean)
  ctx.save(); ctx.translate(cx + (side ? 22 * dir : 0), top + H0 * .2); ctx.rotate(pose.head * dir * .6);
  const r = 96; drawFaceBig(ctx, face, r, dir, side);
  // facial hair
  ctx.strokeStyle = INK; ctx.lineWidth = 5;
  if (c.beard === "white" || c.beard === "stubble") { ctx.fillStyle = c.beard === "white" ? "rgba(255,255,255,1)" : "transparent";
    for (let k = 0; k < 28; k++) { const a = Math.PI * (.15 + .7 * (k / 27)), rr = r * (.75 + (k % 3) * .12); const x = Math.cos(a) * rr * .9, y = Math.sin(a) * rr * .9 + r * .35;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (k % 2 ? 6 : -6), y + 14); ctx.lineWidth = 3; ctx.stroke(); } }
  if (c.beard === "mustache") { ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * r * .22, r * .36, r * .24, r * .08, s * -.35, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
  // hat on top
  if (c.hat?.type === "scholar") { ctx.fillStyle = c.hat.color || INK; ctx.beginPath(); ctx.roundRect(cx - 70, top - 34, 140, 54, 16); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillRect(cx - 130, top - 6, 260, 12); }
  if (c.hat?.type === "crown") { ctx.fillStyle = c.hat.color || "#f2c230"; ctx.beginPath(); ctx.moveTo(cx - 70, top + 30); for (let k = 0; k <= 4; k++) ctx.lineTo(cx - 70 + k * 35, top - (k % 2 ? 10 : 40)); ctx.lineTo(cx + 70, top + 30); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
  if (side) hands[0] = arm(0); else { hands[0] = arm(0); hands[1] = arm(1); }
  // little feet
  ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * 34 + (side ? 10 * dir : 0), GROUND - 6, 26, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  return hands;
}
// bigger, bolder face for bean characters: heavy brows, expressive mouth
function drawFaceBig(ctx, f, r, dir, side) {
  const ox = side ? r * .18 * dir : 0, ex = side ? [-r * .05, r * .35] : [-r * .3, r * .3];
  ctx.fillStyle = INK; ctx.strokeStyle = INK;
  ex.forEach((x0, i) => { const x = (side ? x0 * dir : x0) + ox, ey = 0;
    if (f.eyes === "closed" || f.eyes === "happy") { ctx.beginPath(); ctx.lineWidth = 7; ctx.lineCap = "round"; if (f.eyes === "happy") ctx.arc(x, ey + 8, r * .12, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(x - r * .12, ey); ctx.lineTo(x + r * .12, ey); } ctx.stroke(); }
    else if (f.eyes === "wide") { ctx.beginPath(); ctx.arc(x, ey, r * .17, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); ctx.beginPath(); ctx.arc(x + 4 * (side ? dir : 0), ey, r * .07, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
    else { ctx.beginPath(); ctx.ellipse(x, ey, r * .07, r * .12, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); }
    const b = f.brow || 0, inner = (i === 0 ? 1 : -1) * (side ? -dir : 1); let tilt = (b < 0 ? -b : 0) * r * .14 * -inner; if (f.worry) tilt = -r * .12 * inner * f.worry;
    const by = ey - r * .3 - b * r * .1; ctx.beginPath(); ctx.lineWidth = 11; ctx.lineCap = "round"; ctx.moveTo(x - r * .16, by - tilt); ctx.lineTo(x + r * .16, by + tilt); ctx.stroke(); });
  const mx = ox * 1.2, my = r * .34, w = r * (side ? .22 : .3), talk = f.talk || 0; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath();
  if (talk > .05 || f.mouth === "o") { ctx.ellipse(mx, my, f.mouth === "o" ? r * .1 : w * .6, f.mouth === "o" ? r * .14 : r * (.04 + .13 * talk), 0, 0, Math.PI * 2); ctx.fillStyle = "#3a1d24"; ctx.fill(); ctx.stroke(); return; }
  if (f.mouth === "grin") { ctx.moveTo(mx - w, my - 6); ctx.quadraticCurveTo(mx, my + r * .34, mx + w, my - 6); ctx.closePath(); ctx.fillStyle = "#3a1d24"; ctx.fill(); ctx.stroke(); return; }
  const curve = f.mouth === "smile" ? r * .2 : f.mouth === "frown" ? -r * .16 : f.mouth === "smirk" ? r * .1 : 0;
  if (f.mouth === "smirk") { ctx.moveTo(mx - w, my + 4); ctx.quadraticCurveTo(mx + w * .3, my + curve, mx + w, my - 8); ctx.stroke(); return; }
  ctx.moveTo(mx - w, my); ctx.quadraticCurveTo(mx, my + curve, mx + w, my); ctx.stroke();
}
FACES.smirk = { brow: .2, eyes: "open", mouth: "smirk" }; FACES.determined = { brow: -.6, eyes: "open", mouth: "flat" }; FACES.shocked = { brow: 1.3, eyes: "wide", mouth: "o" };
// actions for bean characters (arms only matter)
ACTIONS.stir = t => ({ ...BASE, bounce: 2 * Math.sin(t * 5), arms: [[1.1 + .25 * Math.sin(t * 5), .5 + .3 * Math.cos(t * 5)], [-.3, -.2]] });
ACTIONS.present = t => ({ ...BASE, arms: [[1.3, -.3], [-1.3, .3]] });
ACTIONS.hold = t => ({ ...BASE, bounce: 2 * Math.sin(t * 2.4), arms: [[1.2, 1.0], [-.2, -.1]] });

// ---------- costume layers for the round-head characters ----------
function drawOutfit(ctx, c, w, h, side, dir) {
  const o = c.outfit; if (!o) return; ctx.lineWidth = 5; ctx.strokeStyle = INK;
  if (o === "coat" || o === "suit") { ctx.fillStyle = c.coat || "#3a3f4a"; ctx.beginPath(); ctx.roundRect(-w / 2 - 6, -h - 6, w + 12, h + 34, [24, 24, 6, 6]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.shirt; ctx.beginPath(); ctx.moveTo(-12, -h - 4); ctx.lineTo(12, -h - 4); ctx.lineTo(0, -h + 46); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (o === "suit") { ctx.fillStyle = c.tie || "#b3262f"; ctx.beginPath(); ctx.moveTo(-6, -h + 4); ctx.lineTo(6, -h + 4); ctx.lineTo(4, -h + 56); ctx.lineTo(0, -h + 64); ctx.lineTo(-4, -h + 56); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = INK; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(side ? 10 * dir : 8, -h + 70 + k * 26, 4, 0, 7); ctx.fill(); } }
  if (o === "vest" || o === "hivis") { ctx.fillStyle = o === "hivis" ? "#ff7a1a" : (c.vest || "#7a4a2a"); ctx.beginPath(); ctx.roundRect(-w / 2 - 2, -h + 8, w + 4, h + 4, 10); ctx.fill(); ctx.stroke();
    if (o === "hivis") { ctx.fillStyle = "#e9f2f0"; ctx.fillRect(-w / 2 - 2, -h + 60, w + 4, 12); ctx.fillRect(-w / 2 - 2, -h + 96, w + 4, 12); } }
  if (o === "overalls") { ctx.fillStyle = c.overalls || "#3b6ea8"; ctx.beginPath(); ctx.roundRect(-w / 2 + 2, -h * .55, w - 4, h * .55 + 22, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h * .55); ctx.lineTo(-w / 2 + 12, -h + 6); ctx.moveTo(w / 2 - 8, -h * .55); ctx.lineTo(w / 2 - 12, -h + 6); ctx.lineWidth = 8; ctx.strokeStyle = c.overalls || "#3b6ea8"; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = INK; }
  if (c.scarf) { ctx.fillStyle = c.scarf; ctx.beginPath(); ctx.roundRect(-w / 2 - 8, -h - 10, w + 16, 26, 12); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(side ? -8 * dir : 8, -h + 8, 18, 50, 6); ctx.fill(); ctx.stroke(); }
}
function drawFacialHair(ctx, c, r, dir, side) {
  ctx.fillStyle = c.beardColor || INK; ctx.strokeStyle = INK; ctx.lineWidth = 4; const ox = side ? r * .3 * dir : 0;
  if (c.beard === "mustache" || c.beard === "full") for (const s of (side ? [dir] : [-1, 1])) { ctx.beginPath(); ctx.ellipse(ox + s * r * .17, r * .3, r * .2, r * .07, s * -.3, 0, 7); ctx.fill(); }
  if (c.beard === "full") { ctx.beginPath(); ctx.moveTo(ox - r * .55, r * .25); ctx.quadraticCurveTo(ox, r * 1.35, ox + r * .55, r * .25); ctx.quadraticCurveTo(ox, r * .75, ox - r * .55, r * .25); ctx.fill(); ctx.stroke(); }
  if (c.beard === "stubble") { ctx.fillStyle = "rgba(30,30,36,.55)"; for (let k = 0; k < 22; k++) { const a = Math.PI * (.2 + .6 * (k / 21)); ctx.beginPath(); ctx.arc(ox + Math.cos(a) * r * .62, Math.sin(a) * r * .62 + r * .1, 2.4, 0, 7); ctx.fill(); } }
  if (c.glasses) { ctx.lineWidth = 4; ctx.strokeStyle = INK; for (const x of side ? [r * .02 * dir + ox * .4, r * .42 * dir + ox * .4] : [-r * .3, r * .3]) { ctx.beginPath(); ctx.arc(x, -r * .02, r * .2, 0, 7); ctx.stroke(); } }
}
function drawHat(ctx, c, r, dir, side) {
  const h = c.hat; if (!h) return; ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.fillStyle = c.hatColor || "#3a3f4a";
  const sx = side ? r * .1 * dir : 0;
  if (h === "fedora") { ctx.beginPath(); ctx.ellipse(sx, -r * .62, r * 1.25, r * .2, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(sx - r * .7, -r * 1.35, r * 1.4, r * .75, [r * .35, r * .35, 4, 4]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.hatBand || "#1b1b22"; ctx.fillRect(sx - r * .7, -r * .82, r * 1.4, r * .16); }
  if (h === "cowboy") { ctx.beginPath(); ctx.moveTo(sx - r * 1.5, -r * .45); ctx.quadraticCurveTo(sx, -r * .25, sx + r * 1.5, -r * .45); ctx.quadraticCurveTo(sx, -r * .85, sx - r * 1.5, -r * .45); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - r * .7, -r * .6); ctx.quadraticCurveTo(sx - r * .7, -r * 1.45, sx, -r * 1.25); ctx.quadraticCurveTo(sx + r * .7, -r * 1.45, sx + r * .7, -r * .6); ctx.fill(); ctx.stroke(); }
  if (h === "hardhat" || h === "helmet") { ctx.beginPath(); ctx.arc(sx, -r * .35, r * .95, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(sx + (side ? r * .25 * dir : 0), -r * .35, r * 1.18, r * .14, 0, 0, 7); ctx.fill(); ctx.stroke();
    if (h === "hardhat") { ctx.beginPath(); ctx.moveTo(sx, -r * 1.3); ctx.lineTo(sx, -r * .4); ctx.lineWidth = 5; ctx.stroke(); } }
  if (h === "pilot") { ctx.beginPath(); ctx.arc(sx, -r * .15, r * 1.04, Math.PI * 1.02, -.02); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#9ad4e8"; for (const x of [-.32, .32]) { ctx.beginPath(); ctx.arc(sx + x * r, -r * .62, r * .2, 0, 7); ctx.fill(); ctx.stroke(); } ctx.fillStyle = c.hatColor || "#6b4a2e"; ctx.beginPath(); ctx.roundRect(sx - r * 1.05, -r * .2, r * .3, r * .7, 8); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(sx + r * .75, -r * .2, r * .3, r * .7, 8); ctx.fill(); ctx.stroke(); }
  if (h === "beanie") { ctx.beginPath(); ctx.arc(sx, -r * .3, r * .98, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(sx - r * 1.02, -r * .48, r * 2.04, r * .3, 10); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(sx, -r * 1.32, r * .18, 0, 7); ctx.fillStyle = c.hatBand || "#f2f2f2"; ctx.fill(); ctx.stroke(); }
  if (h === "straw") { ctx.fillStyle = "#e8c26a"; ctx.beginPath(); ctx.ellipse(sx, -r * .55, r * 1.45, r * .22, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.roundRect(sx - r * .62, -r * 1.2, r * 1.24, r * .66, [r * .3, r * .3, 4, 4]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#b3262f"; ctx.fillRect(sx - r * .62, -r * .74, r * 1.24, r * .14); }
  if (h === "cap") { ctx.beginPath(); ctx.arc(sx, -r * .3, r * .96, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(sx + r * .6 * (side ? dir : 1), -r * .32, r * .6, r * .12, 0, 0, 7); ctx.fill(); ctx.stroke(); }
}
