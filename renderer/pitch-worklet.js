'use strict';
/* Nava Player — granular pitch shifter (two crossfaded read heads). Copyright (c) 2026 Silenzio Morto. */
class NavaPitch extends AudioWorkletProcessor {
  static get parameterDescriptors() { return [{ name: 'ratio', defaultValue: 1, minValue: 0.25, maxValue: 4, automationRate: 'k-rate' }]; }
  constructor() {
    super();
    this.N = 16384; this.W = 2048; this.w = 0; this.ph = 0;
    this.buf = [new Float32Array(this.N), new Float32Array(this.N)];
  }
  read(b, d) {
    const N = this.N; let pos = this.w - d; while (pos < 0) pos += N;
    const i = pos | 0, f = pos - i, j = (i + 1) % N;
    return b[i] + (b[j] - b[i]) * f;
  }
  process(inputs, outputs, params) {
    const inp = inputs[0], out = outputs[0], ratio = params.ratio[0];
    if (!inp || !inp.length) return true;
    const n = inp[0].length, chs = Math.min(out.length, 2), W = this.W, N = this.N;
    if (Math.abs(ratio - 1) < 1e-3) {
      for (let c = 0; c < out.length; c++) out[c].set(inp[Math.min(c, inp.length - 1)]);
      for (let c = 0; c < 2; c++) { const src = inp[Math.min(c, inp.length - 1)], b = this.buf[c]; let w = this.w; for (let k = 0; k < n; k++) { b[w] = src[k]; w = (w + 1) % N; } }
      this.w = (this.w + n) % N; return true;
    }
    for (let k = 0; k < n; k++) {
      for (let c = 0; c < 2; c++) this.buf[c][this.w] = inp[Math.min(c, inp.length - 1)][k];
      this.ph += 1 - ratio; this.ph = ((this.ph % W) + W) % W;
      const d1 = this.ph + 2, d2 = ((this.ph + W / 2) % W) + 2;
      const g1 = Math.sin(Math.PI * this.ph / W) ** 2, g2 = 1 - g1;
      for (let c = 0; c < chs; c++) { const b = this.buf[c]; out[c][k] = g1 * this.read(b, d1) + g2 * this.read(b, d2); }
      this.w = (this.w + 1) % N;
    }
    return true;
  }
}
registerProcessor('nava-pitch', NavaPitch);
