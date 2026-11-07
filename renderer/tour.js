'use strict';
/* Nava Player — first-run onboarding + guided tour. Copyright (c) 2026 Silenzio Morto. All rights reserved. */
(function () {
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- onboarding wizard ---------- */
function onboard(ctx) {
  const { t } = ctx;
  return new Promise(resolve => {
    const root = document.createElement('div'); root.className = 'onb'; root.id = 'onb';
    document.body.appendChild(root);
    let step = 0, lyrChoice = 'default';
    const TOTAL = 4;
    const render = () => {
      const L = t;
      let body = '';
      if (step === 0) body = `
        <div class="onb-hero"><img src="logo.svg" alt=""><h1>${L('obWelcome')}</h1><p>${L('obLangQ')}</p></div>
        <div class="onb-langs">
          <button class="onb-card${ctx.lang() === 'fa' ? ' on' : ''}" data-lang="fa"><b>فارسی</b><span>Persian · راست به چپ</span></button>
          <button class="onb-card${ctx.lang() === 'en' ? ' on' : ''}" data-lang="en"><b>English</b><span>انگلیسی · Left to right</span></button>
        </div>`;
      if (step === 1) body = `
        <h2>${L('obThemeQ')}</h2><p class="muted">${L('obThemeHint')}</p>
        <div class="onb-themes">${ctx.themes().map(th => `<button class="onb-theme${ctx.theme() === th.id ? ' on' : ''}" data-theme="${th.id}" style="--tb:${th.bg};--tp:${th.panel};--tf:${th.fg};--ta:${th.accent};--ta2:${th.accent2 || th.accent}">
          <i class="mock"><i></i><i></i><i></i></i><b>${esc(ctx.lang() === 'fa' ? th.fa : th.en)}</b></button>`).join('')}</div>`;
      if (step === 2) body = `
        <h2>${L('obLyrQ')}</h2>
        <div class="onb-opts">
          <button class="onb-opt${lyrChoice === 'default' ? ' on' : ''}" data-lyr="default"><b>${L('obLyrDefault')}</b><span dir="ltr">${esc(ctx.defaultLyricsDir())}</span></button>
          <button class="onb-opt${lyrChoice === 'beside' ? ' on' : ''}" data-lyr="beside"><b>${L('obLyrBeside')}</b><span>${L('obLyrBesideD')}</span></button>
          <button class="onb-opt${lyrChoice === 'custom' ? ' on' : ''}" data-lyr="custom"><b>${L('obLyrCustom')}</b><span dir="ltr" id="onbCustom">${L('obLyrCustomD')}</span></button>
        </div>`;
      if (step === 3) body = `
        <h2>${L('obAiQ')}</h2><p class="muted">${L('obAiD')}</p>
        <div id="onbAi" class="onb-ai"></div>`;
      root.innerHTML = `<div class="onb-card-wrap" dir="${ctx.lang() === 'fa' ? 'rtl' : 'ltr'}">
        <div class="onb-top"><span class="onb-step">${L('obStep', { a: ctx.num(step + 1), b: ctx.num(TOTAL) })}</span><div class="onb-dots">${Array.from({ length: TOTAL }, (_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div></div>
        <div class="onb-body" key="${step}">${body}</div>
        <div class="onb-nav">${step > 0 ? `<button class="btn" data-nav="back">${L('back')}</button>` : '<span></span>'}
          <button class="btn pri" data-nav="next">${step === TOTAL - 1 ? L('obStart') : L('next')}</button></div>
        <div class="onb-foot">${L('madeBy')} <b>Silenzio Morto</b> · <a href="#" data-gh>github.com/SilenzioMorto</a></div></div>`;
      if (step === 3) ctx.renderAi($('#onbAi', root));
    };
    root.addEventListener('click', async e => {
      const b = e.target.closest('button,a'); if (!b) return;
      if (b.dataset.gh !== undefined) { e.preventDefault(); ctx.openGithub(); return; }
      if (b.dataset.lang) { ctx.setLang(b.dataset.lang); render(); return; }
      if (b.dataset.theme) { ctx.setTheme(b.dataset.theme); render(); return; }
      if (b.dataset.lyr) {
        lyrChoice = b.dataset.lyr;
        if (lyrChoice === 'custom') { const r = await ctx.chooseLyricsDir(); if (r && r.canceled) lyrChoice = 'default'; render(); if (r && !r.canceled) { const s = $('#onbCustom', root); if (s) s.textContent = r.lyricsDir; } return; }
        render(); return;
      }
      if (b.dataset.nav === 'back') { step = Math.max(0, step - 1); render(); return; }
      if (b.dataset.nav === 'next') {
        if (step === 2) await ctx.setLyrics(lyrChoice);
        if (step < TOTAL - 1) { step++; render(); return; }
        root.classList.add('out'); setTimeout(() => { root.remove(); resolve(); }, 450);
      }
    });
    render();
  });
}

/* ---------- coach marks ---------- */
function coach(steps, ctx) {
  const { t } = ctx;
  return new Promise(resolve => {
    const ov = document.createElement('div'); ov.className = 'coach'; ov.id = 'coach';
    ov.innerHTML = '<div class="coach-hole"></div><div class="coach-tip" role="dialog"></div>';
    document.body.appendChild(ov);
    const hole = ov.firstChild, tip = ov.lastChild;
    const usable = steps.filter(s => !s.sel || ((el) => el && el.getClientRects().length)($(s.sel)));
    let i = 0;
    const finish = () => { window.removeEventListener('resize', place); window.removeEventListener('keydown', key, true); ov.classList.add('out'); setTimeout(() => { ov.remove(); resolve(); }, 350); };
    const place = () => {
      const s = usable[i], el = s.sel ? $(s.sel) : null;
      const W = innerWidth, H = innerHeight;
      if (el) {
        const r = el.getBoundingClientRect(), pad = 8;
        Object.assign(hole.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px', opacity: 1 });
        const tw = Math.min(360, W - 32); tip.style.width = tw + 'px';
        const th = tip.offsetHeight;
        let x = r.left + r.width / 2 - tw / 2; x = Math.max(16, Math.min(W - tw - 16, x));
        let y = r.bottom + 18; if (y + th > H - 16) y = r.top - th - 18; if (y < 16) y = Math.max(16, Math.min(H - th - 16, r.top + r.height / 2 - th / 2));
        Object.assign(tip.style, { left: x + 'px', top: y + 'px' });
      } else {
        Object.assign(hole.style, { left: W / 2 + 'px', top: H / 2 + 'px', width: '0px', height: '0px', opacity: 0 });
        const tw = Math.min(420, W - 32); tip.style.width = tw + 'px';
        Object.assign(tip.style, { left: (W - tw) / 2 + 'px', top: (H - tip.offsetHeight) / 2 + 'px' });
      }
    };
    const render = () => {
      const s = usable[i], last = i === usable.length - 1;
      tip.setAttribute('dir', ctx.lang() === 'fa' ? 'rtl' : 'ltr');
      tip.innerHTML = `<div class="ct-top"><b>${t(s.title)}</b><span>${t('tourOf', { a: ctx.num(i + 1), b: ctx.num(usable.length) })}</span></div>
        <p>${t(s.text)}</p>${s.gh ? `<button class="btn sm gh" data-gh>${t('supportGh')}</button>` : ''}
        <div class="ct-nav">${last ? '<span></span>' : `<button class="lnk" data-c="skip">${t('tourSkip')}</button>`}
        <div>${i > 0 ? `<button class="btn sm" data-c="back">${t('back')}</button>` : ''}<button class="btn sm pri" data-c="next">${last ? t('done') : t('next')}</button></div></div>`;
      tip.classList.remove('pop'); void tip.offsetWidth; tip.classList.add('pop');
      place();
    };
    const go = d => { i += d; if (i >= usable.length) return finish(); if (i < 0) i = 0; render(); };
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(); }
      else if (e.key === 'Enter' || e.key === 'ArrowLeft' && ctx.lang() === 'fa' || e.key === 'ArrowRight' && ctx.lang() !== 'fa') { e.preventDefault(); e.stopPropagation(); go(1); }
      else if (e.key === 'ArrowRight' && ctx.lang() === 'fa' || e.key === 'ArrowLeft' && ctx.lang() !== 'fa') { e.preventDefault(); e.stopPropagation(); go(-1); }
      else { e.stopPropagation(); }
    };
    tip.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.gh !== undefined) { ctx.openGithub(); return; }
      if (b.dataset.c === 'skip') finish(); else if (b.dataset.c === 'back') go(-1); else if (b.dataset.c === 'next') go(1);
    });
    ov.addEventListener('click', e => { if (e.target === ov || e.target === hole) e.stopPropagation(); });
    window.addEventListener('resize', place); window.addEventListener('keydown', key, true);
    if (!usable.length) return finish();
    render();
  });
}
window.NavaTour = { onboard, coach };
})();
