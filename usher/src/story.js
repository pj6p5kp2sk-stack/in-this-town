// story.js: a 3-part recap of "The Fall of the House of Usher" in the town-story look. ?part=1|2|3 picks the part.
// Each part is its own ~30 s video with its own timings file (timings1.json ...).
import * as THREE from 'three';
import { start, shot, frame, LIGHTS } from './core.js';
import { makeAvatar } from './avatar.js';
import { TEX, floor, tree, table, chair, sofa, tv, rug, room, windowPane, counter, bench, bookshelf, lampPost } from './sets.js';
import { TOWN, makeNarrator, handheld, follow, drone, hills, skyDome, house, partyWash, hatOn, stringLights } from './town.js';
import { makeSparkles, makePuff } from './fx.js';
import { canvasTex, mat, tmat, glow, box, at, grp, sign, rng, shade, clamp, remap, lerp, E } from './util.js';

const PART = +(new URLSearchParams(location.search).get('part') || 1);
Object.assign(LIGHTS, {
  gothic: { amb: 0.7, hemi: 0.6, sun: 1.15, dir: [-8, 14, 10], sunColor: '#b9c6f2', bg: '#10142a', exposure: 1.12 },
  candle: { amb: 0.4, hemi: 0.3, sun: 0.5, dir: [6, 14, 10], sunColor: '#ffd2a0', bg: '#140c10', exposure: 1.05 },
  redroom: { amb: 0.35, hemi: 0.25, sun: 0.7, dir: [-6, 14, 10], sunColor: '#ff6a6a', bg: '#1a0808', exposure: 1.0 },
});

// ───────────── props
function raven() {
  const g = grp(), k = '#121216';
  g.add(at(box(0.9, 0.8, 1.5, k, 0.2), 0, 0.6, 0), at(box(0.6, 0.6, 0.6, k, 0.15), 0, 1.25, 0.6), at(box(0.18, 0.18, 0.5, '#3a3a40'), 0, 1.2, 1.1), at(box(0.7, 0.1, 0.9, k), 0, 0.5, -0.9));
  for (const s of [-1, 1]) g.add(at(box(0.12, 0.7, 1.2, '#1c1c24'), s * 0.5, 0.65, -0.05), at(new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), glow('#ff3030', 2)), s * 0.22, 1.35, 0.88));
  return g;
}
function blackCat() {
  const g = grp(), k = '#0e0e12';
  g.add(at(box(0.9, 0.9, 1.7, k, 0.3), 0, 0.75, 0), at(box(0.85, 0.8, 0.8, k, 0.25), 0, 1.45, 0.85));
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), mat(k)); e.position.set(s * 0.26, 1.98, 0.85); g.add(e); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), glow('#ffe14a', 2.6)), s * 0.2, 1.5, 1.26)); }
  for (const [x, z] of [[-0.3, 0.6], [0.3, 0.6], [-0.3, -0.6], [0.3, -0.6]]) g.add(at(box(0.22, 0.4, 0.22, k), x, 0.2, z));
  const tail = grp(at(box(0.16, 1.3, 0.16, k, 0.08), 0, 0.65, 0)); tail.position.set(0, 1, -0.8); tail.rotation.x = -0.5; g.add(tail); g.tail = tail;
  return g;
}
function moneyStack(n = 5) { const g = grp(); for (let i = 0; i < n; i++) g.add(at(box(1.4, 0.3, 0.7, '#4f9a4a', 0.04), 0, 0.15 + i * 0.3, 0), at(box(0.3, 0.31, 0.72, '#e8e2c8'), 0, 0.15 + i * 0.3, 0)); return g; }
function pillBottle() { const g = grp(), b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 16), new THREE.MeshLambertMaterial({ color: '#e8821e', transparent: true, opacity: 0.9 })); b.position.y = 0.45; const c = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 16), mat('#ffffff')); c.position.y = 1.0; g.add(b, c, at(box(0.5, 0.35, 0.05, '#ffffff'), 0, 0.45, 0.34)); return g; }
function candle(h = 1.2) { const g = grp(at(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, h, 10), mat('#f4ecd8')), 0, h / 2, 0)); const f = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), glow('#ffc04a', 2.6)); f.scale.y = 1.6; f.position.y = h + 0.18; g.add(f); return g; }
function candelabra() { const g = grp(at(box(0.25, 1.4, 0.25, '#b89a4a'), 0, 0.7, 0), at(box(1.8, 0.15, 0.15, '#b89a4a'), 0, 1.4, 0)); for (const x of [-0.8, 0, 0.8]) g.add(at(candle(0.8), x, 1.45, 0)); return g; }
function deadTree(h = 10) { const g = grp(at(box(0.8, h, 0.8, '#2a2220'), 0, h / 2, 0)); const r = rng(h * 7); for (let i = 0; i < 6; i++) { const b = box(0.3, 3 + r() * 2, 0.3, '#2a2220'); b.position.set((r() - 0.5) * 1.5, h * (0.55 + r() * 0.4), 0); b.rotation.z = (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6); g.add(b); } return g; }
function mansion() {
  const g = grp(), c = '#3c3844', d = '#17141c';
  g.add(at(house({ w: 26, h: 16, d: 14, color: c, roof: d, lit: 0.35, seed: 13, door: '#2a1414' }), 0, 0, 0));
  for (const x of [-15, 15]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 24, 16), mat(shade(c, -0.08))); t.position.set(x, 12, 1); t.castShadow = true; const r = new THREE.Mesh(new THREE.ConeGeometry(4.2, 8, 16), mat(d)); r.position.set(x, 28, 1); g.add(t, r); g.add(at(box(1.6, 2.6, 0.2, glow('#ffd27a', 1.4)), x, 16, 4.3)); }
  return g;
}
function cage(open = false) {
  const g = grp(at(box(4.4, 0.3, 3.2, '#5a5f66'), 0, 0.15, 0), at(box(4.4, 0.3, 3.2, '#5a5f66'), 0, 5.2, 0));
  for (let i = 0; i <= 8; i++) { if (open && i > 2 && i < 6) continue; g.add(at(box(0.1, 5, 0.1, '#8a8f96'), -2.1 + i * 0.525, 2.65, 1.5)); }
  for (const x of [-2.1, 2.1]) for (const z of [-1.5, 1.5]) g.add(at(box(0.16, 5, 0.16, '#5a5f66'), x, 2.65, z));
  return g;
}
function heartMesh() {
  const s = new THREE.Shape(); s.moveTo(0, -1.4); s.bezierCurveTo(-2.6, 0.2, -1.6, 2.2, 0, 1); s.bezierCurveTo(1.6, 2.2, 2.6, 0.2, 0, -1.4);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: true, bevelSize: 0.15, bevelThickness: 0.15 }), mat('#c0101a', { emissive: new THREE.Color('#ff1020'), emissiveIntensity: 0.9 }));
  return grp(m);
}

start(() => {
  // ───────────── cast options
  const ME = { color: '#3553b8', print: 'BINGE' };
  const O = {
    verna: { seed: 21, skin: 'fair', hair: 'long', hairColor: '#0e0b0b', top: 'dress', topColor: '#16141a', sleeves: 'long', bottom: 'plain', bottomColor: '#16141a', shoe: '#0e0e10', sole: '#0e0e10', face: 'smirk' },
    rod: { seed: 22, skin: 'fair', hair: 'swoop', hairColor: '#cfcfd4', top: 'suit', topColor: '#26262c', tie: '#7a1a1a', sleeves: 'long', bottom: 'slacks', bottomColor: '#202026', shoe: '#111', sole: '#111' },
    mad: { seed: 23, skin: 'fair', hair: 'bob', hairColor: '#e4e4ea', top: 'suit', topColor: '#ece6da', tie: '#ece6da', sleeves: 'long', bottom: 'slacks', bottomColor: '#ece6da', shoe: '#d8d0c0', sole: '#bbb' },
    rodY: { seed: 22, skin: 'fair', hair: 'swoop', hairColor: '#2a1a12', top: 'suit', topColor: '#6a4a2a', tie: '#c9a03a', sleeves: 'long', bottom: 'slacks', bottomColor: '#4a3420' },
    madY: { seed: 23, skin: 'fair', hair: 'bob', hairColor: '#2a1a12', top: 'dress', topColor: '#3a5a8a', sleeves: 'long', bottom: 'plain', bottomColor: '#3a5a8a' },
    fred: { seed: 31, skin: 'fair', hair: 'short', hairColor: '#5a3a1a', top: 'suit', topColor: '#2a3a5a', tie: '#c9a03a', sleeves: 'long', bottom: 'slacks', bottomColor: '#22283a', glasses: true },
    tam: { seed: 32, skin: 'fair', hair: 'long', hairColor: '#f0d890', top: 'dress', topColor: '#f4f0f6', sleeves: 'none', bottom: 'plain', bottomColor: '#f4f0f6' },
    vic: { seed: 33, skin: 'tan', hair: 'bob', hairColor: '#1a1210', top: 'shirt', topColor: '#f6f6f6', sleeves: 'long', bottom: 'slacks', bottomColor: '#30303a' },
    leo: { seed: 34, skin: 'light', hair: 'messy', hairColor: '#1a1210', top: 'zip', topColor: '#6a2a8a', inner: '#111', sleeves: 'long', bottom: 'jeans', bottomColor: '#2a2a33' },
    cam: { seed: 35, skin: 'brown', hair: 'buzz', hairColor: '#f4f4f4', top: 'suit', topColor: '#111114', tie: '#111114', sleeves: 'long', bottom: 'slacks', bottomColor: '#111114' },
    pros: { seed: 36, skin: 'fair', hair: 'swoop', hairColor: '#f0c870', top: 'shirt', topColor: '#ff5fa8', sleeves: 'long', bottom: 'slacks', bottomColor: '#f4f4f4' },
    dupin: { seed: 37, skin: 'deep', hair: 'short', hairColor: '#9a9aa2', top: 'suit', topColor: '#3a3a42', tie: '#2a4a8a', sleeves: 'long', bottom: 'slacks', bottomColor: '#2a2a30', glasses: true },
    chimp: { seed: 38, skin: '#6b4a32', hair: 'afro', hairColor: '#3a2414', top: 'plain', topColor: '#4a3020', sleeves: 'long', bottom: 'plain', bottomColor: '#4a3020', shoe: '#3a2414', sole: '#3a2414', height: 0.85, face: 'angry' },
    g1: { seed: 41, skin: 'tan', hair: 'ponytail', hairColor: '#5a3a1a', top: 'tee', topColor: '#7dffa8', bottom: 'skirt', bottomColor: '#3a3a8a' },
    g2: { seed: 42, skin: 'light', hair: 'spiky', hairColor: '#e8a03a', top: 'tee', topColor: '#ffe46a', bottom: 'jeans', bottomColor: '#3a4f7a' },
    g3: { seed: 43, skin: 'deep', hair: 'buns', hairColor: '#1b1210', top: 'stripes', topColor: '#ff9ac8', bottom: 'jeans', bottomColor: '#4f79a7' },
  };
  const KIDS = ['fred', 'tam', 'vic', 'leo', 'cam', 'pros'];
  const castIn = (set, names) => { const C = {}; for (const n of names) { C[n] = n === 'me' ? makeNarrator(ME) : makeAvatar(O[n]); set.group.add(C[n].root); } C.sp = makeSparkles(set.group, 3); C.puff = makePuff(set.group); return C; };
  const on = a => a.reset().size(a.baseHeight);
  const zap = (c, at0, dur = 0.12, k = 0.55) => { c.shot.flash = () => (c.lt >= at0 && c.lt < at0 + dur ? k : 0); };

  // ───────────── sets (built only when a part needs them)
  const S = {};
  S.ext = () => { const g = grp(skyDome('night'), hills('#141e16', -140), at(floor(400, 300, TEX.grass('#1e2a1e'), 6), 0, -0.02, 0), at(mansion(), 0, 0, -14)); const s = { group: g, light: 'gothic' };
    for (const [x, z, h] of [[-22, 2, 11], [24, 0, 12], [-34, -10, 10], [34, -12, 9]]) g.add(at(deadTree(h), x, 0, z));
    for (let i = 0; i < 21; i++) g.add(at(box(0.2, 4, 0.2, '#0c0c10'), -30 + i * 3, 2, 8)); g.add(at(box(60, 0.25, 0.2, '#0c0c10'), 0, 3.8, 8), at(box(60, 0.25, 0.2, '#0c0c10'), 0, 1.2, 8));
    const rv = raven(); g.add(at(rv, -6, 4.1, 8, 0.4)); s.mansion = g.children[3]; s.raven = rv; s.reset = () => { s.mansion.position.set(0, 0, -14); s.mansion.rotation.set(0, 0, 0); };
    for (const x of [-4, 4]) { const L = new THREE.PointLight('#ffd27a', 120, 22, 2); L.position.set(x, 5, -5); g.add(L); }
    const moonL = new THREE.PointLight('#9fb0ff', 900, 70, 1.6); moonL.position.set(-6, 16, 14); g.add(moonL);
    return s; };
  S.bed = () => { const s = TOWN.roomNight({ wall: '#2a2f4a', bed: '#5a2a3a', shelf: true }); s.group.add(at(tv(), 2, 0, 11, Math.PI)); const L = new THREE.PointLight('#8fb4ff', 300, 30, 2); L.position.set(2, 4.5, 9); s.group.add(L); return s; };
  S.bar = () => { const g = room({ floorTex: TEX.checker('#2a1a1a', '#4a2a2a'), tile: 3, wallColor: '#5a1f2a', trim: '#2a0c12', trimY: 3, w: 30, d: 22, h: 11, lights: 0, ceiling: '#140a0c' });
    g.add(at(counter(18, '#3a1a10', '#7a4a2a'), 0, 0, -3.6), at(sign('HAPPY NEW YEAR!', 10, 1.8, { bg: '#1a0a10', fg: '#ffd24a', glowing: true }), -4, 8.6, -5.85), at(sign('1979', 4.4, 2.2, { bg: '#1a0a10', fg: '#ff5fd8', glowing: true }), 7, 8.4, -5.85));
    for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 1.1, 10), glow(['#3a9a5a', '#c98a2a', '#8a2a2a', '#5a7ac9'][i % 4], 0.9)); b.position.set(-8 + i * 1.2, 5.9, -5.5); g.add(b); }
    g.add(at(box(18, 0.2, 0.8, '#3a1a10'), 0, 5.2, -5.6));
    const L = new THREE.PointLight('#ffb070', 220, 30, 2); L.position.set(0, 9, 2); g.add(L);
    const rv = raven(); g.add(at(rv, 5.6, 3.3, -3.4, -0.4)); return { group: g, light: 'candle' }; };
  S.office = () => { const g = room({ floorTex: TEX.checker('#ffffff', '#d0d8e0'), wallColor: '#dfe6ec', trim: '#8a9aa8', w: 36, d: 24, lights: 3 });
    const tg = grp(at(table(14, 4, '#2a2a30', 2.7), 0, 0, 1)); g.add(tg);
    for (const x of [-5, -3.2, 3.6, 5.4]) tg.add(at(moneyStack(4 + (x > 0 ? 2 : 0)), x, 2.83, 1.6));
    for (let i = 0; i < 6; i++) tg.add(at(pillBottle(), -1.6 + i * 0.65, 2.83, 0.6));
    const scr = grp(at(box(14, 7, 0.3, '#1a1a22'), 0, 0, 0), at(sign('PROFITS', 6, 1.2, { bg: '#1a1a22', fg: '#ffffff', glowing: true }), -3.5, 2.6, 0.2)); for (let i = 0; i < 6; i++) scr.add(at(box(1.2, 0.8 + i * 0.9, 0.1, glow('#4bd17a', 1.2)), -4.5 + i * 1.8, -3.1 + (0.8 + i * 0.9) / 2, 0.2));
    g.add(at(scr, 0, 7.4, -5.7)); return { group: g, light: 'indoor', tg, reset() { tg.visible = true; } }; };
  S.street = () => { const s = TOWN.street({ time: 'night', lit: 0.3 }); s.group.add(at(bench(), -4, 0, 3)); return s; };
  S.dine = () => { const g = room({ floorTex: TEX.wood('#3a2418'), tile: 6, wallColor: '#2a1f2a', trim: '#5a3a2a', trimY: 4, w: 34, d: 24, h: 13, lights: 0, ceiling: '#120c10' });
    g.add(at(table(20, 4, '#4a2a1a', 2.7), 0, 0, 1)); const chairs = []; for (let i = 0; i < 6; i++) { const ch = chair('#5a1f2a', 1.5); g.add(at(ch, -7.5 + i * 3, 0, -1.3)); chairs.push(ch); }
    for (const x of [-9.4, 9.4]) g.add(at(candelabra(), x, 2.83, 1.8));
    g.add(at(sign('USHER', 8, 1.8, { bg: '#1a1014', fg: '#c9a03a', border: '#c9a03a' }), 0, 9.6, -5.85));
    for (const x of [-11, 11]) g.add(at(box(4, 5, 0.3, '#6a4a2a'), x, 7.5, -5.8), at(box(3.4, 4.4, 0.1, '#2a2430'), x, 7.5, -5.62));
    for (const x of [-6, 6]) { const L = new THREE.PointLight('#ffc070', 160, 24, 2); L.position.set(x, 6, 3); g.add(L); }
    return { group: g, light: 'candle', seats: Array.from({ length: 6 }, (_, i) => -7.5 + i * 3) }; };
  S.party = () => { const g = room({ floorTex: TEX.concrete('#5a5a60'), tile: 5, wallColor: '#2e2e38', trim: '#1e1e26', trimY: 3, w: 40, d: 26, h: 14, lights: 0, ceiling: '#18181e' });
    g.add(at(box(40, 0.4, 0.4, '#6a6a72'), 0, 13.2, 2)); for (let i = 0; i < 7; i++) g.add(at(box(0.5, 0.6, 0.5, '#9a9aa2'), -15 + i * 5, 12.8, 2));
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), glow('#e8e8ff', 1.3)); ball.position.set(0, 11, 0); g.add(ball, at(stringLights(36, 1.4, ['#ff6fd8', '#7dffa8', '#ffe46a', '#7ab8ff']), 0, 12, -5), at(sign('KEEP OUT', 5, 1.4, { bg: '#e8c33a', fg: '#1a1a1a' }), -12, 7, -5.85));
    for (const x of [-16, 16]) g.add(at(box(2.6, 4.5, 2.6, '#121216'), x, 2.25, -4));
    const drops = []; for (let i = 0; i < 70; i++) { const d = box(0.12, 0.7, 0.12, glow('#9dff3a', 1.8)); d.userData = { x: -15 + (i % 7) * 5 + Math.sin(i * 7.1) * 1.4, z: 2 + Math.cos(i * 3.3) * 2.5, ph: (i * 0.37) % 1 }; d.visible = false; g.add(d); drops.push(d); }
    const P = partyWash(g, { strength: 0.6 });
    return { group: g, light: 'partyNight', update: t => P.update(t), drops, rain(lt, on) { for (const d of drops) { const u = d.userData; d.visible = on; d.position.set(u.x, 12.5 - ((lt * 10 + u.ph * 12) % 12.5), u.z); } } }; };
  S.lab = () => { const g = room({ floorTex: TEX.checker('#ffffff', '#cfd8d4'), wallColor: '#bfe0d6', trim: '#5a9a8a', trimY: 4, w: 36, d: 24, lights: 2 });
    const cg = cage(true); g.add(at(cage(), -10, 0, -3.8), at(cg, 9, 0, -3.8), at(counter(9, '#e8eef0', '#5a9a8a'), -1, 0, -4.4));
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.9, 12), glow(['#7dffa8', '#7ab8ff', '#ff6fd8'][i % 3], 1)); b.position.set(-4 + i * 1.5, 3.75, -4.4); g.add(b); }
    g.add(at(sign('LAB 07', 4, 1.4, { bg: '#1a2a2a', fg: '#7dffa8', glowing: true }), 0, 8.6, -5.85)); return { group: g, light: 'night' }; };
  S.apt = () => { const s = TOWN.roomNight({ wall: '#4a2a5a', rug: '#c33a3a', shelf: true }); s.group.add(at(sofa('#2a2a30'), -3, 0, -4)); const c1 = blackCat(), c2 = blackCat(); s.group.add(at(c1, -4.5, 1.75, -3.8, 0.3), at(c2, 11, 6.05, -5, -0.4)); s.cats = [c1, c2]; s.reset = () => { c1.visible = c2.visible = false; }; return s; };
  S.mirror = () => { const g = room({ floorTex: TEX.checker('#1a1a22', '#2e2e3a'), tile: 3, wallColor: '#1a1a24', trim: '#3a3a4a', trimY: 3, w: 34, d: 24, h: 13, lights: 0, ceiling: '#0e0e14' });
    const glass = () => new THREE.Mesh(new THREE.PlaneGeometry(4, 7.5), new THREE.MeshBasicMaterial({ color: '#b8c8e8', transparent: true, opacity: 0.22, depthWrite: false }));
    for (const x of [-5.5, 0, 5.5]) g.add(at(box(4.6, 8.1, 0.3, '#c9c9d4'), x, 4.2, -2.4), at(glass(), x, 4.2, -2.2));
    for (const x of [-5.5, 0, 5.5]) { const L = new THREE.PointLight('#b8c8ff', 70, 10, 2); L.position.set(x, 9, -3.5); g.add(L); }
    const L = new THREE.PointLight('#d8e0ff', 140, 24, 2); L.position.set(0, 8, 6); g.add(L); return { group: g, light: 'gothic' }; };
  S.heart = () => { const g = room({ floorTex: TEX.checker('#1a0a0a', '#2a1010'), tile: 3, wallColor: '#2a0c10', trim: '#4a1a1a', trimY: 3, w: 30, d: 22, h: 12, lights: 0, ceiling: '#100406' });
    const h = heartMesh(); h.position.set(0, 7, -4); g.add(h); const L = new THREE.PointLight('#ff3040', 260, 30, 2); L.position.set(0, 6, 2); g.add(L); return { group: g, light: 'redroom', heart: h, lamp: L }; };
  S.pit = () => { const g = room({ floorTex: TEX.checker('#2a2622', '#3a342e'), tile: 3, wallColor: '#3a3430', trim: '#2a2420', trimY: 3, w: 30, d: 22, h: 16, lights: 0, ceiling: '#141010' });
    g.add(at(box(3.4, 2.6, 7.4, '#4a4038'), 0, 1.3, 0)); for (const z of [-1.5, 1.2, 3]) g.add(at(box(3.6, 0.3, 0.3, '#6a5a3a'), 0, 3.4, z));
    const piv = grp(); const arm = box(0.3, 9, 0.3, '#6a6a72'); arm.position.y = -4.5; const blade = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32, Math.PI, Math.PI), new THREE.MeshLambertMaterial({ color: '#8a909a', side: THREE.DoubleSide, emissive: new THREE.Color('#2a2a34') })); blade.position.y = -9; piv.add(arm, blade); piv.position.set(0, 15.5, 0.5); g.add(piv);
    const L = new THREE.PointLight('#ffb070', 200, 26, 2); L.position.set(-6, 9, 6); g.add(L); return { group: g, light: 'candle', piv }; };
  S.talk = () => { const s = TOWN.roomNight({ wall: '#3a3028', floor: '#4a3424', rug: '#5a1f2a' }); s.group.add(at(chair('#5a1f2a', 1.6), -3.2, 0, -1, 0.5), at(chair('#5a1f2a', 1.6), 3.2, 0, -1, -0.5), at(box(1.6, 2.2, 1.6, '#3a2418'), 0, 1.1, -2));
    for (const x of [-0.4, 0.4]) s.group.add(at(candle(0.9), x, 2.2, -2)); const L = new THREE.PointLight('#ffc070', 140, 18, 2); L.position.set(0, 4, -1); s.group.add(L); s.light = 'candle'; return s; };

  // ───────────── PART 1: the deal
  if (PART === 1) {
    const ext = S.ext(), bar = S.bar(), off = S.office(), st = S.street(), din = S.dine(), bed = S.bed();
    const X = castIn(ext, []), B = castIn(bar, ['verna', 'rodY', 'madY']), F = castIn(off, ['rod', 'mad']), T = castIn(st, ['g1', 'g2']), D = castIn(din, [...KIDS, 'rod']), M = castIn(bed, ['me']), V = castIn(din, ['verna']);
    const seated = (t, faces) => KIDS.forEach((k, i) => on(D[k]).place(din.seats[i], -1.3, 0).sit(1.5).setFace(faces[i % faces.length]).idle(t, 0.6));
    shot({ line: 'In this world,', set: ext, sfx: [['whoosh', 0]], cam: drone([0, 8, -14], { h: 22, back: 50, drift: [6, -2, -10], fov: 52 }) });
    shot({ line: 'if you make a deal', set: bar, cam: frame(3, -1.2, { size: 'medium', side: -14 }),
      act(lt, c) { on(B.verna).place(3, -1.2, -0.3).pose({ aR: [80, 0] }).setFace('smirk').idle(c.t); } });
    shot({ line: 'with a mysterious woman named Verna,', set: bar, cam: frame(3, -1.2, { size: 'close', side: 12, push: 0.1 }),
      act(lt, c) { on(B.verna).place(3, -1.2, 0.1).setFace(lt < c.w('verna') ? 'smirk' : 'smug').idle(c.t); } });
    shot({ line: 'you get everything you want.', set: off, sfx: [['sparkle', 'everything', 0.6]], cam: { pos: [4.5, 5, 7], look: [4.5, 3.4, 1.6], fov: 46, blur: 0.2, push: 0.1 },
      act(lt, c) { F.sp.at(lt - c.w('everything'), [4.5, 1.5, 1.6], 0.9); } });
    shot({ line: 'Roderick Usher', set: bar, cam: frame(-2.5, -1.2, { size: 'close', side: -10 }),
      act(lt, c) { on(B.rodY).place(-2.5, -1.2, 0.1).setFace('calm').idle(c.t); } });
    shot({ line: 'and his twin sister Madeline', set: bar, cam: frame(0, -1.2, { size: 'close', side: 12 }),
      act(lt, c) { on(B.madY).place(0, -1.2, -0.1).setFace('smirk').idle(c.t); } });
    shot({ line: "made that deal on New Year's Eve,", set: bar, cam: frame(0.3, -1.2, { size: 'medium', side: 0, dist: 1.6 }),
      act(lt, c) { const k = remap(lt, c.w('deal') - 0.1, c.w('deal') + 0.2); on(B.rodY).place(-2.5, -1.2, 0.5).pose({ aR: [lerp(0, 80, k), -20] }).setFace('joy').idle(c.t); on(B.madY).place(0, -1.2, 0.2).setFace('smirk').idle(c.t); on(B.verna).place(3, -1.2, -0.5).pose({ aR: [lerp(0, 80, k), -20] }).setFace('smirk').idle(c.t); } });
    shot({ line: 'nineteen seventy-nine.', set: bar, cam: { pos: [7, 8.2, 2], look: [7, 8.4, -5.85], fov: 44, blur: 0, push: 0.12 } });
    shot({ line: 'They became billionaires,', set: off, cam: frame(0, -1.2, { size: 'medium', side: 10, dist: 1.4 }),
      act(lt, c) { off.tg.visible = false; on(F.rod).place(-1.6, -1.2, 0.2).pose('open').setFace('joy').idle(c.t); on(F.mad).place(1.6, -1.2, -0.2).pose('hips').setFace('smug').idle(c.t); } });
    shot({ line: 'running a giant drug company', set: off, cam: { pos: [0.4, 4.6, 5.5], look: [0, 3.2, 0.6], fov: 44, blur: 0.3, push: 0.1 } });
    shot({ line: 'that made people sick', set: st, cam: frame(-4, 3, { size: 'medium', side: 14, dist: 1.2 }),
      act(lt, c) { on(T.g1).place(-5.2, 3, 0.1).sit(1.3).pose('slump').setFace('sad').idle(c.t, 0.3); on(T.g2).place(-2.8, 3, -0.1).sit(1.3).pose('slump').setFace('worried').idle(c.t, 0.3); } });
    shot({ line: 'while they got rich.', set: off, cam: frame(-1.6, -1.2, { size: 'close', side: -12 }),
      act(lt, c) { off.tg.visible = false; on(F.rod).place(-1.6, -1.2, -0.1).setFace('smug').idle(c.t); } });
    shot({ line: 'But there was one price.', set: bed, cam: frame(2, 2.5, { size: 'close', side: -10 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('serious').idle(c.t); } });
    shot({ line: 'Their whole bloodline would end with them,', set: din, cam: { pos: [0, 7, 15], look: [0, 3.5, -1], fov: 52, blur: 0.05, push: 0.07 },
      act(lt, c) { seated(c.t, ['calm', 'smug', 'serious', 'calm', 'smirk', 'joy']); } });
    shot({ line: 'and nobody could ever punish them', set: off, cam: frame(1.6, -1.2, { size: 'close', side: 12 }),
      act(lt, c) { off.tg.visible = false; on(F.mad).place(1.6, -1.2, 0.1).setFace('smirk').idle(c.t); } });
    shot({ line: 'while they lived.', set: bar, cam: frame(3, -1.2, { size: 'face', side: -8, push: 0.1 }),
      act(lt, c) { on(B.verna).place(3, -1.2, 0).setFace(lt < c.w('lived') ? 'smirk' : 'wink').idle(c.t); } });
    shot({ line: 'Years later,', set: ext, sfx: [['whoosh', 0, 0.6]], cam: { pos: [-20, 6, 26], look: [0, 10, -14], fov: 50, blur: 0, push: 0.05 } });
    shot({ line: 'Roderick has six grown-up children.', set: din, cam: { pos: [-8, 5.2, 9], look: [-6, 4, -1.3], fov: 50, blur: 0.15, push: 0, to: { pos: [8, 5.2, 9], look: [6, 4, -1.3] }, ease: 'lin' },
      act(lt, c) { seated(c.t, ['calm', 'smug', 'serious', 'joy', 'smirk', 'joy']); on(D.rod).place(10.6, -1.6, -0.5).pose('hips').setFace('serious').idle(c.t); } });
    shot({ line: 'And in just two weeks,', set: bed, sfx: [['tick', 'weeks']], cam: frame(2, 2.5, { size: 'close', side: 12, push: 0.1 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0.1).setFace('uneasy').idle(c.t); } });
    shot({ line: 'every single one of them', set: din, cam: frame(-1.5, -1.3, { size: 'medium', side: 0, dist: 1.7 }),
      act(lt, c) { seated(c.t, ['gasp', 'worried']); } });
    shot({ line: 'is going to die.', set: din, sfx: [['thud', 'die']], cam: frame(12.5, -3.5, { size: 'close', side: -14, push: 0.12 }),
      act(lt, c) { on(V.verna).place(12.5, -3.5, -0.4).setFace('smirk').idle(c.t, 0.4); } });
  }

  // ───────────── PART 2: it begins
  if (PART === 2) {
    const ext = S.ext(), din = S.dine(), bed = S.bed(), pty = S.party(), lab = S.lab(), apt = S.apt();
    const D = castIn(din, [...KIDS]), M = castIn(bed, ['me']), P = castIn(pty, ['pros', 'g1', 'g2', 'g3', 'verna']), L = castIn(lab, ['cam', 'chimp', 'verna']), A = castIn(apt, ['leo', 'verna']);
    const hats = [hatOn(P.g1, '#ff6fd8'), hatOn(P.g2, '#7dffa8'), hatOn(P.g3, '#ffe46a')];
    const dance = (t, faces) => [P.g1, P.g2, P.g3].forEach((a, i) => on(a).place([-5, 5, 2.5][i], [1, 0.5, -2.5][i], [0.4, -0.4, 0.1][i]).pose(i % 2 ? 'cheer' : 'wave').setFace(faces[i % faces.length]).jump((t * 2.2 + i * 0.3) % 1, 0.5));
    shot({ line: 'In this world,', set: ext, sfx: [['thud', 0, 0.6]], cam: drone([0, 8, -14], { h: 20, back: 48, drift: [-6, -2, -10], fov: 52 }), act(lt, c) { zap(c, 0.25); } });
    shot({ line: 'the Usher kids start dying', set: din, cam: { pos: [0, 7, 15], look: [0, 3.5, -1], fov: 52, blur: 0.05, push: 0.08 },
      act(lt, c) { KIDS.forEach((k, i) => on(D[k]).place(din.seats[i], -1.3, 0).sit(1.5).setFace(['worried', 'gasp', 'uneasy'][i % 3]).idle(c.t, 0.5)); } });
    shot({ line: 'in the strangest ways.', set: bed, cam: frame(2, 2.5, { size: 'close', side: -12 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('uneasy').idle(c.t); } });
    shot({ line: 'First, Prospero, the youngest,', set: pty, cam: frame(0, 2, { size: 'close', side: 12 }),
      act(lt, c) { on(P.pros).place(0, 2, -0.1).pose({ aR: [150, 20] }).setFace('joy').idle(c.t); dance(c.t, ['joy']); } });
    shot({ line: 'throws a wild secret party', set: pty, sfx: [['pop', 'party', 0.6]], cam: { pos: [-6, 6, 16], look: [0, 4, 0], fov: 54, blur: 0, push: 0.07 },
      act(lt, c) { on(P.pros).place(0, 2, 0).pose('cheer').setFace('joy').jump((c.t * 2) % 1, 0.6); dance(c.t, ['joy', 'winkjoy']); } });
    shot({ line: 'in an old abandoned building,', set: pty, cam: { pos: [12, 4, 10], look: [-6, 6, -5], fov: 54, blur: 0, push: 0.06 },
      act(lt, c) { on(P.pros).place(0, 2, 0.4).pose('cheer').setFace('joy').idle(c.t); dance(c.t, ['joy']); } });
    shot({ line: 'and acid pours down', set: pty, sfx: [['whoosh', 'acid', 0.7]], cam: { pos: [0, 9, 9], look: [0, 12.5, 2], fov: 54, blur: 0, push: 0.08 },
      act(lt, c) { pty.rain(lt - c.w('acid'), lt >= c.w('acid')); } });
    shot({ line: 'from the sprinklers.', set: pty, cam: handheld(frame(0, 2, { size: 'medium', side: -14, dist: 1.4 }), 1.2),
      act(lt, c) { pty.rain(lt + 1, true); on(P.pros).place(0, 2, 0).pose({ aL: [160, 40], aR: [160, 40] }).setFace('scream').idle(c.t); dance(c.t, ['scream', 'gasp']); on(P.verna).place(-9, -4, 0.3).setFace('smirk'); } });
    shot({ line: 'Next, Camille', set: lab, cam: frame(-2, 2, { size: 'close', side: -12 }),
      act(lt, c) { on(L.cam).place(-2, 2, 0.1).setFace('sus').idle(c.t); } });
    shot({ line: "sneaks into her sister's lab at night", set: lab, cam: { pos: [-12, 6, 14], look: [0, 3, -1], fov: 54, blur: 0, push: 0.06 },
      act(lt, c) { on(L.cam).place(-8 + lt * 2.2, 2, Math.PI / 2).walk(c.t, 0.5, 22).setFace('sus'); } });
    shot({ line: 'to spy on her,', set: lab, cam: frame(2, 1, { size: 'close', side: 16 }),
      act(lt, c) { on(L.cam).place(2, 1, 0.4).pose('think').setFace('smirk').lookAt(9, -3).idle(c.t); } });
    shot({ line: 'and gets attacked', set: lab, sfx: [['boing', 'attacked', 0.7]], cam: handheld(frame(8, -0.5, { size: 'medium', h: 0.85, side: -10 }), 1.2),
      act(lt, c) { const k = remap(lt, c.w('attacked'), c.w('attacked') + 0.35); on(L.chimp).place(8, lerp(-3.8, -0.5, E.out(k)), -0.3).pose('reach').setFace('angry').jump(k, 1.6); } });
    shot({ line: 'by an angry chimpanzee.', set: lab, cam: handheld(frame(3.5, 1, { size: 'medium', side: 14, dist: 1.3 }), 1.4),
      act(lt, c) { on(L.cam).place(2, 1, -0.6).pose({ aL: [150, 40], aR: [150, 40] }).setFace('scream').idle(c.t); on(L.chimp).place(5.2, 1.2, -0.9).pose('reach').setFace('angry').jump((lt * 2.5) % 1, 0.6); on(L.verna).place(-15.5, -2, 0.4).setFace('smirk'); } });
    shot({ line: 'Then Leo', set: apt, cam: frame(2, 2, { size: 'close', side: 12 }),
      act(lt, c) { on(A.leo).place(2, 2, -0.1).setFace('uneasy').idle(c.t); } });
    shot({ line: 'is haunted by a black cat', set: apt, sfx: [['pop', 'cat', 0.6]], cam: { pos: [-3.5, 3.4, 1.5], look: [-4.5, 2.6, -3.8], fov: 46, blur: 0.2, push: 0.1 },
      act(lt, c) { apt.cats[0].visible = true; apt.cats[0].tail.rotation.z = Math.sin(c.t * 3) * 0.4; } });
    shot({ line: "that just won't die,", set: apt, cam: { pos: [6, 6, 4], look: [11, 6.8, -5], fov: 46, blur: 0.1, push: 0.1 },
      act(lt, c) { apt.cats[1].visible = true; apt.cats[1].tail.rotation.z = Math.sin(c.t * 3) * 0.4; on(A.leo).place(5, 0.5, -0.9).setFace('gasp').idle(c.t); } });
    shot({ line: 'no matter what he does.', set: apt, cam: frame(2, 2, { size: 'medium', side: -16 }),
      act(lt, c) { on(A.leo).place(2, 2, 0.2).pose('shrug').setFace('worried').idle(c.t); } });
    shot({ line: 'And every time, the same woman', set: lab, cam: { pos: [-12.5, 4.5, 6], look: [-15.5, 4, -2], fov: 44, blur: 0.1, push: 0.1 },
      act(lt, c) { on(L.verna).place(-15.5, -2, 0.3).setFace('smirk').idle(c.t, 0.3); } });
    shot({ line: 'shows up right before it happens.', set: apt, cam: frame(-8, 0, { size: 'medium', side: 12 }),
      act(lt, c) { on(A.verna).place(-8, 0, 0.3).pose({ aR: [40, -10] }).setFace('smirk').idle(c.t, 0.3); } });
    shot({ line: 'Verna. //', set: apt, sfx: [['thud', 'verna', 0.7]], cam: frame(-8, 0, { size: 'face', side: -6, push: 0.12 }),
      act(lt, c) { on(A.verna).place(-8, 0, 0).setFace('smug'); zap(c, 0.05, 0.1, 0.4); } });
    shot({ line: 'Three kids are gone.', set: din, cam: { pos: [0, 6, 12], look: [0, 3.5, -1.3], fov: 50, blur: 0.05, push: 0.08 },
      act(lt, c) { ['fred', 'tam', 'vic'].forEach((k, i) => on(D[k]).place(din.seats[i], -1.3, 0).sit(1.5).setFace('worried').idle(c.t, 0.4)); } });
    shot({ line: 'Three are left.', set: bed, cam: frame(2, 2.5, { size: 'close', side: 10, push: 0.12 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('gasp').idle(c.t, 0.4); } });
  }

  // ───────────── PART 3: the fall
  if (PART === 3) {
    const ext = S.ext(), din = S.dine(), bed = S.bed(), mir = S.mirror(), ht = S.heart(), pit = S.pit(), tk = S.talk();
    const D = castIn(din, ['fred', 'tam', 'vic', 'rod', 'mad']), M = castIn(bed, ['me']), R = castIn(mir, ['tam']), H = castIn(ht, ['vic']), P = castIn(pit, ['fred']), K = castIn(tk, ['rod', 'dupin']), X = castIn(ext, ['verna']);
    const refl = [-5.5, 0, 5.5].map(() => { const a = makeAvatar(O.tam); mir.group.add(a.root); return a; });
    const showRefl = (t, face) => refl.forEach((a, i) => on(a).place([-5.5, 0, 5.5][i], -4.2, [0.3, 0, -0.3][i]).setFace(face).idle(t + i));
    shot({ line: 'In this world,', set: ext, sfx: [['thud', 0, 0.6]], cam: drone([0, 8, -14], { h: 24, back: 52, drift: [8, -2, -10], fov: 52 }), act(lt, c) { zap(c, 0.3); } });
    shot({ line: 'the last Usher kids never stood a chance.', set: din, cam: { pos: [-4.5, 6, 12], look: [-4.5, 3.6, -1.3], fov: 48, blur: 0.05, push: 0.08 },
      act(lt, c) { ['fred', 'tam', 'vic'].forEach((k, i) => on(D[k]).place(din.seats[i], -1.3, 0).sit(1.5).setFace(['worried', 'uneasy', 'sad'][i]).idle(c.t, 0.4)); } });
    shot({ line: 'Tamerlane is haunted by her own mirrors,', set: mir, cam: { pos: [3, 5, 12], look: [0, 4, -2], fov: 52, blur: 0.05, push: 0.07 },
      act(lt, c) { on(R.tam).place(0, 2, 0.2).setFace('uneasy').idle(c.t); showRefl(c.t, lt < c.w('mirrors') ? 'uneasy' : 'smirk'); } });
    shot({ line: "until she can't tell what's real anymore.", set: mir, cam: frame(0, 2, { size: 'close', side: -14, push: 0.1 }),
      act(lt, c) { on(R.tam).place(0, 2, -0.1).setFace(lt < c.w('real') ? 'worried' : 'scream').idle(c.t); showRefl(c.t, 'laugh'); } });
    shot({ line: 'Victorine', set: ht, cam: frame(0, 1, { size: 'close', side: 10 }),
      act(lt, c) { on(H.vic).place(0, 1, 0).setFace('uneasy').idle(c.t); } });
    shot({ line: "can't stop hearing a heartbeat.", set: ht, sfx: [['thud', 'hearing', 0.9], ['thud', 'heartbeat', 0.9]], cam: frame(0, 1, { size: 'medium', side: -12, dist: 1.4 }),
      act(lt, c) { const b = Math.pow(Math.abs(Math.sin(c.t * 4.2)), 6); ht.heart.scale.setScalar(1 + b * 0.25); ht.lamp.intensity = 200 + b * 300; on(H.vic).place(0, 1, 0.2).pose({ aL: [150, -10], aR: [150, -10], head: [10, 0, 0] }).setFace('worried').idle(c.t); } });
    shot({ line: 'Frederick ends up tied down', set: pit, cam: { pos: [5, 8, 7], look: [0, 3, 0.5], fov: 50, blur: 0.1, push: 0.08 },
      act(lt, c) { on(P.fred).place(0, 2.6, 0, 3.0); P.fred.root.rotation.x = -Math.PI / 2; P.fred.setFace('scream'); pit.piv.rotation.z = Math.sin(c.t * 2.4) * 0.7; } });
    shot({ line: 'under a giant swinging blade.', set: pit, sfx: [['whoosh', 0, 0.6], ['whoosh', 0.65, 0.6]], cam: handheld({ pos: [0, 3.5, 12], look: [0, 8, 0.5], fov: 56, blur: 0, push: 0.08 }, 1),
      act(lt, c) { on(P.fred).place(0, 2.6, 0, 3.0); P.fred.root.rotation.x = -Math.PI / 2; P.fred.setFace('scream'); pit.piv.position.y = 15.5 - lt * 0.6; pit.piv.rotation.z = Math.sin(c.t * 2.4) * 0.7; } });
    shot({ line: 'Then Roderick invites Auguste Dupin,', set: tk, cam: { pos: [0, 5, 11], look: [0, 3.5, -1], fov: 52, blur: 0.05, push: 0.07 },
      act(lt, c) { on(K.rod).place(-3.2, -1, 0.5).sit(1.6).setFace('serious').idle(c.t, 0.4); on(K.dupin).place(3.2, -1, -0.5).sit(1.6).setFace('serious').idle(c.t, 0.4); } });
    shot({ line: 'the lawyer who spent years trying to stop him,', set: tk, cam: frame(3.2, -1, { size: 'close', side: -24 }),
      act(lt, c) { on(K.dupin).place(3.2, -1, -0.5).sit(1.6).setFace('sus').idle(c.t, 0.5); } });
    shot({ line: 'to his old family house,', set: ext, cam: { pos: [14, 4, 22], look: [0, 10, -14], fov: 50, blur: 0, push: 0.06 }, act(lt, c) { zap(c, 0.5); } });
    shot({ line: 'and tells him the whole truth.', set: tk, cam: frame(-3.2, -1, { size: 'close', side: 22 }),
      act(lt, c) { on(K.rod).place(-3.2, -1, 0.5).sit(1.6).pose({ aL: [40, 40], aR: [40, 40] }).setFace('say').talk(c.t); } });
    shot({ line: 'In the end, the twins die together,', set: din, cam: frame(0, 2, { size: 'medium', side: 8, dist: 1.3 }), light: 'gothic',
      act(lt, c) { on(D.rod).place(-1.6, 2, 0.25).setFace('sad').idle(c.t, 0.3); on(D.mad).place(1.6, 2, -0.25).setFace('sad').idle(c.t, 0.3); } });
    shot({ line: 'and the House of Usher falls apart.', set: ext, sfx: [['thud', 'falls'], ['thud', 'apart']], cam: handheld({ pos: [0, 6, 34], look: [0, 10, -14], fov: 54, blur: 0, push: 0.04 }, 1.4),
      act(lt, c) { const k = E.in(remap(lt, c.w('falls'), c.d)); ext.mansion.position.y = -k * 14; ext.mansion.rotation.z = k * 0.18; X.puff.at((lt - c.w('falls')) % 0.6, [0, 0, -6]); zap(c, c.w('falls'), 0.1, 0.35); } });
    shot({ line: 'Because when you make a deal with Verna,', set: bed, cam: frame(2, 2.5, { size: 'close', side: -12 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('serious').idle(c.t); } });
    shot({ line: 'she always collects.', set: ext, sfx: [['pop', 'collects', 0.6]], cam: frame(-3, 11, { size: 'close', side: 10, push: 0.12 }),
      act(lt, c) { ext.mansion.position.y = -14; on(X.verna).place(-3, 11, 0.1).setFace(lt < c.w('collects') ? 'smirk' : 'wink').idle(c.t, 0.3); } });
  }
}, `timings${PART}.json`);
