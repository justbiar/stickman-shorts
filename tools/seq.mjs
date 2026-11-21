// Save every PNG a page's window.seq() returns:  node tools/seq.mjs <url> <out-dir>
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";
const [url, dir] = process.argv.slice(2); mkdirSync(dir, { recursive: true });
const PORT = 9600 + Math.floor(Math.random() * 150);
const chrome = spawn(process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${tmpdir()}/stick-seq-${PORT}`, "about:blank"], { stdio: "ignore" });
let ws, id = 0; const pend = new Map();
for (let k = 0; k < 50; k++) { try { ws = new WebSocket((await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl); break; } catch { await sleep(200); } }
await new Promise(r => ws.addEventListener("open", r));
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) })); });
const { targetId } = await send("Target.createTarget", { url: "about:blank" }); const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const S = (m, p) => send(m, p, sessionId); await S("Page.navigate", { url });
const ev = async e => (await S("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true })).result.value;
for (let k = 0; k < 100 && !(await ev("!!window.ready").catch(() => false)); k++) await sleep(150);
const frames = await ev("window.seq()"); frames.forEach((d, i) => writeFileSync(`${dir}/${String(i + 1).padStart(4, "0")}.png`, Buffer.from(d.split(",")[1], "base64")));
chrome.kill(); ws.close(); console.log(JSON.stringify({ ok: true, frames: frames.length, dir }));
