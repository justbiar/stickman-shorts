// The six sets. Each one builds its world with the helpers in `k` (see player.html), adds its default cast,
// names a few "spots" the camera and labels can aim at, and returns { fx(t, events) } for its moving parts.
//
//   k.character(id, costume, [x, z], look)   add a flat round-head character
//   k.spot(name, [x, y, z], camOffset?)      a point of interest; camOffset = where an "insert" shot stands
//   events = [{ name, t }]                   story beats with "fx" become events the set can react to
import * as THREE from "three";

export const SETS = {
  hangar(k) {   // WWII hangar: open doors onto a sunny airfield, a bomber, a board with the bullet-hole diagram
    const { M, box, add, glow, tex, speckle, rnd } = k;
    k.sky(0x5aa8ff, 0xbfe3ff, 0xe8d2a8); k.scene.fog = new THREE.Fog(0xcfe2f0, 30, 120);
    k.ground(M({ map: tex(512, 512, (g, w, h) => { g.fillStyle = "#b9b3a8"; g.fillRect(0, 0, w, h); speckle(g, w, h, 8000, ["#9a948a", "#d4cec4", "#857f75"]); g.fillStyle = "#e8c23a"; g.fillRect(0, 240, w, 14); }, [8, 8]) }));
    const tin = M({ map: tex(256, 256, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#8a8f86" : "#a3a89e"; g.fillRect(i * 16, 0, 16, h); } speckle(g, w, h, 2000, ["#5a5f56"], .1); }, [6, 2]), metalness: .4, roughness: .6 });
    for (const x of [-9, 9]) box(.3, 9, 22, tin, x, 4.5, -2); box(5, 9, .3, tin, -6.5, 4.5, -9); box(5, 9, .3, tin, 6.5, 4.5, -9); box(18, 1.6, .3, tin, 0, 8.2, -9);
    for (let z = -9; z <= 6; z += 3) { box(18, .25, .25, M({ color: 0x5a4a3a }), 0, 8.8, z); const lamp = new THREE.Mesh(new THREE.ConeGeometry(.45, .45, 24, 1, true), M({ color: 0x2f5a3a, side: THREE.DoubleSide })); lamp.position.set(-2, 7.6, z); k.scene.add(lamp);
      glow(new THREE.Color(1.6, 1.4, 1), .9).position.set(-2, 7.3, z); const pl = new THREE.PointLight(0xfff0d0, 6, 9); pl.position.set(-2, 7.2, z); k.scene.add(pl); }
    const run = new THREE.Mesh(new THREE.PlaneGeometry(60, 10), M({ color: 0x8d8c86 })); run.rotation.x = -Math.PI / 2; run.position.set(0, .01, -30); k.scene.add(run);
    for (let i = 0; i < 10; i++) { const t = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), M({ color: 0x5f9a4a, flatShading: true })); t.position.set(-30 + i * 7, 1.4, -45 - (i % 3) * 4); k.scene.add(t); }
    // the bomber
    const od = M({ color: 0x7a8a55, roughness: .55, metalness: .3 }); const plane = new THREE.Group(); k.scene.add(plane);
    add(new THREE.Mesh(new THREE.CapsuleGeometry(.9, 8, 12, 32), od), plane).rotation.z = Math.PI / 2;
    add(new THREE.Mesh(new THREE.SphereGeometry(.85, 32, 16), M({ color: 0x9fd3e8, roughness: .1, transparent: true, opacity: .7 })), plane).position.x = 4.6;
    add(new THREE.Mesh(new THREE.BoxGeometry(2.4, .14, 14), od), plane).position.set(.6, .1, 0);
    add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, .14), od), plane).position.set(-4.4, 1.3, 0); add(new THREE.Mesh(new THREE.BoxGeometry(1.3, .12, 4.6), od), plane).position.set(-4.4, .2, 0);
    const props = [];
    for (const z of [-5, -2.5, 2.5, 5]) { const n = add(new THREE.Mesh(new THREE.CylinderGeometry(.42, .5, 1.6, 20), od), plane); n.rotation.z = Math.PI / 2; n.position.set(1.6, 0, z);
      const pr = new THREE.Group(); pr.position.set(2.45, 0, z); plane.add(pr); for (let j = 0; j < 3; j++) { const b = add(new THREE.Mesh(new THREE.BoxGeometry(.06, 1.6, .18), M({ color: 0x1b1b1b })), pr); b.rotation.x = j * Math.PI * 2 / 3; b.geometry.translate(0, .8, 0); } props.push(pr); }
    const star = new THREE.Mesh(new THREE.CircleGeometry(.45, 5), M({ color: 0xffffff })); star.position.set(-1.5, .3, .91); plane.add(star); const sb = new THREE.Mesh(new THREE.CircleGeometry(.62, 32), M({ color: 0x1f3a7a })); sb.position.set(-1.5, .3, .905); plane.add(sb);
    for (const [x, z] of [[1, -1.2], [1, 1.2], [-3.8, 0]]) { const w2 = add(new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .3, 24), M({ color: 0x1b1b1b })), plane); w2.rotation.x = Math.PI / 2; w2.position.set(x, -1.2, z); }
    plane.position.set(1.5, 2.1, -14); plane.rotation.y = .5;
    // the board: a top-down plane outline with red bullet holes; after the "board2" fx green rings mark the clean zones
    const holes = []; for (let i = 0; i < 80; i++) { const a = rnd(); holes.push(a < .55 ? [70 + rnd() * 372, 178 + rnd() * 24] : [246 + rnd() * 20, 120 + rnd() * 150]); }
    const drawBoard = rings => tex(512, 360, (g, w, h) => { g.fillStyle = "#f4f1e8"; g.fillRect(0, 0, w, h); g.strokeStyle = "#2b2b33"; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
      g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(256, 70); g.lineTo(256, 320); g.moveTo(60, 190); g.lineTo(452, 190); g.moveTo(196, 306); g.lineTo(316, 306); g.stroke();
      for (const x of [150, 362]) { g.beginPath(); g.arc(x, 175, 13, 0, 7); g.stroke(); }
      g.fillStyle = "#c62828"; for (const [x, y] of holes) { if (Math.hypot(x - 150, y - 175) < 22 || Math.hypot(x - 362, y - 175) < 22 || y < 110) continue; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
      if (rings) { g.strokeStyle = "#1f9a4a"; g.lineWidth = 7; for (const [x, y, r] of [[150, 175, 30], [362, 175, 30], [256, 84, 30]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); } } });
    const boardA = drawBoard(false), boardB = drawBoard(true); const bm = M({ map: boardA });
    box(2.4, 1.7, .08, bm, -3.4, 1.9, -3.2); box(.08, 2.2, .08, M({ color: 0x4a3a2a }), -4.5, 1.1, -3.2); box(.08, 2.2, .08, M({ color: 0x4a3a2a }), -2.3, 1.1, -3.2);
    k.light({ sun: [-4, 14, -20], sunColor: 0xfff3dc, sunI: 2.6, sky: 0xdfeeff, groundCol: 0x8a7a60, hemiI: 1.0 });
    k.character("officer", { shirt: "#f2f2f2", pants: "#4a4a3a", outfit: "suit", coat: "#5a6040", tie: "#3a3a2a", hat: "cap", hatColor: "#4a5038" }, [-1.6, -1.2], "right");
    k.character("pilot", { shirt: "#c9b28a", pants: "#4a4a3a", outfit: "overalls", overalls: "#556b3a", hat: "pilot", hatColor: "#6b4a2e" }, [.2, -.9], "left");
    k.character("wald", { shirt: "#f2f2f2", pants: "#2b2f3a", outfit: "suit", coat: "#3d4352", tie: "#8a2b2b", glasses: true, beard: "mustache", beardColor: "#3a3030" }, [-3, -.2], "right", false);
    k.spot("plane", [1.5, 2.6, -14], [-3, .6, 17]); k.spot("board", [-3.4, 1.9, -3.1], [0, .05, 2.3]); k.spot("engine", [4.1, 2.1, -12.6], [-1.4, .2, 3.2]);
    return { fx(t, ev) { props.forEach((p, i) => p.rotation.x = t * (i % 2 ? 14 : 11)); bm.map = ev.some(e => e.name === "board2" && t >= e.t) ? boardB : boardA; } };
  },

  goldrush(k) {   // 1849 boomtown: false-front wooden shops, boardwalks, a pile of pans and shovels, dust in low sun
    const { M, box, cyl, add, glow, tex, speckle, rnd, wood, signTex } = k;
    k.sky(0x6fa8e0, 0xffc98a, 0xe89a5a); k.scene.fog = new THREE.Fog(0xf0b878, 18, 90);
    k.ground(M({ map: tex(512, 512, (g, w, h) => { g.fillStyle = "#c79a62"; g.fillRect(0, 0, w, h); speckle(g, w, h, 12000, ["#a87a48", "#dcb07a", "#8f6538"], .2); for (let i = 0; i < 30; i++) { g.strokeStyle = "rgba(90,60,30,.2)"; g.lineWidth = 3; g.beginPath(); g.moveTo(rnd() * w, 0); g.lineTo(rnd() * w, h); g.stroke(); } }, [10, 10]) }));
    const shops = [["SALOON", "#8b4a2b"], ["ASSAY OFFICE", "#5d6f7a"], ["GENERAL STORE", "#7a5a3a"], ["HOTEL", "#9a6a4a"], ["BANK", "#6a4a3a"]];
    for (const side of [-1, 1]) for (let i = 0; i < 5; i++) { const [name, col] = shops[(i + (side > 0 ? 2 : 0)) % 5]; const z = -2 - i * 5.2, x = side * 5.2;
      const wallM = M({ map: wood(col, new THREE.Color(col).offsetHSL(0, 0, -.06).getStyle(), [2, 2]) }); box(4, 3.4, 4.6, wallM, x + side * 1.6, 1.7, z); box(.25, 4.6, 4.8, wallM, x - side * .45, 2.3, z);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .8), M({ map: signTex(name) })); sign.position.set(x - side * .6, 3.9, z); sign.rotation.y = -side * Math.PI / 2; k.scene.add(sign);
      box(.1, 1.8, .9, M({ color: 0x3a2414 }), x - side * .58, .9, z - 1); box(.06, .9, 1.2, M({ color: 0xffd98a, emissive: 0xffa840, emissiveIntensity: .6 }), x - side * .58, 1.5, z + 1);
      box(2.2, .14, 4.8, M({ map: wood("#8a6a48", "#7a5a3a", [1, 3]) }), x - side * 1.6, .2, z); for (const zz of [z - 2.2, z + 2.2]) box(.14, 2.6, .14, M({ color: 0x5a3a26 }), x - side * 2.6, 1.3, zz); box(.2, .12, 4.8, M({ color: 0x5a3a26 }), x - side * 2.6, 2.6, z); }
    for (const [x, z] of [[-2.6, -1], [2.8, -4.5], [-2.4, -9]]) cyl(.38, .32, .9, M({ color: 0x7a4a2a }), x, .45, z, 16);
    // pans and shovels stacked in front of the general store
    const tinM = M({ color: 0x9aa0a8, metalness: .8, roughness: .35 }), handle = M({ color: 0x6a4a2a });
    for (let i = 0; i < 9; i++) { const p = cyl(.32, .22, .07, tinM, -2.0 + (i % 3) * .05, .1 + i * .075, -5.2 + (i % 2) * .05, 24); p.rotation.z = (rnd() - .5) * .1; }
    for (let i = 0; i < 6; i++) { const s = new THREE.Group(); k.scene.add(s); const h2 = add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.5, 8), handle), s); h2.position.y = .75;
      const bl = add(new THREE.Mesh(new THREE.BoxGeometry(.26, .32, .03), tinM), s); bl.position.y = .05; s.position.set(-2.7 + i * .12, .15, -4.5); s.rotation.z = -.25 + i * .02; s.rotation.x = .15; }
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { const m = new THREE.Mesh(new THREE.ConeGeometry(14 + i * 3, 9 + (i % 2) * 4, 5), M({ color: 0x9a6a5a, flatShading: true })); if (j) continue; m.position.set(-40 + i * 20, 3, -70 - i * 3); k.scene.add(m); }
    glow(new THREE.Color(3, 1.8, .9), 30).position.set(-60, 14, -90);
    k.light({ sun: [-14, 5, -10], sunColor: 0xffb060, sunI: 3.2, sky: 0xffd8a8, groundCol: 0x8a5a30, hemiI: .9 });
    k.character("brannan", { shirt: "#f2f2f2", pants: "#3a2a2a", outfit: "suit", coat: "#2b2b33", tie: "#6a1a1a", hat: "fedora", hatColor: "#1b1b22", beard: "full", beardColor: "#3a2a1a" }, [.5, -.8], "left");
    k.character("miner", { shirt: "#d8c8a0", pants: "#4a3a2a", outfit: "vest", vest: "#6a4a2a", hat: "cowboy", hatColor: "#8a5a30", beard: "stubble" }, [-.9, -1.2], "right");
    k.character("miner2", { shirt: "#a8c0d8", pants: "#3a3a4a", outfit: "overalls", overalls: "#4a5a7a", hat: "straw", beard: "mustache" }, [-1.9, -2.6], "right");
    k.spot("pans", [-2.2, .6, -5], [1.3, .8, 2.7]); k.spot("street", [0, 1.6, -12], [0, .2, 14]);
    const dust = k.particles(600, .06, 0xffd9a0, { additive: true, opacity: .7 }); const dp = dust.geometry.attributes.position; const base = []; for (let i = 0; i < 600; i++) base.push([(rnd() - .5) * 14, rnd() * 4, -rnd() * 16 + 3]);
    return { fx(t) { base.forEach(([x, y, z], i) => dp.setXYZ(i, x + Math.sin(t * .6 + i) * .3 + t * .25 % 6, (y + t * .15 + Math.sin(i) * .1) % 4, z)); dp.needsUpdate = true; } };
  },

  city(k) {   // blue-hour city: lit towers, an art-deco giant with a spire, a steel frame going up, cones, a truck
    const { M, box, add, glow, tex, speckle, rnd } = k;
    k.sky(0x1b2a5a, 0x6a6aa8, 0xff9a7a); k.scene.fog = new THREE.Fog(0x4a4a7a, 20, 140);
    k.ground(M({ map: tex(512, 512, (g, w, h) => { g.fillStyle = "#3a3d48"; g.fillRect(0, 0, w, h); speckle(g, w, h, 12000, ["#2a2d36", "#565a66"]); }, [12, 12]), roughness: .45, metalness: .1 }));
    for (let z = -60; z < 8; z += 4) box(.18, .015, 2, M({ color: 0xf2f2f2, emissive: 0x222222 }), 0, .01, z);
    for (const x of [-3.6, 3.6]) box(.15, .015, 80, M({ color: 0xf2d23a }), x, .01, -25);
    for (const x of [-6.4, 6.4]) box(4.6, .18, 80, M({ color: 0x9a9aa6 }), x, .09, -25);
    const winTex = (hue, cols = 11) => tex(256, 512, (g, w, h) => { g.fillStyle = hue; g.fillRect(0, 0, w, h); const s = w / cols; for (let y = 8; y < h; y += s) for (let x = 6; x < w; x += s) { g.fillStyle = rnd() < .45 ? `hsl(${40 + rnd() * 15},90%,${60 + rnd() * 20}%)` : "#1c2030"; g.fillRect(x, y, s * .62, s * .62); } });
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) { const hgt = 12 + rnd() * 26, w = 5 + rnd() * 2; const t2 = winTex(["#2a2f44", "#33304a", "#2a3a44"][i % 3]);
      box(w, hgt, 6, M({ map: t2, emissiveMap: t2, emissive: 0xffffff, emissiveIntensity: .9 }), side * (11 + rnd() * 2), hgt / 2, -6 - i * 7); }
    // the giant: stepped tower with a spire at the end of the avenue
    const deco = winTex("#3a3a50", 14); const dm = M({ map: deco, emissiveMap: deco, emissive: 0xffffff, emissiveIntensity: .8 });
    let y0 = 0; for (const [w, h] of [[16, 26], [12, 22], [9, 18], [6, 14], [3.5, 8]]) { box(w, h, w, dm, 0, y0 + h / 2, -85); y0 += h; }
    const spire = add(new THREE.Mesh(new THREE.CylinderGeometry(.25, 1.2, 14, 16), M({ color: 0xcfd4e0, metalness: .8, roughness: .3 }))); spire.position.set(0, y0 + 7, -85);
    glow(new THREE.Color(3, .6, .5), 2.2).position.set(0, y0 + 14.4, -85);
    // steel frame under construction on the right, with a working light
    const steel = M({ color: 0x8a3a2a, metalness: .6, roughness: .5 });
    for (let fl = 0; fl < 9; fl++) { const y = fl * 1.6; for (const [x, z] of [[5.5, -9], [8.5, -9], [5.5, -12], [8.5, -12]]) box(.16, 1.6, .16, steel, x, y + .8, z);
      box(3.2, .16, .16, steel, 7, y + 1.6, -9); box(3.2, .16, .16, steel, 7, y + 1.6, -12); box(.16, .16, 3.2, steel, 5.5, y + 1.6, -10.5); box(.16, .16, 3.2, steel, 8.5, y + 1.6, -10.5); }
    const wl = new THREE.PointLight(0xffd29a, 30, 14); wl.position.set(6, 8, -8); k.scene.add(wl); glow(new THREE.Color(2.4, 2, 1.4), 1).position.set(6, 8, -8.6);
    for (let z = -2; z > -50; z -= 9) for (const x of [-4.6, 4.6]) { box(.12, 4.2, .12, M({ color: 0x2a2d36, metalness: .6 }), x, 2.1, z); glow(new THREE.Color(2, 1.6, 1), 1.1).position.set(x * .9, 4.2, z); const pl = new THREE.PointLight(0xffd29a, 8, 10); pl.position.set(x * .9, 4, z); k.scene.add(pl); }
    for (let i = 0; i < 6; i++) { const c2 = add(new THREE.Mesh(new THREE.ConeGeometry(.2, .6, 20), M({ color: 0xff6a1a }))); c2.position.set(-1.4 + (i % 2) * .4, .3, -2 - i * 1.6); box(.5, .05, .5, M({ color: 0x1b1b1b }), c2.position.x, .025, c2.position.z); }
    const truck = new THREE.Group(); k.scene.add(truck); add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.2), M({ color: 0x1f3a8a, metalness: .5, roughness: .35 })), truck).position.set(0, 1.6, 0);
    const bed = add(new THREE.Mesh(new THREE.BoxGeometry(2.5, .6, 7), M({ color: 0x3a3a44 })), truck); bed.position.set(0, .9, -4.8);
    for (let j = 0; j < 4; j++) add(new THREE.Mesh(new THREE.BoxGeometry(.3, .3, 6.6), steel), truck).position.set(-.6 + j * .4, 1.35, -4.8);   // steel beams on the bed
    for (const x of [-.8, .8]) { const hl = k.glow(new THREE.Color(3, 2.8, 2.2), 1.4); truck.add(hl); hl.position.set(x, 1.2, 1.15); }
    k.light({ sun: [10, 20, -30], sunColor: 0x8a9aff, sunI: .6, sky: 0x7a8ad8, groundCol: 0x2a2030, hemiI: .7 });
    k.character("worker", { shirt: "#3a3a44", pants: "#2b2b33", outfit: "hivis", hat: "hardhat", hatColor: "#f2c230", beard: "stubble" }, [-1.9, 1.2], "right");
    k.character("worker2", { shirt: "#c8a87a", pants: "#3a3a4a", outfit: "overalls", overalls: "#5a4a3a", hat: "cap", hatColor: "#3a3a4a" }, [-3.2, -.6], "right");
    k.spot("tower", [0, 50, -85], [0, -42, 70]); k.spot("frame", [7, 6, -10.5], [-4, -3.5, 9]); k.spot("truck", [1.8, 1.4, -10], [-2.5, .2, 7]);
    return { fx(t) { truck.position.set(1.8, 0, -36 + t * 2.2); } };
  },

  piazza(k) {   // Italian hill town in a storm: cobbles, ochre houses, bell tower with a rope, rain and lightning
    const { M, box, add, tex, speckle, rnd } = k;
    k.sky(0x2a2e3a, 0x5a5e6e, 0x8a8a8a); k.scene.fog = new THREE.Fog(0x4a4e5a, 15, 70);
    k.ground(M({ map: tex(512, 512, (g, w, h) => { g.fillStyle = "#6a5e52"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 24) for (let x = 0; x < w; x += 30) { g.fillStyle = `hsl(28,${15 + rnd() * 10}%,${36 + rnd() * 16}%)`; g.beginPath(); g.roundRect(x + (y / 24 % 2) * 15 + 2, y + 2, 26, 20, 8); g.fill(); } }, [8, 8]), roughness: .35 }));
    const cols = ["#d9a35a", "#c8744a", "#e0c08a", "#b8603a", "#d8b070"];
    for (let i = 0; i < 9; i++) { const a = -Math.PI * .9 + i * .23, r = 9, x = Math.cos(a) * r, z = Math.sin(a) * r - 3, hgt = 4 + (i % 3) * 1.2;
      const m = box(3.2, hgt, 3, M({ map: tex(256, 256, (g, w, h) => { g.fillStyle = cols[i % 5]; g.fillRect(0, 0, w, h); speckle(g, w, h, 3000, ["#000", "#fff"], .05); for (let y = 30; y < h - 40; y += 80) for (let x2 = 30; x2 < w - 40; x2 += 90) { g.fillStyle = "#3a5a3a"; g.fillRect(x2, y, 50, 60); g.fillStyle = "#2a2020"; g.fillRect(x2 + 10, y + 8, 30, 44); } }) }), x, hgt / 2, z);
      m.lookAt(0, hgt / 2, -3); const roof = add(new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.2, 4), M({ color: 0xb4532a }))); roof.position.set(x, hgt + .6, z); roof.rotation.y = Math.PI / 4 + a; }
    const stone = M({ map: tex(256, 256, (g, w, h) => { g.fillStyle = "#cfc6b4"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(80,70,60,.4)"; g.lineWidth = 3; for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) g.strokeRect(x + (y / 32 % 2) * 32, y, 64, 32); }, [1, 4]) });
    const TX = 2.5, TZ = -6;
    box(2.2, 12, 2.2, stone, TX, 6, TZ); box(2.6, .4, 2.6, stone, TX, 12.2, TZ); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.3, 1.8, .3, stone, TX + dx * 1.05, 13.3, TZ + dz * 1.05); box(2.6, .4, 2.6, stone, TX, 14.4, TZ);
    const bell = add(new THREE.Mesh(new THREE.CylinderGeometry(.25, .6, .8, 24, 1, true), M({ color: 0xb8902a, metalness: .9, roughness: .3, side: THREE.DoubleSide }))); bell.position.set(TX, 13.2, TZ);
    const pyr = add(new THREE.Mesh(new THREE.ConeGeometry(1.9, 2, 4), M({ color: 0xa04a2a }))); pyr.position.set(TX, 15.6, TZ); pyr.rotation.y = Math.PI / 4;
    box(1, 2, .1, M({ color: 0x3a2618 }), TX, 1, TZ + 1.12);   // door
    const rope = add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1, 8), M({ color: 0xc8b088 }))); rope.position.set(TX - .3, 1.4, TZ + 1.4);
    k.light({ sun: [-6, 14, 6], sunColor: 0xc8d0e8, sunI: .9, sky: 0x9aa4c8, groundCol: 0x3a3028, hemiI: .9 });
    k.character("ringer", { shirt: "#e8e0d0", pants: "#3a3028", outfit: "vest", vest: "#3a5a3a", hat: "cap", hatColor: "#a8322a", beard: "stubble" }, [TX - .7, TZ + 1.9], "right");
    k.character("villager", { shirt: "#d8c8b0", pants: "#4a3a2a", outfit: "coat", coat: "#6a2a2a", scarf: "#d8b070" }, [-.6, .8], "right");
    k.character("priest", { shirt: "#1b1b22", pants: "#1b1b22", outfit: "coat", coat: "#1b1b22", hat: "fedora", hatColor: "#1b1b22", glasses: true }, [.7, .2], "front", false);
    k.spot("bell", [TX, 13.2, TZ], [0, -3, 7.5]); k.spot("tower", [TX, 9, TZ], [-3, -7, 19]); k.spot("rope", [TX - .3, 1.6, TZ + 1.4], [.4, .2, 2.4]);
    const rain = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xbfd0ff, transparent: true, opacity: .45 })); k.scene.add(rain); const N = 1100, rp = new Float32Array(N * 6); rain.geometry.setAttribute("position", new THREE.BufferAttribute(rp, 3));
    const rb = []; for (let i = 0; i < N; i++) rb.push([(rnd() - .5) * 18, rnd() * 16, (rnd() - .5) * 16 - 2]);
    const bolt = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: new THREE.Color(3, 3, 4) })); k.scene.add(bolt); const flashL = new THREE.PointLight(0xdfe6ff, 0, 60); flashL.position.set(6, 16, -10); k.scene.add(flashL);
    let lastBolt = -1;
    return { fx(t, ev) { rb.forEach(([x, y, z], i) => { const yy = ((y - t * 16) % 16 + 16) % 16; rp.set([x, yy, z, x - .04, yy - .45, z], i * 6); }); rain.geometry.attributes.position.needsUpdate = true;
      bell.rotation.z = Math.sin(t * 3) * .25 * (ev.some(e => e.name === "ring" && t >= e.t && t < e.t + 6) ? 1 : 0); rope.position.y = 1.4 + Math.sin(t * 3) * .12;
      const hits = ev.filter(e => e.name === "lightning" || e.name === "flash"); const last = hits.filter(e => t >= e.t).pop(); const d = last ? t - last.t : 9;
      const on = d < .09 || (d > .15 && d < .21); flashL.intensity = on ? 240 : 0; bolt.visible = on;
      if (on && last.t !== lastBolt) { lastBolt = last.t; const pts = []; let x = TX + 5, y = 24; while (y > 15.8) { pts.push(new THREE.Vector3(x, y, TZ - 3)); x += (rnd() - .7) * 1.4; y -= .7; } pts.push(new THREE.Vector3(TX, 16.6, TZ)); bolt.geometry.setFromPoints(pts); }
      return on ? "flash" : null; } };
  },

  snow(k) {   // winter night: snowy yard, string lanterns, an alchemist's table, fireworks bursts on cue
    const { M, box, cyl, add, glow, tex, speckle, rnd, wood } = k;
    k.sky(0x0b1640, 0x2a3c8a, 0x5a6ab8); k.scene.fog = new THREE.Fog(0x2a3a7a, 18, 80);
    k.ground(M({ map: tex(512, 512, (g, w, h) => { g.fillStyle = "#dfe8f8"; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ["#b8c8e8", "#ffffff"], .3); }, [10, 10]), roughness: .9 }));
    for (const [x, z, col] of [[-6, -7, "#7a2f2f"], [5.5, -8, "#3a4a7a"], [0, -12, "#6a4a2a"]]) { box(4.4, 3, 4, M({ map: wood(col, new THREE.Color(col).offsetHSL(0, 0, -.05).getStyle(), [2, 1]) }), x, 1.5, z);
      const roof = add(new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.8, 4), M({ color: 0xf2f6ff }))); roof.position.set(x, 3.9, z); roof.rotation.y = Math.PI / 4; box(.9, .9, .06, M({ color: 0xffd98a, emissive: 0xffb060, emissiveIntensity: 1.6 }), x + .8, 1.6, z + 2.03); }
    const lanCols = [[2.4, .6, .5], [.6, 2.2, .8], [2.4, 1.9, .5], [.7, 1.2, 2.6]];
    for (let j = 0; j < 14; j++) { const x = -6 + j * .92, y = 4.4 - Math.sin(j / 13 * Math.PI) * 1.1; glow(new THREE.Color(...lanCols[j % 4]), .5).position.set(x, y, -4.5);
      const body = new THREE.Mesh(new THREE.SphereGeometry(.15, 16, 12), M({ color: new THREE.Color(...lanCols[j % 4]).multiplyScalar(.4), emissive: new THREE.Color(...lanCols[j % 4]).multiplyScalar(.5) })); body.position.set(x, y, -4.5); body.scale.y = 1.3; k.scene.add(body); }
    // the alchemist's table: three jars and a bowl that "goes off" on the boom fx
    box(2.2, .12, 1, M({ map: wood("#8a5a38", "#7a4a2a", [1, 1]) }), 2.4, .95, -1.6); for (const [x, z] of [[1.4, -2], [3.4, -2], [1.4, -1.2], [3.4, -1.2]]) box(.08, .95, .08, M({ color: 0x5a3a26 }), x, .47, z);
    for (const [x, col] of [[1.7, 0xe8e0d0], [2.05, 0xd8c040], [2.4, 0x2a2a2a]]) { cyl(.13, .13, .32, M({ color: 0x9ab8c8, transparent: true, opacity: .5, roughness: .1 }), x, 1.17, -1.6, 16); cyl(.11, .11, .18, M({ color: col }), x, 1.1, -1.6, 16); }
    const bowl = cyl(.3, .2, .16, M({ color: 0x6a4a3a }), 3.0, 1.09, -1.6, 24);
    glow(new THREE.Color(2, 2, 2.2), 7).position.set(-14, 22, -50);
    k.light({ sun: [-8, 16, 6], sunColor: 0x9ab0ff, sunI: .8, sky: 0x8aa0ff, groundCol: 0x6a7ab8, hemiI: .9 });
    k.character("alchemist", { shirt: "#d8c8a0", pants: "#3a2a4a", outfit: "coat", coat: "#5a2a6a", beard: "full", beardColor: "#d8d8d8", glasses: true }, [1.1, -1.0], "right");
    k.character("kid", { shirt: "#3a6a8a", pants: "#2b2b4a", outfit: "coat", coat: "#3a6a5a", scarf: "#c8322a", hat: "beanie", hatColor: "#c8a23a" }, [-.6, .6], "front", false);
    k.spot("table", [2.4, 1.2, -1.6], [-.3, .5, 2.2]); k.spot("sky", [0, 10, -12], [0, -8, 15]); k.spot("bowl", [3.0, 1.15, -1.6], [-.2, .35, 1.4]);
    const snow = k.particles(1400, .07, 0xffffff, { opacity: .95 }); const sp = snow.geometry.attributes.position; const sb = []; for (let i = 0; i < 1400; i++) sb.push([(rnd() - .5) * 20, rnd() * 12, (rnd() - .5) * 16 - 2]);
    const NB = 2400, burst = k.particles(NB, .32, 0xffffff, { additive: true }); const bp = burst.geometry.attributes.position; const cols = new Float32Array(NB * 3); burst.geometry.setAttribute("color", new THREE.BufferAttribute(cols, 3)); burst.material.vertexColors = true;
    const dirs = []; for (let i = 0; i < NB; i++) { const u = 2 * rnd() - 1, a = rnd() * 6.28, s2 = Math.sqrt(1 - u * u); dirs.push([s2 * Math.cos(a), u, s2 * Math.sin(a), rnd()]); }
    const palette = [[2.6, .7, .6], [.7, 1.6, 2.8], [2.6, 2.2, .7], [1.8, .7, 2.6], [.7, 2.6, 1.2]];
    const smoke = glow(new THREE.Color(2.4, 1.6, .7), .1); smoke.position.set(3.0, 1.3, -1.6);
    return { fx(t, ev) { sb.forEach(([x, y, z], i) => sp.setXYZ(i, x + Math.sin(t + i) * .2, ((y - t * .9) % 12 + 12) % 12, z)); sp.needsUpdate = true;
      // every "firework" event fires three shells, staggered
      const shells = []; ev.filter(e => e.name === "firework").forEach((e, n) => { for (let j = 0; j < 3; j++) shells.push({ t0: e.t + j * .45, c: [(-4 + j * 4 + n) % 7, 8.5 + ((j + n) % 3) * 1.5, -11 - j], col: palette[(n * 3 + j) % 5] }); });
      dirs.forEach(([dx, dy, dz, r], i) => { const sh = shells[i % Math.max(1, shells.length)]; const d = sh ? t - sh.t0 : -1; if (!sh || d < 0 || d > 2) { bp.setXYZ(i, 0, -50, 0); return; }
        const s = 4.2 * (1 - Math.exp(-d * 3)) * (.6 + r * .4); bp.setXYZ(i, sh.c[0] + dx * s, sh.c[1] + dy * s - d * d * 1.1, sh.c[2] + dz * s); const f = Math.max(0, 1 - d / 2); cols.set([sh.col[0] * f, sh.col[1] * f, sh.col[2] * f], i * 3); });
      bp.needsUpdate = true; burst.geometry.attributes.color.needsUpdate = true;
      const b = ev.filter(e => e.name === "boom" && t >= e.t).pop(); const d = b ? t - b.t : 9; smoke.scale.setScalar(d < 1.2 ? 3.5 * Math.sin(Math.min(1, d * 3) * Math.PI / 2) * (1 - d / 1.2) + .01 : .01); bowl.position.y = 1.09 + (d < .3 ? Math.sin(d * 30) * .03 : 0); } };
  },

  silo(k) {   // farm at sunset: grain silos, red barn, fence, golden chaff; "boom" fires a dust explosion
    const { M, box, cyl, add, glow, tex, speckle, rnd, wood } = k;
    k.sky(0x3a5aa8, 0xff9a5a, 0xffd07a); k.scene.fog = new THREE.Fog(0xffb878, 25, 120);
    k.ground(M({ map: tex(512, 512, (g, w, h) => { g.fillStyle = "#8aa04a"; g.fillRect(0, 0, w, h); speckle(g, w, h, 14000, ["#6f8a3a", "#a8b85a", "#c8a85a"], .25); }, [14, 14]) }));
    const rib = M({ map: tex(256, 256, (g, w, h) => { for (let i = 0; i < 32; i++) { g.fillStyle = i % 2 ? "#b8bcc4" : "#d0d4dc"; g.fillRect(0, i * 8, w, 8); } speckle(g, w, h, 2000, ["#7a7e86"], .1); }, [3, 3]), metalness: .6, roughness: .4 });
    for (const [x, z, r, h] of [[-4.5, -10, 2.2, 10], [.6, -12, 2.6, 12]]) { cyl(r, r, h, rib, x, h / 2, z, 40); const cap = add(new THREE.Mesh(new THREE.ConeGeometry(r * 1.05, 1.6, 40), M({ color: 0x9a9ea6, metalness: .6, roughness: .35 }))); cap.position.set(x, h + .8, z); }
    const conv = box(.5, .5, 9, M({ color: 0xd8a83a, metalness: .4 }), -2, 5.5, -8); conv.rotation.x = -.6;
    box(6, 4, 5, M({ map: wood("#a8322a", "#962a22", [2, 2]) }), 7.5, 2, -7); const br = add(new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 5.2, 3, 1), M({ color: 0x5a3a2a }))); br.rotation.set(Math.PI / 2, 0, Math.PI / 2 + Math.PI / 6); br.position.set(7.5, 4.2, -7);
    for (let j = 0; j < 12; j++) box(.12, 1, .12, M({ color: 0x7a5a3a }), -7 + j * 1.2, .5, -2.4); box(14, .1, .08, M({ color: 0x7a5a3a }), -.4, .8, -2.4); box(14, .1, .08, M({ color: 0x7a5a3a }), -.4, .45, -2.4);
    add(new THREE.Mesh(new THREE.ConeGeometry(1.6, 1, 32), M({ color: 0xe8b84a, roughness: .9 }))).position.set(-2.6, .5, -5);
    glow(new THREE.Color(3, 2, 1), 26).position.set(40, 9, -80);
    k.light({ sun: [16, 6, -14], sunColor: 0xffb060, sunI: 3, sky: 0xffc898, groundCol: 0x6a5a2a, hemiI: .9 });
    k.character("farmer", { shirt: "#c84a3a", pants: "#3b5a8a", outfit: "overalls", overalls: "#3b5a8a", hat: "straw", beard: "full", beardColor: "#8a6a4a" }, [-.4, .4], "front");
    k.character("hand", { shirt: "#e8d8b8", pants: "#4a4a3a", outfit: "overalls", overalls: "#6a5a3a", hat: "cap", hatColor: "#3a5a3a" }, [1.3, -.4], "left", false);
    k.spot("silo", [.6, 7, -12], [-1, -4.5, 13]); k.spot("dust", [-2, 4, -8], [1, -1.6, 7]);
    const chaff = k.particles(800, .05, 0xffd98a, { additive: true, opacity: .8 }); const cp = chaff.geometry.attributes.position; const cb = []; for (let i = 0; i < 800; i++) cb.push([(rnd() - .5) * 12, rnd() * 6, -rnd() * 12 + 2]);
    const NF = 900, fire = k.particles(NF, .5, 0xffffff, { additive: true }); const fp = fire.geometry.attributes.position; const fc = new Float32Array(NF * 3); fire.geometry.setAttribute("color", new THREE.BufferAttribute(fc, 3)); fire.material.vertexColors = true;
    const fd = []; for (let i = 0; i < NF; i++) { const u = rnd(), a = rnd() * 6.28; fd.push([Math.cos(a) * (1 - u), u * 1.4, Math.sin(a) * (1 - u), rnd()]); }
    const bl = new THREE.PointLight(0xff9a3a, 0, 60); bl.position.set(.6, 8, -9); k.scene.add(bl);
    return { fx(t, ev) { cb.forEach(([x, y, z], i) => cp.setXYZ(i, x - t * .4 % 6 + Math.sin(t + i) * .2, (y + t * .2) % 6, z)); cp.needsUpdate = true;
      const b = ev.filter(e => e.name === "boom" && t >= e.t).pop(); const d = b ? t - b.t : 9;
      fd.forEach(([dx, dy, dz, r], i) => { if (d > 3.5) { fp.setXYZ(i, 0, -50, 0); return; } const s = 7 * (1 - Math.exp(-d * 2.2)) * (.4 + r * .6); fp.setXYZ(i, .6 + dx * s, 9 + dy * s + d * .6, -12 + dz * s);
        const f = Math.max(0, 1 - d / 3.5), hot = Math.max(0, 1 - d * 1.5); fc.set([(1.4 + 1.6 * hot) * f, (.6 + 1.6 * hot) * f, (.2 + 1.2 * hot) * f], i * 3); });
      fp.needsUpdate = true; fire.geometry.attributes.color.needsUpdate = true; bl.intensity = d < 3 ? 400 * Math.exp(-d * 1.6) : 0; return d < .25 ? "flash" : null; } };
  },
};
