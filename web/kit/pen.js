// Drawing helpers shared by the whole kit: seeded randomness and a "pen" that can draw clean vector lines
// or hand-drawn ones (jitter) that re-draw a few times a second (boil), like real frame-by-frame animation.

export const hash = (a, b = 0, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
export function rng(seed = 1) { let s = (seed >>> 0) % 2147483647 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const back = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a, b, k) => a + (b - a) * k;

export class Pen {
  // o: { ink, width, jitter (px), boil (redraws per second, 0 = still), glow (px blur, for luminous styles) }
  constructor(ctx, o = {}) { this.ctx = ctx; this.ink = o.ink || "#141418"; this.width = o.width || 8; this.jitter = o.jitter || 0; this.boil = o.boil || 0; this.t = 0; this.glow = o.glow || 0; }
  frame(t) { this.t = t; this.seed = this.boil ? Math.floor(t * this.boil) : 0; }
  j(x, y, k = 1) { if (!this.jitter) return [x, y]; const a = this.jitter * k; return [x + (hash(Math.round(x), Math.round(y), this.seed) - .5) * a, y + (hash(Math.round(y), Math.round(x), this.seed + 7) - .5) * a]; }
  // polyline through points, subdivided so the jitter wobbles along long strokes
  line(pts, w = this.width, color = this.ink, close = false) {
    const c = this.ctx; c.beginPath(); let first = true;
    const P = close ? [...pts, pts[0]] : pts;
    for (let i = 0; i < P.length - 1 || (i === 0 && P.length === 1); i++) {
      const [x0, y0] = P[i], [x1, y1] = P[i + 1] || P[i]; const n = this.jitter ? Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 40)) : 1;
      for (let k = 0; k <= n; k++) { if (!first && k === 0) continue; const [x, y] = this.j(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); first ? c.moveTo(x, y) : c.lineTo(x, y); first = false; }
    }
    if (close) c.closePath(); c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = color; c.stroke();
  }
  // smooth curve through points (for rubber-hose limbs and hair)
  curve(pts, w = this.width, color = this.ink) {
    const c = this.ctx; const P = pts.map(([x, y]) => this.j(x, y, .6)); c.beginPath(); c.moveTo(...P[0]);
    for (let i = 1; i < P.length - 1; i++) { const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2; c.quadraticCurveTo(P[i][0], P[i][1], mx, my); }
    c.lineTo(...P[P.length - 1]); c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = color; c.stroke();
  }
  circle(x, y, r, fill, stroke = this.ink, w = this.width) {
    const c = this.ctx; c.beginPath();
    if (this.jitter) { const n = 28; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = r + (hash(i % n, Math.round(r), this.seed) - .5) * this.jitter * .8; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); }
    else c.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke && w) { c.lineWidth = w; c.strokeStyle = stroke; c.stroke(); }
  }
  poly(pts, fill, stroke = this.ink, w = this.width) {
    const c = this.ctx; c.beginPath(); pts.forEach((p, i) => { const [x, y] = this.j(p[0], p[1], .5); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); } if (stroke && w) { c.lineWidth = w; c.lineJoin = "round"; c.strokeStyle = stroke; c.stroke(); }
  }
  rect(x, y, w, h, fill, stroke = this.ink, lw = this.width, r = 0) {
    if (this.jitter) return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill, stroke, lw);
    const c = this.ctx; c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke && lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.stroke(); }
  }
  text(s, x, y, o = {}) {
    const c = this.ctx; c.save(); c.font = o.font || `800 64px "Avenir Next", sans-serif`; c.textAlign = o.align || "center"; c.textBaseline = "middle";
    if (o.rot) { c.translate(x, y); c.rotate(o.rot); x = 0; y = 0; }
    if (o.stroke) { c.lineWidth = o.strokeWidth || 10; c.lineJoin = "round"; c.strokeStyle = o.stroke; c.strokeText(s, x, y); }
    c.fillStyle = o.color || this.ink; c.fillText(s, x, y); c.restore();
  }
}
