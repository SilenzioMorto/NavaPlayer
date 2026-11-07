'use strict';
/*
 * Nava Player — renderer
 * Copyright (c) 2026 Silenzio Morto. All rights reserved.
 * https://github.com/SilenzioMorto
 */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const api = window.nava;
const { t, fmtN } = I18N;
const { MODES, PALETTES, PRESETS, CATS } = window.NAVA_DATA;
const GITHUB = 'https://github.com/SilenzioMorto';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = s => { if (!isFinite(s) || s < 0) s = 0; s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const store = {
  get(k, d) { try { const v = localStorage.getItem('nava2:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('nava2:' + k, JSON.stringify(v)); } catch (e) {} }
};
const L = () => I18N.lang;
const nm = o => (o && (o[L()] || o.en || o.fa)) || '';
const toastEl = $('#toast'); let toastT = 0;
function toast(m, ms = 2600) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), ms); }
const status = (text, pct) => { try { api.app.status({ text, pct }); } catch (e) {} };

/* ================= settings ================= */
const DEFAULTS = {
  lang: (navigator.language || '').startsWith('fa') ? 'fa' : 'en', theme: 'nava', onboarded: false, tourDone: false,
  welcome: true, outro: true, mediaKeys: true, notify: false, uiAnim: true,
  mode: 'halo', palette: 'theme', bars: 112, sensitivity: 1.2, beatSens: .6, rotate: .35, mirror: true, showCover: true, spinCover: true,
  coverCard: 'left', coverSize: 200, glow: .75, flash: .6, trail: .5, warpZoom: .004, twist: 0, zoom: true, shake: true, shakeAmt: .6, ca: .5,
  particleAmt: 1, dust: true, backdrop: .8, vignette: .7, grain: .25, fps: 0, quality: 1, fft: 2048, autoHide: true,
  lyrOn: true, lyrStyle: 'wheel', lyrPos: 'bottom', lyrDir: 'down', lyrSize: 44, lyrOffset: 0, lyrGlow: true, lyrColor: 'accent', lyrFont: 'display',
  aiAuto: true, aiPrefetch: true, aiLang: 'auto', aiModel: 'auto', aiDevice: 'gpu', aiVad: true,
  eq: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], eqPre: 0, eqOn: true, speed: 1, pitch: 0, vinyl: false, bass: 0, reverb: 0, revSize: 2, revDamp: .4,
  d8: false, d8Speed: .12, balance: 0, width: 1, mono: false, normalize: false, fadeIn: 0, fadeOut: 0, booster: false,
  volume: .85, muted: false, repeat: 'all', shuffle: false, minDur: 30, hideShort: false, smoothing: .55,
  autoCycle: 0, sideOpen: true, sort: 'title', view: 'songs', keymap: {}
};
const saved = store.get('settings', null);
const S = Object.assign({}, DEFAULTS, saved || {});
if (!Array.isArray(S.eq) || S.eq.length !== 10) S.eq = DEFAULTS.eq.slice();
if (!MODES.some(m => m[0] === S.mode)) S.mode = 'halo';
if (!S.booster && S.volume > 1) S.volume = 1;
let saveT = 0; const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => store.set('settings', S), 300); };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let appCfg = { lyricsDir: '', lyricsMode: 'folder', writeLrc: true, closeAction: 'ask', autostart: false };

/* ================= themes & colors ================= */
const customThemes = () => store.get('themes', []);
const allThemes = () => THEMES.list.concat(customThemes());
const curTheme = () => allThemes().find(x => x.id === S.theme) || THEMES.list[0];
const hexToRgb = THEMES.hex;
function rgbToHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; }
function hslToRgb(h, s, l) { h = ((h % 1) + 1) % 1; const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; }
const shift = (c, deg, ds = 0, dl = 0) => { const [h, s, l] = rgbToHsl(...c); return hslToRgb(h + deg / 360, clamp(s + ds, 0, 1), clamp(l + dl, 0, 1)); };
let coverColors = null, palCache = null;
function paletteRGB(id) {
  const th = curTheme(), a = hexToRgb(th.accent);
  if (id === 'theme') return THEMES.palette(th);
  if (id === 'accent') return [shift(a, -10, 0, -.3), shift(a, -4, 0, -.1), a, shift(a, 8, -.2, .25)];
  if (id === 'duo') return [shift(a, -20, 0, -.15), a, shift(a, 60, 0, 0), shift(a, 100, .1, .08)];
  if (id === 'cover') return coverColors || paletteRGB('theme');
  const p = PALETTES.find(x => x[0] === id);
  return p && p[3] ? p[3].map(hexToRgb) : paletteRGB('theme');
}
function colors(time) {
  if (S.palette === 'rainbow') { const o = []; for (let i = 0; i < 4; i++) o.push(hslToRgb(time * .04 + i * .22, .9, .6).map(v => v / 255)); return o; }
  if (!palCache) palCache = paletteRGB(S.palette).map(c => c.map(v => v / 255));
  return palCache;
}
function extractCoverColors(img) {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, 32, 32);
    const d = x.getImageData(0, 0, 32, 32).data, bins = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
    for (let i = 0; i < d.length; i += 4) { const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2]); const w = s * s * (1 - Math.abs(l - .55) * 1.6); if (w <= 0) continue; const bn = bins[Math.floor(h * 12) % 12]; bn.w += w; bn.r += d[i] * w; bn.g += d[i + 1] * w; bn.b += d[i + 2] * w; }
    const top = bins.filter(b => b.w > .3).sort((a, b) => b.w - a.w).slice(0, 3);
    if (!top.length) return null;
    const cols = top.map(b => { const [h, s, l] = rgbToHsl(b.r / b.w, b.g / b.w, b.b / b.w); return hslToRgb(h, clamp(s * 1.25, .55, 1), clamp(l, .5, .66)); });
    while (cols.length < 3) cols.push(shift(cols[cols.length - 1], 40, 0, .08));
    return [shift(cols[0], 0, 0, -.25), cols[0], cols[1], shift(cols[2], 0, -.2, .22)];
  } catch (e) { return null; }
}
function applyTheme(id) {
  S.theme = id; const th = THEMES.apply(curTheme());
  palCache = null; genArt.clear();
  api.win.overlay({ color: th.bg, symbolColor: th.fg, height: 44 });
  F.bg = THEMES.visBg(th); F.bgLight = THEMES.visBg(th);
  if (cur) setArtOnly(cur);
}

/* ================= audio ================= */
const audio = new Audio();
audio.crossOrigin = 'anonymous'; audio.preload = 'auto';
const fx = new AudioFX(audio);
const ac = fx.ac, analyser = fx.analyser;
let freq, wave, binHz;
const NB = 256, specBytes = new Uint8Array(768), sm = new Float32Array(NB), pk = new Float32Array(NB), barLo = new Uint16Array(NB), barHi = new Uint16Array(NB);
function applyAnalyser() {
  analyser.fftSize = S.fft; analyser.smoothingTimeConstant = S.smoothing;
  freq = new Uint8Array(analyser.frequencyBinCount); wave = new Uint8Array(analyser.fftSize).fill(128); binHz = ac.sampleRate / analyser.fftSize;
  const lo = 30, hi = Math.min(16000, ac.sampleRate / 2 - 100), mx = freq.length - 1;
  for (let i = 0; i < NB; i++) { let a = Math.floor(lo * Math.pow(hi / lo, i / NB) / binHz), b = Math.floor(lo * Math.pow(hi / lo, (i + 1) / NB) / binHz); a = clamp(a, 1, mx); b = clamp(Math.max(a, b), 1, mx); barLo[i] = a; barHi[i] = b; }
}
applyAnalyser();
const volMax = () => S.booster ? 3 : 1;
function applyVolume() {
  const v = Math.min(S.volume, volMax());
  fx.setVolume(S.muted ? 0 : (v <= 1 ? v * v : v));
  $('#volUse').setAttribute('href', S.muted || !v ? '#i-mute' : '#i-vol');
  const el = $('#vol'); el.max = volMax(); el.value = v; setP(el);
  el.classList.toggle('hot', v > 1);
  $('#volPct').textContent = fmtN(Math.round(v * 100)) + (L() === 'fa' ? '٪' : '%');
  $('#volPct').classList.toggle('hot', v > 1);
  $('#boostBadge').hidden = !S.booster;
}
const applyEq = () => fx.setEq(S.eq, S.eqPre, S.eqOn);
function applySound() {
  applyEq(); fx.setBass(S.bass); fx.setPitch(S.pitch); fx.setWidth(S.mono ? 0 : S.width); fx.setBalance(S.balance);
  fx.set8d(S.d8, S.d8Speed); fx.setReverb(S.reverb, S.revSize, S.revDamp); fx.setNormalize(S.normalize);
  audio.playbackRate = S.speed; audio.preservesPitch = !S.vinyl;
}

/* analysis */
const D = { bass: 0, mid: 0, vocal: 0, high: 0, energy: 0, beat: 0, t: 0, idle: 1 };
const agc = { bass: .35, mid: .3, vocal: .25, high: .18 };
let bassAvg = 0, lastBeat = 0, wasActive = false, playing = false, streamViz = false;
const rings = [];
const bandRaw = (lo, hi) => { let a = clamp(Math.round(lo / binHz), 1, freq.length - 1), b = clamp(Math.round(hi / binHz), a, freq.length - 1), s = 0; for (let i = a; i <= b; i++) s += freq[i]; return s / ((b - a + 1) * 255); };
function band(k, r, dt, g) { agc[k] = Math.max(r, agc[k] - dt * .05, .12); let v = r / agc[k]; v = Math.min(1.25, v * v * S.sensitivity * g); D[k] += (v - D[k]) * (v > D[k] ? 1 - Math.exp(-dt * 30) : 1 - Math.exp(-dt * 6)); }
function analyze(dt) {
  D.t += dt;
  const active = (playing && !audio.paused) || streamViz;
  D.idle += ((active ? 0 : 1) - D.idle) * (1 - Math.exp(-dt * 1.5));
  if (active) { analyser.getByteFrequencyData(freq); analyser.getByteTimeDomainData(wave); } else if (wasActive) { freq.fill(0); wave.fill(128); }
  wasActive = active;
  const sens = S.sensitivity * 1.3, up = 1 - Math.exp(-dt * 30), dn = 1 - Math.exp(-dt * 7.5), idle = D.idle, tt = D.t;
  for (let i = 0; i < NB; i++) {
    let v = 0;
    if (active) { let s = 0; const a = barLo[i], b = barHi[i]; for (let k = a; k <= b; k++) s += freq[k]; v = s / ((b - a + 1) * 255); v = Math.min(1, v * v * (1 + i / NB * 1.1) * sens); }
    if (idle > .01) v = v * (1 - idle) + idle * (.1 + .07 * Math.sin(tt * 1.6 + i * .06) + .05 * Math.sin(tt * .7 - i * .025));
    sm[i] += (v - sm[i]) * (v > sm[i] ? up : dn);
    const p = pk[i] - dt * .4; pk[i] = sm[i] > p ? sm[i] : p;
    specBytes[i] = sm[i] * 255; specBytes[256 + i] = Math.min(1, pk[i]) * 255;
  }
  const half = wave.length >> 1; let st = 0;
  for (let i = 1; i < half; i++) if (wave[i - 1] < 128 && wave[i] >= 128) { st = i; break; }
  for (let i = 0; i < 256; i++) specBytes[512 + i] = wave[st + ((i * half / 256) | 0)];
  if (active) {
    band('bass', bandRaw(30, 150), dt, .95); band('mid', bandRaw(150, 500), dt, .8); band('vocal', bandRaw(500, 3500), dt, .85); band('high', bandRaw(4000, 14000), dt, .8);
    const e = bandRaw(40, 130); bassAvg += (e - bassAvg) * (1 - Math.exp(-dt * 2.5));
    if (e > bassAvg * (1.34 - S.beatSens * .3) && e > .3 && D.t - lastBeat > .2) { lastBeat = D.t; D.beat = 1; if (rings.length < 4) rings.push({ r: 0, a: 1 }); }
  } else { const k = Math.exp(-dt * 3); D.bass = D.bass * k + idle * .08 * (1 + Math.sin(tt * 1.4)) * (1 - k); D.mid *= k; D.vocal = D.vocal * k + idle * .06 * (1 - k); D.high *= k; }
  D.beat *= Math.exp(-dt * 6.5);
  D.energy = D.bass * .42 + D.mid * .25 + D.vocal * .2 + D.high * .13;
  for (let i = rings.length - 1; i >= 0; i--) { const g = rings[i]; g.r += dt * .55; g.a -= dt * 1.4; if (g.a <= 0) rings.splice(i, 1); }
}

/* ================= GPU engine & frame loop ================= */
const glCanvas = $('#gl'), stageEl = $('#stage');
let engine = null;
try { engine = new NavaEngine(glCanvas); engine.getMode(S.mode); setTimeout(() => engine.warm(), 2500); }
catch (e) { console.error(e); toast('WebGL2: ' + e.message, 6000); }
function resize() { if (!engine) return; const r = stageEl.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1) * S.quality; engine.resize(Math.round(r.width * dpr), Math.round(r.height * dpr)); }
new ResizeObserver(resize).observe(stageEl);
let rot = 0, flow = 0, coverRot = 0, lastT = performance.now(), lastUi = 0, loudAcc = 0, fadingOut = false;
const ringsU = new Float32Array(4), ringA = new Float32Array(4);
const F = { spec: specBytes, center: [0, 0], rings: ringsU, ringA, bg: [0, 0, 0], bgLight: [1, 1, 1] };
const fillEl = $('#fill'), knobEl = $('#knob'), barEl = $('#bar'), tCur = $('#tCur'), tDur = $('#tDur'), ccEl = $('#coverCard'), pulseEl = $('#playPulse'), markEl = $('#mark');
let barW = 300; new ResizeObserver(() => { barW = barEl.clientWidth; }).observe(barEl);
let seeking = false, seekFrac = 0, eqTick = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const cap = S.fps ? 1000 / S.fps : 0;
  if (now - lastT < cap - 1.5) return;
  const dt = Math.min(.05, Math.max(.001, (now - lastT) / 1000)); lastT = now;
  analyze(dt);
  rot += dt * S.rotate * .5 * (.35 + D.energy * 1.4);
  flow += dt * (.25 + D.energy * 1.6 + D.beat * 1.2);
  if (S.spinCover && playing) coverRot += dt * .35;
  if (engine) {
    for (let i = 0; i < 4; i++) { ringsU[i] = rings[i] ? rings[i].r : 0; ringA[i] = rings[i] ? rings[i].a * .7 : 0; }
    let sx = 0, sy = 0;
    if (S.shake && !reduced && D.beat > .02) { const a = D.beat * S.shakeAmt * .012; sx = (Math.random() - .5) * a; sy = (Math.random() - .5) * a; }
    const lyrBottom = S.lyrOn && lyr.data && S.lyrPos === 'bottom';
    F.center[0] = sx; F.center[1] = sy + (lyrBottom ? .1 : 0); F.scaleV = lyrBottom ? 1.18 : 1;
    F.t = D.t; F.bass = D.bass; F.mid = D.mid; F.vocal = D.vocal; F.high = D.high; F.beat = D.beat; F.energy = D.energy;
    F.rot = rot; F.flow = flow; F.coverRot = coverRot; F.mode = S.mode; F.bars = S.bars; F.mirror = S.mirror; F.showCover = S.showCover; F.sens = S.sensitivity;
    F.colors = colors(D.t); F.trail = S.trail * .97; F.warpZoom = S.warpZoom + (S.zoom ? D.bass * .004 + D.beat * .006 : 0); F.twist = S.twist;
    F.glow = S.glow * (1 + D.beat * S.flash * .8); F.vignette = S.vignette; F.grain = S.grain; F.ca = S.ca; F.backdrop = S.backdrop;
    F.dust = S.dust; F.particleAmt = S.particleAmt; F.pxScale = Math.min(2, devicePixelRatio || 1) * S.quality; F.light = document.documentElement.dataset.theme === 'light';
    engine.render(F);
  }
  const b = D.bass;
  pulseEl.style.transform = `scale(${(1 + b * .22 + D.beat * .12).toFixed(3)})`; pulseEl.style.opacity = (b * .7).toFixed(3);
  markEl.style.transform = `scale(${(1 + D.beat * .1).toFixed(3)}) rotate(${(D.beat * 4).toFixed(2)}deg)`;
  if (S.coverCard !== 'off') ccEl.style.transform = `translateY(${(-D.beat * 4).toFixed(2)}px) scale(${(1 + b * .025).toFixed(4)})`;
  if (S.lyrOn) lyr.tick(audio.currentTime + S.lyrOffset, D.vocal * .5 + b * .5);
  if (audio.duration && isFinite(audio.duration)) {
    const f = seeking ? seekFrac : audio.currentTime / audio.duration;
    fillEl.style.transform = `scaleX(${f.toFixed(5)})`; knobEl.style.transform = `translateX(${(f * barW).toFixed(1)}px)`;
    if (S.fadeOut > 0 && playing && !fadingOut && audio.duration - audio.currentTime < S.fadeOut && audio.duration > S.fadeOut * 3) { fadingOut = true; fx.fadeTo(0, audio.duration - audio.currentTime); }
  }
  if (playing && !S.muted && S.volume > 1) { loudAcc += dt; if (loudAcc >= 600) { loudAcc = 0; loudWarning(); } }
  if (eqVisible && playing && ++eqTick % 3 === 0) drawEq();
  if (now - lastUi > 250) { lastUi = now; tCur.textContent = fmtTime(seeking ? seekFrac * audio.duration : audio.currentTime); tDur.textContent = cur && cur.remote && !isFinite(audio.duration) ? '∞' : fmtTime(audio.duration); }
}

/* ================= library ================= */
let tracks = [], byPath = new Map(), list = [], Q = [], qi = -1, cur = null, hist = [], filter = null, query = '';
const b64u = s => { const b = new TextEncoder().encode(s); let bin = ''; for (let i = 0; i < b.length; i += 0x8000) bin += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const mediaUrl = tr => tr.remote ? 'nava://app/__remote/' + b64u(tr.url) : 'nava://app/__media/' + b64u(tr.path);
const coverUrl = tr => tr && tr.cover ? 'nava://app/__cover/' + tr.cover : null;
const hue = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; };
const isShort = tr => S.minDur > 0 && tr && !tr.remote && tr.duration > 0 && tr.duration < S.minDur;
const dirOf = p => p.replace(/[\\/][^\\/]*$/, '');
const baseName = p => p.split(/[\\/]/).pop();
const genArt = new Map();
function artFor(tr) {
  const u = coverUrl(tr); if (u) return u;
  const key = (tr && tr.path) || 'none'; if (genArt.has(key)) return genArt.get(key);
  const c = document.createElement('canvas'); c.width = c.height = 400; const x = c.getContext('2d');
  const th = curTheme(), h0 = hue(key), a = hexToRgb(th.accent), a2 = hexToRgb(th.accent2 || th.accent);
  const c1 = shift(a, (h0 % 50) - 25, 0, -.05), c2 = shift(a2, (h0 % 40) - 20, 0, .02), c3 = shift(a, -(h0 % 40), -.25, -.4);
  x.fillStyle = `rgb(${c3})`; x.fillRect(0, 0, 400, 400);
  const blob = (px, py, r, c) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(${c},1)`); g.addColorStop(1, `rgba(${c},0)`); x.fillStyle = g; x.fillRect(0, 0, 400, 400); };
  blob(100 + h0 % 120, 110 + (h0 >> 2) % 100, 290, c1); blob(300 - (h0 >> 3) % 110, 290 - (h0 >> 5) % 100, 250, c2);
  x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 1.4; for (let i = 1; i < 10; i++) { x.beginPath(); x.arc(200, 200, i * 21, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,.88)'; x.font = '800 150px Unbounded, Vazirmatn, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(((tr && tr.title) || '♪').trim().charAt(0).toUpperCase() || '♪', 200, 212);
  const url = c.toDataURL('image/jpeg', .88); genArt.set(key, url); return url;
}
function setLibrary(arr) {
  tracks = arr; byPath = new Map(arr.map(x => [x.path, x]));
  if (cur && byPath.has(cur.path)) cur = byPath.get(cur.path);
  Q = Q.map(x => byPath.get(x.path) || x);
  renderSide(); updateEmpty(); updateFav();
}
function computeList(base) {
  let arr = base || tracks;
  if (S.hideShort) arr = arr.filter(x => !isShort(x));
  if (S.view === 'favs' && !base) arr = arr.filter(x => x.fav);
  if (filter) arr = arr.filter(x => filter.type === 'album' ? (x.album || '~') + '|' + (x.artist || '') === filter.value : filter.type === 'artist' ? (x.artist || '~') === filter.value : dirOf(x.path) === filter.value);
  if (query) { const q = query.toLowerCase(); arr = arr.filter(x => (x.title + ' ' + x.artist + ' ' + x.album + ' ' + baseName(x.path)).toLowerCase().includes(q)); }
  const coll = new Intl.Collator(L(), { numeric: true, sensitivity: 'base' });
  const by = { title: (a, b) => coll.compare(a.title, b.title), artist: (a, b) => coll.compare(a.artist || '~', b.artist || '~') || coll.compare(a.album || '', b.album || '') || coll.compare(a.title, b.title),
    added: (a, b) => (b.added || 0) - (a.added || 0) || (b.mtime || 0) - (a.mtime || 0), duration: (a, b) => (b.duration || 0) - (a.duration || 0), plays: (a, b) => (b.plays || 0) - (a.plays || 0) };
  return arr.slice().sort(by[S.sort] || by.title);
}
const ROW = 60, vl = $('#vlist'), vspace = $('#vspace'); let pool = [];
function rowHTML(x, i) {
  const art = coverUrl(x), short = isShort(x);
  return `<div class="art"${art ? '' : ` style="--h:${hue(x.path)}"`}>${art ? `<img src="${art}" loading="lazy" decoding="async" alt="">` : '<span>♪</span>'}<span class="eqi"><i></i><i></i><i></i></span></div>
    <div class="tt"><b dir="auto">${esc(x.title)}</b><span dir="auto">${esc(x.artist || t('unknownArtist'))}${x.album ? ' · ' + esc(x.album) : ''}</span></div>
    <div class="side-r">${x.fav ? '<svg class="favdot"><use href="#i-heart"/></svg>' : ''}${short ? `<em class="short" title="${esc(t('shortTip'))}">${t('short')}</em>` : ''}<span class="d">${x.duration ? fmtTime(x.duration) : ''}</span>
    <button class="rb" data-reveal="${i}" title="${esc(t('tReveal'))}"><svg><use href="#i-folder"/></svg></button></div>`;
}
function renderV(force) {
  vspace.style.height = list.length * ROW + 'px';
  const st = vl.scrollTop, h = vl.clientHeight || 600;
  const a = Math.max(0, Math.floor(st / ROW) - 6), b = Math.min(list.length, Math.ceil((st + h) / ROW) + 6), n = b - a;
  while (pool.length < n) { const r = document.createElement('div'); r.className = 'row'; r.setAttribute('role', 'button'); r.tabIndex = 0; vspace.appendChild(r); pool.push(r); }
  for (let k = 0; k < pool.length; k++) {
    const r = pool[k], i = a + k;
    if (k >= n) { if (!r.hidden) r.hidden = true; r._i = -1; continue; }
    r.hidden = false; const x = list[i];
    if (force || r._i !== i || r._p !== x.path) { r._i = i; r._p = x.path; r.dataset.i = i; r.innerHTML = rowHTML(x, i); r.style.transform = `translateY(${i * ROW}px)`; }
    r.classList.toggle('on', !!(cur && cur.path === x.path)); r.classList.toggle('dim', isShort(x));
  }
}
let vRaf = 0; vl.addEventListener('scroll', () => { cancelAnimationFrame(vRaf); vRaf = requestAnimationFrame(() => renderV(false)); }, { passive: true });
new ResizeObserver(() => renderV(false)).observe(vl);
vl.addEventListener('click', e => {
  const rv = e.target.closest('[data-reveal]'); if (rv) { e.stopPropagation(); api.lib.reveal(list[+rv.dataset.reveal].path); return; }
  const r = e.target.closest('.row'); if (!r) return;
  const i = +r.dataset.i; playTrack(list[i], { manual: true, queue: list, index: i });
});
vl.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.classList.contains('row')) { const i = +e.target.dataset.i; playTrack(list[i], { manual: true, queue: list, index: i }); } });
const gridEl = $('#grid');
function groups(type) {
  const m = new Map();
  for (const x of tracks) {
    if (S.hideShort && isShort(x)) continue;
    const key = type === 'album' ? (x.album || '~') + '|' + (x.artist || '') : type === 'artist' ? (x.artist || '~') : dirOf(x.path);
    let g = m.get(key); if (!g) { g = { key, n: 0, cover: null, t: x }; m.set(key, g); }
    g.n++; if (!g.cover && x.cover) g.cover = coverUrl(x);
  }
  const coll = new Intl.Collator(L(), { numeric: true });
  return [...m.values()].sort((a, b) => coll.compare(a.key, b.key));
}
const groupLabel = (type, key) => { if (type === 'album') { const a = key.split('|')[0]; return a === '~' ? t('noAlbum') : a; } if (type === 'artist') return key === '~' ? t('unknownArtist') : key; return baseName(key) || key; };
function renderSide() {
  $$('#libTabs button').forEach(b => b.classList.toggle('on', b.dataset.view === S.view));
  const isList = ['songs', 'queue', 'favs'].includes(S.view);
  vl.hidden = !isList; gridEl.hidden = isList;
  $('#sortSel').hidden = !['songs', 'favs'].includes(S.view); $('#sortSel').value = S.sort;
  $('#filterChip').hidden = !filter || S.view !== 'songs';
  if (filter) $('#filterChip span').textContent = filter.label;
  if (isList) { list = S.view === 'queue' ? Q : computeList(); vl.scrollTop = Math.min(vl.scrollTop, Math.max(0, list.length * ROW - vl.clientHeight)); renderV(true); $('#libCount').textContent = fmtN(list.length) + ' ' + t('songs'); return; }
  const type = S.view === 'albums' ? 'album' : S.view === 'artists' ? 'artist' : 'folder', gs = groups(type);
  $('#libCount').textContent = fmtN(gs.length) + ' ' + t(type === 'album' ? 'albums' : type === 'artist' ? 'artists' : 'folders');
  gridEl.className = 'grid ' + (type === 'album' ? 'tiles' : 'lines');
  gridEl.innerHTML = gs.map((g, i) => {
    const sub = type === 'album' ? (g.t.artist || '') : type === 'folder' ? g.key : '';
    const art = g.cover ? `<img src="${g.cover}" loading="lazy" decoding="async" alt="">` : `<span style="--h:${hue(g.key)}">${type === 'folder' ? '<svg><use href="#i-folder"/></svg>' : '♪'}</span>`;
    return `<button class="g" data-g="${i}"><div class="ga">${art}</div><div class="gt"><b dir="auto">${esc(groupLabel(type, g.key))}</b><span dir="auto">${esc(sub)}${sub ? ' · ' : ''}${fmtN(g.n)} ${t('songs')}</span></div></button>`;
  }).join('') || `<p class="muted pad">${t('nothingHere')}</p>`;
  gridEl._g = gs; gridEl._type = type;
}
gridEl.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; const g = gridEl._g[+b.dataset.g], type = gridEl._type; filter = { type, value: g.key, label: groupLabel(type, g.key) }; S.view = 'songs'; persist(); renderSide(); });
$('#libTabs').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (!b) return; S.view = b.dataset.view; persist(); renderSide(); });
$('#filterChip button').addEventListener('click', () => { filter = null; renderSide(); });
$('#sortSel').addEventListener('change', e => { S.sort = e.target.value; persist(); renderSide(); });
let qT = 0; $('#q').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => { query = e.target.value.trim(); if (query && !['songs', 'favs'].includes(S.view)) S.view = 'songs'; renderSide(); }, 120); });
$('#btnAddFolder').addEventListener('click', () => api.lib.addFolder(t('tAddFolder')).then(f => { libCfg.folders = f; toast(t('folderAdded')); }));
$('#btnOpenFiles').addEventListener('click', () => api.lib.openFiles().then(ts => { if (ts.length) playTrack(ts[0], { manual: true, queue: ts, index: 0 }); }));
$('#btnRescan').addEventListener('click', () => { api.lib.scan(); toast(t('rescanning')); });
api.lib.onLibrary(setLibrary);
let scanState = null;
function renderScan() {
  const p = scanState, el = $('#scanInfo'); if (!p) return;
  el.textContent = p.phase === 'walk' ? t('scanWalk') : p.phase === 'parse' ? t('scanParse', { a: fmtN(p.done), b: fmtN(p.total) }) : p.phase === 'done' ? t('scanDone', { n: fmtN(p.total) }) : t('scanErr', { m: p.message || '' });
  el.classList.toggle('busy', p.phase === 'walk' || p.phase === 'parse');
}
api.lib.onScan(p => { scanState = p; renderScan(); updateEmpty(); });
api.lib.onOpen(ts => { if (ts && ts.length) { closeEmbed(); playTrack(ts[0], { manual: true, queue: ts, index: 0 }); } });
function updateEmpty() {
  const busy = scanState && (scanState.phase === 'walk' || scanState.phase === 'parse');
  $('#empty').hidden = !!cur || tracks.length > 0 || embedOpen;
  $('#emptyMsg').textContent = busy ? t('emptyScanning') : t('emptyMsg');
  $('#stageHello').hidden = !!cur || !tracks.length || embedOpen;
}

/* ================= player ================= */
function playTrack(tr, o = {}) {
  if (!tr) return;
  if (embedOpen) closeEmbed();
  if (o.queue) { Q = o.queue.slice(); qi = o.index != null ? o.index : Q.indexOf(tr); }
  else { const j = Q.findIndex(x => x.path === tr.path); if (j >= 0) qi = j; }
  if (o.manual && isShort(tr)) toast(t('shortPlay', { n: fmtN(S.minDur) }));
  if (cur && cur.path !== tr.path && !o.fromHist) hist.push(cur);
  cur = tr; fx.resume(); fadingOut = false;
  audio.src = mediaUrl(tr); audio.playbackRate = S.speed; audio.preservesPitch = !S.vinyl;
  if (o.at) audio.currentTime = o.at;
  if (S.fadeIn > 0 && !o.paused) { fx.setFade(0); fx.fadeTo(1, S.fadeIn); } else fx.setFade(1);
  if (o.paused) audio.load(); else audio.play().catch(err => { if (err.name !== 'AbortError') toast(t('playFail')); });
  setNow(tr); renderV(false); updateEmpty(); updateFav();
  if (!tr.remote) {
    store.set('last', { path: tr.path, at: o.at || 0 });
    if (!o.paused) { tr.plays = (tr.plays || 0) + 1; api.lib.setMeta(tr.path, { plays: tr.plays, lastPlayed: Date.now() }); }
  }
  loadLyrics(tr);
  if (!o.paused && S.notify && !document.hasFocus()) { try { new Notification(tr.title || 'Nava', { body: tr.artist || '', icon: 'icon.png', silent: true }); } catch (e) {} }
}
function pickNext(dirn = 1) {
  if (!Q.length) return -1;
  if (S.shuffle && dirn > 0) { const c = []; for (let i = 0; i < Q.length; i++) if (i !== qi && !isShort(Q[i])) c.push(i); return c.length ? c[(Math.random() * c.length) | 0] : -1; }
  for (let s = 1; s <= Q.length; s++) {
    let j = qi + s * dirn;
    if (j >= Q.length || j < 0) { if (S.repeat === 'off' && dirn > 0) return -1; j = ((j % Q.length) + Q.length) % Q.length; }
    if (!isShort(Q[j])) return j;
  }
  return -1;
}
let skipNote = 0;
function next(auto) {
  if (auto && S.repeat === 'one' && cur) { audio.currentTime = 0; fx.setFade(1); fadingOut = false; audio.play(); return; }
  const before = qi, i = pickNext(1);
  if (i < 0) { if (auto) { audio.pause(); toast(t('queueEnd')); } return; }
  const skipped = S.shuffle ? 0 : ((i - before + Q.length) % Q.length) - 1;
  if (skipped > 0 && Date.now() - skipNote > 8000) { skipNote = Date.now(); toast(t('skippedShort', { n: fmtN(skipped) })); }
  qi = i; playTrack(Q[i]);
}
function prev() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  if (S.shuffle && hist.length) { playTrack(hist.pop(), { fromHist: true }); return; }
  const i = pickNext(-1); if (i >= 0) { qi = i; playTrack(Q[i]); }
}
function toggle() {
  if (embedOpen) return;
  if (!cur) { const l = list.length ? list : computeList(); const i = l.findIndex(x => !isShort(x)); if (i >= 0) playTrack(l[i], { queue: l, index: i }); return; }
  fx.resume();
  if (audio.paused) { fx.setFade(1); audio.play().catch(() => {}); } else audio.pause();
}
audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('ended', () => { if (sleepEnd) { sleepEnd = false; syncSleep(); toast(t('sleepDone'), 5000); return; } next(true); });
audio.addEventListener('error', () => { if (!cur || !audio.getAttribute('src')) return; toast(t('fileErr')); if (!cur.remote) setTimeout(() => next(true), 800); });
let lastSave = 0;
audio.addEventListener('timeupdate', () => { if (cur && !cur.remote && Date.now() - lastSave > 5000) { lastSave = Date.now(); store.set('last', { path: cur.path, at: audio.currentTime }); } });
function setPlaying(v) {
  playing = v; document.body.classList.toggle('playing', v);
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = v ? 'playing' : 'paused';
  scheduleIdle();
}
function setArtOnly(tr) {
  const art = artFor(tr);
  $('#thumb').style.backgroundImage = `url("${art}")`; $('#ccImg').src = art;
  const im = new Image();
  im.onload = () => { if (cur !== tr) return; coverColors = extractCoverColors(im); if (S.palette === 'cover') palCache = null; if (engine) engine.setCover(im); };
  im.src = art;
  return art;
}
function setNow(tr) {
  $('#mTitle').textContent = tr.title || baseName(tr.path); $('#mArtist').textContent = tr.artist || t('unknownArtist');
  $('#ccTitle').textContent = tr.title || baseName(tr.path); $('#ccArtist').textContent = tr.artist || t('unknownArtist');
  $('#ccAlbum').textContent = [tr.album, tr.year || ''].filter(Boolean).join(' · ');
  ccEl.classList.remove('swap'); void ccEl.offsetWidth; ccEl.classList.add('swap');
  document.title = (tr.title || 'Nava') + ' — Nava Player';
  const art = setArtOnly(tr);
  if ('mediaSession' in navigator) {
    const setMeta = src => { try { navigator.mediaSession.metadata = new MediaMetadata({ title: tr.title || '', artist: tr.artist || '', album: tr.album || '', artwork: src ? [{ src, sizes: '512x512' }] : [] }); } catch (e) {} };
    if (art.startsWith('data:')) setMeta(art); else fetch(art).then(r => r.blob()).then(bl => { if (cur === tr) setMeta(URL.createObjectURL(bl)); }).catch(() => setMeta(null));
  }
}
function setMediaKeys() {
  if (!('mediaSession' in navigator)) return;
  const ms = navigator.mediaSession, on = S.mediaKeys;
  [['play', () => toggle()], ['pause', () => audio.pause()], ['nexttrack', () => next()], ['previoustrack', () => prev()], ['seekto', d => { if (d.seekTime != null) audio.currentTime = d.seekTime; }]]
    .forEach(([a, f]) => { try { ms.setActionHandler(a, on ? f : null); } catch (e) {} });
}
function updateFav() { const b = $('#btnFav'); b.hidden = !cur || !!cur.remote; b.classList.toggle('on', !!(cur && cur.fav)); }
function toggleFav() {
  if (!cur || cur.remote) return;
  cur.fav = !cur.fav; api.lib.setMeta(cur.path, { fav: cur.fav }); updateFav(); renderV(true);
  toast(cur.fav ? t('favAdd') : t('favDel'), 1400);
  if (S.view === 'favs') renderSide();
}

/* ================= AI lyrics ================= */
const lyr = new LyricsView($('#lyrics'));
const pill = $('#aiPill');
let lyrToken = 0, aiSt = null, prefetching = null;
const tref = tr => ({ path: tr.path, size: tr.size || 0, mtime: tr.mtime || 0, title: tr.title, artist: tr.artist });
const langName = l => ({ fa: t('langFa'), en: t('langEn'), ru: t('langRu') }[l] || l || '');
const hasFa = tr => /[؀-ۿ]/.test((tr.title || '') + ' ' + (tr.artist || '') + ' ' + baseName(tr.path || ''));
function langFor(tr) {
  const ov = store.get('langOv', {})[tr.path]; if (ov) return ov;
  if (S.aiLang !== 'auto') return S.aiLang;
  if (hasFa(tr)) return 'fa';
  if (/[Ѐ-ӿ]/.test((tr.title || '') + ' ' + (tr.artist || '') + ' ' + baseName(tr.path))) return 'ru';
  return 'auto';
}
async function aiStatus(force) { if (!aiSt || force) aiSt = await api.ai.status(); return aiSt; }
function setPill(state, extra) {
  pill.dataset.state = state || ''; pill._extra = extra;
  let h = '';
  if (state === 'working') h = `<span class="spin"></span><span>${t('aiWorking')}</span><b>${fmtN(extra || 0)}${L() === 'fa' ? '٪' : '%'}</b>`;
  else if (state === 'prep') h = `<span class="spin"></span><span>${t('aiPrep')}</span>`;
  else if (state === 'queued') h = `<span class="spin"></span><span>${t('aiQueued')}</span>`;
  else if (state === 'ready') h = `<svg><use href="#i-spark"/></svg><span>${t('aiReady')} · ${esc(langName(extra && extra.lang))}${extra && extra.device ? ' · ' + extra.device : ''}</span>`;
  else if (state === 'none') h = `<svg><use href="#i-spark"/></svg><span>${t('aiNone')}</span>`;
  else if (state === 'setup') h = `<svg><use href="#i-spark"/></svg><span>${t('aiSetupPill')}</span><b>${t('install')}</b>`;
  else if (state === 'error') h = `<svg><use href="#i-x"/></svg><span>${esc(extra || t('aiErr'))}</span>`;
  else if (state === 'stream') h = `<svg><use href="#i-link"/></svg><span>${t('aiStream')}</span>`;
  pill.innerHTML = h; pill.hidden = !h;
  pill.classList.remove('fade'); clearTimeout(pill._t);
  if (['ready', 'none', 'stream'].includes(state)) pill._t = setTimeout(() => pill.classList.add('fade'), 4500);
}
function applyLyrics(data) { if (!data || !data.lines || !data.lines.length) { lyr.clear(); setPill('none'); return; } lyr.set(data); setPill('ready', data); }
async function loadLyrics(tr) {
  const token = ++lyrToken; lyr.clear(); setPill('');
  if (!S.lyrOn) return;
  if (tr.remote) { setPill('stream'); return; }
  const data = await api.lyrics.get(tref(tr));
  if (token !== lyrToken) return;
  if (data) { applyLyrics(data); prefetchNext(); return; }
  if (!S.aiAuto) return;
  const st = await aiStatus();
  if (!st.ready) { setPill('setup'); return; }
  transcribe(tr, { priority: true });
}
async function makeWav(tr) {
  const buf = await (await fetch(mediaUrl(tr))).arrayBuffer();
  const oc = new OfflineAudioContext(1, 1, 16000);
  const ab = await oc.decodeAudioData(buf);
  const n = ab.length, ch = ab.numberOfChannels, mono = new Float32Array(n);
  for (let c = 0; c < ch; c++) { const d = ab.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += d[i] / ch; }
  let y = 0, px = 0, peak = 0; const a = .95;
  for (let i = 0; i < n; i++) { const x = mono[i]; y = a * (y + x - px); px = x; mono[i] = y; const v = y < 0 ? -y : y; if (v > peak) peak = v; }
  const g = peak > 0 ? .9 / peak : 1, out = new DataView(new ArrayBuffer(44 + n * 2));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, 16000, true); out.setUint32(28, 32000, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * 2, true);
  for (let i = 0, o = 44; i < n; i++, o += 2) { const s = clamp(mono[i] * g, -1, 1); out.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); }
  return new Uint8Array(out.buffer);
}
async function transcribe(tr, o = {}) {
  const mine = () => cur && cur.path === tr.path;
  if (mine()) setPill('prep');
  let wav; try { wav = await makeWav(tr); } catch (e) { if (mine()) setPill('error', t('aiReadErr')); return; }
  if (mine()) setPill(o.priority ? 'working' : 'queued', 0);
  try {
    const data = await api.lyrics.transcribe({ track: tref(tr), wav, lang: o.lang || langFor(tr), model: S.aiModel, device: S.aiDevice, vad: S.aiVad, hintFa: hasFa(tr), priority: !!o.priority });
    if (mine()) { applyLyrics(data); prefetchNext(); }
  } catch (e) {
    const m = String(e.message || e);
    if (/replaced|cancelled/.test(m)) return;
    if (mine()) setPill('error', /AI_NOT_READY/.test(m) ? t('aiNotReady') : t('aiErr'));
  }
}
async function prefetchNext() {
  if (!S.aiPrefetch || !S.aiAuto || S.shuffle) return;
  const i = pickNext(1); if (i < 0) return;
  const tr = Q[i]; if (!tr || tr.remote || prefetching === tr.path || (cur && tr.path === cur.path)) return;
  const st = await aiStatus(); if (!st.ready) return;
  if (await api.lyrics.get(tref(tr))) return;
  prefetching = tr.path; await transcribe(tr, { priority: false }); prefetching = null;
}
api.lyrics.onProgress(p => { if (cur && p.path === cur.path && pill.dataset.state !== 'ready') setPill('working', p.pct); });
pill.addEventListener('click', () => { if (pill.dataset.state === 'setup') { openDrawer('appSet', 'ai'); return; } if (cur && !cur.remote) $('#lyrMenu').hidden = !$('#lyrMenu').hidden; });
$('#lyrMenu').addEventListener('click', async e => {
  const b = e.target.closest('[data-relang]'); if (!b || !cur) return;
  $('#lyrMenu').hidden = true;
  const l = b.dataset.relang, ov = store.get('langOv', {});
  if (l === 'auto') delete ov[cur.path]; else ov[cur.path] = l; store.set('langOv', ov);
  await api.lyrics.del(tref(cur)); lyr.clear();
  const st = await aiStatus(true); if (!st.ready) { setPill('setup'); return; }
  transcribe(cur, { priority: true, lang: l === 'auto' ? langFor(cur) : l });
});
function aiBoxHTML(st, compact) {
  const row = (ok, label, extra = '') => `<div class="ai-row"><i class="${ok ? 'ok' : ''}"></i><span>${label}</span><b>${ok ? t('installed') : (extra || t('notInstalled'))}</b></div>`;
  let h = row(st.cuda, t('aiEngineGpu'), st.nvidia === false ? t('noNvidia') : '') + row(st.cpu, t('aiEngineCpu')) + row(st.turbo, t('aiTurbo', { n: fmtN(st.sizes.turbo) })) + row(st.large, t('aiLarge', { n: fmtN(st.sizes.large) })) + row(st.vad, t('aiVad'));
  if (st.ready) h += compact ? `<p class="note">${t('obAiReady')}</p>` : `<p class="note">${t('aiAllReady')}</p>`;
  else h += `<button class="btn pri" data-aisetup="base"${st.busy ? ' disabled' : ''}><svg><use href="#i-spark"/></svg>${t('aiInstallBtn')}</button>`;
  if (st.ready && !st.large) h += `<button class="btn" data-aisetup="large"${st.busy ? ' disabled' : ''}><svg><use href="#i-spark"/></svg>${t('aiLargeBtn')}</button>`;
  h += `<div class="prog" data-aiprog hidden><i></i><span></span></div>`;
  if (!compact) h += `<p class="note">${t('aiPersianNote')}</p>`;
  return h;
}
async function renderAiInto(el, compact) { if (!el) return; const st = await aiStatus(true); el.innerHTML = aiBoxHTML(st, compact); }
const AI_STEP = { cuda: 'aiStepCuda', cpu: 'aiStepCpu', turbo: 'aiStepTurbo', large: 'aiStepLarge', vad: 'aiStepVad' };
api.ai.onProgress(p => {
  $$('[data-aiprog]').forEach(pr => {
    pr.hidden = false;
    if (p.error) { pr.querySelector('span').textContent = p.error; return; }
    pr.querySelector('i').style.width = (p.done ? 100 : p.total ? p.got / p.total * 100 : 100) + '%';
    pr.querySelector('span').textContent = p.done ? t('aiDone') : (t(AI_STEP[p.step] || 'aiStepTurbo') + ' · ' + (p.unpack ? t('aiUnpack') : `${fmtN(Math.round(p.got / 1e6))} / ${fmtN(Math.round(p.total / 1e6))} ${t('mb')}`));
  });
  if (p.done) { aiSt = null; $$('.ai-box').forEach(el => renderAiInto(el, el.dataset.compact === '1')); toast(t('aiDone')); if (cur && !lyr.data) loadLyrics(cur); }
  if (p.error) toast(p.error, 5000);
});
document.addEventListener('click', e => { const b = e.target.closest('[data-aisetup]'); if (b) { $$('[data-aisetup]').forEach(x => { x.disabled = true; }); api.ai.setup(b.dataset.aisetup === 'large' ? 'large' : undefined); } });

/* ================= links & embeds ================= */
let embedOpen = false, vizStream = null;
function parseLink(raw) {
  const u = (raw || '').trim(); let m;
  if ((m = u.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/)) || (m = u.match(/^spotify:(track|album|playlist|episode|show|artist):([A-Za-z0-9]+)/)))
    return { kind: 'embed', provider: 'Spotify', src: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0`, h: m[1] === 'track' || m[1] === 'episode' ? 160 : 380 };
  if (/^https?:\/\/(www\.|m\.|on\.)?soundcloud\.com\//i.test(u)) return { kind: 'embed', provider: 'SoundCloud', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u)}&auto_play=true&visual=true&hide_related=true&show_comments=false`, h: 300 };
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/|music\.youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/)))
    return { kind: 'embed', provider: 'YouTube', src: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0`, h: 300 };
  if (/^https?:\/\//i.test(u)) return { kind: 'direct', url: u };
  return null;
}
async function openLink(raw, viz) {
  const p = parseLink(raw);
  if (!p) { toast(t('linkBad')); return false; }
  if (p.kind === 'direct') {
    toast(t('linkChecking'), 1500);
    const pr = await api.link.probe(p.url);
    const okType = /audio\/|ogg|mpeg|aac|flac|wav|octet-stream/i.test(pr.type || '') || /\.(mp3|ogg|oga|opus|m4a|aac|flac|wav|webm)(\?|$)/i.test(p.url);
    if (!pr.ok || !okType || /mpegurl|html/i.test(pr.type || '')) { toast(t('linkBad')); return false; }
    const host = new URL(p.url).host;
    let title = ''; try { title = decodeURIComponent(p.url.split('?')[0].split('/').pop() || ''); } catch (e) {}
    title = title.replace(/\.[a-z0-9]{2,4}$/i, '') || host;
    const tr = { path: 'url:' + p.url, url: p.url, remote: true, title, artist: t('linkStream') + ' · ' + host, duration: 0 };
    playTrack(tr, { manual: true, queue: [tr], index: 0 });
    return true;
  }
  audio.pause(); embedOpen = true; updateEmpty();
  const box = $('#embedBox'); box.innerHTML = '';
  const ifr = document.createElement('iframe');
  ifr.src = p.src; ifr.allow = 'autoplay; encrypted-media; clipboard-write; fullscreen'; ifr.referrerPolicy = 'strict-origin-when-cross-origin'; ifr.style.height = p.h + 'px';
  box.appendChild(ifr);
  $('#embedLabel').textContent = p.provider; $('#embedNote').textContent = p.provider === 'Spotify' ? t('spotifyNote') : '';
  $('#embed').hidden = false;
  lyr.clear(); setPill('stream');
  if (viz) startViz();
  return true;
}
async function startViz() {
  try {
    const st = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    st.getVideoTracks().forEach(tk => tk.stop());
    if (!st.getAudioTracks().length) return;
    vizStream = st; fx.attachStream(st); streamViz = true;
  } catch (e) { streamViz = false; }
}
function closeEmbed() {
  if (!embedOpen) return;
  embedOpen = false; $('#embedBox').innerHTML = ''; $('#embed').hidden = true;
  if (vizStream) { vizStream.getTracks().forEach(tk => tk.stop()); vizStream = null; }
  fx.detachStream(); streamViz = false; setPill(''); updateEmpty();
}
$('#embedClose').addEventListener('click', closeEmbed);
function linkDialog() {
  modal(`<h3><svg><use href="#i-link"/></svg>${t('linkTitle')}</h3>
    <div class="linkrow"><input id="linkIn" dir="ltr" placeholder="${esc(t('linkPh'))}"><button class="btn pri" id="linkGo">${t('linkPlay')}</button></div>
    <div class="provs"><span class="pv sp">Spotify</span><span class="pv sc">SoundCloud</span><span class="pv yt">YouTube</span><span class="pv mp">MP3 · OGG · Radio</span></div>
    <p class="muted small">${t('linkHelp')}</p>
    <label class="chk"><input type="checkbox" id="linkViz" ${store.get('linkViz', true) ? 'checked' : ''}> <span>${t('linkViz')}</span></label>`, { cls: 'wide' });
  const inp = $('#linkIn'); inp.focus();
  const go = async () => { const v = $('#linkViz').checked; store.set('linkViz', v); if (await openLink(inp.value, v)) closeModal(); };
  $('#linkGo').addEventListener('click', go);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
}

/* ================= modal, close, welcome, outro, booster, sleep ================= */
const modalEl = $('#modal'), mbox = $('#mbox');
let modalResolve = null;
function modal(html, o = {}) {
  if (modalResolve) { const r = modalResolve; modalResolve = null; r(null); }
  mbox.className = 'mbox ' + (o.cls || ''); mbox.innerHTML = html; mbox.setAttribute('dir', L() === 'fa' ? 'rtl' : 'ltr');
  modalEl.hidden = false; requestAnimationFrame(() => modalEl.classList.add('show'));
  return new Promise(res => { modalResolve = res; });
}
function closeModal(v) { modalEl.classList.remove('show'); setTimeout(() => { if (!modalResolve) modalEl.hidden = true; }, 250); if (modalResolve) { const r = modalResolve; modalResolve = null; r(v); } }
modalEl.addEventListener('click', e => { if (e.target === modalEl) { closeModal(null); return; } const b = e.target.closest('[data-m]'); if (b) closeModal(b.dataset.m); });
async function confirmBox(title, msg, yes, no, icon = 'i-spark', danger) {
  return (await modal(`<h3><svg><use href="#${icon}"/></svg>${title}</h3><p>${msg}</p><div class="mnav"><button class="btn" data-m="no">${no}</button><button class="btn ${danger ? 'warn' : 'pri'}" data-m="yes">${yes}</button></div>`)) === 'yes';
}
api.app.onCloseRequest(async action => {
  if (action === 'quit') return doQuit();
  let remember = false;
  const p = modal(`<h3><img src="logo.svg" alt="" class="mlogo">${t('closeTitle')}</h3><p>${t('closeMsg')}</p>
    <label class="chk"><input type="checkbox" id="rememberClose"> <span>${t('remember')}</span></label>
    <div class="mnav"><button class="btn" data-m="cancel">${t('cancel')}</button><button class="btn" data-m="tray">${t('closeTray')}</button><button class="btn warn" data-m="quit">${t('closeQuit')}</button></div>`);
  $('#rememberClose').addEventListener('change', e => { remember = e.target.checked; });
  const r = await p;
  if (r === 'tray') { await api.app.closeAction('tray', remember); if (remember) appCfg.closeAction = 'tray'; }
  else if (r === 'quit') { if (remember) { await api.app.setCfg('closeAction', 'quit'); appCfg.closeAction = 'quit'; } doQuit(); }
});
api.app.onCmd(c => { if (c === 'toggle') toggle(); else if (c === 'next') next(); else if (c === 'prev') prev(); else if (c === 'quit') doQuit(); });
let quittingNow = false;
function doQuit() {
  if (quittingNow) return; quittingNow = true;
  try { store.set('settings', S); } catch (e) {}
  if (!S.outro) { api.app.quitNow(); return; }
  fx.fadeTo(0, 1.2);
  $('#ouText').textContent = I18N.outro();
  const o = $('#outro'); o.hidden = false; requestAnimationFrame(() => o.classList.add('show'));
  setTimeout(() => api.app.quitNow(), 2200);
}
function showWelcome() {
  const w = $('#welcome'); $('#wlText').textContent = I18N.welcome();
  w.hidden = false; requestAnimationFrame(() => w.classList.add('show'));
  const hide = () => { w.classList.remove('show'); w.classList.add('gone'); setTimeout(() => { w.hidden = true; w.classList.remove('gone'); }, 700); };
  const tm = setTimeout(hide, 2600); w.onclick = () => { clearTimeout(tm); hide(); };
}
async function setBooster(on) {
  if (on && !S.booster) {
    const ok = await confirmBox(t('boostTitle'), t('boostWarn'), t('boostEnable'), t('cancel'), 'i-boost', true);
    if (!ok) { syncControls(); return; }
    S.booster = true; toast(t('boostOn'));
  } else if (!on && S.booster) { S.booster = false; if (S.volume > 1) S.volume = 1; toast(t('boostOff')); }
  loudAcc = 0; applyVolume(); persist(); syncControls();
}
let loudOpen = false;
async function loudWarning() {
  if (loudOpen) return; loudOpen = true;
  try { new Notification(t('loudTitle'), { body: t('loudMsg'), icon: 'icon.png' }); } catch (e) {}
  const keep = await confirmBox(t('loudTitle'), t('loudMsg'), t('loudKeep'), t('loudLower'), 'i-boost');
  if (!keep) { S.volume = 1; applyVolume(); persist(); }
  loudAcc = 0; loudOpen = false;
}
let sleepT = 0, sleepEnd = false;
function setSleep(v) {
  clearTimeout(sleepT); sleepEnd = false;
  if (v === 'end') { sleepEnd = true; toast(t('sleepSet', { n: t('sleepEnd') })); return; }
  if (+v > 0) { sleepT = setTimeout(sleepNow, +v * 60000); toast(t('sleepSet', { n: fmtN(+v) + ' ' + t('minutes') })); }
}
function sleepNow() { fx.fadeTo(0, 4); setTimeout(() => { audio.pause(); fx.setFade(1); toast(t('sleepDone'), 5000); }, 4100); sleepEnd = false; syncSleep(); }
function syncSleep() { $$('[data-sleep]').forEach(c => c.classList.toggle('on', c.dataset.sleep === '0')); }

/* ================= settings UI ================= */
const opt = (v, lbl) => [v, lbl];
const literal = (fa, en) => () => L() === 'fa' ? fa : en;
const key = k => () => t(k);
const PLAY_SCHEMA = () => [
  ['visual', 'tabVisual'],
  ['mode', 'sMode', 'chips', MODES.map(m => opt(m[0], literal(m[1], m[2])))],
  ['palette', 'sPalette', 'chips', PALETTES.map(p => opt(p[0], literal(p[1], p[2])))],
  ['bars', 'sBars', 'range', 32, 192, 8], ['sensitivity', 'sSens', 'range', .5, 2.5, .05], ['beatSens', 'sBeat', 'range', 0, 1, .05], ['rotate', 'sRotate', 'range', 0, 2, .05],
  ['mirror', 'sMirror', 'toggle'], ['showCover', 'sShowCover', 'toggle'], ['spinCover', 'sSpin', 'toggle'],
  ['coverCard', 'sCard', 'chips', [opt('left', key('left')), opt('right', key('right')), opt('off', key('hidden'))]], ['coverSize', 'sCardSize', 'range', 140, 320, 10],
  ['@sec', 'secPerf'], ['fps', 'sFps', 'chips', [opt(30, literal('۳۰', '30')), opt(60, literal('۶۰', '60')), opt(120, literal('۱۲۰', '120')), opt(0, key('fpsSync'))]],
  ['quality', 'sQuality', 'range', .4, 1, .05], ['fft', 'sFft', 'chips', [opt(1024, literal('۱۰۲۴', '1024')), opt(2048, literal('۲۰۴۸', '2048')), opt(4096, literal('۴۰۹۶', '4096'))]], ['autoHide', 'sAutoHide', 'toggle'], ['@note', 'perfNote'],
  ['fx', 'tabFx'],
  ['glow', 'sGlow', 'range', 0, 1, .05], ['flash', 'sFlash', 'range', 0, 1.5, .05], ['trail', 'sTrail', 'range', 0, .95, .05], ['warpZoom', 'sWarp', 'range', 0, .03, .001], ['twist', 'sTwist', 'range', -.02, .02, .001],
  ['zoom', 'sZoom', 'toggle'], ['shake', 'sShake', 'toggle'], ['shakeAmt', 'sShakeAmt', 'range', 0, 1.5, .05], ['ca', 'sCa', 'range', 0, 1.5, .05], ['particleAmt', 'sParticles', 'range', .1, 1, .05],
  ['dust', 'sDust', 'toggle'], ['backdrop', 'sBackdrop', 'range', 0, 1, .05], ['vignette', 'sVignette', 'range', 0, 1, .05], ['grain', 'sGrain', 'range', 0, 1, .05],
  ['lyrics', 'tabLyrics'],
  ['lyrOn', 'sLyrOn', 'toggle'], ['lyrStyle', 'sLyrStyle', 'chips', LyricsView.styles.map(s => opt(s[0], literal(s[1], s[2])))],
  ['lyrPos', 'sLyrPos', 'chips', [opt('bottom', key('pBottom')), opt('center', key('pCenter')), opt('top', key('pTop'))]],
  ['lyrDir', 'sLyrDir', 'chips', [opt('down', key('dDown')), opt('up', key('dUp'))]],
  ['lyrColor', 'sLyrColor', 'chips', [opt('accent', key('cAccent')), opt('white', key('cWhite')), opt('gradient', key('cGrad'))]],
  ['lyrFont', 'sLyrFont', 'chips', [opt('display', key('fDisplay')), opt('body', key('fBody'))]],
  ['lyrSize', 'sLyrSize', 'range', 24, 90, 2], ['lyrOffset', 'sLyrOffset', 'range', -2, 2, .05], ['lyrGlow', 'sLyrGlow', 'toggle'],
  ['sound', 'tabSound'],
  ['@sec', 'secPlayback'], ['speed', 'sSpeed', 'range', .5, 2, .05], ['pitch', 'sPitch', 'range', -12, 12, .5], ['vinyl', 'sVinyl', 'toggle'],
  ['minDur', 'sMinDur', 'range', 0, 120, 5], ['fadeIn', 'sFadeIn', 'range', 0, 8, .5], ['fadeOut', 'sFadeOut', 'range', 0, 12, .5], ['@sleep'],
  ['@sec', 'secFx'], ['bass', 'sBass', 'range', 0, 15, .5], ['@reverb'], ['reverb', 'sReverb', 'range', 0, .8, .02], ['revSize', 'sRoom', 'range', .3, 6, .1], ['revDamp', 'sDamp', 'range', 0, 1, .05],
  ['d8', 's8d', 'toggle'], ['d8Speed', 's8dSpeed', 'range', .03, .5, .01], ['balance', 'sBalance', 'range', -1, 1, .05], ['width', 'sWidth', 'range', 0, 2, .05], ['mono', 'sMono', 'toggle'], ['normalize', 'sNormalize', 'toggle'],
  ['@sec', 'secBoost'], ['@booster'],
  ['eq', 'tabEq'], ['@eq'],
  ['presets', 'tabPresets'], ['@presets']
];
const APP_SCHEMA = () => [
  ['general', 'tabGeneral'],
  ['lang', 'sLang', 'chips', [opt('fa', literal('فارسی', 'فارسی')), opt('en', literal('English', 'English'))]],
  ['@closeAction'], ['@autostart'], ['welcome', 'sWelcome', 'toggle'], ['outro', 'sOutro', 'toggle'], ['mediaKeys', 'sMediaKeys', 'toggle'], ['notify', 'sNotify', 'toggle'], ['uiAnim', 'sAnim', 'toggle'],
  ['themes', 'tabThemes'], ['@themes'],
  ['library', 'tabLibrary'], ['@lib'], ['hideShort', 'sHideShort', 'toggle'],
  ['ai', 'tabAi'], ['@ai'], ['aiAuto', 'sAiAuto', 'toggle'], ['aiPrefetch', 'sAiPrefetch', 'toggle'], ['aiVad', 'sAiVad', 'toggle'],
  ['aiLang', 'sAiLang', 'chips', [opt('auto', key('langAuto')), opt('fa', key('langFa')), opt('en', key('langEn')), opt('ru', key('langRu'))]],
  ['aiModel', 'sAiModel', 'chips', [opt('auto', key('mAuto')), opt('turbo', literal('Turbo', 'Turbo')), opt('large', literal('Large-v3', 'Large-v3'))]],
  ['aiDevice', 'sAiDevice', 'chips', [opt('gpu', key('dGpu')), opt('cpu', key('dCpu'))]], ['@lyrdir'],
  ['keys', 'tabKeys'], ['@keys'],
  ['about', 'tabAbout'], ['@about']
];
const PCT = new Set(['glow', 'flash', 'trail', 'shakeAmt', 'ca', 'particleAmt', 'backdrop', 'vignette', 'grain', 'beatSens', 'rotate', 'quality', 'smoothing', 'reverb', 'revDamp', 'width']);
function fmtVal(k, v) {
  const pc = L() === 'fa' ? '٪' : '%';
  if (k === 'speed' || k === 'sensitivity') return fmtN(+v.toFixed(2)) + '×';
  if (k === 'pitch') return (v > 0 ? '+' : '') + fmtN(v) + ' ' + t('semis');
  if (k === 'lyrOffset') return (v > 0 ? '+' : '') + fmtN(+v.toFixed(2)) + ' ' + t('seconds');
  if (k === 'lyrSize' || k === 'coverSize') return fmtN(v) + 'px';
  if (k === 'minDur') return v ? fmtN(v) + ' ' + t('seconds') : t('minDurOff');
  if (k === 'fadeIn' || k === 'fadeOut') return v ? fmtN(v) + ' ' + t('seconds') : t('off');
  if (k === 'revSize') return fmtN(+v.toFixed(1)) + ' ' + t('seconds');
  if (k === 'bass') return '+' + fmtN(v) + ' dB';
  if (k === 'eqPre') return (v > 0 ? '+' : '') + fmtN(v) + ' dB';
  if (k === 'd8Speed') return fmtN(+v.toFixed(2)) + ' Hz';
  if (k === 'balance') return v === 0 ? fmtN(0) : (v < 0 ? t('left') : t('right')) + ' ' + fmtN(Math.round(Math.abs(v) * 100)) + pc;
  if (k === 'warpZoom' || k === 'twist') return fmtN(Math.round(v * 1000));
  if (PCT.has(k)) return fmtN(Math.round(v * 100)) + pc;
  return fmtN(v);
}
const setP = el => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
function buildPanel(schema, tabsEl, panesEl, keepTab) {
  let tabs = '', html = '', open = false, first = true;
  for (const row of schema) {
    const [k, label, type, a, b, c] = row;
    if (row.length === 2 && !k.startsWith('@')) {
      if (open) html += '</div>';
      tabs += `<button data-tab="${k}"${first ? ' class="on"' : ''}>${t(label)}</button>`;
      html += `<div class="pane${first ? ' on' : ''}" data-pane="${k}">`; open = true; first = false; continue;
    }
    if (k === '@sec') { html += `<div class="sec">${t(label)}</div>`; continue; }
    if (k === '@note') { html += `<p class="note">${t(label)}</p>`; continue; }
    if (k.startsWith('@')) { html += customBlock(k.slice(1)); continue; }
    if (type === 'range') html += `<div class="srow"><label for="s-${k}">${t(label)}</label><output id="o-${k}"></output><input type="range" dir="ltr" id="s-${k}" data-k="${k}" min="${a}" max="${b}" step="${c}"></div>`;
    else if (type === 'toggle') html += `<div class="srow"><label for="s-${k}">${t(label)}</label><span class="switch"><input type="checkbox" id="s-${k}" data-k="${k}"><i></i></span></div>`;
    else if (type === 'chips') html += `<div class="srow col"><span>${t(label)}</span><div class="chips" data-chips="${k}">${a.map(([v, l]) => `<button class="chip" data-v="${v}">${esc(l())}</button>`).join('')}</div></div>`;
  }
  if (open) html += '</div>';
  tabsEl.innerHTML = tabs; panesEl.innerHTML = html;
  if (keepTab) showTab(panesEl, keepTab);
}
function customBlock(id) {
  if (id === 'sleep') return `<div class="srow col"><span>${t('sSleep')}</span><div class="chips">${[['0', t('off')], ['15', 15], ['30', 30], ['45', 45], ['60', 60], ['90', 90], ['end', t('sleepEnd')]].map(([v, l]) => `<button class="chip${v === '0' ? ' on' : ''}" data-sleep="${v}">${typeof l === 'number' ? fmtN(l) + ' ' + t('minutes') : l}</button>`).join('')}</div></div>`;
  if (id === 'reverb') return `<div class="srow col"><span>${t('rPresetsReverb')}</span><div class="chips">${Object.entries(REVERB_PRESETS).map(([k, [n]]) => `<button class="chip" data-rev="${k}">${L() === 'fa' ? n[0] : n[1]}</button>`).join('')}<button class="chip" data-rev="off">${t('off')}</button></div></div>`;
  if (id === 'booster') return `<div class="srow"><label for="s-booster">${t('sBooster')}</label><span class="switch warn"><input type="checkbox" id="s-booster"><i></i></span></div><p class="note">${t('boosterNote')}</p>`;
  if (id === 'eq') return `<div class="srow"><label for="s-eqOn">${t('eqOn')}</label><span class="switch"><input type="checkbox" id="s-eqOn" data-k="eqOn"><i></i></span></div>
    <div class="eqwrap"><canvas id="eqCanvas"></canvas><div class="eqlabels" id="eqLabels" dir="ltr"></div></div><p class="muted small">${t('eqHint')}</p>
    <div class="srow"><label for="s-eqPre">${t('eqPreamp')}</label><output id="o-eqPre"></output><input type="range" dir="ltr" id="s-eqPre" data-k="eqPre" min="-12" max="12" step=".5"></div>
    <div class="sec">${t('eqPresets')}</div><div class="chips">${Object.entries(EQ_PRESETS).map(([k, [n]]) => `<button class="chip" data-eqp="${k}">${L() === 'fa' ? n[0] : n[1]}</button>`).join('')}</div>`;
  if (id === 'presets') return `<div class="pre-top"><input id="pq" placeholder="${esc(t('pSearch'))}"><button class="btn sm pri" id="pRandom"><svg><use href="#i-spark"/></svg>${t('pRandom')}</button></div>
      <div class="chips" id="pcats">${CATS.map(([v, l]) => `<button class="chip${v === pcat ? ' on' : ''}" data-pc="${v}">${t(l)}</button>`).join('')}</div>
      <div class="srow col"><span>${t('pCycle')}</span><div class="chips" data-chips="autoCycle">${[[0, t('off')], [30, t('cyc30')], [60, t('cyc60')], [-1, t('cycTrack')]].map(([v, l]) => `<button class="chip" data-v="${v}">${l}</button>`).join('')}</div></div>
      <div class="saverow"><input id="pname" placeholder="${esc(t('pName'))}" maxlength="30"><button class="btn sm" id="psave">${t('pSave')}</button></div>
      <div class="presets" id="plist"></div>
      <div class="srow"><span>${t('pResetAll')}</span><button class="btn sm" id="pReset">${t('reset')}</button></div>`;
  if (id === 'closeAction') return `<div class="srow col"><span>${t('sCloseAction')}</span><div class="chips">${[['ask', 'caAsk'], ['tray', 'caTray'], ['quit', 'caQuit']].map(([v, l]) => `<button class="chip${appCfg.closeAction === v ? ' on' : ''}" data-close-act="${v}">${t(l)}</button>`).join('')}</div></div>`;
  if (id === 'autostart') return `<div class="srow"><label for="s-autostart">${t('sAutostart')}</label><span class="switch"><input type="checkbox" id="s-autostart" ${appCfg.autostart ? 'checked' : ''}><i></i></span></div>`;
  if (id === 'themes') return `<div class="sec">${t('thTitle')}</div><div class="themes" id="themeList"></div><div class="sec">${t('thBuild')}</div><div class="thbuild" id="thBuild"></div>`;
  if (id === 'lib') return `<div class="sec">${t('sFolders')}</div><div id="folders" class="folders"></div><div class="btnrow s"><button class="btn sm pri" id="libAdd"><svg><use href="#i-plus"/></svg>${t('tAddFolder')}</button><button class="btn sm" id="libScan">${t('tRescan')}</button></div>
      <div class="srow"><label for="allDrives">${t('sAllDrives')}</label><span class="switch"><input type="checkbox" id="allDrives"><i></i></span></div>`;
  if (id === 'ai') return `<div class="sec">${t('sEngine')}</div><div class="ai-box" id="aiBox"></div><div class="sec">${t('tabAi')}</div>`;
  if (id === 'lyrdir') return `<div class="sec">${t('sLyrDir')}</div>
      <div class="chips"><button class="chip${appCfg.lyricsMode !== 'beside' ? ' on' : ''}" data-lyrmode="folder">${t('lyrDirFolder')}</button><button class="chip${appCfg.lyricsMode === 'beside' ? ' on' : ''}" data-lyrmode="beside">${t('lyrDirBeside')}</button></div>
      <div class="pathbox" dir="ltr" id="lyrDirPath">${esc(appCfg.lyricsDir)}</div>
      <div class="btnrow s"><button class="btn sm" id="lyrChoose">${t('lyrChoose')}</button><button class="btn sm" id="lyrOpen">${t('lyrOpen')}</button></div>
      <div class="srow"><label for="s-writeLrc">${t('sWriteLrc')}</label><span class="switch"><input type="checkbox" id="s-writeLrc" ${appCfg.writeLrc ? 'checked' : ''}><i></i></span></div>
      <div class="srow"><span>${t('lyrClear')}</span><button class="btn sm" id="aiClear">${t('delete')}</button></div>`;
  if (id === 'keys') return `<p class="note">${t('keysNote')}</p><div class="keys" id="keyList"></div><div class="btnrow s"><button class="btn sm" id="keysReset">${t('keysReset')}</button></div>`;
  if (id === 'about') return `<div class="about"><img src="logo.svg" alt=""><h3>Nava Player</h3><div class="ver"><b>${t('beta')}</b><span id="aboutVer"></span></div>
      <p>${t('aboutBuilt')} <b>Silenzio Morto</b></p><button class="btn pri gh" data-gh><svg><use href="#i-gh"/></svg>github.com/SilenzioMorto</button>
      <p class="muted">${t('aboutSupport')}</p><p class="note">${t('aboutBeta')}</p><p class="muted small">${t('aboutLicense')}</p><p class="muted small">${t('aboutThird')}</p>
      <div class="btnrow s"><button class="btn sm" id="replayTour">${t('aboutTour')}</button><button class="btn sm" id="openData">${t('aboutData')}</button></div></div>`;
  return '';
}
let eqVisible = false;
function showTab(panes, id) {
  const drawer = panes.closest('.drawer');
  $$('.tabs button', drawer).forEach(x => x.classList.toggle('on', x.dataset.tab === id));
  $$('.pane', panes).forEach(p => p.classList.toggle('on', p.dataset.pane === id));
  panes.scrollTop = 0;
  if (id === 'ai') renderAiInto($('#aiBox'));
  if (id === 'library') renderFolders();
  if (id === 'presets') renderPresets();
  if (id === 'themes') renderThemes();
  if (id === 'keys') renderKeys();
  if (id === 'about') api.app.info().then(i => { const v = $('#aboutVer'); if (v) v.textContent = 'v' + i.version; });
  eqVisible = id === 'eq' && drawer.classList.contains('open');
  if (id === 'eq') requestAnimationFrame(() => drawEq(true));
}
function buildSettings() {
  const at = $('#appTabs .on'), pt = $('#playTabs .on');
  buildPanel(APP_SCHEMA(), $('#appTabs'), $('#appPanes'), at && at.dataset.tab);
  buildPanel(PLAY_SCHEMA(), $('#playTabs'), $('#playPanes'), pt && pt.dataset.tab);
  syncControls();
}
function syncControls() {
  for (const sch of [APP_SCHEMA(), PLAY_SCHEMA()]) for (const [k, , type] of sch) {
    if (type === 'range') { const el = $('#s-' + k); if (el) { el.value = S[k]; setP(el); const o = $('#o-' + k); if (o) o.textContent = fmtVal(k, S[k]); } }
    else if (type === 'toggle') { const el = $('#s-' + k); if (el) el.checked = !!S[k]; }
  }
  $$('[data-chips]').forEach(g => { const k = g.dataset.chips; $$('.chip', g).forEach(ch => ch.classList.toggle('on', String(S[k]) === ch.dataset.v)); });
  const eo = $('#s-eqOn'); if (eo) eo.checked = S.eqOn;
  const ep = $('#s-eqPre'); if (ep) { ep.value = S.eqPre; setP(ep); $('#o-eqPre').textContent = fmtVal('eqPre', S.eqPre); }
  $$('[data-eqp]').forEach(c => c.classList.toggle('on', EQ_PRESETS[c.dataset.eqp][1].every((g, i) => g === S.eq[i])));
  const bo = $('#s-booster'); if (bo) bo.checked = S.booster;
  const ad = $('#allDrives'); if (ad) ad.checked = !!libCfg.allDrives;
  renderModes();
}
function set(k, v) { if (S[k] === v) return; S[k] = v; applyKey(k); persist(); }
function lyrOpts() { lyr.setOptions({ style: S.lyrStyle, dir: S.lyrDir, pos: S.lyrPos, size: S.lyrSize, glow: S.lyrGlow, color: S.lyrColor, font: S.lyrFont }); }
function applyKey(k) {
  switch (k) {
    case 'lang': setLanguage(S.lang); break;
    case 'theme': applyTheme(S.theme); break;
    case 'palette': palCache = null; break;
    case 'mode': if (engine) engine.getMode(S.mode); renderModes(); break;
    case 'fft': case 'smoothing': applyAnalyser(); break;
    case 'quality': resize(); break;
    case 'coverCard': ccEl.dataset.pos = S.coverCard; ccEl.hidden = S.coverCard === 'off'; break;
    case 'coverSize': document.documentElement.style.setProperty('--cc', S.coverSize + 'px'); break;
    case 'lyrOn': document.body.classList.toggle('no-lyr', !S.lyrOn); $('#btnLyr').classList.toggle('on', S.lyrOn); if (S.lyrOn && cur) loadLyrics(cur); else { lyr.clear(); setPill(''); } break;
    case 'lyrStyle': case 'lyrDir': case 'lyrPos': case 'lyrSize': case 'lyrGlow': case 'lyrColor': case 'lyrFont': lyrOpts(); break;
    case 'minDur': case 'hideShort': renderSide(); break;
    case 'sideOpen': document.body.classList.toggle('side-closed', !S.sideOpen); $('#btnSide').classList.toggle('on', S.sideOpen); setTimeout(renderModes, 450); break;
    case 'autoCycle': setupCycle(); break;
    case 'mediaKeys': setMediaKeys(); break;
    case 'uiAnim': document.body.classList.toggle('no-anim', !S.uiAnim); break;
    case 'eqOn': case 'eqPre': applyEq(); drawEq(); break;
    case 'speed': case 'vinyl': audio.playbackRate = S.speed; audio.preservesPitch = !S.vinyl; break;
    case 'pitch': fx.setPitch(S.pitch); break;
    case 'bass': fx.setBass(S.bass); break;
    case 'reverb': case 'revSize': case 'revDamp': fx.setReverb(S.reverb, S.revSize, S.revDamp); break;
    case 'd8': case 'd8Speed': fx.set8d(S.d8, S.d8Speed); break;
    case 'balance': fx.setBalance(S.balance); break;
    case 'width': case 'mono': fx.setWidth(S.mono ? 0 : S.width); break;
    case 'normalize': fx.setNormalize(S.normalize); break;
  }
}
function applyAll() { Object.keys(DEFAULTS).filter(k => k !== 'lang').forEach(applyKey); applySound(); applyVolume(); applyTransport(); }
for (const panes of [$('#appPanes'), $('#playPanes')]) {
  panes.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.k && el.type === 'range') { setP(el); set(el.dataset.k, parseFloat(el.value)); const o = $('#o-' + el.dataset.k); if (o) o.textContent = fmtVal(el.dataset.k, S[el.dataset.k]); }
    else if (el.id === 'pq') renderPresets();
    else if (el.dataset.thk) themeBuilderInput(el);
  });
  panes.addEventListener('change', async e => {
    const el = e.target;
    if (el.dataset.k && el.type === 'checkbox') set(el.dataset.k, el.checked);
    if (el.id === 's-booster') setBooster(el.checked);
    if (el.id === 'allDrives') api.lib.setAllDrives(el.checked).then(v => { libCfg.allDrives = v; toast(v ? t('allDrivesOn') : t('allDrivesOff')); });
    if (el.id === 's-autostart') appCfg.autostart = await api.app.autostart(el.checked);
    if (el.id === 's-writeLrc') appCfg.writeLrc = await api.app.setCfg('writeLrc', el.checked);
  });
  panes.addEventListener('click', e => panelClick(e));
}
let pcat = 'all';
async function panelClick(e) {
  const chip = e.target.closest('.chip');
  if (chip && chip.parentElement.dataset.chips) {
    const k = chip.parentElement.dataset.chips, v = typeof DEFAULTS[k] === 'number' ? Number(chip.dataset.v) : chip.dataset.v;
    if (k === 'mode') setMode(v); else set(k, v);
    syncControls(); return;
  }
  if (chip && chip.dataset.eqp) { S.eq = EQ_PRESETS[chip.dataset.eqp][1].slice(); applyEq(); persist(); syncControls(); drawEq(); return; }
  if (chip && chip.dataset.pc) { pcat = chip.dataset.pc; $$('#pcats .chip').forEach(c => c.classList.toggle('on', c === chip)); renderPresets(); return; }
  if (chip && chip.dataset.sleep) { $$('[data-sleep]').forEach(c => c.classList.toggle('on', c === chip)); setSleep(chip.dataset.sleep); return; }
  if (chip && chip.dataset.rev) { const p = chip.dataset.rev === 'off' ? { mix: 0, size: S.revSize, damp: S.revDamp } : REVERB_PRESETS[chip.dataset.rev][1]; S.reverb = p.mix; S.revSize = p.size; S.revDamp = p.damp; applyKey('reverb'); persist(); syncControls(); return; }
  if (chip && chip.dataset.closeAct) { appCfg.closeAction = await api.app.setCfg('closeAction', chip.dataset.closeAct); $$('[data-close-act]').forEach(c => c.classList.toggle('on', c === chip)); return; }
  if (chip && chip.dataset.lyrmode) { appCfg.lyricsMode = await api.app.setCfg('lyricsMode', chip.dataset.lyrmode); $$('[data-lyrmode]').forEach(c => c.classList.toggle('on', c === chip)); return; }
  const dp = e.target.closest('[data-delp]'); if (dp) { const u = store.get('presets', []); u.splice(+dp.dataset.delp, 1); store.set('presets', u); renderPresets(); return; }
  const pr = e.target.closest('[data-preset]'); if (pr) { const p = allPresets()[+pr.dataset.preset]; applyPreset(p.s); toast(t('pApplied', { n: nm(p.n) })); return; }
  if (e.target.closest('#pRandom')) return randomPreset();
  if (e.target.closest('#psave')) return savePreset();
  if (e.target.closest('#pReset')) {
    const b = e.target.closest('#pReset');
    if (b.dataset.arm !== '1') { b.dataset.arm = '1'; b.textContent = t('sure'); setTimeout(() => { b.dataset.arm = ''; b.textContent = t('reset'); }, 3000); return; }
    const keep = {}; for (const k of ['lang', 'theme', 'onboarded', 'tourDone', 'welcome', 'outro', 'mediaKeys', 'notify', 'uiAnim', 'volume', 'booster', 'sideOpen', 'view', 'sort', 'keymap', 'aiAuto', 'aiPrefetch', 'aiLang', 'aiModel', 'aiDevice', 'aiVad', 'hideShort']) keep[k] = S[k];
    Object.assign(S, DEFAULTS, keep); S.eq = DEFAULTS.eq.slice(); applyAll(); syncControls(); persist(); toast(t('pResetDone')); return;
  }
  if (e.target.closest('#aiClear')) { await api.lyrics.clearAll(); toast(t('lyrCleared')); if (cur) loadLyrics(cur); return; }
  if (e.target.closest('#libAdd')) { libCfg.folders = await api.lib.addFolder(t('tAddFolder')); renderFolders(); return; }
  if (e.target.closest('#libScan')) { api.lib.scan(); toast(t('rescanning')); return; }
  const rf = e.target.closest('[data-rmf]'); if (rf) { libCfg.folders = await api.lib.removeFolder(rf.dataset.rmf); renderFolders(); return; }
  if (e.target.closest('#lyrChoose')) { const r = await api.lyrics.chooseDir(t('lyrChoose')); appCfg.lyricsDir = r.lyricsDir; appCfg.lyricsMode = r.lyricsMode; $('#lyrDirPath').textContent = r.lyricsDir; $$('[data-lyrmode]').forEach(c => c.classList.toggle('on', c.dataset.lyrmode === r.lyricsMode)); return; }
  if (e.target.closest('#lyrOpen')) { api.lyrics.openDir(); return; }
  if (e.target.closest('#keysReset')) { S.keymap = {}; persist(); renderKeys(); return; }
  const kb = e.target.closest('[data-bind]'); if (kb) return startRebind(kb);
  const dth = e.target.closest('[data-delth]'); if (dth) { const u = customThemes().filter(x => x.id !== dth.dataset.delth); store.set('themes', u); if (S.theme === dth.dataset.delth) set('theme', 'nava'); renderThemes(); return; }
  const th = e.target.closest('[data-theme-id]'); if (th) { set('theme', th.dataset.themeId); renderThemes(); toast(t('themeT', { n: nm(curTheme()) }), 1200); return; }
  if (e.target.closest('#thSave')) return saveCustomTheme();
  const bb = e.target.closest('[data-thbase]'); if (bb) { thDraft.base = bb.dataset.thbase; renderThemeBuilder(); previewDraft(); return; }
  if (e.target.closest('#replayTour')) { closeDrawers(); runTour(); return; }
  if (e.target.closest('#openData')) { api.app.info().then(i => api.app.openPath(i.userData)); return; }
}
const drawers = { appSet: $('#appSet'), playSet: $('#playSet') }, scrim = $('#scrim');
function openDrawer(id, tab) {
  const d = drawers[id], open = !!tab || !d.classList.contains('open');
  Object.values(drawers).forEach(x => x.classList.remove('open'));
  if (open) { d.classList.add('open'); scrim.classList.add('show'); showTab(d.querySelector('.dbody'), tab || (d.querySelector('.tabs .on') || d.querySelector('.tabs button')).dataset.tab); }
  else { scrim.classList.remove('show'); eqVisible = false; restoreThemeAfterPreview(); }
  $('#btnAppSet').classList.toggle('on', open && id === 'appSet'); $('#btnPlaySet').classList.toggle('on', open && id === 'playSet');
}
function closeDrawers() { Object.values(drawers).forEach(x => x.classList.remove('open')); scrim.classList.remove('show'); $('#btnAppSet').classList.remove('on'); $('#btnPlaySet').classList.remove('on'); eqVisible = false; restoreThemeAfterPreview(); }
scrim.addEventListener('click', closeDrawers);
$$('[data-close]').forEach(b => b.addEventListener('click', closeDrawers));
$('#appTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { restoreThemeAfterPreview(); showTab($('#appPanes'), b.dataset.tab); } });
$('#playTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) showTab($('#playPanes'), b.dataset.tab); });
let libCfg = { folders: [], allDrives: false };
function renderFolders() {
  const el = $('#folders'); if (!el) return;
  el.innerHTML = libCfg.folders.map(f => `<div><svg><use href="#i-folder"/></svg><span dir="ltr" title="${esc(f)}">${esc(f)}</span><button class="ib bare sm" data-rmf="${esc(f)}"><svg><use href="#i-x"/></svg></button></div>`).join('') || `<p class="muted">${t('noFolders')}</p>`;
}

/* themes UI + builder */
let thDraft = { base: 'dark', bg: '#120A16', panel: '#1C1222', fg: '#FBEFFF', accent: '#FF7EB8', accent2: '#8FD6FF', name: '' }, previewing = false;
function renderThemes() {
  const el = $('#themeList'); if (!el) return;
  el.innerHTML = allThemes().map(th => `<button class="thcard${S.theme === th.id ? ' on' : ''}" data-theme-id="${th.id}" style="--tb:${th.bg};--tp:${th.panel};--tf:${th.fg};--ta:${th.accent};--ta2:${th.accent2 || th.accent}">
    <i class="mock"><i></i><i></i><i></i></i><b>${esc(nm(th))}</b>${th.custom ? `<em data-delth="${th.id}" title="${esc(t('delete'))}">×</em>` : ''}</button>`).join('');
  renderThemeBuilder();
}
function renderThemeBuilder() {
  const el = $('#thBuild'); if (!el) return;
  const c = (k, l) => `<label class="thc"><input type="color" data-thk="${k}" value="${thDraft[k]}"><span>${t(l)}</span></label>`;
  el.innerHTML = `<div class="chips"><button class="chip${thDraft.base === 'dark' ? ' on' : ''}" data-thbase="dark">${t('thDark')}</button><button class="chip${thDraft.base === 'light' ? ' on' : ''}" data-thbase="light">${t('thLight')}</button></div>
    <div class="thcolors">${c('bg', 'thBg')}${c('panel', 'thPanel')}${c('fg', 'thText')}${c('accent', 'thAccent')}${c('accent2', 'thAccent2')}</div>
    <div class="saverow"><input id="thName" data-thk="name" placeholder="${esc(t('thName'))}" maxlength="24" value="${esc(thDraft.name)}"><button class="btn sm pri" id="thSave">${t('thSave')}</button></div>
    <p class="muted small">${t('thPreview')}</p>`;
}
let previewT = 0;
function themeBuilderInput(el) { thDraft[el.dataset.thk] = el.value; if (el.dataset.thk !== 'name') { clearTimeout(previewT); previewT = setTimeout(previewDraft, 40); } }
function previewDraft() { previewing = true; const th = THEMES.apply(Object.assign({ id: 'draft' }, thDraft)); palCache = null; F.bg = THEMES.visBg(th); F.bgLight = F.bg; }
function restoreThemeAfterPreview() { if (previewing) { previewing = false; applyTheme(S.theme); } }
function saveCustomTheme() {
  const name = (thDraft.name || '').trim() || (L() === 'fa' ? 'تم من ' : 'My theme ') + fmtN(customThemes().length + 1);
  const th = Object.assign({}, thDraft, { id: 'c-' + Date.now().toString(36), fa: name, en: name, custom: true }); delete th.name;
  store.set('themes', customThemes().concat(th)); previewing = false; S.theme = ''; set('theme', th.id); thDraft.name = ''; renderThemes(); toast(t('thSaved', { n: name }));
}

/* EQ curve */
const EQ_MIN = 20, EQ_MAX = 20000;
let eqFreqs = null, eqDrag = -1;
const eqX = (f, w) => Math.log(f / EQ_MIN) / Math.log(EQ_MAX / EQ_MIN) * w;
function drawEq(rebind) {
  const cv = $('#eqCanvas'); if (!cv) return;
  const r = cv.getBoundingClientRect(); if (!r.width) return;
  const dpr = devicePixelRatio || 1, W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
  if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const x = cv.getContext('2d'), cs = getComputedStyle(document.documentElement);
  const acc = cs.getPropertyValue('--accent').trim(), acc2 = cs.getPropertyValue('--accent-2').trim() || acc, fg = cs.getPropertyValue('--fg').trim(), line = cs.getPropertyValue('--line').trim();
  x.clearRect(0, 0, W, H);
  const yOf = db => H / 2 - db / 15 * (H / 2 - 14 * dpr);
  x.strokeStyle = line; x.lineWidth = dpr; x.font = `${10 * dpr}px JetBrains Mono, monospace`; x.fillStyle = fg;
  for (const db of [-12, -6, 0, 6, 12]) { const y = yOf(db); x.globalAlpha = db === 0 ? 1 : .6; x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); x.globalAlpha = .5; x.fillText((db > 0 ? '+' : '') + db, 4 * dpr, y - 3 * dpr); }
  x.globalAlpha = 1;
  if (playing && freq) {
    x.fillStyle = acc; x.globalAlpha = .14; x.beginPath(); x.moveTo(0, H);
    for (let i = 0; i < 96; i++) { const f = EQ_MIN * Math.pow(EQ_MAX / EQ_MIN, i / 95), bn = clamp(Math.round(f / binHz), 1, freq.length - 1); x.lineTo(eqX(f, W), H - freq[bn] / 255 * H * .9); }
    x.lineTo(W, H); x.fill(); x.globalAlpha = 1;
  }
  if (!eqFreqs) { eqFreqs = new Float32Array(160); for (let i = 0; i < 160; i++) eqFreqs[i] = EQ_MIN * Math.pow(EQ_MAX / EQ_MIN, i / 159); }
  const resp = fx.eqResponse(eqFreqs);
  const grad = x.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, acc2); grad.addColorStop(1, acc);
  x.beginPath(); for (let i = 0; i < 160; i++) { const px = eqX(eqFreqs[i], W), py = yOf(S.eqOn ? resp[i] : 0); i ? x.lineTo(px, py) : x.moveTo(px, py); }
  x.strokeStyle = grad; x.lineWidth = 3 * dpr; x.shadowColor = acc; x.shadowBlur = 14 * dpr; x.stroke(); x.shadowBlur = 0;
  x.lineTo(W, H / 2); x.lineTo(0, H / 2); x.closePath(); x.fillStyle = acc; x.globalAlpha = .1; x.fill(); x.globalAlpha = 1;
  EQ_FREQS.forEach((f, i) => { const px = eqX(f, W), py = yOf(S.eq[i]); x.beginPath(); x.arc(px, py, (eqDrag === i ? 9 : 7) * dpr, 0, Math.PI * 2); x.fillStyle = eqDrag === i ? acc : fg; x.fill(); x.lineWidth = 3 * dpr; x.strokeStyle = acc; x.stroke(); });
  const lab = $('#eqLabels');
  if (lab && (rebind || !lab.childElementCount)) lab.innerHTML = EQ_FREQS.map((f, i) => `<span style="left:${(eqX(f, W) / W * 100).toFixed(2)}%"><b id="eqv-${i}"></b>${f >= 1000 ? f / 1000 + 'k' : f}</span>`).join('');
  EQ_FREQS.forEach((f, i) => { const bv = $('#eqv-' + i); if (bv) bv.textContent = (S.eq[i] > 0 ? '+' : '') + (+S.eq[i].toFixed(1)); });
}
const nearestBand = (cv, clientX) => { const r = cv.getBoundingClientRect(), xx = clientX - r.left; let best = 0, bd = 1e9; EQ_FREQS.forEach((f, i) => { const d = Math.abs(eqX(f, r.width) - xx); if (d < bd) { bd = d; best = i; } }); return best; };
document.addEventListener('pointerdown', e => { const cv = e.target.closest('#eqCanvas'); if (!cv) return; eqDrag = nearestBand(cv, e.clientX); cv.setPointerCapture(e.pointerId); eqMove(e); });
function eqMove(e) {
  if (eqDrag < 0) return; const cv = $('#eqCanvas'); if (!cv) return; const r = cv.getBoundingClientRect();
  S.eq[eqDrag] = clamp(Math.round((r.height / 2 - (e.clientY - r.top)) / (r.height / 2 - 14) * 15 * 2) / 2, -15, 15); applyEq(); drawEq(); persist();
}
document.addEventListener('pointermove', eqMove);
document.addEventListener('pointerup', () => { if (eqDrag >= 0) { eqDrag = -1; drawEq(); syncControls(); } });
document.addEventListener('dblclick', e => { const cv = e.target.closest('#eqCanvas'); if (!cv) return; S.eq[nearestBand(cv, e.clientX)] = 0; applyEq(); drawEq(); persist(); syncControls(); });

/* presets */
const allPresets = () => PRESETS.concat(store.get('presets', []).map(p => Object.assign({ cat: 'mine', mine: true }, p)));
function presetGrad(s) {
  const id = s.palette || S.palette;
  const cols = id === 'rainbow' ? [[255, 90, 120], [255, 200, 80], [90, 240, 140], [100, 160, 255]] : paletteRGB(id);
  return `linear-gradient(135deg,${cols.map((c, i) => `rgb(${c.map(Math.round)}) ${i * 33}%`).join(',')})`;
}
function renderPresets() {
  const el = $('#plist'); if (!el) return;
  const q = (($('#pq') && $('#pq').value) || '').trim().toLowerCase();
  let mi = -1;
  el.innerHTML = allPresets().map((p, i) => {
    if (p.mine) mi++;
    if (pcat !== 'all' && p.cat !== pcat) return '';
    if (q && !(p.n.fa + ' ' + p.n.en).toLowerCase().includes(q)) return '';
    const m = MODES.find(x => x[0] === p.s.mode), ly = LyricsView.styles.find(x => x[0] === p.s.lyrStyle);
    return `<button class="preset" data-preset="${i}"><i style="background:${presetGrad(p.s)}"><span class="pm">${m ? esc(L() === 'fa' ? m[1] : m[2]) : t('perfPreset')}</span></i><b>${esc(nm(p.n))}</b><span>${ly ? esc(L() === 'fa' ? ly[1] : ly[2]) : ''}</span>${p.mine ? `<em data-delp="${mi}">×</em>` : ''}</button>`;
  }).join('') || `<p class="muted">${t('pNone')}</p>`;
}
const PRESET_KEYS = ['mode', 'palette', 'bars', 'sensitivity', 'beatSens', 'rotate', 'mirror', 'showCover', 'spinCover', 'glow', 'flash', 'trail', 'warpZoom', 'twist', 'zoom', 'shake', 'shakeAmt', 'ca', 'particleAmt', 'dust', 'backdrop', 'vignette', 'grain', 'lyrStyle', 'lyrPos', 'lyrDir', 'lyrSize', 'lyrColor', 'lyrFont'];
function applyPreset(p) { Object.entries(p).forEach(([k, v]) => { if (k === 'mode') setMode(v, true); else { S[k] = Array.isArray(v) ? v.slice() : v; applyKey(k); } }); persist(); syncControls(); }
function randomPreset() { const arr = allPresets().filter(p => p.cat !== 'perf'); const p = arr[(Math.random() * arr.length) | 0]; applyPreset(p.s); toast(t('pApplied', { n: nm(p.n) }), 1500); }
function savePreset() {
  const inp = $('#pname'), u = store.get('presets', []), name = inp.value.trim() || (L() === 'fa' ? 'پریست ' : 'Preset ') + fmtN(u.length + 1);
  const s = {}; PRESET_KEYS.forEach(k => { s[k] = S[k]; });
  u.unshift({ id: 'u' + Date.now(), n: { fa: name, en: name }, s }); store.set('presets', u.slice(0, 60)); inp.value = ''; pcat = 'mine';
  $$('#pcats .chip').forEach(c => c.classList.toggle('on', c.dataset.pc === 'mine')); renderPresets(); toast(t('pSaved', { n: name }));
}
let cycleT = 0;
function setupCycle() { clearInterval(cycleT); if (S.autoCycle > 0) cycleT = setInterval(() => { if (playing) randomPreset(); }, S.autoCycle * 1000); }
audio.addEventListener('play', () => { if (S.autoCycle === -1 && audio.currentTime < 1) randomPreset(); });

/* modes rail */
const modesEl = $('#modes');
function buildModes() {
  modesEl.innerHTML = '<span class="ind"></span>' + MODES.map(([id, fa, en], i) => `<button data-mode="${id}" title="${esc(L() === 'fa' ? fa : en)}${i < 9 ? ' (' + (i + 1) + ')' : ''}">${esc(L() === 'fa' ? fa : en)}</button>`).join('');
  renderModes();
}
modesEl.addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode); });
function renderModes() {
  const on = modesEl.querySelector(`[data-mode="${S.mode}"]`);
  $$('[data-mode]', modesEl).forEach(b => b.classList.toggle('on', b === on));
  if (!on) return;
  const ind = modesEl.querySelector('.ind'); ind.style.width = on.offsetWidth + 'px'; ind.style.transform = `translateX(${on.offsetLeft}px)`;
  modesEl.scrollTo({ left: on.offsetLeft - modesEl.clientWidth / 2 + on.offsetWidth / 2, behavior: 'smooth' });
}
function setMode(id, quiet) {
  if (S.mode === id) return;
  set('mode', id); syncControls();
  if (!quiet) { const m = MODES.find(x => x[0] === id), sp = $('#splash'); sp.textContent = L() === 'fa' ? m[1] : m[2]; sp.classList.remove('go'); void sp.offsetWidth; sp.classList.add('go'); }
}
window.addEventListener('resize', renderModes);

/* ================= hotkeys (only while Nava's window is focused) ================= */
const ACTIONS = [
  ['toggle', 'kToggle', 'Space'], ['next', 'kNext', 'Shift+ArrowRight'], ['prev', 'kPrev', 'Shift+ArrowLeft'], ['fwd', 'kFwd', 'ArrowRight'], ['back', 'kBack', 'ArrowLeft'],
  ['volUp', 'kVolUp', 'ArrowUp'], ['volDown', 'kVolDown', 'ArrowDown'], ['mute', 'kMute', 'KeyM'], ['mode', 'kMode', 'KeyV'], ['palette', 'kPalette', 'KeyC'], ['random', 'kRandom', 'KeyR'],
  ['lyrics', 'kLyrics', 'KeyL'], ['lyrStyle', 'kLyrStyle', 'KeyK'], ['stage', 'kStage', 'KeyH'], ['full', 'kFull', 'KeyF'], ['side', 'kSide', 'KeyB'], ['theme', 'kTheme', 'KeyT'],
  ['fav', 'kFav', 'KeyJ'], ['eq', 'kEq', 'KeyE'], ['link', 'kLink', 'Ctrl+KeyL'], ['search', 'kSearch', 'Ctrl+KeyF']
];
const bindOf = a => (S.keymap && S.keymap[a[0]]) || a[2];
const comboOf = e => (e.ctrlKey || e.metaKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + (e.shiftKey ? 'Shift+' : '') + e.code;
const prettyKey = c => c.split('+').map(p => p.replace(/^Key/, '').replace(/^Digit/, '').replace('ArrowRight', '→').replace('ArrowLeft', '←').replace('ArrowUp', '↑').replace('ArrowDown', '↓')).map(p => `<kbd>${esc(p)}</kbd>`).join('+');
function renderKeys() { const el = $('#keyList'); if (!el) return; el.innerHTML = ACTIONS.map(a => `<span>${t(a[1])}</span><button class="kbind" data-bind="${a[0]}">${prettyKey(bindOf(a))}</button>`).join(''); }
let rebinding = null;
function startRebind(btn) { if (rebinding) rebinding.classList.remove('wait'); rebinding = btn; btn.classList.add('wait'); btn.textContent = t('keyPress'); }
window.addEventListener('keydown', e => {
  if (!rebinding) return;
  e.preventDefault(); e.stopPropagation();
  if (['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(e.code)) return;
  const id = rebinding.dataset.bind, combo = e.code === 'Escape' ? null : comboOf(e);
  if (combo) { const clash = ACTIONS.find(a => a[0] !== id && bindOf(a) === combo); if (clash) toast(t('keyTaken', { n: t(clash[1]) })); else { S.keymap = Object.assign({}, S.keymap, { [id]: combo }); persist(); } }
  rebinding.classList.remove('wait'); rebinding = null; renderKeys();
}, true);
function runAction(id) {
  switch (id) {
    case 'toggle': toggle(); break; case 'next': next(); break; case 'prev': prev(); break;
    case 'fwd': if (audio.duration) audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); break;
    case 'back': audio.currentTime = Math.max(0, audio.currentTime - 5); break;
    case 'volUp': S.volume = clamp(+(S.volume + .05).toFixed(2), 0, volMax()); S.muted = false; applyVolume(); persist(); toast(t('vol', { n: fmtN(Math.round(S.volume * 100)) }), 800); break;
    case 'volDown': S.volume = clamp(+(S.volume - .05).toFixed(2), 0, volMax()); applyVolume(); persist(); toast(t('vol', { n: fmtN(Math.round(S.volume * 100)) }), 800); break;
    case 'mute': S.muted = !S.muted; applyVolume(); persist(); toast(S.muted ? t('muted') : t('unmuted'), 900); break;
    case 'mode': { const i = MODES.findIndex(m => m[0] === S.mode); setMode(MODES[(i + 1) % MODES.length][0]); break; }
    case 'palette': { const i = PALETTES.findIndex(p => p[0] === S.palette), p = PALETTES[(i + 1) % PALETTES.length]; set('palette', p[0]); syncControls(); toast(t('palette', { n: L() === 'fa' ? p[1] : p[2] }), 1000); break; }
    case 'random': randomPreset(); break;
    case 'lyrics': $('#btnLyr').click(); break;
    case 'lyrStyle': { const st = LyricsView.styles, i = st.findIndex(s => s[0] === S.lyrStyle), n = st[(i + 1) % st.length]; set('lyrStyle', n[0]); syncControls(); toast(t('lyrStyleT', { n: L() === 'fa' ? n[1] : n[2] }), 1000); break; }
    case 'stage': toggleStage(); break; case 'full': api.win.fullscreen(); break; case 'side': $('#btnSide').click(); break; case 'theme': $('#btnTheme').click(); break;
    case 'fav': toggleFav(); break; case 'eq': openDrawer('playSet', 'eq'); break; case 'link': linkDialog(); break;
    case 'search': if (!S.sideOpen) set('sideOpen', true); $('#q').focus(); break;
  }
}
window.addEventListener('keydown', e => {
  if (rebinding || $('#onb') || $('#coach')) return;
  const tg = e.target, combo = comboOf(e);
  if (e.key === 'Escape') {
    if (!modalEl.hidden) { closeModal(null); return; }
    if (!$('#lyrMenu').hidden) { $('#lyrMenu').hidden = true; return; }
    if (Object.values(drawers).some(d => d.classList.contains('open'))) { closeDrawers(); return; }
    if (document.body.classList.contains('stage')) { toggleStage(); return; }
    if (document.body.classList.contains('fs')) api.win.fullscreen();
    if (tg && tg.blur) tg.blur();
    return;
  }
  if (!modalEl.hidden) return;
  const typing = tg && ((tg.tagName === 'INPUT' && /text|search|color|url/.test(tg.type)) || tg.tagName === 'SELECT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable);
  const act = ACTIONS.find(a => bindOf(a) === combo);
  if (typing && !(act && combo.startsWith('Ctrl+'))) return;
  if (act) {
    if (act[0] === 'toggle' && tg && tg.tagName === 'BUTTON') return;
    if (/Arrow/.test(combo) && tg && tg.type === 'range') return;
    e.preventDefault(); runAction(act[0]); return;
  }
  if (!e.ctrlKey && !e.altKey && !e.shiftKey && /^Digit[1-9]$/.test(e.code)) setMode(MODES[+e.code.slice(5) - 1][0]);
});

/* ================= transport & chrome ================= */
function applyTransport() { $('#btnShuffle').classList.toggle('on', S.shuffle); $('#btnRepeat').classList.toggle('on', S.repeat !== 'off'); $('#repBadge').hidden = S.repeat !== 'one'; $('#btnLyr').classList.toggle('on', S.lyrOn); }
$('#btnPlay').addEventListener('click', toggle);
$('#btnNext').addEventListener('click', () => next());
$('#btnPrev').addEventListener('click', prev);
$('#btnFav').addEventListener('click', toggleFav);
$('#btnShuffle').addEventListener('click', () => { S.shuffle = !S.shuffle; persist(); applyTransport(); toast(S.shuffle ? t('shuffleOn') : t('shuffleOff')); });
$('#btnRepeat').addEventListener('click', () => { S.repeat = { off: 'all', all: 'one', one: 'off' }[S.repeat]; persist(); applyTransport(); toast(t({ off: 'repOff', all: 'repAll', one: 'repOne' }[S.repeat])); });
$('#btnMute').addEventListener('click', () => { S.muted = !S.muted; applyVolume(); persist(); });
$('#vol').addEventListener('input', e => { S.volume = parseFloat(e.target.value); S.muted = false; applyVolume(); persist(); });
$('#btnLyr').addEventListener('click', () => { set('lyrOn', !S.lyrOn); applyTransport(); syncControls(); toast(S.lyrOn ? t('lyrOn') : t('lyrOff'), 1200); });
$('#btnEq').addEventListener('click', () => openDrawer('playSet', 'eq'));
$('#btnPlaySet').addEventListener('click', () => openDrawer('playSet'));
$('#btnAppSet').addEventListener('click', () => openDrawer('appSet'));
$('#btnSide').addEventListener('click', () => set('sideOpen', !S.sideOpen));
$('#btnStage').addEventListener('click', toggleStage);
$('#btnExitStage').addEventListener('click', toggleStage);
$('#btnFull').addEventListener('click', () => api.win.fullscreen());
$('#btnLink').addEventListener('click', linkDialog);
$('#btnTheme').addEventListener('click', e => {
  const th = allThemes(), i = th.findIndex(x => x.id === S.theme), n = th[(i + 1) % th.length];
  const go = () => { set('theme', n.id); renderThemes(); };
  if (document.startViewTransition && !reduced && S.uiAnim) {
    const x = e.clientX || innerWidth - 200, y = e.clientY || 20, r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(go).ready.then(() => document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] }, { duration: 650, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
  } else go();
  toast(t('themeT', { n: nm(n) }), 1200);
});
document.addEventListener('click', e => { if (e.target.closest('[data-gh],[data-gh-link]') && !e.target.closest('#onb,#coach')) { e.preventDefault(); api.app.open(GITHUB); } });
$('#emptyAdd').addEventListener('click', () => api.lib.addFolder(t('tAddFolder')));
$('#emptyOpen').addEventListener('click', () => $('#btnOpenFiles').click());
$('#helloPlay').addEventListener('click', () => toggle());
$('#helloShuffle').addEventListener('click', () => { S.shuffle = true; persist(); applyTransport(); const l = tracks.filter(x => !isShort(x)); if (l.length) { const i = (Math.random() * l.length) | 0; playTrack(l[i], { queue: l, index: i }); } });
function toggleStage() {
  const on = document.body.classList.toggle('stage');
  $('#btnStage').classList.toggle('on', on);
  if (on) { closeDrawers(); toast(t('stageOn')); }
  setTimeout(renderModes, 450); scheduleIdle();
}
let idleT = 0;
function scheduleIdle() { document.body.classList.remove('idle'); clearTimeout(idleT); if (!document.body.classList.contains('stage') || !S.autoHide) return; idleT = setTimeout(() => document.body.classList.add('idle'), 2000); }
['pointermove', 'pointerdown', 'keydown', 'wheel'].forEach(ev => window.addEventListener(ev, scheduleIdle, { passive: true }));
api.win.onFs(v => document.body.classList.toggle('fs', v));
const tipEl = $('#tip');
const fracOf = e => { const r = barEl.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); };
barEl.addEventListener('pointerdown', e => { if (!audio.duration || !isFinite(audio.duration)) return; seeking = true; barEl.classList.add('drag'); barEl.setPointerCapture(e.pointerId); seekFrac = fracOf(e); });
barEl.addEventListener('pointermove', e => { const f = fracOf(e); tipEl.style.left = f * 100 + '%'; tipEl.textContent = fmtTime(f * (audio.duration || 0)); if (seeking) seekFrac = f; });
const endSeek = () => { if (!seeking) return; seeking = false; barEl.classList.remove('drag'); if (audio.duration) { audio.currentTime = seekFrac * audio.duration; fadingOut = false; fx.setFade(1); } };
barEl.addEventListener('pointerup', endSeek); barEl.addEventListener('pointercancel', endSeek);
let dragN = 0; const dropEl = $('#drop');
window.addEventListener('dragenter', e => { if ([...e.dataTransfer.types].includes('Files')) { dragN++; dropEl.classList.add('show'); } });
window.addEventListener('dragleave', () => { dragN = Math.max(0, dragN - 1); if (!dragN) dropEl.classList.remove('show'); });
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', async e => {
  e.preventDefault(); dragN = 0; dropEl.classList.remove('show');
  const paths = [...e.dataTransfer.files].map(f => api.pathOf(f)).filter(Boolean);
  if (!paths.length) { const txt = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain'); if (txt) openLink(txt, store.get('linkViz', true)); return; }
  toast(t('adding'), 1200);
  const ts = await api.lib.addPaths(paths);
  if (ts.length) { toast(t('added', { n: fmtN(ts.length) })); playTrack(ts[0], { manual: true, queue: ts, index: 0 }); } else toast(t('noAudio'));
});

/* ================= language ================= */
function setLanguage(l) {
  I18N.setLang(l); S.lang = I18N.lang;
  buildSettings(); buildModes(); renderSide(); renderScan(); updateEmpty();
  if (cur) setNow(cur); else { $('#mTitle').textContent = t('noneSelected'); $('#mArtist').textContent = t('pickOne'); }
  if (pill.dataset.state) setPill(pill.dataset.state, pill._extra);
  applyVolume();
  api.app.tray({ show: t('trayShow'), play: t('kToggle'), next: t('kNext'), prev: t('kPrev'), quit: t('closeQuit'), tip: 'Nava Player', trayHint: t('trayHint') });
}

/* ================= onboarding & tour ================= */
const tourCtx = () => ({
  t, lang: () => L(), num: fmtN, setLang: l => set('lang', l), themes: () => THEMES.list, theme: () => S.theme, setTheme: id => set('theme', id),
  defaultLyricsDir: () => appCfg.lyricsDir, chooseLyricsDir: async () => { const r = await api.lyrics.chooseDir(t('lyrChoose')); if (!r.canceled) appCfg.lyricsDir = r.lyricsDir; return r; },
  setLyrics: async c => { if (c === 'default') { appCfg.lyricsDir = await api.lyrics.setDefaultDir(); appCfg.lyricsMode = await api.app.setCfg('lyricsMode', 'folder'); } else if (c === 'beside') appCfg.lyricsMode = await api.app.setCfg('lyricsMode', 'beside'); },
  renderAi: el => { el.classList.add('ai-box'); el.dataset.compact = '1'; renderAiInto(el, true); }, openGithub: () => api.app.open(GITHUB)
});
const TOUR = [
  { sel: '#side', title: 'tour1T', text: 'tour1' }, { sel: '#searchBox', title: 'tour2T', text: 'tour2' }, { sel: '.dock .center', title: 'tour3T', text: 'tour3' },
  { sel: '#modes', title: 'tour4T', text: 'tour4' }, { sel: '#btnLyr', title: 'tour5T', text: 'tour5' }, { sel: '#btnPlaySet', title: 'tour6T', text: 'tour6' },
  { sel: '#btnLink', title: 'tour7T', text: 'tour7' }, { sel: '#btnAppSet', title: 'tour8T', text: 'tour8' }, { sel: '#btnStage', title: 'tour9T', text: 'tour9' },
  { sel: null, title: 'tourDoneT', text: 'tourDone', gh: true }
];
async function runTour() {
  closeDrawers(); if (document.body.classList.contains('stage')) toggleStage();
  if (!S.sideOpen) set('sideOpen', true);
  await new Promise(r => setTimeout(r, 480));
  await NavaTour.coach(TOUR, tourCtx());
  S.tourDone = true; persist();
}
async function firstRun() {
  await NavaTour.onboard(tourCtx());
  S.onboarded = true; persist();
  await runTour();
}

/* ================= boot ================= */
window.__nava = { audioTime: () => audio.currentTime, lyr, S, get cur() { return cur; }, runAction, openDrawer, closeDrawers, playTrack, get tracks() { return tracks; }, linkDialog, setBooster, I18N, runTour };
(async () => {
  status(null, 20);
  I18N.setLang(S.lang);
  try { appCfg = await api.app.getCfg(); } catch (e) {}
  applyTheme(S.theme);
  buildSettings(); buildModes(); applyAll(); syncControls(); setMediaKeys(); lyrOpts();
  $('#mTitle').textContent = t('noneSelected'); $('#mArtist').textContent = t('pickOne');
  api.app.tray({ show: t('trayShow'), play: t('kToggle'), next: t('kNext'), prev: t('kPrev'), quit: t('closeQuit'), tip: 'Nava Player', trayHint: t('trayHint') });
  requestAnimationFrame(frame);
  status(null, 55);
  const r = await api.lib.get();
  libCfg = { folders: r.folders, allDrives: r.allDrives };
  setLibrary(r.tracks);
  const last = store.get('last', null);
  if (last && byPath.has(last.path)) { const tr = byPath.get(last.path), l = computeList(), i = l.findIndex(x => x.path === tr.path); playTrack(tr, { queue: l, index: Math.max(0, i), paused: true, at: last.at || 0 }); }
  status(null, 85);
  try { await Promise.race([document.fonts.ready, new Promise(r2 => setTimeout(r2, 1500))]); } catch (e) {}
  renderModes();
  document.body.classList.remove('booting');
  api.app.ready();
  aiStatus();
  setTimeout(() => { if (!S.onboarded) firstRun(); else if (S.welcome) showWelcome(); }, 500);
})();
})();
