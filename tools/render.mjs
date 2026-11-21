// Renders a page frame by frame in headless Chrome (DevTools protocol, no npm packages) and pipes the frames to ffmpeg.
// The page must expose window.ready, window.frame(t), window.duration and a <canvas id="out">.
//   node tools/render.mjs <url> <out.mp4> [fps=30] [from=0] [to=duration]
// Also writes <out>.json with the page's window.timeline (cuts and fx times) for the mixer.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { tmpdir } from "node:os";
import { writeFileSync } from "node:fs";

const [url, outFile, fpsArg, fromArg, toArg] = process.argv.slice(2);
const FPS = Number(fpsArg || 30);
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333 + Math.floor(Math.random() * 400);
const prof = `${tmpdir()}/stickman-chrome-${PORT}`;
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, "--window-size=1080,1920",
  "--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars", "--mute-audio", "about:blank"], { stdio: "ignore" });

let ws, id = 0; const pending = new Map();
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
});
for (let k = 0; k < 50; k++) {
  try { const v = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); ws = new WebSocket(v.webSocketDebuggerUrl); break; } catch { await sleep(200); }
}
await new Promise(r => ws.addEventListener("open", r));
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId);
await S("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await S("Page.navigate", { url });
const ev = async expr => { const r = await S("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 600)); return r.result.value; };
for (let k = 0; k < 100 && !(await ev("!!window.ready").catch(() => false)); k++) await sleep(150);
const dur = await ev("window.duration");
writeFileSync(outFile + ".json", JSON.stringify(await ev("window.timeline || null")));
const from = Number(fromArg || 0), to = Number(toArg || dur);
const n = Math.round((to - from) * FPS);

const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), outFile], { stdio: ["pipe", "inherit", "inherit"] });
const t0 = Date.now();
for (let f = 0; f < n; f++) {
  const b64 = await ev(`(window.frame(${(from + f / FPS).toFixed(4)}), document.getElementById('out').toDataURL('image/jpeg', 0.93).slice(23))`);
  if (!ff.stdin.write(Buffer.from(b64, "base64"))) await new Promise(r => ff.stdin.once("drain", r));
  if (f % 150 === 0) console.log(JSON.stringify({ frame: f, of: n, sec: ((Date.now() - t0) / 1000).toFixed(0) }));
}
ff.stdin.end(); await new Promise(r => ff.on("close", r));
chrome.kill(); ws.close();
console.log(JSON.stringify({ ok: true, out: outFile, frames: n, secs: ((Date.now() - t0) / 1000).toFixed(0) }));
