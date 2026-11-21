// A real 3D version of the round-head character: lit sphere head with a painted face decal, a clothed torso,
// tube limbs with joints, gloves, shoes and hats. It reads the same poses as the 2D kit (kit/poses.js angles)
// and the same expressions (kit/face.js), so stories work unchanged.
//   const c = makeChar3D(THREE, spec);  scene.add(c.group);  c.update(pose, expression, { t, talk, look, blink })
import { Pen } from "./kit/pen.js";
import { drawFace } from "./kit/face.js";

export function makeChar3D(THREE, sp = {}) {
  const S = 1.0;                                   // ~2.6 units tall, like the billboard cards
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? .62, metalness: o.metal ?? 0, ...o.extra });
  const ink = std(0x1a1a20, { rough: .5 }), skin = std(sp.skin || 0xfff4ea, { rough: .48 }), shirt = std(sp.shirt || "#e8e0d0", { rough: .8 });
  const pants = std(sp.pants || "#2a2a30", { rough: .85 }), over = sp.outfit === "overalls" ? std(sp.overalls || "#3b6ea8", { rough: .85 }) : null;
  const mesh = (g, m, p) => { const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };
  const group = new THREE.Group(), body = new THREE.Group(); group.add(body);
  // ---- legs: hip joint -> thigh -> knee joint -> shin -> shoe ----
  const thighL = .52 * S, shinL = .5 * S, limbR = .055 * S, hipY = 1.06 * S;
  const leg = side => { const hip = new THREE.Group(); hip.position.set(side * .1 * S, hipY, 0); body.add(hip);
    mesh(new THREE.CapsuleGeometry(limbR * 1.25, thighL, 6, 12), pants, hip).position.y = -thighL / 2;
    const knee = new THREE.Group(); knee.position.y = -thighL; hip.add(knee);
    mesh(new THREE.CapsuleGeometry(limbR, shinL, 6, 12), ink, knee).position.y = -shinL / 2;
    const shoe = mesh(new THREE.SphereGeometry(.1 * S, 16, 12), ink, knee); shoe.scale.set(1, .6, 1.6); shoe.position.set(0, -shinL - .02, .06 * S);
    return { hip, knee }; };
  const legs = [leg(1), leg(-1)];
  // ---- torso ----
  const torso = new THREE.Group(); torso.position.y = hipY; body.add(torso);
  const tH = .62 * S; const chest = mesh(new THREE.CapsuleGeometry(.22 * S, tH - .2, 8, 20), shirt, torso); chest.position.y = tH / 2 + .06; chest.scale.z = .78;
  mesh(new THREE.CylinderGeometry(.23 * S, .2 * S, .2 * S, 20), pants, torso).position.y = .02;
  if (over) { const bib = mesh(new THREE.CylinderGeometry(.225 * S, .225 * S, .34 * S, 20, 1, false, -1.1, 2.2), over, torso); bib.position.y = .2; bib.scale.z = .8;
    for (const x of [-.11, .11]) { const st = mesh(new THREE.BoxGeometry(.05, .42, .02), over, torso); st.position.set(x, .5, .175); st.rotation.x = -.15; }
    mesh(new THREE.CylinderGeometry(.235 * S, .235 * S, .14 * S, 20), over, torso).position.y = .02; }
  if (sp.outfit === "suit" || sp.outfit === "coat") mesh(new THREE.CapsuleGeometry(.235 * S, tH - .2, 8, 20), std(sp.coat || "#2b2f3a", { rough: .75 }), torso).position.y = tH / 2 + .05;
  // ---- arms: shoulder -> upper -> elbow -> fore -> glove ----
  const upL = .4 * S, foL = .38 * S;
  const arm = side => { const sh = new THREE.Group(); sh.position.set(side * .25 * S, tH + .02, 0); torso.add(sh);
    mesh(new THREE.CapsuleGeometry(limbR * 1.2, upL, 6, 12), shirt, sh).position.y = -upL / 2;
    const el = new THREE.Group(); el.position.y = -upL; sh.add(el);
    mesh(new THREE.CapsuleGeometry(limbR, foL, 6, 12), ink, el).position.y = -foL / 2;
    mesh(new THREE.SphereGeometry(.075 * S, 16, 12), std(0xf6f6f4, { rough: .5 }), el).position.y = -foL - .03;
    return { sh, el }; };
  const arms = [arm(1), arm(-1)];
  // ---- head: sphere + face decal on a front cap of a slightly bigger sphere ----
  const neck = new THREE.Group(); neck.position.y = tH + .1; torso.add(neck);
  const hr = .42 * S, head = new THREE.Group(); head.position.y = hr + .02; neck.add(head);
  mesh(new THREE.SphereGeometry(hr, 48, 32), skin, head);
  const fc = document.createElement("canvas"); fc.width = fc.height = 512; const fctx = fc.getContext("2d"), pen = new Pen(fctx, { ink: "#141418", width: 10 });
  const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 8;
  const face = new THREE.Mesh(new THREE.SphereGeometry(hr * 1.004, 48, 32, Math.PI / 2 - 1.05, 2.1, .5, 2.1), new THREE.MeshStandardMaterial({ map: ftex, transparent: true, roughness: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  head.add(face);
  if (sp.hairStyle === "bob" || sp.hair) { const hm = std(sp.hair || "#6a4a32", { rough: .9 }); const back = mesh(new THREE.SphereGeometry(hr * 1.06, 32, 24, 0, Math.PI * 2, 0, 1.9), hm, head); back.rotation.x = -.35; back.position.z = -.05; }
  if (sp.hat === "straw") { const hm = std("#e2bd68", { rough: .95 }); mesh(new THREE.CylinderGeometry(hr * 1.3, hr * 1.36, .035, 40), hm, head).position.y = hr * .52;
    mesh(new THREE.CylinderGeometry(hr * .78, hr * .9, hr * .55, 32), hm, head).position.y = hr * .78; mesh(new THREE.CylinderGeometry(hr * .91, hr * .91, hr * .14, 32), std("#b3262f"), head).position.y = hr * .6; }
  if (sp.hat === "cap") { const hm = std(sp.hatColor || "#2a5aa8", { rough: .8 }); mesh(new THREE.SphereGeometry(hr * 1.04, 32, 16, 0, Math.PI * 2, 0, 1.45), hm, head).position.y = .02;
    const brim = mesh(new THREE.CylinderGeometry(hr * .62, hr * .62, .03, 24, 1, false, -1.2, 2.4), hm, head); brim.position.set(0, hr * .22, hr * .55); brim.rotation.y = Math.PI; brim.rotation.x = .12; }
  // ---- per-frame update ----
  let lastFace = "";
  function paintFace(expr, t, talk, blink) { const key = expr + (talk > .08 ? Math.round(talk * 6) : 0) + (blink ? "b" : "");
    if (key === lastFace) return; lastFace = key; fctx.clearRect(0, 0, 512, 512); fctx.save(); fctx.translate(256, 250);
    drawFace(pen, 210, expr, { t, talk, blink, eyeWhite: "#ffffff" });
    if (sp.beard === "mustache" || sp.beard === "full") { const r = 210, y = r * .21, w = r * .27; fctx.beginPath(); fctx.moveTo(-w, y + r * .04); fctx.quadraticCurveTo(-w * .5, y - r * .07, 0, y - r * .01); fctx.quadraticCurveTo(w * .5, y - r * .07, w, y + r * .04); fctx.quadraticCurveTo(0, y + r * .02, -w, y + r * .04); fctx.fillStyle = sp.beardColor || "#4a3424"; fctx.fill(); fctx.lineWidth = 8; fctx.strokeStyle = "#141418"; fctx.stroke(); }
    fctx.restore(); ftex.needsUpdate = true; }
  function update(pose, expr, o = {}) {
    const look = o.look || "front", turn = look === "left" ? -.42 : look === "right" ? .42 : 0, side = turn !== 0, dir = turn < 0 ? -1 : 1;
    body.rotation.set(0, turn, 0); body.position.y = (pose.bounce || 0) * .0037 * -1;
    if (pose.rot) { body.rotation.z = pose.rot * dir; body.position.y += .3; }
    torso.rotation.set(side ? (pose.lean || 0) : 0, 0, side ? 0 : -(pose.lean || 0) * .5);
    head.rotation.set(side ? (pose.head || 0) * .6 : 0, 0, side ? 0 : -(pose.head || 0) * .7);
    // front view: limbs swing sideways (around z); side view: forward/back (around x). +angle = screen right in 2D.
    pose.arms.forEach(([s, e], i) => { const a = arms[i]; if (side) { a.sh.rotation.set(-s, 0, 0); a.el.rotation.set(-e, 0, 0); } else { a.sh.rotation.set(0, 0, s); a.el.rotation.set(0, 0, e); } });
    pose.legs.forEach(([h, kn], i) => { const l = legs[i]; if (side) { l.hip.rotation.set(-h, 0, 0); l.knee.rotation.set(Math.abs(kn), 0, 0); } else { l.hip.rotation.set(0, 0, h); l.knee.rotation.set(Math.abs(kn) * .6, 0, 0); } });
    if (pose.sit) { legs.forEach(l => { l.hip.rotation.set(-1.45 * pose.sit, 0, 0); l.knee.rotation.set(1.45 * pose.sit, 0, 0); }); body.position.y -= .48 * pose.sit; }
    paintFace(expr, o.t || 0, o.talk || 0, o.blink);
  }
  return { group, update };
}
