'use strict';
(function () {
  let lang = 'en', theme = null;
  try { const s = JSON.parse(localStorage.getItem('nava2:settings') || '{}'); lang = s.lang || ((navigator.language || '').startsWith('fa') ? 'fa' : 'en'); } catch (e) {}
  const T = {
    fa: { by: 'ساخته‌شده با ♥ توسط', steps: ['دارم بلندگوها رو گرم می‌کنم…', 'آماده‌سازی موتور گرافیکی…', 'خوندن کتابخونه‌ی آهنگ‌ها…', 'کوک کردن اکولایزر…', 'تقریباً آماده‌ست…'] },
    en: { by: 'Made with ♥ by', steps: ['Warming up the speakers…', 'Starting the GPU engine…', 'Reading your music library…', 'Tuning the equalizer…', 'Almost there…'] }
  }[lang] || null;
  const L = T || { by: 'Made with ♥ by', steps: ['Loading…'] };
  if (lang === 'fa') document.body.classList.add('rtl');
  document.getElementById('by').textContent = L.by;
  const ring = document.getElementById('ring');
  for (let i = 0; i < 36; i++) { const b = document.createElement('i'); b.style.transform = `rotate(${i * 10}deg) translateY(-80px)`; b.style.animationDelay = (-(i % 9) * 0.12) + 's'; ring.appendChild(b); }
  const st = document.getElementById('status'), fill = document.getElementById('fill');
  let k = 0;
  const tick = () => { st.textContent = L.steps[Math.min(k, L.steps.length - 1)]; fill.style.width = Math.min(92, 12 + k * 20) + '%'; k++; };
  tick(); const iv = setInterval(tick, 700);
  window.splash.onStatus(s => { if (s && s.pct != null) fill.style.width = s.pct + '%'; if (s && s.text) st.textContent = s.text; });
  window.splash.onDone(() => { clearInterval(iv); fill.style.width = '100%'; setTimeout(() => document.getElementById('card').classList.add('out'), 120); });
  fetch('nava://app/version.json').then(r => r.json()).then(v => { document.getElementById('ver').textContent = 'v' + v.version; }).catch(() => {});
})();
