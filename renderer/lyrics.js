'use strict';
/* Nava Player — lyrics view. Copyright (c) 2026 Silenzio Morto. All rights reserved.
   Data is produced at runtime by the on-device transcription of the user's own audio:
   { lang, lines: [{ t0, t1, text, words: [{ w, t0, t1 }] }] } */
(function () {
const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const LIST_STYLES = new Set(['wheel', 'scroll']);
const WORD_STYLES = new Set(['karaoke', 'pop', 'stagger', 'bounce', 'orbit3d']);
const STYLES = [
  ['wheel', 'چرخونه', 'Wheel'], ['scroll', 'لیست نرم', 'Smooth list'], ['karaoke', 'کارائوکه', 'Karaoke'], ['slide', 'اسلاید', 'Slide'], ['blur', 'محو و شفاف', 'Soft blur'],
  ['pop', 'کلمه به کلمه', 'Word by word'], ['stagger', 'پرواز کلمه‌ها', 'Flying words'], ['bounce', 'پرش کلمه', 'Bouncing word'], ['typewriter', 'ماشین تحریر', 'Typewriter'],
  ['neon', 'نئون', 'Neon'], ['cinema', 'زیرنویس سینمایی', 'Cinema subtitles'], ['split', 'ورق خوردن', 'Page flip'],
  ['extrude3d', 'برجسته‌ی سه‌بعدی', '3D Extrude'], ['fly3d', 'پرواز سه‌بعدی', '3D Fly-in'], ['cube3d', 'مکعب سه‌بعدی', '3D Cube'], ['orbit3d', 'مدار سه‌بعدی', '3D Orbit']
];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

class LyricsView {
  constructor(root) {
    this.root = root;
    this.pulse = document.createElement('div'); this.pulse.className = 'lyr-pulse';
    this.stage = document.createElement('div'); this.stage.className = 'lyr-stage';
    this.pulse.appendChild(this.stage); root.appendChild(this.pulse);
    this.data = null; this.style = 'wheel'; this.dir = 'down'; this.idx = -2; this.gap = false;
    this.cur = null; this.words = []; this.lastWordTick = 0;
  }
  static get styles() { return STYLES; }
  setOptions(o) {
    let rebuild = false;
    if (o.style && o.style !== this.style) { this.style = o.style; rebuild = true; }
    if (o.dir && o.dir !== this.dir) { this.dir = o.dir; rebuild = true; }
    this.root.dataset.pos = o.pos || 'bottom';
    this.root.dataset.color = o.color || 'accent';
    this.root.dataset.font = o.font || 'display';
    this.root.style.setProperty('--lyr-size', (o.size || 44) + 'px');
    this.root.classList.toggle('lyr-glow', !!o.glow);
    if (rebuild) this.build();
  }
  set(data) { this.data = data && data.lines && data.lines.length ? data : null; this.build(); }
  clear() { this.data = null; this.build(); }
  build() {
    this.stage.className = 'lyr-stage st-' + this.style + ' dir-' + this.dir + (/3d$/.test(this.style) ? ' is3d' : '');
    this.stage.innerHTML = ''; this.idx = -2; this.cur = null; this.words = []; this.list = null;
    this.root.classList.toggle('has-lyr', !!this.data);
    if (!this.data) return;
    if (LIST_STYLES.has(this.style)) {
      const inner = document.createElement('div'); inner.className = 'lyr-list';
      inner.innerHTML = this.data.lines.map((l, i) => `<div class="ln${RTL.test(l.text) ? ' rtl' : ''}" data-i="${i}" dir="auto">${esc(l.text)}</div>`).join('');
      this.stage.appendChild(inner); this.list = inner; this.lines = [...inner.children];
    }
  }
  find(t) {
    const L = this.data.lines; let lo = 0, hi = L.length - 1, r = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (L[m].t0 <= t) { r = m; lo = m + 1; } else hi = m - 1; }
    return r;
  }
  tick(t, energy) {
    this.pulse.style.transform = `scale(${(1 + energy * 0.035).toFixed(4)})`;
    if (!this.data) return;
    const L = this.data.lines, i = this.find(t + 0.12), line = L[i], next = L[i + 1];
    const gap = i < 0 || (line && t > line.t1 + 0.9 && (!next || next.t0 - t > 2.2));
    if (i !== this.idx) { this.idx = i; this.onLine(i); }
    if (gap !== this.gap) { this.gap = gap; this.stage.classList.toggle('gap', gap); }
    if (this.cur && this.words.length && Math.abs(t - this.lastWordTick) > 0.03) { this.lastWordTick = t; this.onWords(t, line); }
  }
  onLine(i) {
    if (LIST_STYLES.has(this.style)) return this.listLine(i);
    const L = this.data.lines, line = L[i], old = this.cur;
    if (old) { old.classList.add('out'); old.classList.remove('in'); setTimeout(() => old.remove(), 1000); }
    this.cur = null; this.words = [];
    if (!line) return;
    const el = document.createElement('div');
    el.className = 'one'; el.setAttribute('dir', 'auto');
    if (RTL.test(line.text)) el.classList.add('rtl');
    if (this.style === 'orbit3d') {
      const n = line.words.length, step = 360 / Math.max(n, 6), R = Math.max(2.2, n * 0.62);
      el.innerHTML = `<div class="ring3d" style="--R:${R}em">${line.words.map((w, k) => `<span class="w" style="--a:${(k * step * (el.classList.contains('rtl') ? -1 : 1)).toFixed(2)}deg">${esc(w.w)}</span>`).join('')}</div>`;
      this.words = [...el.querySelectorAll('.w')];
    } else if (WORD_STYLES.has(this.style)) {
      el.innerHTML = line.words.map((w, k) => {
        const r1 = ((k * 73) % 9) - 4, r2 = ((k * 37) % 7) - 3;
        return `<span class="w" style="--k:${k};--rx:${r1 * 14}px;--ry:${r2 * 18}px;--rr:${r1 * 6}deg">${esc(w.w)}</span>`;
      }).join(' ');
      this.words = [...el.querySelectorAll('.w')];
    } else if (this.style === 'typewriter') {
      el.innerHTML = '<span class="tw"></span><span class="caret"></span>'; this.tw = el.firstChild; this.words = [1];
    } else if (this.style === 'extrude3d') {
      el.innerHTML = `<span class="x3d" data-t="${esc(line.text)}">${esc(line.text)}</span>`;
    } else el.textContent = line.text;
    if (this.style === 'karaoke' && L[i + 1]) { const nx = document.createElement('div'); nx.className = 'next'; nx.setAttribute('dir', 'auto'); nx.textContent = L[i + 1].text; el.appendChild(nx); }
    this.stage.appendChild(el);
    void el.offsetWidth; el.classList.add('in');
    this.cur = el; this.lastWordTick = -1;
  }
  listLine(i) {
    const n = this.lines.length;
    if (this.style === 'wheel') {
      const step = 17, sign = this.dir === 'down' ? 1 : -1;
      for (let k = 0; k < n; k++) {
        const el = this.lines[k], d = k - i;
        if (Math.abs(d) > 6) { if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'; continue; }
        el.style.visibility = '';
        el.style.transform = `rotateX(${d * step * sign}deg) translateZ(var(--wr)) scale(${d === 0 ? 1.06 : 1})`;
        el.style.opacity = d === 0 ? 1 : Math.max(0, 0.5 - Math.abs(d) * 0.12);
        el.classList.toggle('on', d === 0);
      }
    } else {
      const el = this.lines[Math.max(0, i)]; if (!el) return;
      this.list.style.transform = `translateY(${-(el.offsetTop + el.offsetHeight / 2)}px)`;
      this.lines.forEach((x, k) => { x.classList.toggle('on', k === i); x.classList.toggle('past', k < i); x.classList.toggle('near', Math.abs(k - i) === 1); });
    }
  }
  onWords(t, line) {
    if (!line) return;
    if (this.style === 'typewriter') {
      const dur = Math.max(0.4, Math.min((line.t1 - line.t0) * 0.75, line.text.length * 0.06));
      const n = Math.round(Math.min(1, Math.max(0, (t - line.t0) / dur)) * line.text.length);
      if (this.tw.textContent.length !== n) this.tw.textContent = line.text.slice(0, n);
      return;
    }
    const ws = line.words;
    for (let k = 0; k < this.words.length; k++) {
      const w = ws[k], el = this.words[k]; if (!w) continue;
      const on = t >= w.t0 - 0.05, act = on && t < w.t1 + 0.05;
      if (on !== el._on) { el._on = on; el.classList.toggle('on', on); }
      if (act !== el._act) { el._act = act; el.classList.toggle('act', act); }
      if (this.style === 'karaoke') {
        const pv = Math.round(Math.max(0, Math.min(1, (t - w.t0) / Math.max(0.08, w.t1 - w.t0))) * 100);
        if (pv !== el._p) { el._p = pv; el.style.setProperty('--p', pv + '%'); }
      }
    }
    if (this.style === 'orbit3d') {
      let a = -1; for (let k = 0; k < ws.length; k++) if (t >= ws[k].t0 - 0.05) a = k;
      if (a !== this._orb && a >= 0) { this._orb = a; const ring = this.cur.firstChild; ring.style.setProperty('--turn', this.words[a].style.getPropertyValue('--a')); }
    }
  }
}
window.LyricsView = LyricsView;
})();
