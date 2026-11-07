'use strict';
/* Nava Player — audio graph. Copyright (c) 2026 Silenzio Morto. All rights reserved.
   media/stream -> input -> preamp -> EQ(10) -> bass shelf -> pitch -> stereo width -> balance -> 8D panner
   -> dry + reverb(wet) -> loudness comp -> fade -> [analyser tap] -> volume -> limiter -> out */
(function () {
const EQ_FREQS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const EQ_PRESETS = {
  flat: [['صاف', 'Flat'], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  bass: [['بیس سنگین', 'Bass Heavy'], [7, 6, 4.5, 2, 0, -.5, -.5, 0, .5, 1]],
  deep: [['بیس عمیق', 'Sub Bass'], [9, 7, 3, 0, -1, -1, 0, 0, 0, 0]],
  vocal: [['وکال', 'Vocal'], [-2, -2, -1, 1, 3, 4, 4, 2.5, 1, 0]],
  pop: [['پاپ', 'Pop'], [-1, 1, 3, 4, 2.5, 0, -1, 0, 1.5, 2.5]],
  rock: [['راک', 'Rock'], [5, 4, 2.5, 0, -1, 0, 2, 3.5, 4.5, 5]],
  rap: [['رپ', 'Hip-Hop'], [6, 5.5, 3, 1, -1, -1, 1, 1.5, 2.5, 3]],
  edm: [['الکترونیک', 'Electronic'], [6, 5, 2, 0, -2, 1, 0, 2, 5, 6]],
  club: [['کلاب', 'Club'], [5, 4, 3, 1, 0, 0, 1.5, 3, 4, 3]],
  jazz: [['جز', 'Jazz'], [3, 2, 1, 2, -1.5, -1.5, 0, 1.5, 3, 3.5]],
  classical: [['کلاسیک', 'Classical'], [4, 3, 2.5, 1.5, -1, -1, 0, 2, 3, 3.5]],
  acoustic: [['آکوستیک', 'Acoustic'], [4, 3.5, 2.5, 1, 1.5, 1.5, 3, 3, 2.5, 1.5]],
  persian: [['سنتی ایرانی', 'Persian Traditional'], [1, 1.5, 2, 1, 0, 1.5, 3, 3.5, 2.5, 1]],
  lofi: [['لوفای', 'Lo-fi'], [3, 2.5, 2, 1, 0, -1, -3, -5, -8, -10]],
  bright: [['روشن', 'Bright'], [-2, -1.5, -1, 0, 0, 1, 2.5, 4, 5.5, 6.5]],
  night: [['شبانه (آرام)', 'Late Night'], [2, 1.5, 1, 0, 0, 0, -1, -2, -3, -4]],
  phone: [['هدفون', 'Headphones'], [4, 3, 1, 0, -1, 0, 1.5, 3, 4, 3]],
  laptop: [['اسپیکر لپ‌تاپ', 'Laptop Speakers'], [-6, -4, 1, 3, 2, 1, 2, 3, 2, 0]],
  loud: [['بلند و پر', 'Loudness'], [6, 4, 0, 0, -2, 0, -1, -4, 5, 1]],
  podcast: [['گفتار', 'Speech'], [-6, -4, -1, 2, 4, 4.5, 4, 2, 0, -2]]
};
const REVERB_PRESETS = {
  room: [['اتاق', 'Room'], { size: 0.8, damp: 0.5, mix: 0.18 }], hall: [['سالن', 'Hall'], { size: 2.6, damp: 0.35, mix: 0.28 }],
  church: [['کلیسا', 'Cathedral'], { size: 5.5, damp: 0.25, mix: 0.36 }], plate: [['پلیت', 'Plate'], { size: 1.6, damp: 0.1, mix: 0.24 }],
  cave: [['غار', 'Cave'], { size: 4, damp: 0.65, mix: 0.4 }], studio: [['استودیو', 'Studio'], { size: 0.45, damp: 0.6, mix: 0.12 }]
};
class AudioFX {
  constructor(media) {
    const ac = this.ac = new AudioContext({ latencyHint: 'playback' });
    this.media = media;
    this.src = ac.createMediaElementSource(media);
    this.input = ac.createGain();
    this.preamp = ac.createGain();
    this.eq = EQ_FREQS.map((f, i) => { const b = ac.createBiquadFilter(); b.type = i === 0 ? 'lowshelf' : i === EQ_FREQS.length - 1 ? 'highshelf' : 'peaking'; b.frequency.value = f; b.Q.value = 1.3; return b; });
    this.bass = ac.createBiquadFilter(); this.bass.type = 'lowshelf'; this.bass.frequency.value = 95;
    this.pitchIn = ac.createGain(); this.pitchOut = ac.createGain(); this.pitch = null;
    // stereo width matrix
    this.split = ac.createChannelSplitter(2); this.merge = ac.createChannelMerger(2);
    this.gLL = ac.createGain(); this.gRR = ac.createGain(); this.gLR = ac.createGain(); this.gRL = ac.createGain();
    this.balance = ac.createStereoPanner(); this.pan8d = ac.createStereoPanner();
    this.lfo = ac.createOscillator(); this.lfoGain = ac.createGain(); this.lfoGain.gain.value = 0; this.lfo.frequency.value = 0.12; this.lfo.connect(this.lfoGain); this.lfoGain.connect(this.pan8d.pan); this.lfo.start();
    this.dry = ac.createGain(); this.conv = ac.createConvolver(); this.wetLP = ac.createBiquadFilter(); this.wetLP.type = 'lowpass'; this.wet = ac.createGain(); this.wet.gain.value = 0;
    this.sum = ac.createGain();
    this.comp = ac.createDynamicsCompressor(); this.makeup = ac.createGain();
    this.fade = ac.createGain();
    this.analyser = ac.createAnalyser(); this.analyser.minDecibels = -88; this.analyser.maxDecibels = -14;
    this.vol = ac.createGain();
    this.limiter = ac.createDynamicsCompressor();
    Object.assign(this.limiter, {}); this.limiter.threshold.value = -0.8; this.limiter.knee.value = 0; this.limiter.ratio.value = 20; this.limiter.attack.value = 0.002; this.limiter.release.value = 0.12;
    // wiring
    this.src.connect(this.input);
    this.input.connect(this.preamp);
    let n = this.preamp; for (const b of this.eq) { n.connect(b); n = b; }
    n.connect(this.bass); this.bass.connect(this.pitchIn); this.pitchIn.connect(this.pitchOut);
    this.pitchOut.connect(this.split);
    this.split.connect(this.gLL, 0); this.split.connect(this.gLR, 0); this.split.connect(this.gRR, 1); this.split.connect(this.gRL, 1);
    this.gLL.connect(this.merge, 0, 0); this.gRL.connect(this.merge, 0, 0); this.gRR.connect(this.merge, 0, 1); this.gLR.connect(this.merge, 0, 1);
    this.merge.connect(this.balance); this.balance.connect(this.pan8d);
    this.pan8d.connect(this.dry); this.pan8d.connect(this.conv); this.conv.connect(this.wetLP); this.wetLP.connect(this.wet);
    this.dry.connect(this.sum); this.wet.connect(this.sum);
    this.sum.connect(this.comp); this.comp.connect(this.makeup); this.makeup.connect(this.fade);
    this.fade.connect(this.analyser); this.fade.connect(this.vol); this.vol.connect(this.limiter); this.limiter.connect(ac.destination);
    this.stream = null;
    this.setWidth(1); this.setNormalize(false); this.buildIR(2, 0.4);
    ac.audioWorklet.addModule('pitch-worklet.js').then(() => {
      this.pitch = new AudioWorkletNode(ac, 'nava-pitch', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
      this.pitchIn.disconnect(); this.pitchIn.connect(this.pitch); this.pitch.connect(this.pitchOut);
      if (this._ratio) this.setPitch(this._semis || 0);
    }).catch(() => {});
  }
  t(v, node, time = 0.04) { node.setTargetAtTime(v, this.ac.currentTime, time); }
  resume() { if (this.ac.state !== 'running') this.ac.resume(); }
  setEq(gains, preampDb, enabled) { this.eq.forEach((b, i) => this.t(enabled ? (gains[i] || 0) : 0, b.gain)); this.t(Math.pow(10, (enabled ? preampDb : 0) / 20), this.preamp.gain); }
  setBass(db) { this.t(db, this.bass.gain); }
  setPitch(semis) { this._semis = semis; this._ratio = Math.pow(2, semis / 12); if (this.pitch) this.pitch.parameters.get('ratio').setValueAtTime(this._ratio, this.ac.currentTime); }
  setWidth(w) { const a = (1 + w) / 2, b = (1 - w) / 2; this.t(a, this.gLL.gain); this.t(a, this.gRR.gain); this.t(b, this.gLR.gain); this.t(b, this.gRL.gain); }
  setBalance(v) { this.t(v, this.balance.pan); }
  set8d(on, speed) { this.lfo.frequency.setTargetAtTime(speed, this.ac.currentTime, .1); this.t(on ? 0.9 : 0, this.lfoGain.gain, .3); }
  setReverb(mix, size, damp) {
    this.t(mix, this.wet.gain); this.t(1 - mix * 0.45, this.dry.gain);
    this.wetLP.frequency.setTargetAtTime(1200 + (1 - damp) * 14000, this.ac.currentTime, .05);
    if (Math.abs((this._irSize || 0) - size) > 0.05) { clearTimeout(this._irT); this._irT = setTimeout(() => this.buildIR(size, damp), 120); }
  }
  buildIR(sec, damp) {
    const ac = this.ac, sr = ac.sampleRate, len = Math.max(1, Math.floor(sr * sec)), ir = ac.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c); let lp = 0;
      for (let i = 0; i < len; i++) { const x = (Math.random() * 2 - 1); lp += (x - lp) * (0.25 + (1 - damp) * 0.7); d[i] = lp * Math.pow(1 - i / len, 2.2 + damp * 2); }
      for (let i = 0; i < Math.min(len, sr * 0.012); i++) d[i] *= i / (sr * 0.012);
    }
    this.conv.buffer = ir; this._irSize = sec;
  }
  setNormalize(on) {
    const c = this.comp;
    if (on) { c.threshold.value = -26; c.knee.value = 12; c.ratio.value = 4; c.attack.value = 0.01; c.release.value = 0.3; this.t(1.9, this.makeup.gain); }
    else { c.threshold.value = 0; c.knee.value = 0; c.ratio.value = 1; c.attack.value = 0.003; c.release.value = 0.25; this.t(1, this.makeup.gain); }
  }
  setVolume(v) { this.t(v, this.vol.gain, 0.03); }
  fadeTo(v, sec) { const g = this.fade.gain, now = this.ac.currentTime; g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.linearRampToValueAtTime(v, now + Math.max(0.01, sec)); }
  setFade(v) { const g = this.fade.gain; g.cancelScheduledValues(this.ac.currentTime); g.setValueAtTime(v, this.ac.currentTime); }
  attachStream(stream) {
    this.detachStream();
    this.stream = this.ac.createMediaStreamSource(stream); this.stream.connect(this.analyser);
  }
  detachStream() { if (this.stream) { try { this.stream.disconnect(); } catch (e) {} this.stream = null; } }
  eqResponse(freqs) {
    const mag = new Float32Array(freqs.length), ph = new Float32Array(freqs.length), total = new Float32Array(freqs.length);
    for (const b of this.eq) { b.getFrequencyResponse(freqs, mag, ph); for (let i = 0; i < freqs.length; i++) total[i] += 20 * Math.log10(mag[i] || 1e-6); }
    return total;
  }
}
window.AudioFX = AudioFX; window.EQ_FREQS = EQ_FREQS; window.EQ_PRESETS = EQ_PRESETS; window.REVERB_PRESETS = REVERB_PRESETS;
})();
