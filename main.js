'use strict';
/*
 * Nava Player — main process
 * Copyright (c) 2026 Silenzio Morto. All rights reserved.
 * https://github.com/SilenzioMorto
 */
const { app, BrowserWindow, ipcMain, protocol, dialog, shell, Menu, Tray, nativeImage, session, desktopCapturer, net, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const crypto = require('crypto');
const https = require('https');
const { spawn } = require('child_process');
const { Readable } = require('stream');

const APP_ID = 'app.nava.player';
const GITHUB = 'https://github.com/SilenzioMorto';
protocol.registerSchemesAsPrivileged([{
  scheme: 'nava',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true, codeCache: true }
}]);
app.setAppUserModelId(APP_ID);
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

if (process.env.NAVA_USERDATA && !app.isPackaged) app.setPath('userData', process.env.NAVA_USERDATA);
const USER = app.getPath('userData');
const DIR = { fonts: path.join(USER, 'fonts'), covers: path.join(USER, 'covers'), lyricsCache: path.join(USER, 'lyrics'), ai: path.join(USER, 'ai'), tmp: path.join(os.tmpdir(), 'nava-player') };
for (const d of Object.values(DIR)) fs.mkdirSync(d, { recursive: true });
const LIB_FILE = path.join(USER, 'library.json');
const CFG_FILE = path.join(USER, 'config.json');
const RENDERER = path.join(__dirname, 'renderer');
const AUDIO_EXT = new Set(['.mp3', '.flac', '.wav', '.ogg', '.oga', '.opus', '.m4a', '.aac', '.webm', '.weba', '.mp4a']);
const MIME = {
  '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.oga': 'audio/ogg', '.opus': 'audio/ogg',
  '.m4a': 'audio/mp4', '.mp4a': 'audio/mp4', '.aac': 'audio/aac', '.webm': 'audio/webm', '.weba': 'audio/webm',
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf'
};
const SKIP_DIRS = new Set(['windows', 'program files', 'program files (x86)', 'programdata', 'appdata', '$recycle.bin', 'system volume information',
  'node_modules', '.git', 'recovery', 'perflogs', 'msocache', '$windows.~bt', '$windows.~ws', 'windowsapps', 'steamapps', 'cache', 'temp', 'tmp',
  'steam', 'steamlibrary', 'epic games', 'riot games', 'ubisoft game launcher', 'origin games', 'ea games', 'xboxgames', 'battle.net', 'plugins', 'patches', 'sfx', 'renpy', 'unitycache']);
const MIN_BYTES = 40 * 1024;

let win = null, splash = null, tray = null, quitting = false, trayHintShown = false;
const send = (ch, data) => { if (win && !win.isDestroyed()) win.webContents.send(ch, data); };

/* ---------------- config + library ---------------- */
function readJSON(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } }
const writeT = {};
function writeJSONSoon(f, data) {
  clearTimeout(writeT[f]);
  writeT[f] = setTimeout(() => { fsp.writeFile(f + '.tmp', JSON.stringify(data)).then(() => fsp.rename(f + '.tmp', f)).catch(() => {}); }, 400);
}
const cfg = Object.assign({
  folders: [app.getPath('music'), app.getPath('downloads'), app.getPath('desktop')].filter(Boolean),
  allDrives: false, extra: [],
  lyricsDir: null, lyricsMode: 'folder', writeLrc: true,
  closeAction: 'ask', bounds: null, maximized: false
}, readJSON(CFG_FILE, {}));
const saveCfg = () => writeJSONSoon(CFG_FILE, cfg);
const lib = readJSON(LIB_FILE, { tracks: {} });
if (!lib.tracks) lib.tracks = {};

function fixMojibake(s) {
  if (!s || typeof s !== 'string') return s;
  s = s.replace(/\0/g, '').trim();
  if (/[؀-ۿЀ-ӿ]/.test(s)) return s;
  const hi = (s.match(/[À-ÿ]/g) || []).length;
  if (hi >= 2 && hi / s.length > 0.3 && !/[^\u0000-ÿ]/.test(s)) {
    try {
      const b = Buffer.from(s, 'latin1');
      const fa = new TextDecoder('windows-1256').decode(b); if (/[؀-ۿ]{2}/.test(fa)) return fa;
      const ru = new TextDecoder('windows-1251').decode(b); if (/[Ѐ-ӿ]{2}/.test(ru)) return ru;
    } catch (e) {}
  }
  return s;
}
function nameFromFile(fp) {
  const base = path.basename(fp).replace(/\.[^.]+$/, '').replace(/_/g, ' ').trim();
  const m = base.split(/\s+[-–—]\s+/);
  return m.length >= 2 ? { artist: m[0].trim(), title: m.slice(1).join(' - ').trim() } : { artist: '', title: base };
}
let mm = null;
async function parseTrack(fp, st) {
  if (!mm) mm = await import('music-metadata');
  const nm = nameFromFile(fp);
  const t = { path: fp, size: st.size, mtime: st.mtimeMs, added: Date.now(), title: nm.title, artist: nm.artist, album: '', year: 0, genre: '', duration: 0, cover: null, bitrate: 0, sampleRate: 0, codec: '' };
  try {
    let meta = await mm.parseFile(fp, { duration: false, skipCovers: false });
    if (!meta.format.duration) { try { meta = await mm.parseFile(fp, { duration: true, skipCovers: false }); } catch (e) {} }
    const c = meta.common, f = meta.format;
    if (c.title) t.title = fixMojibake(c.title);
    if (c.artist || (c.artists && c.artists[0])) t.artist = fixMojibake(c.artist || c.artists[0]);
    if (c.album) t.album = fixMojibake(c.album);
    if (c.year) t.year = c.year;
    if (c.genre && c.genre[0]) t.genre = fixMojibake(c.genre[0]);
    t.duration = f.duration || 0; t.bitrate = f.bitrate || 0; t.sampleRate = f.sampleRate || 0; t.codec = f.codec || f.container || '';
    const pic = c.picture && c.picture[0];
    if (pic && pic.data && pic.data.length > 200) {
      const h = crypto.createHash('sha1').update(pic.data.subarray(0, 65536)).update(String(pic.data.length)).digest('hex').slice(0, 20);
      const ext = /png/i.test(pic.format) ? '.png' : /webp/i.test(pic.format) ? '.webp' : '.jpg';
      const out = path.join(DIR.covers, h + ext);
      if (!fs.existsSync(out)) await fsp.writeFile(out, pic.data);
      t.cover = h + ext;
    }
  } catch (e) {}
  return t;
}
async function walk(dir, out, depth, seen) {
  if (depth > 14 || out.length > 200000) return;
  let ents;
  try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch (e) { return; }
  for (const e of ents) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const n = e.name.toLowerCase();
      if (SKIP_DIRS.has(n) || n.startsWith('.') || n.startsWith('$') || seen.has(full.toLowerCase())) continue;
      seen.add(full.toLowerCase());
      await walk(full, out, depth + 1, seen);
    } else if (e.isFile() && AUDIO_EXT.has(path.extname(e.name).toLowerCase())) out.push(full);
  }
}
function driveRoots() { const r = []; for (let c = 67; c <= 90; c++) { const d = String.fromCharCode(c) + ':\\'; try { fs.accessSync(d); r.push(d); } catch (e) {} } return r; }
let scanning = false, scanAgain = false;
async function scan() {
  if (scanning) { scanAgain = true; return; }
  scanning = true; send('scan:progress', { phase: 'walk', done: 0, total: 0 });
  try {
    const roots = (cfg.allDrives ? driveRoots() : []).concat(cfg.folders);
    const files = [], seen = new Set();
    for (const r of roots) if (r && fs.existsSync(r)) await walk(r, files, 0, seen);
    const uniq = [...new Set(files)];
    for (const x of cfg.extra) if (fs.existsSync(x) && !uniq.includes(x)) uniq.push(x);
    const keep = new Set(uniq);
    for (const k of Object.keys(lib.tracks)) if (!keep.has(k)) delete lib.tracks[k];
    let done = 0, idx = 0; const total = uniq.length;
    send('scan:progress', { phase: 'parse', done, total });
    const worker = async () => {
      while (idx < uniq.length) {
        const fp = uniq[idx++];
        try {
          const st = await fsp.stat(fp), old = lib.tracks[fp];
          if (st.size < MIN_BYTES && !cfg.extra.includes(fp)) { delete lib.tracks[fp]; done++; continue; }
          if (!old || old.size !== st.size || Math.abs(old.mtime - st.mtimeMs) > 1) { const t = await parseTrack(fp, st); if (old) { t.added = old.added; t.plays = old.plays; t.fav = old.fav; } lib.tracks[fp] = t; }
        } catch (e) {}
        if (++done % 40 === 0) send('scan:progress', { phase: 'parse', done, total });
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
    writeJSONSoon(LIB_FILE, lib);
    send('library', Object.values(lib.tracks));
    send('scan:progress', { phase: 'done', done: total, total });
  } catch (e) { send('scan:progress', { phase: 'error', message: String(e.message || e) }); }
  scanning = false;
  if (scanAgain) { scanAgain = false; scan(); }
}
async function addPaths(paths) {
  const files = [];
  for (const p of paths) {
    try {
      const st = await fsp.stat(p);
      if (st.isDirectory()) { if (!cfg.folders.includes(p)) cfg.folders.push(p); await walk(p, files, 0, new Set()); }
      else if (AUDIO_EXT.has(path.extname(p).toLowerCase())) { files.push(p); if (!cfg.extra.includes(p) && !cfg.folders.some(f => p.toLowerCase().startsWith(f.toLowerCase() + path.sep))) cfg.extra.push(p); }
    } catch (e) {}
  }
  saveCfg();
  const out = [];
  for (const fp of files) {
    try { const st = await fsp.stat(fp); let t = lib.tracks[fp]; if (!t || t.size !== st.size) { t = await parseTrack(fp, st); lib.tracks[fp] = t; } out.push(t); } catch (e) {}
  }
  writeJSONSoon(LIB_FILE, lib);
  send('library', Object.values(lib.tracks));
  return out;
}

/* ---------------- protocol ---------------- */
async function serveFile(fp, req, type) {
  const st = await fsp.stat(fp), size = st.size;
  const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' };
  const range = req.headers.get('range');
  let start = 0, end = size - 1, status = 200;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      if (m[1]) { start = +m[1]; if (m[2]) end = Math.min(+m[2], size - 1); } else if (m[2]) start = Math.max(0, size - +m[2]);
      if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    }
  }
  headers['Content-Length'] = String(end - start + 1);
  if (req.method === 'HEAD') return new Response(null, { status, headers });
  return new Response(Readable.toWeb(fs.createReadStream(fp, { start, end, highWaterMark: 256 * 1024 })), { status, headers });
}
async function serveRemote(url, req) {
  if (!/^https?:\/\//i.test(url)) return new Response('bad url', { status: 400 });
  const h = { 'User-Agent': 'Mozilla/5.0 NavaPlayer/2.0' };
  const range = req.headers.get('range'); if (range) h.Range = range;
  const r = await net.fetch(url, { headers: h, redirect: 'follow' });
  const out = new Headers();
  for (const k of ['content-type', 'content-length', 'content-range', 'accept-ranges']) { const v = r.headers.get(k); if (v) out.set(k, v); }
  out.set('Access-Control-Allow-Origin', '*');
  return new Response(r.body, { status: r.status, headers: out });
}
function registerProtocol() {
  protocol.handle('nava', async req => {
    try {
      const u = new URL(req.url), p = decodeURIComponent(u.pathname);
      if (p.startsWith('/__media/')) {
        const fp = Buffer.from(p.slice(9), 'base64url').toString('utf8');
        if (!AUDIO_EXT.has(path.extname(fp).toLowerCase())) return new Response('forbidden', { status: 403 });
        return await serveFile(fp, req, MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream');
      }
      if (p.startsWith('/__remote/')) return await serveRemote(Buffer.from(p.slice(10), 'base64url').toString('utf8'), req);
      if (p.startsWith('/__font/')) { const name = path.basename(p.slice(8)); return await serveFile(path.join(DIR.fonts, name), req, MIME[path.extname(name).toLowerCase()] || 'font/ttf'); }
      if (p.startsWith('/__cover/')) { const name = path.basename(p.slice(9)); return await serveFile(path.join(DIR.covers, name), req, MIME[path.extname(name).toLowerCase()] || 'image/jpeg'); }
      const rel = path.normalize(p === '/' ? '/index.html' : p).replace(/^([\\/])+/, '');
      const fp = path.join(RENDERER, rel);
      if (!fp.startsWith(RENDERER)) return new Response('forbidden', { status: 403 });
      return await serveFile(fp, req, MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream');
    } catch (e) { return new Response('not found', { status: 404 }); }
  });
}

/* ---------------- AI: whisper.cpp ---------------- */
const MODELS = {
  turbo: { file: 'ggml-large-v3-turbo-q5_0.bin', url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin', min: 400e6, mb: 547 },
  large: { file: 'ggml-large-v3-q5_0.bin', url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-q5_0.bin', min: 900e6, mb: 1031 },
  vad: { file: 'ggml-silero-v5.1.2.bin', url: 'https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v5.1.2.bin', min: 2e5, mb: 1 }
};
const ENGINES = {
  cuda: { url: 'https://github.com/ggml-org/whisper.cpp/releases/download/b5454/whisper-bin-win-cuda-12.4.0-x64.zip', zip: 'whisper-cuda12.zip', dir: 'cuda', mb: 684 },
  cpu: { url: 'https://github.com/ggml-org/whisper.cpp/releases/download/b5454/whisper-bin-x64.zip', zip: 'whisper-cpu.zip', dir: 'cpu', mb: 9 }
};
function findExe(dir) {
  if (!fs.existsSync(dir)) return null;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop(); let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
    for (const e of ents) { const f = path.join(d, e.name); if (e.isDirectory()) stack.push(f); else if (/^whisper-cli\.exe$/i.test(e.name)) return f; }
  }
  return null;
}
function cudaExe() {
  const e = findExe(path.join(DIR.ai, 'cuda')); if (!e) return null;
  try { return fs.readdirSync(path.dirname(e)).some(f => /^cublas64_\d+\.dll$/i.test(f)) ? e : null; } catch (er) { return null; }
}
const hasModel = k => { try { return fs.statSync(path.join(DIR.ai, MODELS[k].file)).size > MODELS[k].min; } catch (e) { return false; } };
let hasNvidia = null;
function detectNvidia() {
  if (hasNvidia !== null) return Promise.resolve(hasNvidia);
  return new Promise(res => {
    let out = '';
    const p = spawn('nvidia-smi', ['-L'], { windowsHide: true });
    p.stdout.on('data', d => out += d); p.on('error', () => { hasNvidia = false; res(false); });
    p.on('close', c => { hasNvidia = c === 0 && /GPU/i.test(out); res(hasNvidia); });
  });
}
function aiStatus() {
  const cuda = !!cudaExe(), cpu = !!findExe(path.join(DIR.ai, 'cpu'));
  const turbo = hasModel('turbo'), large = hasModel('large'), vad = hasModel('vad');
  return { cuda, cpu, turbo, large, vad, nvidia: hasNvidia, ready: (cuda || cpu) && (turbo || large), busy: !!setupRunning, sizes: { cuda: ENGINES.cuda.mb, turbo: MODELS.turbo.mb, large: MODELS.large.mb } };
}
function download(url, dest, onProgress, redirects = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'NavaPlayer/2.0' } }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 8) { res.resume(); return resolve(download(new URL(res.headers.location, url).toString(), dest, onProgress, redirects + 1)); }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const total = +res.headers['content-length'] || 0; let got = 0;
      const out = fs.createWriteStream(dest + '.part');
      res.on('data', c => { got += c.length; onProgress && onProgress(got, total); });
      res.pipe(out);
      out.on('finish', () => out.close(() => { fs.renameSync(dest + '.part', dest); resolve(); }));
      out.on('error', reject); res.on('error', reject);
    });
    req.on('error', reject);
  });
}
function unzip(zip, dir) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(dir, { recursive: true });
    const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', `Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${dir.replace(/'/g, "''")}' -Force`], { windowsHide: true });
    ps.on('close', c => c === 0 ? resolve() : reject(new Error('unzip ' + c))); ps.on('error', reject);
  });
}
let setupRunning = null;
async function aiSetup(what) {
  if (setupRunning) return setupRunning;
  setupRunning = (async () => {
    const nv = await detectNvidia();
    const steps = [];
    if (what === 'large') steps.push(['model', 'large']);
    else {
      if (nv && !cudaExe()) steps.push(['engine', 'cuda']);
      if (!findExe(path.join(DIR.ai, 'cpu'))) steps.push(['engine', 'cpu']);
      if (!hasModel('turbo') && !hasModel('large')) steps.push(['model', 'turbo']);
      if (!hasModel('vad')) steps.push(['model', 'vad']);
    }
    for (const [kind, k] of steps) {
      const it = kind === 'engine' ? ENGINES[k] : MODELS[k];
      const dest = path.join(DIR.ai, it.zip || it.file);
      let last = 0;
      try {
        if (!(fs.existsSync(dest) && fs.statSync(dest).size > 1e5)) await download(it.url, dest, (g, t) => { const n = Date.now(); if (n - last > 300) { last = n; send('ai:progress', { step: k, got: g, total: t }); } });
        if (it.zip) {
          send('ai:progress', { step: k, unpack: true });
          if (k === 'cuda') { try { fs.rmSync(path.join(DIR.ai, 'cuda'), { recursive: true, force: true }); } catch (e) {} }
          await unzip(dest, path.join(DIR.ai, it.dir)); try { fs.unlinkSync(dest); } catch (e) {}
        }
      } catch (e) { if (k === 'cuda' || k === 'vad') continue; throw e; }
    }
    send('ai:progress', { done: true });
    return aiStatus();
  })();
  try { return await setupRunning; } finally { setupRunning = null; }
}
async function unpackPending() {
  for (const k of ['cuda', 'cpu']) {
    const it = ENGINES[k], z = path.join(DIR.ai, it.zip);
    if (!fs.existsSync(z)) continue;
    try { if (k === 'cuda') fs.rmSync(path.join(DIR.ai, 'cuda'), { recursive: true, force: true }); await unzip(z, path.join(DIR.ai, it.dir)); fs.unlinkSync(z); } catch (e) {}
  }
  try { fs.unlinkSync(path.join(DIR.ai, 'whisper-cuda.zip')); } catch (e) {}
}

/* lyrics storage: internal cache + the user's chosen folder (or a .lrc beside the song) */
const lyricKey = t => crypto.createHash('sha1').update(t.path + '|' + (t.size || 0) + '|' + Math.round(t.mtime || 0)).digest('hex');
const safeName = s => String(s || 'track').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').slice(0, 120);
function lyricsDir() { return cfg.lyricsDir || path.join(app.getPath('documents'), 'Nava Lyrics'); }
const fmtLrc = s => { const m = Math.floor(s / 60), x = s - m * 60; return `[${String(m).padStart(2, '0')}:${x.toFixed(2).padStart(5, '0')}]`; };
function toLrc(t, data) {
  const head = [`[ti:${t.title || ''}]`, `[ar:${t.artist || ''}]`, '[re:Nava Player - AI transcription]', `[la:${data.lang}]`];
  return head.concat(data.lines.map(l => fmtLrc(l.t0) + l.text)).join('\r\n') + '\r\n';
}
async function saveLyrics(t, data) {
  await fsp.writeFile(path.join(DIR.lyricsCache, lyricKey(t) + '.json'), JSON.stringify(data));
  if (!cfg.writeLrc || !data.lines.length) return;
  const base = safeName(path.basename(t.path).replace(/\.[^.]+$/, ''));
  try {
    if (cfg.lyricsMode === 'beside') await fsp.writeFile(t.path.replace(/\.[^.]+$/, '') + '.lrc', toLrc(t, data), 'utf8');
    else { const d = lyricsDir(); await fsp.mkdir(d, { recursive: true }); await fsp.writeFile(path.join(d, base + '.lrc'), toLrc(t, data), 'utf8'); }
  } catch (e) {}
}

/* Persian clean-up: Arabic letter forms, digits, zero-width non-joiners, punctuation */
const FA_EXCEPT = new Set(['تنها', 'رها', 'بها', 'نها', 'اینها', 'آنها']);
function normalizeFa(s) {
  s = s.replace(/ي/g, 'ی').replace(/ى/g, 'ی').replace(/ك/g, 'ک').replace(/ۀ/g, 'هٔ')
    .replace(/[٠-٩]/g, d => '۰۱۲۳۴۵۶۷۸۹'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]);
  s = s.replace(/(^|[\s(«"])(ن?می)\s+(?=[آ-ی])/g, '$1$2‌');
  s = s.replace(/(^|\s)([آ-ی]{2,})\s?(ها|های|هایی|هایم|هایت|هایش|هایمان|هایتان|هایشان)(?=$|[\s.,!?؟،])/g, (m, a, w, suf) => FA_EXCEPT.has(w + suf) ? m : a + w + '‌' + suf);
  s = s.replace(/([آ-ی])\s(تر|ترین)(?=$|\s)/g, '$1‌$2');
  s = s.replace(/\s*([،؛؟!.])/g, '$1').replace(/,/g, '،').replace(/\?/g, '؟').replace(/\s{2,}/g, ' ');
  return s.trim();
}
const decodeL1 = s => Buffer.from(s || '', 'latin1').toString('utf8');
const HALLU = [/^\s*[\[(（].*[\])）]\s*$/, /^[\s♪♫♬*.\-–—…]+$/, /subtitles? by/i, /amara\.org/i, /thank(s| you) for watching/i, /please subscribe/i, /like and subscribe/i,
  /продолжение следует/i, /субтитры/i, /редактор субтитров/i, /подписывайтесь/i, /زیرنویس/, /مشترک شوید/, /سابسکرایب/, /کانال.*(را|رو) دنبال/, /www\.|\.com\b|\.ir\b/i, /^(موسیقی|music|музыка)$/i];
function buildLyrics(json, lang) {
  const lines = [];
  for (const s of (json.transcription || [])) {
    let text = decodeL1(s.text).replace(/\s+/g, ' ').trim();
    if (!text || HALLU.some(r => r.test(text))) continue;
    const toks = (s.tokens || []).filter(tk => !(tk.text || '').startsWith('[_') && !(tk.text || '').startsWith('<|'));
    const avgP = toks.length ? toks.reduce((a, tk) => a + (tk.p || 0), 0) / toks.length : 1;
    if (avgP < 0.3) continue;
    const t0 = (s.offsets && s.offsets.from || 0) / 1000, t1 = (s.offsets && s.offsets.to || 0) / 1000;
    if (t1 - t0 < 0.15) continue;
    const words = []; let cur = null;
    for (const tk of toks) {
      const raw = tk.text || '', tf = (tk.offsets && tk.offsets.from || 0) / 1000, tt = (tk.offsets && tk.offsets.to || 0) / 1000;
      if (!cur || raw.startsWith(' ')) { if (cur) words.push(cur); cur = { raw, t0: tf, t1: tt }; } else { cur.raw += raw; cur.t1 = tt; }
    }
    if (cur) words.push(cur);
    if (lang === 'fa') text = normalizeFa(text);
    let ws = words.map(w => ({ w: decodeL1(w.raw).trim(), t0: w.t0, t1: Math.max(w.t1, w.t0 + 0.05) })).filter(w => w.w);
    const plain = text.split(' ');
    if (lang === 'fa' || ws.length !== plain.length || ws.some(w => w.w.includes('�'))) {
      const tot = plain.reduce((a, w) => a + w.length + 1, 0), dur = t1 - t0; let acc = 0;
      const starts = ws.length === plain.length ? ws.map(w => w.t0) : null;
      ws = plain.map((w, i) => { const a = t0 + dur * acc / tot; acc += w.length + 1; return { w, t0: starts ? starts[i] : a, t1: t0 + dur * acc / tot }; });
    }
    const MAXW = 9;
    for (let i = 0; i < ws.length; i += MAXW) {
      const part = ws.slice(i, i + MAXW);
      if (ws.length - (i + MAXW) > 0 && ws.length - (i + MAXW) < 3) { part.push(...ws.slice(i + MAXW)); i = ws.length; }
      lines.push({ t0: part[0].t0, t1: part[part.length - 1].t1, text: part.map(w => w.w).join(' '), words: part });
    }
  }
  const out = [];
  for (const l of lines) { const n = out.length; if (n >= 2 && out[n - 1].text === l.text && out[n - 2].text === l.text) continue; out.push(l); }
  for (let i = 0; i < out.length - 1; i++) if (out[i].t1 > out[i + 1].t0) out[i].t1 = out[i + 1].t0;
  return out;
}
const PROMPTS = {
  fa: 'متن ترانه‌ی یک آهنگ فارسی، با املای درست فارسی و نیم‌فاصله نوشته شده است.',
  ru: 'Текст песни на русском языке.',
  en: 'Song lyrics, transcribed carefully.'
};
const jobs = []; let jobRunning = false;
function runWhisper(exe, args, onPct) {
  return new Promise(resolve => {
    const p = spawn(exe, args, { cwd: path.dirname(exe), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let err = ''; const logf = path.join(USER, 'whisper-last.log');
    try { fs.writeFileSync(logf, exe + ' ' + args.join(' ') + '\n\n'); } catch (e) {}
    const onData = d => {
      const s = d.toString(); err += s; if (err.length > 20000) err = err.slice(-10000);
      try { fs.appendFileSync(logf, s.replace(/^\[\d\d:[^\n]*\n?/gm, '')); } catch (e) {}
      const m = s.match(/progress\s*=\s*(\d+)%/g); if (m) onPct(+m[m.length - 1].match(/(\d+)/)[1]);
    };
    p.stdout.on('data', onData); p.stderr.on('data', onData);
    p.on('close', code => { try { fs.appendFileSync(logf, '\nexit ' + code + '\n'); } catch (e) {} resolve({ code, err }); });
    p.on('error', e => resolve({ code: -1, err: String(e) }));
  });
}
async function transcribe(job) {
  const st = aiStatus();
  if (!st.ready) throw new Error('AI_NOT_READY');
  const key = lyricKey(job.track);
  const wav = path.join(DIR.tmp, key + '.wav'), outBase = path.join(DIR.tmp, key);
  await fsp.writeFile(wav, Buffer.from(job.wav));
  const lang = ['fa', 'en', 'ru'].includes(job.lang) ? job.lang : 'auto';
  let mk = job.model === 'large' || job.model === 'turbo' ? job.model : (lang === 'fa' && st.large ? 'large' : (st.turbo ? 'turbo' : 'large'));
  if (!hasModel(mk)) mk = hasModel('turbo') ? 'turbo' : 'large';
  const threads = String(Math.max(2, Math.min(8, os.cpus().length - 1)));
  const base = ['-m', path.join(DIR.ai, MODELS[mk].file), '-f', wav, '-l', lang, '-ojf', '-of', outBase, '-t', threads, '-pp', '-mc', '64', '-sns'];
  if (PROMPTS[lang]) base.push('--prompt', PROMPTS[lang]);
  const vadArgs = st.vad && job.vad !== false ? ['--vad', '-vm', path.join(DIR.ai, MODELS.vad.file), '-vsd', '200', '-vp', '400'] : [];
  const exes = [], cuda = cudaExe(), cpu = findExe(path.join(DIR.ai, 'cpu'));
  if (cuda && job.device !== 'cpu') exes.push([cuda, ['-bs', '5', '-bo', '5']]);
  if (cpu) exes.push([cpu, ['-bs', '2', '-bo', '2']]);
  let res = null, used = '';
  for (const [exe, extra] of exes) {
    for (const va of vadArgs.length ? [vadArgs, []] : [[]]) {
      try { fs.unlinkSync(outBase + '.json'); } catch (e) {}
      res = await runWhisper(exe, base.concat(extra, va), pct => send('lyrics:progress', { path: job.track.path, pct }));
      if (res.code === 0 && fs.existsSync(outBase + '.json')) { used = exe === cuda && !/no GPU found/i.test(res.err) ? 'GPU' : 'CPU'; break; }
    }
    if (used) break;
  }
  try { fs.unlinkSync(wav); } catch (e) {}
  if (!used) throw new Error('WHISPER_FAILED: ' + (res ? res.err.split('\n').filter(Boolean).slice(-2).join(' ') : ''));
  const json = JSON.parse(await fsp.readFile(outBase + '.json', 'latin1'));
  try { fs.unlinkSync(outBase + '.json'); } catch (e) {}
  let detected = (json.result && json.result.language) || lang;
  if (['ar', 'ur', 'ps'].includes(detected) && job.hintFa) detected = 'fa';
  const data = { v: 2, lang: detected, device: used, model: mk, created: Date.now(), lines: buildLyrics(json, detected) };
  await saveLyrics(job.track, data);
  return data;
}
async function pump() {
  if (jobRunning) return;
  const job = jobs.shift(); if (!job) return;
  jobRunning = true;
  try { job.resolve(await transcribe(job)); } catch (e) { job.reject(e); }
  jobRunning = false; pump();
}

/* ---------------- tray & windows ---------------- */
let trayLabels = { show: 'Show Nava', play: 'Play / Pause', next: 'Next', prev: 'Previous', quit: 'Quit', tip: 'Nava Player', trayHint: 'Nava keeps playing in the system tray.' };
function buildTray() {
  if (!tray) { tray = new Tray(nativeImage.createFromPath(path.join(RENDERER, 'tray.png'))); tray.on('click', showWin); }
  tray.setToolTip(trayLabels.tip);
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: trayLabels.show, click: showWin }, { type: 'separator' },
    { label: trayLabels.play, click: () => send('cmd', 'toggle') }, { label: trayLabels.next, click: () => send('cmd', 'next') }, { label: trayLabels.prev, click: () => send('cmd', 'prev') },
    { type: 'separator' }, { label: trayLabels.quit, click: () => { showWin(); send('cmd', 'quit'); } }
  ]));
}
function showWin() { if (!win) return; if (win.isMinimized()) win.restore(); win.show(); win.focus(); }
function createSplash() {
  splash = new BrowserWindow({ width: 560, height: 380, frame: false, transparent: true, resizable: false, show: false, center: true, skipTaskbar: false,
    icon: path.join(RENDERER, 'icon.ico'), backgroundColor: '#00000000', webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'splash-preload.js') } });
  splash.loadURL('nava://app/splash.html');
  splash.once('ready-to-show', () => splash.show());
}
function createWindow() {
  let b = cfg.bounds;
  if (b) { const area = screen.getDisplayMatching(b).workArea; if (b.x < area.x - 50 || b.y < area.y - 50 || b.width > area.width + 100) b = null; }
  win = new BrowserWindow(Object.assign({
    width: 1440, height: 900, minWidth: 980, minHeight: 640, backgroundColor: '#050906', show: false, title: 'Nava Player',
    icon: path.join(RENDERER, 'icon.ico'), titleBarStyle: 'hidden', titleBarOverlay: { color: '#050906', symbolColor: '#DDEBDD', height: 44 },
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, backgroundThrottling: false, spellcheck: false }
  }, b ? { x: b.x, y: b.y, width: b.width, height: b.height } : {}));
  Menu.setApplicationMenu(null);
  win.loadURL('nava://app/index.html');
  const allowPopup = /^https:\/\/(accounts\.spotify\.com|open\.spotify\.com|soundcloud\.com|secure\.soundcloud\.com|accounts\.google\.com)\//i;
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (allowPopup.test(url)) return { action: 'allow', overrideBrowserWindowOptions: { width: 520, height: 720, autoHideMenuBar: true } };
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('nava://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
  const saveBounds = () => { if (!win.isMaximized() && !win.isMinimized() && !win.isFullScreen()) cfg.bounds = win.getBounds(); cfg.maximized = win.isMaximized(); saveCfg(); };
  win.on('resize', saveBounds); win.on('move', saveBounds);
  win.on('enter-full-screen', () => send('win:fs', true));
  win.on('leave-full-screen', () => send('win:fs', false));
  win.on('close', e => {
    if (quitting) return;
    e.preventDefault();
    if (cfg.closeAction === 'tray') return toTray();
    send('app:close-request', cfg.closeAction);
  });
  setTimeout(() => revealMain(), 15000);
  if (process.env.NAVA_TEST && !app.isPackaged) attachTestHarness();
}
function toTray() {
  buildTray(); win.hide();
  if (!trayHintShown) { trayHintShown = true; try { tray.displayBalloon({ title: 'Nava Player', content: trayLabels.trayHint, iconType: 'none' }); } catch (e) {} }
}
let revealed = false;
function revealMain() {
  if (revealed || !win) return; revealed = true;
  if (cfg.maximized) win.maximize();
  win.show(); win.focus();
  if (splash && !splash.isDestroyed()) { splash.webContents.send('splash:done'); setTimeout(() => { if (splash && !splash.isDestroyed()) splash.close(); splash = null; }, 500); }
}
function attachTestHarness() {
  const log = path.join(os.tmpdir(), 'nava-test.log'); fs.writeFileSync(log, '');
  win.webContents.on('console-message', e => { try { fs.appendFileSync(log, `[${e.level}] ${e.message} (${e.sourceId}:${e.lineNumber})\n`); } catch (er) {} });
  const steps = JSON.parse(fs.readFileSync(process.env.NAVA_TEST, 'utf8'));
  win.webContents.once('did-finish-load', async () => {
    for (const [ms, js, shot] of steps) {
      await new Promise(r => setTimeout(r, +ms));
      if (js === '@close') { win.close(); continue; }
      if (js) { try { const r = await win.webContents.executeJavaScript(js); fs.appendFileSync(log, 'JS> ' + JSON.stringify(r) + '\n'); } catch (er) { fs.appendFileSync(log, 'JSERR ' + er.message + '\n'); } }
      if (shot) { await new Promise(r => setTimeout(r, 60)); const img = await win.webContents.capturePage(); fs.writeFileSync(path.join(os.tmpdir(), shot + '.png'), img.toPNG()); }
    }
    quitting = true; app.quit();
  });
}

/* ---------------- user fonts (imported by the user for lyrics) ---------------- */
const FONT_EXT = new Set(['.ttf', '.otf', '.woff', '.woff2']);
const WEIGHTS = [['hairline', 100], ['thin', 100], ['extralight', 200], ['ultralight', 200], ['light', 300], ['regular', 400], ['normal', 400], ['book', 400], ['medium', 500], ['semibold', 600], ['demibold', 600], ['extrabold', 800], ['ultrabold', 800], ['bold', 700], ['black', 900], ['heavy', 900]];
function fontInfo(file) {
  const base = file.replace(/\.[^.]+$/, '');
  const m = base.match(/^(.*?)[-_ ]?((?:extra|ultra|semi|demi)?(?:hairline|thin|light|regular|normal|book|medium|bold|black|heavy))(italic)?$/i);
  let family = base, weight = 400;
  if (m && m[1]) { family = m[1]; const w = m[2].toLowerCase(); for (const [k, v] of WEIGHTS) if (w === k) { weight = v; break; } }
  return { file, family: family.replace(/[-_]+$/, '').trim() || base, weight, italic: /italic/i.test(base) };
}
function listFonts() {
  let files = []; try { files = fs.readdirSync(DIR.fonts).filter(f => FONT_EXT.has(path.extname(f).toLowerCase())); } catch (e) {}
  // prefer woff2 > woff > ttf/otf for the same face
  const rank = f => ({ '.woff2': 0, '.woff': 1, '.ttf': 2, '.otf': 3 }[path.extname(f).toLowerCase()]);
  const faces = new Map();
  for (const f of files) { const fi = fontInfo(f), k = fi.family + '|' + fi.weight + '|' + fi.italic; if (!faces.has(k) || rank(f) < rank(faces.get(k).file)) faces.set(k, fi); }
  return [...faces.values()];
}
async function importFonts(paths) {
  let n = 0;
  for (const p of paths) {
    try {
      const st = await fsp.stat(p);
      const list = st.isDirectory() ? (await fsp.readdir(p)).map(f => path.join(p, f)) : [p];
      for (const f of list) if (FONT_EXT.has(path.extname(f).toLowerCase())) { await fsp.copyFile(f, path.join(DIR.fonts, path.basename(f))); n++; }
    } catch (e) {}
  }
  return { added: n, fonts: listFonts() };
}

/* ---------------- ipc ---------------- */
function ipc() {
  ipcMain.handle('app:info', () => ({ version: app.getVersion(), name: 'Nava Player', author: 'Silenzio Morto', github: GITHUB, electron: process.versions.electron, chrome: process.versions.chrome, userData: USER }));
  ipcMain.on('app:ready', () => revealMain());
  ipcMain.on('splash:status', (e, s) => { if (splash && !splash.isDestroyed()) splash.webContents.send('splash:status', s); });
  ipcMain.handle('app:closeAction', (e, a, remember) => { if (remember) { cfg.closeAction = a; saveCfg(); } if (a === 'tray') toTray(); return true; });
  ipcMain.handle('app:quitNow', () => { quitting = true; app.quit(); return true; });
  ipcMain.handle('app:setCfg', (e, k, v) => { if (['closeAction', 'writeLrc', 'lyricsMode'].includes(k)) { cfg[k] = v; saveCfg(); } return cfg[k]; });
  ipcMain.handle('app:getCfg', () => ({ closeAction: cfg.closeAction, lyricsDir: lyricsDir(), lyricsDirSet: !!cfg.lyricsDir, lyricsMode: cfg.lyricsMode, writeLrc: cfg.writeLrc, autostart: app.getLoginItemSettings().openAtLogin }));
  ipcMain.handle('app:autostart', (e, v) => { app.setLoginItemSettings({ openAtLogin: !!v, args: ['--hidden'] }); return app.getLoginItemSettings().openAtLogin; });
  ipcMain.handle('app:tray', (e, labels) => { trayLabels = Object.assign(trayLabels, labels); if (tray) buildTray(); return true; });
  ipcMain.handle('app:open', (e, url) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return true; });
  ipcMain.handle('app:openPath', (e, p) => { shell.openPath(p); return true; });
  ipcMain.handle('lib:get', () => ({ tracks: Object.values(lib.tracks), folders: cfg.folders, allDrives: cfg.allDrives, scanning }));
  ipcMain.handle('lib:scan', () => { scan(); return true; });
  ipcMain.handle('lib:addFolder', async (e, title) => {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'multiSelections'], title });
    if (r.canceled) return cfg.folders;
    for (const f of r.filePaths) if (!cfg.folders.includes(f)) cfg.folders.push(f);
    saveCfg(); scan(); return cfg.folders;
  });
  ipcMain.handle('lib:removeFolder', (e, f) => { cfg.folders = cfg.folders.filter(x => x !== f); saveCfg(); scan(); return cfg.folders; });
  ipcMain.handle('lib:setAllDrives', (e, v) => { cfg.allDrives = !!v; saveCfg(); scan(); return cfg.allDrives; });
  ipcMain.handle('lib:openFiles', async () => {
    const r = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Audio', extensions: [...AUDIO_EXT].map(x => x.slice(1)) }] });
    return r.canceled ? [] : addPaths(r.filePaths);
  });
  ipcMain.handle('lib:addPaths', (e, paths) => addPaths(paths || []));
  ipcMain.handle('lib:reveal', (e, p) => { shell.showItemInFolder(p); return true; });
  ipcMain.handle('lib:setMeta', (e, p, patch) => { const t = lib.tracks[p]; if (t) { for (const k of ['fav', 'plays', 'lastPlayed']) if (k in patch) t[k] = patch[k]; writeJSONSoon(LIB_FILE, lib); } return true; });
  ipcMain.handle('win:overlay', (e, o) => { try { win.setTitleBarOverlay(o); } catch (er) {} return true; });
  ipcMain.handle('win:fullscreen', () => { win.setFullScreen(!win.isFullScreen()); return win.isFullScreen(); });
  ipcMain.handle('ai:status', async () => { await detectNvidia(); return aiStatus(); });
  ipcMain.handle('ai:setup', async (e, what) => { try { return await aiSetup(what); } catch (er) { send('ai:progress', { error: er.message }); return aiStatus(); } });
  ipcMain.handle('lyrics:get', async (e, t) => { try { return JSON.parse(await fsp.readFile(path.join(DIR.lyricsCache, lyricKey(t) + '.json'), 'utf8')); } catch (er) { return null; } });
  ipcMain.handle('lyrics:delete', async (e, t) => { try { await fsp.unlink(path.join(DIR.lyricsCache, lyricKey(t) + '.json')); } catch (er) {} return true; });
  ipcMain.handle('lyrics:clearAll', async () => { for (const f of await fsp.readdir(DIR.lyricsCache)) { try { await fsp.unlink(path.join(DIR.lyricsCache, f)); } catch (er) {} } return true; });
  ipcMain.handle('lyrics:chooseDir', async (e, title) => {
    const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'], title, defaultPath: lyricsDir() });
    if (!r.canceled && r.filePaths[0]) { cfg.lyricsDir = r.filePaths[0]; cfg.lyricsMode = 'folder'; saveCfg(); }
    return { lyricsDir: lyricsDir(), lyricsMode: cfg.lyricsMode, canceled: r.canceled };
  });
  ipcMain.handle('lyrics:setDefaultDir', () => { cfg.lyricsDir = path.join(app.getPath('documents'), 'Nava Lyrics'); try { fs.mkdirSync(cfg.lyricsDir, { recursive: true }); } catch (e) {} saveCfg(); return lyricsDir(); });
  ipcMain.handle('lyrics:openDir', async () => { const d = lyricsDir(); await fsp.mkdir(d, { recursive: true }).catch(() => {}); shell.openPath(d); return true; });
  ipcMain.handle('lyrics:transcribe', (e, job) => new Promise((resolve, reject) => {
    for (let i = jobs.length - 1; i >= 0; i--) if (jobs[i].track.path === job.track.path) { jobs[i].reject(new Error('replaced')); jobs.splice(i, 1); }
    const j = Object.assign({}, job, { resolve, reject });
    if (job.priority) jobs.unshift(j); else jobs.push(j);
    pump();
  }));
  ipcMain.handle('fonts:list', () => listFonts());
  ipcMain.handle('fonts:import', async (e, title) => {
    const r = await dialog.showOpenDialog(win, { title, properties: ['openFile', 'multiSelections'], filters: [{ name: 'Fonts', extensions: ['ttf', 'otf', 'woff', 'woff2'] }] });
    return r.canceled ? { added: 0, fonts: listFonts() } : importFonts(r.filePaths);
  });
  ipcMain.handle('fonts:importPaths', (e, paths) => importFonts(paths || []));
  ipcMain.handle('fonts:remove', async (e, family) => {
    for (const f of listFonts().filter(x => x.family === family)) { try { await fsp.unlink(path.join(DIR.fonts, f.file)); } catch (er) {} }
    try { for (const f of fs.readdirSync(DIR.fonts)) if (fontInfo(f).family === family) fs.unlinkSync(path.join(DIR.fonts, f)); } catch (er) {}
    return listFonts();
  });
  ipcMain.handle('link:probe', async (e, url) => {
    try {
      const r = await net.fetch(url, { method: 'GET', headers: { Range: 'bytes=0-1', 'User-Agent': 'Mozilla/5.0 NavaPlayer/2.0' } });
      const ct = r.headers.get('content-type') || ''; try { r.body && r.body.cancel(); } catch (er) {}
      return { ok: r.ok || r.status === 206, type: ct };
    } catch (er) { return { ok: false, error: er.message }; }
  });
}

/* ---------------- boot ---------------- */
const audioArgs = argv => argv.slice(1).filter(a => AUDIO_EXT.has(path.extname(a).toLowerCase()) && fs.existsSync(a));
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (e, argv) => {
    showWin();
    const files = audioArgs(argv);
    if (files.length) addPaths(files).then(t => send('open:tracks', t));
  });
  app.whenReady().then(() => {
    registerProtocol(); ipc();
    // YouTube's embed player refuses to load without a referrer
    session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['https://www.youtube-nocookie.com/*', 'https://www.youtube.com/*'] }, (d, cb) => { d.requestHeaders.Referer = 'https://nava-player.app/'; cb({ requestHeaders: d.requestHeaders }); });
    // "visualize system audio" for streaming embeds: loopback capture without a picker
    session.defaultSession.setDisplayMediaRequestHandler((req, cb) => {
      desktopCapturer.getSources({ types: ['screen'] }).then(s => cb(s[0] ? { video: s[0], audio: 'loopback' } : {})).catch(() => cb({}));
    });
    const hidden = process.argv.includes('--hidden');
    if (!hidden) createSplash();
    createWindow();
    if (hidden) { revealed = true; buildTray(); }
    unpackPending();
    const files = audioArgs(process.argv);
    if (files.length) win.webContents.once('did-finish-load', () => setTimeout(() => addPaths(files).then(t => send('open:tracks', t)), 900));
    setTimeout(scan, 1500);
  });
  app.on('before-quit', () => { quitting = true; });
  app.on('window-all-closed', () => app.quit());
}
