'use strict';
/* Nava GPU engine: every visual runs as a WebGL2 shader. Pipeline per frame:
   scene (mode shader + particles) -> feedback accumulate (trails / warp echo) -> bloom (1/4 res) -> final composite. */
(function () {
const VS = `#version 300 es
void main(){ vec2 p = vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2)); gl_Position = vec4(p*2.-1., 0., 1.); }`;

const HEAD = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime, uBass, uMid, uVocal, uHigh, uBeat, uEnergy, uRot, uFlow, uBars, uMirror, uHasCover, uCoverRot, uSens;
uniform vec2 uCenter; uniform float uScaleV; uniform vec4 uRings, uRingA; uniform vec3 uC0, uC1, uC2, uC3;
uniform sampler2D uSpec, uCover;
out vec4 o;
#define TAU 6.28318531
#define PI 3.14159265
float spec(float x){ return texture(uSpec, vec2(clamp(x,0.,1.)*0.996+0.002, 1./6.)).r; }
float peak(float x){ return texture(uSpec, vec2(clamp(x,0.,1.)*0.996+0.002, .5)).r; }
float wave(float x){ return texture(uSpec, vec2(fract(x), 5./6.)).r*2.-1.; }
vec3 pal(float t){ t = clamp(t,0.,1.)*3.; return t<1. ? mix(uC0,uC1,t) : t<2. ? mix(uC1,uC2,t-1.) : mix(uC2,uC3,t-2.); }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.03+17.1; a*=.5; } return v; }
float mfold(float f){ return uMirror>.5 ? 1.-abs(f*2.-1.) : f; }
vec3 ringsAt(float r, float base, float px){ vec3 c=vec3(0); for(int i=0;i<4;i++){ c += pal(.35+.15*float(i))*uRingA[i]*smoothstep(px*3.,0.,abs(r-(base+uRings[i]))); } return c; }
vec3 coverDisc(vec2 p, float R, float px, vec3 col){
  float r = length(p);
  if (r > R+px*2.) return col;
  vec3 c;
  if (uHasCover > .5) { vec2 uv = rot(uCoverRot)*p/(2.*R) + .5; c = texture(uCover, uv).rgb; }
  else { c = mix(pal(.15)*.25, pal(.85), smoothstep(R, 0., r)*.85) * (.75 + .25*sin(r*180./max(R,.01))); }
  c *= smoothstep(R*.1, R*.1+px*2., r);
  col = mix(col, c, smoothstep(R+px, R-px, r));
  return col + pal(.55)*smoothstep(px*3., 0., abs(r-R))*.9;
}
`;
const MAIN = `void main(){ vec2 q = gl_FragCoord.xy/uRes; vec2 p = ((gl_FragCoord.xy - .5*uRes)/uRes.y)*uScaleV - uCenter; o = vec4(max(scene(p,q), 0.), 1.); }`;

const MODES = {
halo: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, r = length(p), a = atan(p.y, p.x);
  float f = fract((a - uRot)/TAU - .25 + 2.), fm = mfold(f);
  float N = uBars, cell = fm*N, id = floor(cell), lx = fract(cell);
  float v = spec((id+.5)/N);
  float R0 = .19*(1. + uBass*.12 + uBeat*.05), L = .3;
  float total = N*(uMirror>.5 ? 2. : 1.);
  float arc = TAU*r/total, dx = abs(lx-.5)*arc, hw = arc*.28;
  float bw = 1. - smoothstep(hw-px, hw+px, dx);
  float r0 = R0+.014, r1 = r0+.004+v*L;
  float rb = smoothstep(r0-px, r0+px, r)*(1.-smoothstep(r1-px, r1+px, r));
  vec3 c = pal(fm);
  vec3 col = c*bw*rb*(.65+.7*v);
  col += c*smoothstep(.06, 0., r-r1)*step(r0, r)*bw*.12;
  float pr = r0 + .022 + peak((id+.5)/N)*L;
  col += c*bw*smoothstep(px*2.5, 0., abs(r-pr)-.0015)*.9;
  float wr = R0 + L + .075 + wave(fm)*.05*(.3+uVocal);
  col += pal(.85)*smoothstep(px*2., 0., abs(r-wr))*.55;
  col += pal(.3)*exp(-abs(r-R0)*38.)*(.2+uBass*.7);
  col += ringsAt(r, R0, px);
  return coverDisc(p, R0, px, col);
}`,
spectrum: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, m = .05, xx = (q.x-m)/(1.-2.*m);
  vec3 col = vec3(0);
  float base = .36;
  col += pal(.6)*smoothstep(px*2., 0., abs(q.y-base))*(.25+uVocal*.5)*step(0.,xx)*step(xx,1.);
  if (xx < 0. || xx > 1.) return col;
  float total = uMirror>.5 ? uBars*2. : uBars, cell = xx*total, id = floor(cell), lx = fract(cell);
  float k = uMirror>.5 ? (id < uBars ? uBars-1.-id : id-uBars) : id;
  float v = spec((k+.5)/uBars), h = max(.006, v*.52);
  float aa = 1.5/(uRes.x*(1.-2.*m)/total);
  float bw = smoothstep(.14, .14+aa, lx)*smoothstep(.86, .86-aa, lx);
  float y = q.y - base;
  if (y > 0. && y < h) col += pal(y/.52)*bw*(.7+.5*v);
  if (y < -.01 && y > -.01 - h*.42) col += pal(.3)*bw*.22*(1.+(y+.01)/(h*.42));
  float pk = peak((k+.5)/uBars)*.52 + .014;
  col += pal(1.)*bw*smoothstep(px*2., 0., abs(y-pk)-.002);
  return col;
}`,
nebula: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, r = length(p), a = atan(p.y, p.x);
  float R = .07 + uBass*.07 + uBeat*.03;
  vec3 col = pal(.92)*exp(-r/R*1.6)*1.1 + pal(.5)*exp(-r/(R*3.2))*.32;
  float fm = mfold(fract((a + uRot)/TAU + 1.));
  col += pal(.8)*smoothstep(px*2., 0., abs(r - (.27 + wave(fm)*.05*(.4+uVocal))))*.7;
  col += pal(.4)*smoothstep(px*2., 0., abs(r - (.35 + wave(fract(fm+.37))*.04*(.3+uMid))))*.35;
  float n = fbm(p*2.6 + vec2(uFlow*.12, -uFlow*.07));
  col += pal(n)*pow(n, 3.)*(.35 + uEnergy*.6)*smoothstep(1.1, .1, r);
  col += ringsAt(r, .12, px);
  if (uHasCover > .5) col = coverDisc(p, R*.95, px, col);
  return col;
}`,
liquid: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y; vec3 col = vec3(0);
  for (int i = 3; i >= 0; i--) {
    float fl = float(i), fx = mfold(q.x), span = .9 - fl*.13;
    float v = spec(fx*span);
    if (i == 0) v *= .85 + uVocal*.35;
    float wob = sin(uTime*(.9+fl*.35) + q.x*16. + fl*1.7)*.018*(1. + uBass*2.5);
    float yb = .14 + fl*.075;
    float y = yb + v*(.42 - fl*.06) + wob + uBeat*.018*(4.-fl);
    float inside = smoothstep(y+px, y-px, q.y);
    float edge = smoothstep(px*3., 0., abs(q.y - y));
    vec3 c = pal(1. - fl/3.);
    col = mix(col, c*(.12 + .4*clamp(q.y/max(y,.01),0.,1.))*(1.-fl*.12), inside*.9);
    col += c*edge*(1. - fl*.18);
  }
  vec2 sp = p - vec2(0., .28);
  col += pal(.95)*exp(-length(sp)/(.06+uBass*.06))*.6;
  return col;
}`,
tunnel: `vec3 scene(vec2 p, vec2 q){
  float r = length(p), a = atan(p.y, p.x) + uRot*.35;
  float sides = uMirror>.5 ? 6. : 8., seg = TAU/sides;
  float aa = mod(a, seg) - seg*.5;
  float rp = r*cos(aa)/cos(seg*.5);
  float z = .32/(rp + .002), zp = z + uFlow*1.4;
  float id = floor(zp), f = fract(zp);
  float v = spec(fract(id*.1371 + .05));
  float w = .05 + uBass*.05 + v*.08;
  float line = smoothstep(w, 0., abs(f - .5) - .0);
  vec3 col = pal(fract(id*.083))*line*(.35 + v*1.5);
  float corner = smoothstep(.05, 0., seg*.5 - abs(aa));
  col += pal(.5)*corner*.18*(1. + uBass);
  col *= smoothstep(.02, .12, rp)*smoothstep(14., 2., z);
  col += pal(1.)*exp(-r*16.)*(.5 + uBass*1.2);
  return col;
}`,
orbit: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, r = length(p), a = atan(p.y, p.x);
  vec3 col = vec3(0);
  for (int k = 0; k < 6; k++) {
    float fk = float(k);
    float rb = (.13 + fk*.062)*(1. + uBass*.1 + uBeat*.03*(6.-fk));
    float dir = mod(fk, 2.) < .5 ? -1. : 1.;
    float ro = uRot*dir*(1. + fk*.18);
    vec3 c = pal(fk/5.);
    col += c*smoothstep(px*1.5, 0., abs(r - rb))*.13;
    float dots = 72., ang = fract((a - ro)/TAU + 2.), cell = ang*dots, cid = floor(cell);
    float span = .25 + .75*(fk + 1.)/6.;
    for (int j = -1; j <= 1; j++) {
      float id = cid + float(j);
      float cf = fract((id + .5)/dots);
      float v = spec(mfold(cf)*span);
      float ca = cf*TAU + ro;
      vec2 dc = vec2(cos(ca), sin(ca))*(rb + v*.05*dir);
      float s = .002 + v*.0085, d = length(p - dc);
      col += c*(smoothstep(s+px, s-px, d) + exp(-d/(s+.001)*1.4)*.25);
    }
  }
  col += ringsAt(r, .1, px);
  return coverDisc(p, .085*(1. + uBass*.18), px, col);
}`,
scope: `vec3 scene(vec2 p, vec2 q){
  vec3 col = vec3(0);
  float amp = .3*(.4 + uSens*.5);
  float b = spec(q.x);
  col += pal(.4)*.1*step(abs(q.y-.5), b*.25)*step(.2, fract(q.x*uBars))*step(fract(q.x*uBars), .8);
  for (int k = 1; k < 4; k++) { float g = amp*float(k)/3.4; col += pal(.3)*.07*(smoothstep(1.5/uRes.y, 0., abs(q.y-.5-g)) + smoothstep(1.5/uRes.y, 0., abs(q.y-.5+g))); }
  float env = pow(sin(PI*q.x), .6);
  for (int l = 2; l >= 0; l--) {
    float fl = float(l);
    float y = .5 + wave(q.x)*amp*env*(1. - fl*.22)*(l == 1 ? -1. : 1.) + sin(q.x*6. + uTime*2. + fl)*fl*.012*(1. + uBass*2.);
    float dyp = (q.y - y)*uRes.y, sl = dFdx(y)*uRes.y;
    float d = abs(dyp)/sqrt(1. + sl*sl);
    float w = l == 0 ? 2.2 + uBass*2. : 1.2;
    col += pal(.9 - fl*.35)*(smoothstep(w+1., w-1., d) + exp(-d*.12)*.12)*(l == 0 ? 1. : .5);
  }
  return col;
}`,
skyline: `vec3 scene(vec2 p, vec2 q){
  float count = uMirror>.5 ? 48. : 64., segs = 22.;
  float x0 = .07, x1 = .93, bot = .26, top = .84;
  float xx = (q.x - x0)/(x1 - x0), yy = (q.y - bot)/(top - bot);
  if (xx < 0. || xx > 1.) return vec3(0);
  float id = floor(xx*count), lx = fract(xx*count);
  float f = uMirror>.5 ? abs((id+.5)/count*2. - 1.) : (id+.5)/count;
  float v = spec(f), pk = peak(f);
  vec3 col = vec3(0);
  if (yy >= 0. && yy <= 1.) {
    float sid = floor(yy*segs), ly = fract(yy*segs);
    float box = step(.12, lx)*step(lx, .88)*step(.16, ly)*step(ly, .84);
    float on = step((sid+.5)/segs, v);
    col = pal(sid/(segs-1.))*box*mix(.06, 1., on);
    if (sid == min(segs-1., floor(pk*segs))) col += pal(1.)*box*step(.5, ly)*.9;
  } else if (yy < 0. && yy > -.35) {
    float sid = floor(-yy*segs), ly = fract(-yy*segs);
    float box = step(.12, lx)*step(lx, .88)*step(.16, ly)*step(ly, .84);
    col = pal(sid/(segs-1.))*box*step((sid+.5)/segs, v)*.16*(1. + yy/.35);
  }
  return col;
}`,
kaleido: `vec3 scene(vec2 p, vec2 q){
  float r = length(p), a = atan(p.y, p.x) + uRot*.5;
  float n = uMirror>.5 ? 8. : 6., seg = TAU/n;
  a = mod(a, seg); a = abs(a - seg*.5);
  vec2 k = vec2(cos(a), sin(a))*r;
  vec2 z = k*3.2 + vec2(uFlow*.35, 0.);
  float v = spec(fract(r*1.15));
  float pat = (sin(z.x*4. + sin(z.y*5. + uTime*.7))*.5 + .5)*(sin(length(z)*6. - uFlow*3.5)*.5 + .5);
  vec3 col = pal(fract(r*.8 + uFlow*.04))*pow(pat, 2.2)*(.35 + v*1.7);
  if (uHasCover > .5) col += texture(uCover, k*1.5 + .5).rgb*(.25 + uBass*.6)*smoothstep(.7, .05, r);
  col += pal(1.)*exp(-r*18.)*(.4 + uBass);
  return col*smoothstep(1.3, .15, r);
}`,
aurora: `vec3 scene(vec2 p, vec2 q){
  vec3 col = vec3(0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i), x = q.x*3. + fi*1.3;
    float h = .5 + fi*.06 + .12*sin(x*1.2 + uTime*.3 + fi) + .06*sin(x*3.1 - uTime*.5) + spec(fract(q.x*.9 + fi*.21))*.24*(1. + uBass);
    float d = q.y - h;
    float rays = .55 + .45*sin(x*22. + uTime*1.6 + fi*3. + fbm(vec2(x*2., uTime*.2))*4.);
    float cur = exp(-max(d, 0.)*9.)*smoothstep(-.32, 0., d)*rays;
    col += pal(fi/3.)*cur*(.22 + uVocal*.55 + uEnergy*.35);
  }
  vec2 g = floor(gl_FragCoord.xy/3.);
  float st = step(.997, hash(g))*(.5 + .5*sin(uTime*3. + hash(g+7.)*30.));
  col += vec3(st)*smoothstep(.3, .9, q.y)*.8;
  col += pal(.2)*exp(-q.y*7.)*.35*(1. + uBass*1.5);
  return col;
}`,
warp: `vec3 scene(vec2 p, vec2 q){
  float r = length(p), a = atan(p.y, p.x);
  vec3 col = pal(1.)*exp(-r*10.)*(.4 + uBass*1.3);
  float rays = pow(abs(sin(a*12. + uRot*2.)), 40.)*smoothstep(.0, .5, r)*.15*(1. + uBass);
  col += pal(.5)*rays;
  col += ringsAt(r, .05, 1.5/uRes.y);
  return col;
}`,
ripple: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, a = atan(p.y, p.x);
  float r = length(p) + wave(mfold(fract(a/TAU + 1.)))*.02*(.3 + uVocal);
  float v = spec(clamp(r*1.35, 0., 1.));
  float w = sin(r*62. - uFlow*9.)*.5 + .5;
  w = pow(w, 7. - uBass*4.);
  vec3 col = pal(clamp(r*1.25, 0., 1.))*w*(.18 + v*1.5)*smoothstep(1.1, .1, r);
  col += ringsAt(r, .12, px);
  return coverDisc(p, .12*(1. + uBass*.14), px, col);
}`,
spiral: `vec3 scene(vec2 p, vec2 q){
  float r = length(p), a = atan(p.y, p.x);
  float arms = uMirror>.5 ? 4. : 3.;
  float s = sin(arms*a - log(r + .002)*5. + uRot*2. - uFlow*1.6);
  float v = spec(clamp(r*1.3, 0., 1.));
  float m = smoothstep(.25, 1., s)*(.3 + v*1.6);
  float dust = fbm(rot(uRot*.5)*p*7. + uFlow*.1);
  vec3 col = pal(fract(r*1.4 + .1))*m*exp(-r*1.7)*1.5 + pal(.6)*pow(dust, 3.)*.5*exp(-r*1.3);
  col += pal(.95)*exp(-r*12.)*(.6 + uBass*1.2);
  return col;
}`,
horizon: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, asp = uRes.x/uRes.y, hz = .42;
  vec3 col = vec3(0);
  vec2 sc = vec2(0., .2);
  float sr = .2*(1. + uBass*.08 + uBeat*.04), sd = length(p - sc);
  if (q.y > hz) {
    float t = clamp((p.y - sc.y + sr)/(2.*sr), 0., 1.);
    float stripes = step(.5, fract((p.y - sc.y)*38. - uTime*.5)) + step(.55, t);
    col += mix(pal(.1), pal(1.), t)*smoothstep(sr+px, sr-px, sd)*min(stripes, 1.)*1.1;
    col += pal(.7)*exp(-max(sd - sr, 0.)*9.)*.35*(1. + uBass);
    float mh = spec(mfold(q.x)*.7)*.2 + .015 + .02*noise(vec2(q.x*12., 1.));
    float m = smoothstep(px, -px, q.y - hz - mh);
    col = mix(col, pal(.15)*.25, m);
    col += pal(.6)*smoothstep(px*2., 0., abs(q.y - hz - mh))*m*0. + pal(.6)*smoothstep(px*2.5, 0., abs(q.y - hz - mh))*.8;
  } else {
    float dz = hz - q.y + .001, z = .12/dz;
    float xg = (q.x - .5)*asp*z;
    float fz = abs(fract(z + uFlow*1.6) - .5), fx = abs(fract(xg*1.5) - .5);
    float lz = smoothstep(.5 - .03*min(z, 6.)*.25 - .012, .5, fz);
    float lx = smoothstep(.5 - .02 - .004*z, .5, fx);
    float fade = smoothstep(0., .25, dz);
    col += pal(.55)*max(lz, lx)*fade*(.45 + uBass*.7)*smoothstep(9., 1., z);
    col += pal(.8)*exp(-dz*40.)*.35;
  }
  return col;
}`,
blackhole: `vec3 scene(vec2 p, vec2 q){
  float px = 1.5/uRes.y, r = length(p), a = atan(p.y, p.x);
  float R = .1*(1. + uBass*.16 + uBeat*.05);
  vec2 d = rot(.18)*p; d.y *= 3.;
  float rd = length(d), ang = atan(d.y, d.x) + uRot*1.6 - uFlow*.5;
  float v = spec(fract(ang/TAU + 1.));
  float band = smoothstep(.2 + v*.08, 0., abs(rd - .34)) * smoothstep(R*1.1, R*2.2, r);
  float swirl = sin(ang*5. + log(rd + .01)*9. - uFlow*2.6)*.5 + .5;
  vec3 col = pal(clamp(rd*1.4, 0., 1.))*band*(.25 + swirl*1.1)*(.6 + uEnergy*.9);
  float front = step(0., p.y)*0.;
  col += pal(.95)*smoothstep(px*2.5, 0., abs(r - R*1.38))*(.7 + uBass*.8);
  col += pal(.6)*exp(-abs(r - R*1.38)*30.)*(.45 + uVocal*.5);
  vec2 g = floor(rot(uRot*.05)*p*90.);
  float st = step(.995, hash(g))*smoothstep(R*1.5, R*3., r)*(.4 + .6*sin(uTime*2. + hash(g + 3.)*20.));
  col += vec3(st);
  col += ringsAt(r, R*1.4, px)*.8;
  col *= smoothstep(R*.98, R*1.06, r);
  if (uHasCover > .5 && r < R*.95) { vec2 uv = rot(uCoverRot)*p/(2.*R) + .5; col = texture(uCover, uv).rgb*.22*smoothstep(R, R*.4, r); }
  return col;
}`,
prism: `vec3 scene(vec2 p, vec2 q){
  float r = length(p);
  vec2 z = rot(uRot*.3)*p*(2.6 - uBass*.4);
  float v = spec(fract(r*.9));
  float t1 = abs(fract(z.y + uFlow*.15) - .5);
  float t2 = abs(fract(dot(z, vec2(.866, .5)) - uFlow*.1) - .5);
  float t3 = abs(fract(dot(z, vec2(-.866, .5)) + uFlow*.12) - .5);
  float l = min(t1, min(t2, t3));
  float line = smoothstep(.035 + uBass*.025, 0., l);
  float cell = hash(floor(vec2(z.y + uFlow*.15, dot(z, vec2(.866, .5)) - uFlow*.1)*1.));
  vec3 col = pal(fract(r*.9 + uFlow*.05))*line*(.3 + v*1.6);
  col += pal(cell)*step(.86 - uEnergy*.25, cell)*.12*(1. + uBeat*2.);
  col *= smoothstep(1.25, .1, r);
  col += pal(1.)*exp(-r*9.)*(.35 + uBass);
  return col;
}`
};

const PART_VS = `#version 300 es
precision highp float;
uniform vec2 uRes, uCenter; uniform float uFlow, uTime, uBass, uHigh, uKind, uScale;
out float vA; out float vC;
float h(float n){ return fract(sin(n)*43758.5453); }
void main(){
  float id = float(gl_VertexID);
  float s1 = h(id*12.9898+1.), s2 = h(id*78.233+2.), s3 = h(id*39.425+3.), s4 = h(id*5.31+4.);
  vec2 pos; float size, a;
  if (uKind < .5) {
    float sp = .25 + s2*.75, ph = fract(s1 + uFlow*sp*.3);
    float ang = s3*6.2831853 + ph*.6;
    pos = vec2(cos(ang), sin(ang))*(.05 + ph*ph*1.15);
    size = (1. + s4*2.6)*(1. + uHigh*.9)*(.45 + ph);
    a = (1. - ph)*smoothstep(0., .06, ph);
  } else if (uKind < 1.5) {
    float z = max(fract(s1 - uFlow*.22*(.5 + s2)), .015);
    pos = (vec2(s3, s4)*2. - 1.)*.18/z;
    size = (1. - z)*(3.5 + uBass*3.) + .6;
    a = smoothstep(1., .55, z)*smoothstep(0., .04, 1. - z);
  } else {
    float asp = uRes.x/uRes.y;
    pos = vec2((s1 - .5)*asp*1.05, fract(s2 + uTime*.008*(.4 + s3) + uFlow*.015) * 1.2 - .6) - uCenter;
    pos.x += sin(uTime*.3 + id)*.01;
    size = 1. + s4*2.2*(1. + uHigh);
    a = .28 + .2*s3;
  }
  vC = s2; vA = a;
  vec2 ndc = (pos + uCenter)*vec2(2.*uRes.y/uRes.x, 2.);
  gl_Position = vec4(ndc, 0., 1.);
  gl_PointSize = size*uScale;
}`;
const PART_FS = `#version 300 es
precision highp float;
uniform vec3 uC0, uC1, uC2, uC3;
in float vA; in float vC; out vec4 o;
vec3 pal(float t){ t = clamp(t,0.,1.)*3.; return t<1. ? mix(uC0,uC1,t) : t<2. ? mix(uC1,uC2,t-1.) : mix(uC2,uC3,t-2.); }
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d)*vA; o = vec4(pal(vC)*a, a); }`;

const ACC_FS = `#version 300 es
precision highp float;
uniform sampler2D uPrev, uScene; uniform vec2 uRes, uCenterUV; uniform float uDecay, uZoom, uTwist;
out vec4 o;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes, c = vec2(.5) + uCenterUV, w = uv - c;
  float asp = uRes.x/uRes.y; w.x *= asp;
  float cs = cos(uTwist), sn = sin(uTwist); w = mat2(cs,-sn,sn,cs)*w*(1. - uZoom); w.x /= asp;
  vec3 prev = texture(uPrev, c + w).rgb*uDecay;
  vec3 s = texture(uScene, uv).rgb;
  o = vec4(max(prev, s), 1.);
}`;
const DOWN_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uTexel; uniform float uThr; out vec4 o; in vec2 vUv;
void main(){ vec2 uv = gl_FragCoord.xy*uTexel*4.;
  vec3 c = texture(uTex, uv + uTexel*vec2(-1,-1)).rgb + texture(uTex, uv + uTexel*vec2(1,-1)).rgb + texture(uTex, uv + uTexel*vec2(-1,1)).rgb + texture(uTex, uv + uTexel*vec2(1,1)).rgb;
  c *= .25; o = vec4(max(c - uThr, 0.)*1.5, 1.); }`.replace(' in vec2 vUv;', '');
const BLUR_FS = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uDir, uRes; out vec4 o;
void main(){ vec2 uv = gl_FragCoord.xy/uRes, d = uDir/uRes;
  vec3 c = texture(uTex, uv).rgb*.227027;
  c += (texture(uTex, uv + d*1.3846).rgb + texture(uTex, uv - d*1.3846).rgb)*.316216;
  c += (texture(uTex, uv + d*3.2308).rgb + texture(uTex, uv - d*3.2308).rgb)*.070270;
  o = vec4(c, 1.); }`;
const FINAL_FS = `#version 300 es
precision highp float;
uniform sampler2D uAcc, uBloom, uBack; uniform vec2 uRes;
uniform float uGlow, uLight, uVig, uGrain, uBeat, uCA, uTime, uBackA, uHasBack;
uniform vec3 uBg, uBgL;
out vec4 o;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec2 d = (uv - .5)*uCA*uBeat*.014;
  vec3 c = vec3(texture(uAcc, uv + d).r, texture(uAcc, uv).g, texture(uAcc, uv - d).b);
  c += texture(uBloom, uv).rgb*uGlow*1.7;
  c = 1. - exp(-c*1.2);
  vec2 vv = (uv - .5)*vec2(uRes.x/uRes.y, 1.);
  float vig = mix(1., smoothstep(1.15, .3, length(vv)), uVig);
  vec3 back = uHasBack > .5 ? texture(uBack, uv).rgb : vec3(0.);
  float gr = (hash(gl_FragCoord.xy + fract(uTime)*91.7) - .5)*uGrain*.07;
  vec3 col;
  if (uLight < .5) {
    col = (uBg + back*uBackA*.55 + c)*vig + gr;
  } else {
    float al = clamp(max(c.r, max(c.g, c.b))*1.15, 0., 1.);
    vec3 ink = c/max(max(c.r, max(c.g, c.b)), .001)*.5;
    vec3 bg = mix(uBgL, back, uBackA*.22);
    col = mix(bg, ink, al*.9);
    col *= mix(1., .9 + .1*smoothstep(1.15, .3, length(vv)), uVig);
    col += gr*.6;
  }
  o = vec4(col, 1.);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { const log = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error(log); }
  return s;
}
function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}

class Engine {
  constructor(canvas) {
    this.cv = canvas;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance', desynchronized: true });
    if (!gl) throw new Error('WebGL2 در دسترس نیست');
    this.gl = gl;
    this.hdr = !!gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    this.vao = gl.createVertexArray();
    this.progs = {};
    this.part = program(gl, PART_VS, PART_FS);
    this.acc = program(gl, VS, ACC_FS);
    this.down = program(gl, VS, DOWN_FS);
    this.blur = program(gl, VS, BLUR_FS);
    this.fin = program(gl, VS, FINAL_FS);
    this.spec = this.tex(256, 3, gl.R8, gl.RED, gl.UNSIGNED_BYTE, gl.LINEAR);
    this.cover = this.tex(1, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, new Uint8Array([20, 40, 24, 255]));
    this.back = this.tex(1, 1, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR, new Uint8Array([0, 0, 0, 255]));
    this.hasCover = 0; this.hasBack = 0;
    this.w = 0; this.h = 0; this.ping = 0;
    this.mode = 'halo';
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; });
  }
  get modes() { return Object.keys(MODES); }
  tex(w, h, ifmt, fmt, type, filter, data) {
    const gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, data || null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  target(w, h) {
    const gl = this.gl;
    const t = this.hdr ? this.tex(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR) : this.tex(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    return { t, f, w, h };
  }
  free(rt) { if (!rt) return; this.gl.deleteTexture(rt.t); this.gl.deleteFramebuffer(rt.f); }
  resize(w, h) {
    w = Math.max(16, w | 0); h = Math.max(16, h | 0);
    if (w === this.w && h === this.h) return;
    this.w = w; this.h = h; this.cv.width = w; this.cv.height = h;
    ['scene', 'a0', 'a1', 'b0', 'b1'].forEach(k => this.free(this[k]));
    this.scene = this.target(w, h); this.a0 = this.target(w, h); this.a1 = this.target(w, h);
    const bw = Math.max(4, w >> 2), bh = Math.max(4, h >> 2);
    this.b0 = this.target(bw, bh); this.b1 = this.target(bw, bh);
  }
  getMode(id) {
    if (!MODES[id]) id = 'halo';
    if (!this.progs[id]) this.progs[id] = program(this.gl, VS, HEAD + MODES[id] + MAIN);
    return this.progs[id];
  }
  warm() { for (const id of Object.keys(MODES)) { try { this.getMode(id); } catch (e) { console.error(id, e); } } }
  setCover(img) {
    const gl = this.gl;
    if (!img) { this.hasCover = 0; this.hasBack = 0; return; }
    // square-crop cover, small blurred copy for the backdrop
    const c = document.createElement('canvas'), S = 512; c.width = c.height = S;
    const x = c.getContext('2d'); const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, m = Math.min(iw, ih);
    x.drawImage(img, (iw - m) / 2, (ih - m) / 2, m, m, 0, 0, S, S);
    gl.bindTexture(gl.TEXTURE_2D, this.cover);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, c);
    const b = document.createElement('canvas'); b.width = 96; b.height = 54;
    const bx = b.getContext('2d'); bx.filter = 'blur(10px) saturate(1.4)'; bx.drawImage(c, -20, -40, 136, 136);
    gl.bindTexture(gl.TEXTURE_2D, this.back);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, b);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    this.hasCover = 1; this.hasBack = 1;
  }
  quad() { this.gl.drawArrays(this.gl.TRIANGLES, 0, 3); }
  bindTex(unit, t, loc) { const gl = this.gl; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(loc, unit); }
  render(F) {
    const gl = this.gl;
    if (this.lost || !this.scene) return;
    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, this.spec);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 3, gl.RED, gl.UNSIGNED_BYTE, F.spec);
    const C = F.colors, W = this.w, H = this.h;
    // 1. scene
    const pr = this.getMode(F.mode), u = pr.u;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.scene.f); gl.viewport(0, 0, W, H);
    gl.useProgram(pr.p);
    gl.uniform2f(u.uRes, W, H); gl.uniform1f(u.uTime, F.t);
    gl.uniform1f(u.uBass, F.bass); gl.uniform1f(u.uMid, F.mid); gl.uniform1f(u.uVocal, F.vocal); gl.uniform1f(u.uHigh, F.high);
    gl.uniform1f(u.uBeat, F.beat); gl.uniform1f(u.uEnergy, F.energy); gl.uniform1f(u.uRot, F.rot); gl.uniform1f(u.uFlow, F.flow);
    gl.uniform1f(u.uBars, F.bars); gl.uniform1f(u.uMirror, F.mirror ? 1 : 0); gl.uniform1f(u.uHasCover, F.showCover ? this.hasCover : 0);
    gl.uniform1f(u.uCoverRot, F.coverRot); gl.uniform1f(u.uSens, F.sens);
    gl.uniform2f(u.uCenter, F.center[0], F.center[1]); gl.uniform1f(u.uScaleV, F.scaleV || 1);
    gl.uniform4fv(u.uRings, F.rings); gl.uniform4fv(u.uRingA, F.ringA);
    gl.uniform3fv(u.uC0, C[0]); gl.uniform3fv(u.uC1, C[1]); gl.uniform3fv(u.uC2, C[2]); gl.uniform3fv(u.uC3, C[3]);
    this.bindTex(0, this.spec, u.uSpec); this.bindTex(1, this.cover, u.uCover);
    this.quad();
    // particles
    const kinds = [];
    if (F.mode === 'nebula') kinds.push([0, 2600]);
    if (F.mode === 'warp') kinds.push([1, 3200]);
    if (F.dust) kinds.push([2, 180]);
    if (kinds.length) {
      const P = this.part, pu = P.u;
      gl.useProgram(P.p); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform2f(pu.uRes, W, H); gl.uniform2f(pu.uCenter, F.center[0], F.center[1]);
      gl.uniform1f(pu.uFlow, F.flow); gl.uniform1f(pu.uTime, F.t); gl.uniform1f(pu.uBass, F.bass); gl.uniform1f(pu.uHigh, F.high);
      gl.uniform1f(pu.uScale, F.pxScale);
      gl.uniform3fv(pu.uC0, C[0]); gl.uniform3fv(pu.uC1, C[1]); gl.uniform3fv(pu.uC2, C[2]); gl.uniform3fv(pu.uC3, C[3]);
      for (const [k, n] of kinds) { gl.uniform1f(pu.uKind, k); gl.drawArrays(gl.POINTS, 0, Math.round(n * F.particleAmt)); }
      gl.disable(gl.BLEND);
    }
    // 2. accumulate (trails + warp echo)
    const src = this.ping ? this.a1 : this.a0, dst = this.ping ? this.a0 : this.a1; this.ping ^= 1;
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.f);
    gl.useProgram(this.acc.p); const au = this.acc.u;
    gl.uniform2f(au.uRes, W, H); gl.uniform2f(au.uCenterUV, F.center[0] * H / W, F.center[1]);
    gl.uniform1f(au.uDecay, F.trail); gl.uniform1f(au.uZoom, F.warpZoom); gl.uniform1f(au.uTwist, F.twist);
    this.bindTex(0, src.t, au.uPrev); this.bindTex(1, this.scene.t, au.uScene);
    this.quad();
    // 3. bloom
    if (F.glow > 0.01) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.b0.f); gl.viewport(0, 0, this.b0.w, this.b0.h);
      gl.useProgram(this.down.p); gl.uniform2f(this.down.u.uTexel, 1 / W, 1 / H); gl.uniform1f(this.down.u.uThr, F.light ? 0.12 : 0.28);
      this.bindTex(0, dst.t, this.down.u.uTex); this.quad();
      gl.useProgram(this.blur.p); gl.uniform2f(this.blur.u.uRes, this.b0.w, this.b0.h);
      for (let i = 0; i < 2; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.b1.f); gl.uniform2f(this.blur.u.uDir, 1.6 + i, 0); this.bindTex(0, this.b0.t, this.blur.u.uTex); this.quad();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.b0.f); gl.uniform2f(this.blur.u.uDir, 0, 1.6 + i); this.bindTex(0, this.b1.t, this.blur.u.uTex); this.quad();
      }
    }
    // 4. final
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.useProgram(this.fin.p); const fu = this.fin.u;
    gl.uniform2f(fu.uRes, W, H); gl.uniform1f(fu.uGlow, F.glow > 0.01 ? F.glow : 0); gl.uniform1f(fu.uLight, F.light ? 1 : 0);
    gl.uniform1f(fu.uVig, F.vignette); gl.uniform1f(fu.uGrain, F.grain); gl.uniform1f(fu.uBeat, F.beat); gl.uniform1f(fu.uCA, F.ca);
    gl.uniform1f(fu.uTime, F.t); gl.uniform1f(fu.uBackA, F.backdrop); gl.uniform1f(fu.uHasBack, this.hasBack);
    gl.uniform3fv(fu.uBg, F.bg); gl.uniform3fv(fu.uBgL, F.bgLight);
    this.bindTex(0, dst.t, fu.uAcc); this.bindTex(1, this.b0.t, fu.uBloom); this.bindTex(2, this.back, fu.uBack);
    this.quad();
  }
}
window.NavaEngine = Engine;
window.NAVA_MODES = Object.keys(MODES);
})();
