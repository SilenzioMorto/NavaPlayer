'use strict';
/* Nava Player — UI themes. Copyright (c) 2026 Silenzio Morto. All rights reserved. */
(function () {
// base: dark|light; colors feed CSS tokens; vis = [r,g,b] background for the GPU stage
const THEMES = [
  { id: 'nava', fa: 'نوا لیمویی', en: 'Nava Lime', base: 'dark', bg: '#050906', panel: '#0A120C', fg: '#E9F6E8', accent: '#86EF6C', accent2: '#3EE5D0' },
  { id: 'daylight', fa: 'روز روشن', en: 'Daylight', base: 'light', bg: '#F3F8F1', panel: '#FCFEFB', fg: '#0C190E', accent: '#3FBF4A', accent2: '#16A3A0' },
  { id: 'midnight', fa: 'نیمه‌شب', en: 'Midnight', base: 'dark', bg: '#060814', panel: '#0C1022', fg: '#E6EAFF', accent: '#7C9CFF', accent2: '#C08BFF' },
  { id: 'sakura', fa: 'ساکورا', en: 'Sakura', base: 'dark', bg: '#140B12', panel: '#1E121C', fg: '#FFEAF3', accent: '#FF7EB8', accent2: '#FFB08A', accent3: '#B9A3FF', accent4: '#7FE3C4' },
  { id: 'ember', fa: 'اخگر', en: 'Ember', base: 'dark', bg: '#0D0807', panel: '#18100D', fg: '#FFEDE4', accent: '#FF8A3D', accent2: '#FF4D5E' },
  { id: 'glacier', fa: 'یخچال', en: 'Glacier', base: 'light', bg: '#EEF5FA', panel: '#FBFDFF', fg: '#0B1A26', accent: '#2C8BEA', accent2: '#21C7C1' }
];
const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const toHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
function tokens(th) {
  const dark = th.base !== 'light';
  const bg = hex(th.bg), panel = hex(th.panel), fg = hex(th.fg), ac = hex(th.accent), ac2 = hex(th.accent2 || th.accent);
  const onAccent = lum(ac) > .45 ? mixc(ac, [0, 0, 0], .82) : [255, 255, 255];
  const ink = dark ? ac : (lum(ac) > .3 ? mixc(ac, [0, 0, 0], .45) : ac);
  return {
    '--bg': th.bg, '--bg-2': toHex(mixc(bg, fg, dark ? .05 : .05)), '--panel': th.panel, '--panel-2': toHex(mixc(panel, fg, dark ? .045 : .035)),
    '--fg': th.fg, '--muted': toHex(mixc(fg, bg, dark ? .42 : .45)), '--line': `rgba(${fg.join(',')},${dark ? .1 : .12})`,
    '--accent': th.accent, '--accent-2': th.accent2 || th.accent, '--accent-3': th.accent3 || th.accent2 || th.accent, '--accent-4': th.accent4 || th.accent,
    '--accent-ink': toHex(ink), '--on-accent': toHex(onAccent),
    '--shadow': dark ? '0 24px 60px -24px rgba(0,0,0,.85)' : '0 22px 60px -26px rgba(20,40,60,.3)'
  };
}
function apply(th) {
  const root = document.documentElement, tk = tokens(th);
  for (const k in tk) root.style.setProperty(k, tk[k]);
  root.dataset.theme = th.base === 'light' ? 'light' : 'dark';
  root.dataset.themeId = th.id;
  return th;
}
function visBg(th) { const c = hex(th.bg); return [c[0] / 255, c[1] / 255, c[2] / 255]; }
function palette(th) {
  const a = hex(th.accent), b = hex(th.accent2 || th.accent), c = hex(th.accent3 || th.accent2 || th.accent), d = hex(th.accent4 || th.fg);
  return [mixc(a, [0, 0, 0], .35), a, th.accent3 ? c : mixc(a, b, .5), th.accent4 ? d : b];
}
window.THEMES = { list: THEMES, apply, tokens, visBg, palette, hex, toHex };
})();
