'use strict';
/* Nava Player — visual modes, palettes and presets. Copyright (c) 2026 Silenzio Morto. All rights reserved. */
(function () {
const MODES = [
  ['halo', 'هاله', 'Halo'], ['spectrum', 'طیف', 'Spectrum'], ['nebula', 'سحابی', 'Nebula'], ['liquid', 'مایع', 'Liquid'], ['tunnel', 'تونل', 'Tunnel'],
  ['orbit', 'مدار', 'Orbit'], ['scope', 'نوسان', 'Scope'], ['skyline', 'برج‌ها', 'Skyline'], ['kaleido', 'کالیدوسکوپ', 'Kaleido'], ['aurora', 'شفق', 'Aurora'],
  ['warp', 'سفر نور', 'Warp'], ['ripple', 'موج آب', 'Ripple'], ['spiral', 'کهکشان', 'Galaxy'], ['horizon', 'افق', 'Horizon'], ['blackhole', 'سیاه‌چاله', 'Black hole'], ['prism', 'منشور', 'Prism']
];
// four stops, low -> high. 'theme', 'accent', 'duo', 'rainbow', 'cover' are computed at runtime.
const PALETTES = [
  ['theme', 'رنگ تم', 'Theme', null], ['accent', 'تک‌رنگ', 'Mono', null], ['duo', 'دوتایی', 'Duo', null], ['rainbow', 'رنگین‌کمان', 'Rainbow', null], ['cover', 'از کاور', 'From cover', null],
  ['aurora', 'شفق', 'Aurora', ['#1f8a5a', '#86ef6c', '#3ee5d0', '#a592ff']],
  ['sakura', 'ساکورا', 'Sakura', ['#7b3fa0', '#ff7eb8', '#ffb08a', '#7fe3c4']],
  ['sunset', 'غروب', 'Sunset', ['#6a3093', '#ff5f6d', '#ffc371', '#fff1d6']],
  ['ocean', 'اقیانوس', 'Ocean', ['#0b3d91', '#0072ff', '#00c6ff', '#e0f7ff']],
  ['fire', 'آتش', 'Fire', ['#7a0000', '#ff2a00', '#ff9500', '#fff3b0']],
  ['ice', 'یخ', 'Ice', ['#4b6cb7', '#7fd8ff', '#c3ecff', '#ffffff']],
  ['candy', 'آبنبات', 'Candy', ['#a592ff', '#ff7eb8', '#7fd8ff', '#ffe17f']],
  ['matrix', 'ماتریکس', 'Matrix', ['#003b00', '#00b32c', '#00ff41', '#d8ffe0']],
  ['gold', 'طلایی', 'Gold', ['#5c3a00', '#c98a1b', '#ffcf5c', '#fff7e0']],
  ['vapor', 'ویپر', 'Vapor', ['#b967ff', '#ff71ce', '#01cdfe', '#05ffa1']],
  ['mono', 'سیاه‌وسفید', 'Monochrome', ['#555a56', '#a9b0aa', '#e6ebe6', '#ffffff']],
  ['toxic', 'سمّی', 'Toxic', ['#3ee5d0', '#86ef6c', '#d4ff4a', '#fbffd1']],
  ['ruby', 'یاقوت', 'Ruby', ['#3d0010', '#b0002a', '#ff3b5c', '#ffd1da']],
  ['forest', 'جنگل', 'Forest', ['#0b3d20', '#2f9e44', '#9be15d', '#e9ffd6']],
  ['lavender', 'اسطوخودوس', 'Lavender', ['#3b2a6b', '#8f7cff', '#c9b8ff', '#fff0fb']],
  ['citrus', 'مرکبات', 'Citrus', ['#ff6a00', '#ffb300', '#c6ff00', '#fffde0']],
  ['deepsea', 'اعماق', 'Deep sea', ['#001b2e', '#00507a', '#00b4d8', '#90f1ef']]
];
const P = (id, fa, en, cat, s) => ({ id, n: { fa, en }, cat, s });
// 40 hand-tuned looks. Each sets visuals, effects and a matching lyrics animation.
const PRESETS = [
  P('club', 'باشگاه شبانه', 'Night Club', 'energy', { mode: 'halo', palette: 'aurora', glow: .9, trail: .55, warpZoom: .006, twist: 0, shake: true, shakeAmt: .8, zoom: true, ca: .7, sensitivity: 1.35, bars: 128, rotate: .5, dust: true, lyrStyle: 'neon' }),
  P('concert', 'کنسرت', 'Concert', 'energy', { mode: 'nebula', palette: 'cover', glow: .85, trail: .6, warpZoom: .004, twist: 0, shake: true, shakeAmt: .5, zoom: true, dust: true, ca: .4, lyrStyle: 'fly3d' }),
  P('calm', 'آرامش', 'Serenity', 'calm', { mode: 'liquid', palette: 'theme', glow: .55, trail: .45, warpZoom: 0, twist: 0, shake: false, zoom: false, ca: 0, rotate: .15, sensitivity: 1, lyrStyle: 'blur' }),
  P('neontunnel', 'تونل نئون', 'Neon Tunnel', 'energy', { mode: 'tunnel', palette: 'vapor', glow: 1, trail: .7, warpZoom: .01, twist: 0, shake: true, shakeAmt: .4, ca: .8, rotate: .8, sensitivity: 1.3, lyrStyle: 'neon' }),
  P('retroled', 'رترو LED', 'Retro LED', 'retro', { mode: 'skyline', palette: 'duo', glow: .6, trail: .15, warpZoom: 0, twist: 0, shake: false, zoom: false, dust: false, grain: .5, lyrStyle: 'typewriter' }),
  P('minimal', 'مینیمال', 'Minimal', 'minimal', { mode: 'spectrum', palette: 'theme', glow: .25, trail: 0, warpZoom: 0, twist: 0, shake: false, zoom: false, dust: false, grain: 0, vignette: 0, ca: 0, backdrop: 0, lyrStyle: 'scroll' }),
  P('kaleicover', 'کالیدوسکوپ کاور', 'Cover Kaleidoscope', 'cover', { mode: 'kaleido', palette: 'cover', glow: .8, trail: .5, warpZoom: .003, twist: .004, rotate: .4, shake: false, lyrStyle: 'stagger' }),
  P('northern', 'شفق قطبی', 'Northern Lights', 'calm', { mode: 'aurora', palette: 'aurora', glow: .75, trail: .5, warpZoom: 0, twist: 0, shake: false, zoom: false, dust: true, lyrStyle: 'slide' }),
  P('hyperspace', 'هایپراسپیس', 'Hyperspace', 'energy', { mode: 'warp', palette: 'ice', glow: .9, trail: .75, warpZoom: .015, twist: 0, shake: true, shakeAmt: .5, ca: .9, lyrStyle: 'fly3d' }),
  P('raindrop', 'قطره', 'Raindrop', 'calm', { mode: 'ripple', palette: 'ocean', glow: .6, trail: .3, warpZoom: 0, twist: 0, shake: false, zoom: true, lyrStyle: 'blur' }),
  P('galaxy', 'کهکشان', 'Galaxy', 'calm', { mode: 'spiral', palette: 'candy', glow: .85, trail: .6, warpZoom: 0, twist: .006, rotate: .3, shake: false, lyrStyle: 'wheel' }),
  P('synthwave', 'سینت‌ویو', 'Synthwave', 'retro', { mode: 'horizon', palette: 'vapor', glow: .9, trail: .25, warpZoom: 0, twist: 0, shake: false, zoom: true, grain: .6, lyrStyle: 'extrude3d' }),
  P('oscillo', 'اسیلوسکوپ', 'Oscilloscope', 'minimal', { mode: 'scope', palette: 'matrix', glow: .8, trail: .55, warpZoom: 0, twist: 0, shake: false, grain: .4, lyrStyle: 'typewriter' }),
  P('goldorbit', 'مدار طلایی', 'Golden Orbit', 'cover', { mode: 'orbit', palette: 'gold', glow: .75, trail: .4, warpZoom: 0, twist: 0, rotate: .45, shake: false, lyrStyle: 'karaoke' }),
  P('volcano', 'آتش‌فشان', 'Volcano', 'energy', { mode: 'halo', palette: 'fire', glow: 1, trail: .5, warpZoom: .012, twist: 0, shake: true, shakeAmt: 1, ca: .6, sensitivity: 1.5, bars: 160, lyrStyle: 'bounce' }),
  P('frost', 'یخبندان', 'Frost', 'calm', { mode: 'halo', palette: 'ice', glow: .7, trail: .65, warpZoom: 0, twist: 0, shake: false, rotate: .1, bars: 96, lyrStyle: 'scroll' }),
  P('matrix', 'ماتریکس', 'The Grid', 'retro', { mode: 'skyline', palette: 'matrix', glow: .8, trail: .3, warpZoom: 0, twist: 0, grain: .7, shake: false, lyrStyle: 'typewriter' }),
  P('candy', 'آبنبات', 'Candy Pop', 'energy', { mode: 'orbit', palette: 'candy', glow: .9, trail: .45, warpZoom: 0, twist: 0, rotate: .9, shake: true, shakeAmt: .4, lyrStyle: 'pop' }),
  P('rubytunnel', 'خون و نور', 'Ruby Rush', 'energy', { mode: 'tunnel', palette: 'ruby', glow: .95, trail: .6, warpZoom: .008, twist: 0, shake: true, shakeAmt: .7, ca: .6, lyrStyle: 'split' }),
  P('mistforest', 'جنگل مه‌آلود', 'Misty Forest', 'calm', { mode: 'liquid', palette: 'forest', glow: .6, trail: .5, warpZoom: 0, twist: 0, shake: false, dust: true, lyrStyle: 'wheel' }),
  P('infinity', 'اکوی بی‌نهایت', 'Infinite Echo', 'energy', { mode: 'halo', palette: 'rainbow', glow: .9, trail: .88, warpZoom: .02, twist: .01, shake: false, lyrStyle: 'neon' }),
  P('noir', 'سیاه و سفید', 'Noir', 'minimal', { mode: 'scope', palette: 'mono', glow: .4, trail: .2, warpZoom: 0, twist: 0, grain: .8, shake: false, ca: 0, lyrStyle: 'cinema' }),
  P('vinyl', 'صفحه گرام', 'Vinyl', 'cover', { mode: 'halo', palette: 'cover', glow: .65, trail: .25, warpZoom: 0, twist: 0, spinCover: true, showCover: true, bars: 192, rotate: .2, shake: false, lyrStyle: 'karaoke' }),
  P('beach', 'غروب ساحلی', 'Beach Sunset', 'calm', { mode: 'horizon', palette: 'sunset', glow: .8, trail: .3, warpZoom: 0, twist: 0, shake: false, lyrStyle: 'slide' }),
  P('neonmist', 'مه نئونی', 'Neon Mist', 'energy', { mode: 'nebula', palette: 'vapor', glow: 1, trail: .7, warpZoom: .007, twist: 0, ca: .7, shake: true, shakeAmt: .5, lyrStyle: 'stagger' }),
  P('lightdance', 'رقص نور', 'Light Dance', 'energy', { mode: 'kaleido', palette: 'rainbow', glow: 1, trail: .55, warpZoom: 0, twist: .008, rotate: .9, shake: true, shakeAmt: .6, lyrStyle: 'bounce' }),
  P('purecover', 'کاور خالص', 'Pure Cover', 'cover', { mode: 'ripple', palette: 'cover', glow: .5, trail: .2, warpZoom: 0, twist: 0, backdrop: 1, shake: false, lyrStyle: 'blur' }),
  P('arcade', 'آرکید', 'Arcade', 'retro', { mode: 'spectrum', palette: 'candy', glow: .85, trail: .2, warpZoom: 0, twist: 0, grain: .6, shake: true, shakeAmt: .3, lyrStyle: 'pop' }),
  P('nightride', 'سفر شبانه', 'Night Ride', 'calm', { mode: 'warp', palette: 'aurora', glow: .7, trail: .6, warpZoom: .008, twist: 0, shake: false, lyrStyle: 'wheel' }),
  P('moltengold', 'طلای مذاب', 'Molten Gold', 'energy', { mode: 'spiral', palette: 'gold', glow: 1, trail: .55, warpZoom: 0, twist: .01, rotate: .6, shake: true, shakeAmt: .4, lyrStyle: 'extrude3d' }),
  P('eventhorizon', 'افق رویداد', 'Event Horizon', 'energy', { mode: 'blackhole', palette: 'fire', glow: 1, trail: .65, warpZoom: .006, twist: .004, rotate: .6, shake: true, shakeAmt: .5, ca: .7, lyrStyle: 'fly3d' }),
  P('voidcover', 'سیاه‌چاله‌ی کاور', 'Cover Singularity', 'cover', { mode: 'blackhole', palette: 'cover', glow: .85, trail: .5, warpZoom: .003, twist: 0, rotate: .4, shake: false, lyrStyle: 'cube3d' }),
  P('crystal', 'کریستال', 'Crystal', 'calm', { mode: 'prism', palette: 'ice', glow: .8, trail: .45, warpZoom: 0, twist: .003, rotate: .3, shake: false, lyrStyle: 'orbit3d' }),
  P('prismrave', 'منشور رقصان', 'Prism Rave', 'energy', { mode: 'prism', palette: 'vapor', glow: 1, trail: .55, warpZoom: .006, twist: .006, rotate: .9, shake: true, shakeAmt: .6, ca: .8, lyrStyle: 'cube3d' }),
  P('sakuradream', 'رویای ساکورا', 'Sakura Dream', 'calm', { mode: 'aurora', palette: 'sakura', glow: .8, trail: .55, warpZoom: 0, twist: 0, shake: false, dust: true, lyrStyle: 'orbit3d' }),
  P('sakurabloom', 'شکوفه‌ی صورتی', 'Pink Bloom', 'energy', { mode: 'halo', palette: 'sakura', glow: .9, trail: .5, warpZoom: .005, twist: 0, shake: true, shakeAmt: .5, ca: .5, bars: 144, lyrStyle: 'stagger' }),
  P('lavender', 'دشت اسطوخودوس', 'Lavender Fields', 'calm', { mode: 'liquid', palette: 'lavender', glow: .65, trail: .5, warpZoom: 0, twist: 0, shake: false, lyrStyle: 'extrude3d' }),
  P('citrus', 'انرژی مرکبات', 'Citrus Burst', 'energy', { mode: 'orbit', palette: 'citrus', glow: .9, trail: .35, warpZoom: 0, twist: 0, rotate: .7, shake: true, shakeAmt: .5, lyrStyle: 'bounce' }),
  P('abyss', 'اعماق اقیانوس', 'Abyss', 'calm', { mode: 'ripple', palette: 'deepsea', glow: .75, trail: .6, warpZoom: .004, twist: 0, shake: false, dust: true, lyrStyle: 'fly3d' }),
  P('lowpower', 'سبک و کم‌مصرف', 'Light & Efficient', 'perf', { fps: 30, quality: .6, glow: 0, trail: 0, warpZoom: 0, dust: false, grain: 0, fft: 1024, bars: 64, particleAmt: .4 })
];
const CATS = [['all', 'catAll'], ['energy', 'catEnergy'], ['calm', 'catCalm'], ['cover', 'catCover'], ['retro', 'catRetro'], ['minimal', 'catMinimal'], ['perf', 'catPerf'], ['mine', 'catMine']];
window.NAVA_DATA = { MODES, PALETTES, PRESETS, CATS };
})();
