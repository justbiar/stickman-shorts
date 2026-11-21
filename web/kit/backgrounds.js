// Backgrounds, painted in code. BACKGROUNDS[name](pen, t, cam, o) draws the world behind the actors.
// The visible frame is 1080x1920 at zoom 1; the ground line where feet stand is y = 1500.
// Layers shift with the camera by their depth (0 = far, 1 = on the actors' plane) for parallax.
import { rng, hash } from "./pen.js";

export const GROUND = 1500;
const W = 1080, H = 1920, L = -700, R = 1780, T = -500, B = 2400;
const par = (c, cam, depth, fn) => { c.save(); c.translate((cam.x - 540) * (1 - depth), (cam.y - 960) * (1 - depth) * .5); fn(); c.restore(); };
const grad = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([k, col]) => g.addColorStop(k, col)); return g; };
const fill = (c, style, x = L, y = T, w = R - L, h = B - T) => { c.fillStyle = style; c.fillRect(x, y, w, h); };
const glowAt = (c, x, y, r, col) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, col.replace(/[\d.]+\)$/, "0)")); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };

// small painted glyphs for temple columns: ankh, eye, water, bird
function glyph(p, n, x, y) { const col = "#6a4a2a", w = 5;
  if (n === 0) { p.circle(x, y - 22, 12, null, col, w); p.line([[x, y - 10], [x, y + 28]], w, col); p.line([[x - 16, y], [x + 16, y]], w, col); }
  if (n === 1) { p.ctx.beginPath(); p.ctx.ellipse(x, y, 24, 11, 0, 0, 7); p.ctx.lineWidth = w; p.ctx.strokeStyle = col; p.ctx.stroke(); p.circle(x, y, 6, col, null, 0); p.line([[x - 6, y + 11], [x - 12, y + 28]], w, col); }
  if (n === 2) for (let k = 0; k < 3; k++) p.line([[x - 24, y - 12 + k * 12], [x - 12, y - 18 + k * 12], [x, y - 12 + k * 12], [x + 12, y - 18 + k * 12], [x + 24, y - 12 + k * 12]], w, col);
  if (n === 3) { p.circle(x - 6, y - 14, 8, null, col, w); p.line([[x - 14, y - 6], [x + 12, y + 8], [x + 22, y + 22]], w, col); p.line([[x - 4, y + 10], [x - 4, y + 28]], w, col); }
}

export const BACKGROUNDS = {
  paper(p, t, cam, o) { const c = p.ctx; fill(c, o.paper || "#fbfaf6"); if (o.ground !== false) p.line([[L, GROUND + 6], [R, GROUND + 6]], 5, o.groundInk || "rgba(20,20,24,.35)"); },
  void(p, t, cam, o) { const c = p.ctx; fill(c, o.paper || "#08080a"); if (o.ground !== false) p.line([[L, GROUND + 6], [R, GROUND + 6]], 5, "rgba(255,255,255,.3)"); },

  techGrid(p, t, cam, o) { const c = p.ctx; fill(c, "#f7fafc");
    par(c, cam, .3, () => { c.strokeStyle = "rgba(90,180,220,.14)"; c.lineWidth = 2; for (let x = L; x < R; x += 90) { c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); } for (let y = T; y < B; y += 90) { c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke(); } });
    glowAt(c, 540, 700, 700, "rgba(90,220,255,.16)"); c.fillStyle = "rgba(60,180,220,.08)"; c.beginPath(); c.ellipse(540, GROUND + 10, 420, 40, 0, 0, 7); c.fill(); },

  cityDusk(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, -200, GROUND, [[0, "#2a2a6a"], [.45, "#a24a7a"], [.75, "#f28a5a"], [1, "#ffc87a"]]));
    glowAt(c, 760, 1160, 380, "rgba(255,210,140,.55)"); c.beginPath(); c.arc(760, 1160, 90, 0, 7); c.fillStyle = "#ffe2a8"; c.fill();
    const r = rng(4);
    par(c, cam, .2, () => { for (let x = L; x < R; x += 120) { const h = 300 + r() * 420; c.fillStyle = "#5a3a6a"; c.fillRect(x, GROUND - 60 - h, 110, h + 60); } });
    par(c, cam, .5, () => { for (let x = L; x < R; x += 190) { const h = 380 + r() * 480; c.fillStyle = "#3a2448"; c.fillRect(x, GROUND - h, 170, h); for (let wy = GROUND - h + 40; wy < GROUND - 60; wy += 56) for (let wx = x + 22; wx < x + 150; wx += 44) if (r() < .45) { c.fillStyle = "#ffd78a"; c.fillRect(wx, wy, 22, 30); } } });
    par(c, cam, 1, () => { fill(c, "#4a3a4a", L, GROUND, R - L, 600); fill(c, "#6a5a6a", L, GROUND, R - L, 26); for (let x = L + 80; x < R; x += 420) { p.line([[x, GROUND], [x, GROUND - 520]], 12, "#1e1824"); p.line([[x, GROUND - 520], [x + 60, GROUND - 520]], 12, "#1e1824"); glowAt(c, x + 60, GROUND - 505, 120, "rgba(255,220,150,.6)"); } }); },

  cave(p, t, cam, o) { const c = p.ctx; fill(c, "#3a2a20"); const r = rng(9);
    par(c, cam, .4, () => { c.fillStyle = "#4a3426"; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(L + r() * (R - L), T + r() * 1700, 120 + r() * 220, 80 + r() * 160, r() * 3, 0, 7); c.fill(); }
      c.save(); c.beginPath(); c.ellipse(820, 1000, 250, 360, 0, 0, 7); c.clip(); c.fillStyle = grad(c, 640, 1360, [[0, "#f4b878"], [1, "#ffe0a8"]]); c.fillRect(560, 600, 520, 800); c.fillStyle = "#7a9a5a"; c.fillRect(560, 1240, 520, 200); c.restore();
      p.ctx.beginPath(); p.ctx.ellipse(820, 1000, 250, 360, 0, 0, 7); p.ctx.lineWidth = 10; p.ctx.strokeStyle = "#2a1c14"; p.ctx.stroke(); });
    par(c, cam, .7, () => { c.save(); c.globalAlpha = .9; for (let i = 0; i < 26; i++) { const x = L + r() * (R - L), y = 200 + r() * 1200; p.line([[x, y], [x + 60 + r() * 90, y + 10 - r() * 30]], 6, "#2a1c14"); } c.restore();
      c.fillStyle = "rgba(220,120,60,.55)"; const hx = 140, hy = 760; c.save(); c.translate(hx, hy); for (const [a, b] of [[0, 0], [60, -10], [120, 10]]) { c.beginPath(); c.ellipse(a, b, 30, 14, 0, 0, 7); c.fill(); p.line([[a - 20, b + 12], [a - 30, b + 50]], 6, "rgba(220,120,60,.55)"); p.line([[a + 18, b + 12], [a + 26, b + 50]], 6, "rgba(220,120,60,.55)"); } c.restore(); });
    par(c, cam, 1, () => { fill(c, "#6a4a32", L, GROUND, R - L, 900); p.line([[L, GROUND], [R, GROUND]], 8, "#2a1c14"); for (let i = 0; i < 30; i++) { const x = L + r() * (R - L); p.line([[x, GROUND + 30 + r() * 300], [x + 40, GROUND + 34 + r() * 300]], 5, "#4a3222"); } }); },

  subway(p, t, cam, o) { const c = p.ctx; fill(c, "#f2e6cf");
    par(c, cam, .6, () => { for (let y = 200; y < 1180; y += 46) for (let x = L; x < R; x += 92) { c.fillStyle = ((x + y) / 46) % 2 ? "#e8d8b8" : "#efe2c6"; c.fillRect(x + ((y / 46) % 2) * 46, y, 90, 44); }
      fill(c, "#3a8a7a", L, 520, R - L, 70); p.text("LINE 2  ·  CENTRAL", 540, 555, { font: '700 44px "Avenir Next", sans-serif', color: "#f4f0e4" });
      fill(c, "#2a3a4a", L, 1180, R - L, 320); for (let x = L; x < R; x += 360) { c.fillStyle = "#d8e8f0"; c.fillRect(x + 30, 1220, 280, 140); } p.line([[L, 1190], [R, 1190]], 10, "#f2c230");
      for (let x = L + 200; x < R; x += 700) { glowAt(c, x, 260, 300, "rgba(255,220,160,.5)"); c.fillStyle = "#fff6dc"; c.fillRect(x - 120, 240, 240, 26); } });
    par(c, cam, 1, () => { fill(c, "#b8a890", L, GROUND, R - L, 900); fill(c, "#f2c230", L, GROUND, R - L, 18); }); },

  edo(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, -300, GROUND, [[0, "#8ac0e0"], [1, "#f4e6c8"]]));
    par(c, cam, .1, () => { c.fillStyle = "#7a8ab0"; c.beginPath(); c.moveTo(200, 1050); c.lineTo(620, 620); c.lineTo(1040, 1050); c.fill(); c.fillStyle = "#f4f6fa"; c.beginPath(); c.moveTo(520, 720); c.lineTo(620, 620); c.lineTo(720, 720); c.lineTo(680, 740); c.lineTo(620, 715); c.lineTo(560, 742); c.fill(); });
    par(c, cam, .6, () => { for (let i = -2; i < 6; i++) { const x = i * 420; p.rect(x, 900, 400, 600, "#c89a62", p.ink, 6); p.poly([[x - 40, 920], [x + 200, 800], [x + 440, 920]], "#3a3a44", p.ink, 6);
        for (let k = 0; k < 4; k++) p.line([[x + 40 + k * 100, 980], [x + 40 + k * 100, 1220]], 4, "rgba(40,30,20,.6)");
        p.rect(x + 120, 1080, 160, 120, ["#2a4a7a", "#7a2a2a", "#2a5a3a"][(i + 9) % 3], p.ink, 4); p.text(["米", "茶", "酒"][(i + 9) % 3], x + 200, 1140, { font: '700 64px "Hiragino Mincho ProN", serif', color: "#f4ead2" });
        const lx = x + 360, ly = 1000 + Math.sin(t * 2 + i) * 4; glowAt(c, lx, ly, 90, "rgba(255,170,80,.4)"); c.beginPath(); c.ellipse(lx, ly, 26, 36, 0, 0, 7); c.fillStyle = "#e0482a"; c.fill(); c.lineWidth = 4; c.strokeStyle = p.ink; c.stroke(); } });
    par(c, cam, 1, () => { fill(c, "#d8bf8a", L, GROUND, R - L, 900); p.line([[L, GROUND], [R, GROUND]], 6); }); },

  egypt(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, -300, GROUND, [[0, "#3a9ad8"], [1, "#f4dca0"]]));
    par(c, cam, .15, () => { c.fillStyle = "#e8c47a"; c.beginPath(); c.moveTo(-100, 1250); c.lineTo(240, 820); c.lineTo(580, 1250); c.fill(); c.fillStyle = "#d8b06a"; c.beginPath(); c.moveTo(240, 820); c.lineTo(580, 1250); c.lineTo(380, 1250); c.fill(); });
    par(c, cam, .6, () => { for (let i = -1; i < 5; i++) { const x = i * 330 + 120; p.rect(x, 720, 120, 780, "#e8cf96", p.ink, 6); for (const [y, col] of [[760, "#2f8a8a"], [800, "#c8422a"], [840, "#2f6fb0"]]) p.rect(x, y, 120, 30, col, p.ink, 3);
        p.rect(x - 20, 690, 160, 40, "#d8a83a", p.ink, 5); for (let k = 0; k < 5; k++) glyph(p, (k + i + 5) % 4, x + 60, 960 + k * 100); }
      p.rect(L, 640, R - L, 60, "#d8a83a", p.ink, 6); });
    par(c, cam, 1, () => { fill(c, "#e8cf96", L, GROUND, R - L, 900); p.line([[L, GROUND], [R, GROUND]], 6); }); },

  amberNoir(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, -300, GROUND, [[0, "#1a0c24"], [.6, "#3a1838"], [1, "#5a2a3a"]])); const r = rng(13);
    par(c, cam, .25, () => { for (let x = L; x < R; x += 140) { const h = 500 + r() * 600; c.fillStyle = "#24102e"; c.fillRect(x, GROUND - h, 130, h); for (let k = 0; k < 6; k++) if (r() < .35) { c.fillStyle = "rgba(255,170,60,.8)"; c.fillRect(x + 20 + r() * 80, GROUND - h + 40 + r() * (h - 120), 18, 26); } } });
    par(c, cam, .8, () => { const sx = 760; glowAt(c, sx, 1250, 520, "rgba(255,160,50,.45)"); p.rect(sx - 220, 1000, 440, 500, "#2a1420", "#120814", 6); p.rect(sx - 180, 1060, 360, 300, "#ffb44a", "#120814", 6);
      p.text(o.shop || "OPEN 24H", sx, 1035, { font: '800 34px "Avenir Next Condensed", "Avenir Next", sans-serif', color: "#ffcf7a" }); for (let k = 0; k < 3; k++) p.rect(sx - 150 + k * 110, 1280, 80, 60, "#c8702a", "#120814", 4); });
    par(c, cam, 1, () => { fill(c, "#1e0e1c", L, GROUND, R - L, 900); for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(255,170,60,${.12 - i * .015})`; c.fillRect(560, GROUND + 20 + i * 40, 400, 18); } }); },

  vintage(p, t, cam, o) { const c = p.ctx; fill(c, "#ece6d2"); const r = rng(21);
    par(c, cam, .5, () => { for (let i = -2; i < 7; i++) { const x = i * 300, h = 520 + (i * 97 % 260); p.rect(x, GROUND - h, 280, h, ["#b8c4a8", "#c8ccb0", "#a8b89a"][(i + 9) % 3], p.ink, 5);
        for (let wy = GROUND - h + 60; wy < GROUND - 200; wy += 140) for (let wx = x + 40; wx < x + 240; wx += 110) { p.rect(wx, wy, 70, 90, "#f4efdc", p.ink, 4); p.line([[wx + 35, wy], [wx + 35, wy + 90]], 3); }
        if (i % 3 === 0) { p.rect(x + 40, GROUND - 230, 200, 70, "#b8423a", p.ink, 4); p.text(["CAFÉ", "BARBER", "BAKERY"][(i + 9) % 3], x + 140, GROUND - 195, { font: '700 38px "American Typewriter", Georgia, serif', color: "#f4efdc" }); } } });
    par(c, cam, 1, () => { fill(c, "#b8b09a", L, GROUND, R - L, 900); p.line([[L, GROUND], [R, GROUND]], 6); for (let x = L; x < R; x += 160) p.line([[x, GROUND + 60], [x + 90, GROUND + 60]], 4, "rgba(40,30,20,.4)"); }); },

  bedroom(p, t, cam, o) { const c = p.ctx; fill(c, "#f0dcc0");
    par(c, cam, .7, () => { fill(c, "#e8cfb0", L, 300, R - L, 1200); p.rect(620, 520, 300, 380, "#2a3a6a", p.ink, 7, 8); p.circle(820, 610, 46, "#fff2c8", null, 0); for (let k = 0; k < 7; k++) p.circle(660 + (k * 53) % 240, 560 + (k * 89) % 300, 4, "#fff", null, 0);
      p.line([[770, 520], [770, 900]], 6); p.line([[620, 710], [920, 710]], 6); p.rect(160, 620, 120, 160, "#9ac0d8", p.ink, 6, 6); p.rect(120, 1250, 120, 250, "#c89a62", p.ink, 6, 6); const lit = o.lamp ?? 1;
      if (lit) glowAt(c, 180, 1170, 260, "rgba(255,200,110,.5)"); p.poly([[130, 1180], [230, 1180], [205, 1110], [155, 1110]], "#f2c86a", p.ink, 5); });
    par(c, cam, 1, () => { fill(c, "#b88a62", L, GROUND, R - L, 900); p.line([[L, GROUND], [R, GROUND]], 6); }); },

  tvVoid(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, 0, H, [[0, "#06080e"], [.7, "#0e1424"], [1, "#05060a"]])); glowAt(c, 540, 1300, 700, "rgba(120,150,220,.10)");
    c.fillStyle = "rgba(200,210,255,.05)"; c.beginPath(); c.ellipse(540, GROUND + 20, 600, 60, 0, 0, 7); c.fill(); },

  darkRoom(p, t, cam, o) { const c = p.ctx; fill(c, "#141418");
    par(c, cam, .8, () => { fill(c, "#22232a", L, 200, R - L, 1300); p.rect(720, 860, 260, 640, "#1a1a20", "#0a0a0c", 6); const k = .5 + .5 * Math.sin(t * 3);
      c.fillStyle = `rgba(255,236,190,${.55 + .2 * k})`; c.fillRect(720, 1490, 260, 10); glowAt(c, 850, 1500, 260, `rgba(255,230,180,${.12 + .05 * k})`); c.fillStyle = "#3a3a42"; c.beginPath(); c.arc(940, 1180, 12, 0, 7); c.fill(); });
    par(c, cam, 1, () => { fill(c, "#0e0e12", L, GROUND, R - L, 900); }); },

  pixelWorld(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, 0, GROUND, [[0, "#5a8ae8"], [1, "#a8d8ff"]]));
    par(c, cam, .2, () => { c.fillStyle = "#ffffff"; for (const [x, y] of [[120, 420], [640, 300], [940, 560]]) { c.fillRect(x, y, 160, 40); c.fillRect(x + 30, y - 30, 100, 30); } c.fillStyle = "#3a8a4a"; for (let x = L; x < R; x += 260) { c.beginPath(); c.moveTo(x, GROUND); c.lineTo(x + 130, GROUND - 300); c.lineTo(x + 260, GROUND); c.fill(); } });
    par(c, cam, 1, () => { for (let x = L; x < R; x += 60) { c.fillStyle = "#5ac84a"; c.fillRect(x, GROUND, 60, 24); c.fillStyle = "#a8743a"; c.fillRect(x, GROUND + 24, 60, 400); c.fillStyle = "#8a5a2a"; c.fillRect(x + 10, GROUND + 60, 14, 14); c.fillRect(x + 36, GROUND + 120, 14, 14); }
      for (const x of [700, 760]) { c.fillStyle = "#f2b81f"; c.fillRect(x, 1060, 60, 60); c.fillStyle = "#8a5a1a"; c.fillRect(x + 22, 1072, 16, 30); } }); },

  paris(p, t, cam, o) { const c = p.ctx; fill(c, grad(c, -300, GROUND, [[0, "#a8c8e8"], [1, "#f8e8d8"]]));
    par(c, cam, .2, () => { const x = 820, y = GROUND - 40, sz = 520, col = "#8a7a8a"; c.save(); c.globalAlpha = .7; p.poly([[x - sz * .5, y], [x - sz * .08, y - sz * 1.4], [x, y - sz * 1.9], [x + sz * .08, y - sz * 1.4], [x + sz * .5, y], [x + sz * .3, y], [x, y - sz * .45], [x - sz * .3, y]], col, "#4a3a4a", 5); c.restore(); });
    par(c, cam, .6, () => { for (let i = -2; i < 6; i++) { const x = i * 300; p.rect(x, 980, 290, 520, ["#f4e2c8", "#e8d4b8", "#f0dcc4"][(i + 9) % 3], p.ink, 5); p.rect(x, 940, 290, 50, "#6a7a8a", p.ink, 5);
        for (let k = 0; k < 2; k++) p.rect(x + 50 + k * 120, 1040, 70, 110, "#8ab0c8", p.ink, 4); p.rect(x + 20, 1280, 250, 30, ["#c84a4a", "#2a6a5a", "#3a5a9a"][(i + 9) % 3], p.ink, 4); } });
    par(c, cam, 1, () => { fill(c, "#c8b8a0", L, GROUND, R - L, 900); p.line([[L, GROUND], [R, GROUND]], 6); }); },
};
export const BACKGROUND_NAMES = Object.keys(BACKGROUNDS);
