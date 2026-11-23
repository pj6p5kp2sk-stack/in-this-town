// town.js: the "In this town…" look, measured frame-by-frame from the 73.6 s reference.
// Adds to the blocky-story-shorts kit WITHOUT editing it (apart from tools/patch_kit.py):
//   time-of-day light presets + sky domes (night with moon and stars, sunset, overcast day)
//   suburban night street, party house, backyard pool party, party table, basketball court with bleachers
//   and a live scoreboard, night interiors, the beanie narrator, party hats, a dribbling ball, goldfish bowl,
//   the party-light colour cycle, handheld/follow/whip/drone cameras and the fly-through-a-bush transition.
import * as THREE from 'three';
import { LIGHTS } from './core.js';
import { makeAvatar, FACES } from './avatar.js';
import { canvasTex, mat, tmat, glow, box, at, grp, sign, rng, shade, clamp, remap, lerp, E, PRE } from './util.js';
import { TEX, floor, wall, lampPost, tree, bush, bunting, table, chair, room, windowPane, bed, rug, bookshelf } from './sets.js';

// ───────────── light presets (core applies these by name through set.light or shot.light)
Object.assign(LIGHTS, {
  // 60% of the reference is night: deep navy sky, cool moon key, warm lamps, party colour on top
  townNight: { amb: 0.5, hemi: 0.5, sun: 0.95, dir: [-8, 14, 10], sunColor: '#c6d0f2', bg: '#1a2340', exposure: 1.08 },
  partyNight: { amb: 0.45, hemi: 0.45, sun: 0.8, dir: [-8, 14, 10], sunColor: '#c6d0f2', bg: '#1a2340', exposure: 1.06 },
  // late-afternoon "big game": low warm sun, long hard shadows, pale peach sky
  sunset: { amb: 0.95, hemi: 0.75, sun: 1.75, dir: [-16, 7, 12], sunColor: '#ffd2a3', bg: '#d6c3b6', exposure: 1.0 },
  // flat pale day used for practice montages
  overcast: { amb: 1.15, hemi: 0.95, sun: 1.15, dir: [-6, 18, 10], sunColor: '#f4f6ff', bg: '#aec4de', exposure: 1.0 },
  // indoor at night: one warm ceiling lamp, dark corners
  roomNight: { amb: 0.45, hemi: 0.3, sun: 0.55, dir: [4, 16, 10], sunColor: '#ffe2b8', bg: '#121624', exposure: 1.0 },
  // power cut / pitch dark: faces still readable, everything else near black-navy
  blackout: { amb: 0.22, hemi: 0.22, sun: 0.45, dir: [-8, 14, 10], sunColor: '#8fa3e0', bg: '#0d1224', exposure: 0.95 },
});
// extra faces in the reference's decal set (red open mouth, ^ ^ eyes, gasp O)
Object.assign(FACES, {
  joy: ['arc', 'none', 'laugh'],          // ^ ^ + big red open mouth (narrator's default happy)
  winkjoy: ['wink', 'none', 'laugh'],     // wink + red open mouth (punchlines)
  gasp: ['round', 'none', 'o'],           // white round eyes + small dark O (the shocked stare)
  uneasy: ['dot', 'none', 'wavy'],        // dot eyes + squiggle mouth (something is wrong)
  calm: ['dot', 'none', 'smile'],         // classic dot-eyes smile
});

// ───────────── skies
export function skyDome(kind = 'night', seed = 3) {
  const t = canvasTex(1024, 512, (g, w, h) => {
    const P = { night: ['#141b33', '#1a2340', '#384568'], sunset: ['#a8b3cf', '#c9bfc4', '#f2cfb0'], day: ['#7f9fc6', '#a9c1dc', '#d9e2ea'] }[kind];
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, P[0]); gr.addColorStop(0.42, P[1]); gr.addColorStop(0.52, P[2]); gr.addColorStop(1, P[2]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (kind === 'night') { const r = rng(seed); for (let i = 0; i < 420; i++) { const y = r() * h * 0.5, a = 0.25 + r() * 0.6; g.fillStyle = `rgba(255,255,255,${a})`; const s = r() < 0.1 ? 2 : 1; g.fillRect(r() * w, y, s, s); } }
    if (kind === 'day') { const r = rng(seed); for (let i = 0; i < 14; i++) { const x = r() * w, y = 120 + r() * 110; g.fillStyle = 'rgba(255,255,255,0.35)'; for (let j = 0; j < 6; j++) { g.beginPath(); g.ellipse(x + j * 16 - 40, y + (j % 2) * 5, 26, 9, 0, 0, 7); g.fill(); } } }
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(420, 40, 20), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false })); m.material.toneMapped = false;
  const g = grp(m);
  if (kind === 'night') { const moon = new THREE.Mesh(new THREE.CircleGeometry(9, 32), glow('#ffffff', 2.2)); moon.position.set(-90, 150, -330); moon.lookAt(0, 0, 0); g.add(moon); }
  return g;
}
// rolling low-poly hills on the horizon (dark at night, green by day)
export function hills(color = '#1f3a22', z = -150, seed = 5) { const g = grp(), r = rng(seed); for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(40 + r() * 30, 18, 10), mat(color)); s.scale.y = 0.35 + r() * 0.15; s.position.set((i - 4) * 55 + r() * 20, -6, z - r() * 40); g.add(s); } return g; }

// ───────────── props
export function house(o = {}) { // two-storey suburban house: body, gable roof, chimney, windows (lit at night), porch door
  const { w = 14, h = 11, d = 10, color = '#c97a8e', roof = '#2b2f3e', lit = 0.4, seed = 1 } = o, r = rng(seed), g = grp();
  g.add(at(box(w, h, d, color), 0, h / 2, 0));
  const rf = new THREE.Mesh(new THREE.CylinderGeometry(0.01, d * 0.62, w + 1, 3, 1), mat(roof)); rf.rotation.z = Math.PI / 2; rf.rotation.x = Math.PI / 6 + Math.PI / 2; rf.scale.set(1, 1, 0.75); rf.position.set(0, h + d * 0.28, 0); rf.castShadow = true; g.add(rf);
  g.add(at(box(1.6, 4, 1.6, shade(color, -0.3)), w * 0.28, h + 3, -1));
  for (let fl = 0; fl < 2; fl++) for (let c = 0; c < 3; c++) {
    const on = r() < lit, wx = (c - 1) * (w / 3.2), wy = 3.2 + fl * 4.8; if (fl === 0 && c === 1) continue;
    g.add(at(box(2.2, 2.6, 0.2, '#f2f2f2'), wx, wy, d / 2 + 0.05), at(box(1.8, 2.2, 0.12, on ? glow('#ffe7a8', 1.6) : mat('#1d2438')), wx, wy, d / 2 + 0.14));
  }
  g.add(at(box(2.4, 4.4, 0.25, '#f2f2f2'), 0, 2.2, d / 2 + 0.05), at(box(2, 4.1, 0.15, o.door || '#7a4a2a'), 0, 2.05, d / 2 + 0.15));
  return g;
}
export function car(color = '#2f9e55') { const g = grp(at(box(4.2, 1.5, 8, color, 0.35), 0, 1.25, 0), at(box(3.6, 1.4, 4.2, shade(color, -0.05), 0.3), 0, 2.6, -0.4), at(box(3.4, 1.0, 0.1, mat('#22303f')), 0, 2.7, 1.72), at(box(3.4, 1.0, 0.1, mat('#22303f')), 0, 2.7, -2.52));
  for (const [x, z] of [[-2, 2.6], [2, 2.6], [-2, -2.6], [2, -2.6]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.6, 16), mat('#141414')); w.rotation.z = Math.PI / 2; w.position.set(x, 0.75, z); g.add(w); }
  g.add(at(box(0.8, 0.4, 0.1, glow('#fff1c0', 1.4)), -1.4, 1.4, 4.02), at(box(0.8, 0.4, 0.1, glow('#fff1c0', 1.4)), 1.4, 1.4, 4.02)); return g; }
export function fence(w = 30, h = 4.2, color = '#7a5232') { const g = grp(); const t = TEX.wood(color); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), tmat((() => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(w / 2, 1); c.rotation = Math.PI / 2; c.needsUpdate = true; return c; })())); m.position.y = h / 2; m.receiveShadow = true; g.add(m, at(box(w, 0.3, 0.3, shade(color, -0.2)), 0, h, 0.1)); return g; }
export function stringLights(w = 24, sag = 1.2, colors = ['#ffffff']) { const g = grp(), n = Math.floor(w / 1.2); for (let i = 0; i < n; i++) { const k = i / (n - 1), b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glow(colors[i % colors.length], 2.4)); b.position.set((k - 0.5) * w, -Math.sin(k * Math.PI) * sag, 0); g.add(b); } return g; }
export function flags(w = 24, sag = 1.0) { return bunting(w, ['#e94b5f', '#f2b01e', '#2f9e55', '#3d6fe0', '#8a4fd0', '#19a7a0', '#ff7a2f']); }
export function balloons(seed = 2, n = 3) { const g = grp(), r = rng(seed), cs = ['#ff7ac2', '#b38cff', '#ffd25e', '#7fe0a0', '#ff8a5c']; for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 12), mat(cs[(i + seed) % cs.length], { emissive: new THREE.Color(cs[(i + seed) % cs.length]).multiplyScalar(0.25) })); b.scale.y = 1.15; const x = (i - (n - 1) / 2) * 1.1 + (r() - 0.5) * 0.5, y = 6 + r() * 1.5; b.position.set(x, y, (r() - 0.5) * 0.6); g.add(b, at(box(0.03, y - 1, 0.03, '#ddd'), x * 0.5, (y - 1) / 2, 0)); } return g; }
export function partyHat(color = '#f2b01e', stripe = '#ffffff') { const t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); g.fillStyle = stripe; for (let y = 10; y < h; y += 30) g.fillRect(0, y, w, 10); }); const c = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.25, 20), tmat(t)); c.position.y = 0.62; c.castShadow = true; const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), mat('#fff6e0')); p.position.y = 1.28; return grp(c, p); }
export function beanie(color = '#2f4fc4', emblem = '#f2c230') { // knit beanie with folded cuff and a star patch
  const g = grp(), m = mat(color), R = 0.7;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 0.78; dome.position.y = 1.08; dome.castShadow = true;
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.03, R + 0.03, 0.34, 28), mat(shade(color, -0.08))); cuff.position.y = 1.02; cuff.castShadow = true;
  const star = canvasTex(128, 128, (c, w) => { c.translate(w / 2, w / 2); c.fillStyle = emblem; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 22 : 54; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); });
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshLambertMaterial({ map: star, transparent: true })); patch.position.set(0, 1.04, R + 0.045);
  g.add(dome, cuff, patch); return g;
}
export function ball() { const t = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#e8863a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a1e0e'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); for (const x of [w / 4, w * 3 / 4]) { g.moveTo(x, 0); g.lineTo(x, h); } g.stroke(); }); const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), tmat(t)); b.castShadow = true; return b; }
export function hoop(o = {}) { const g = grp(at(box(0.4, 10, 0.4, '#1b1c20'), 0, 5, -1.4), at(box(5, 3.2, 0.2, new THREE.MeshLambertMaterial({ color: '#f4f6f8', transparent: true, opacity: 0.85 })), 0, 11, -1), at(box(1.8, 1.2, 0.05, '#d43a2a'), 0, 10.6, -0.88)); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 8, 24), mat('#e8632b')); rim.rotation.x = Math.PI / 2; rim.position.set(0, 9.9, 0); const net = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.55, 1.2, 12, 1, true), new THREE.MeshLambertMaterial({ color: '#ffffff', wireframe: true })); net.position.set(0, 9.3, 0); g.add(rim, net); g.rim = [0, 9.9, 0]; return g; }
export function scoreboard() { // live: sb.set('GUEST', 0, 'HOME', 18)
  const c = document.createElement('canvas'); c.width = 640; c.height = 384; const g = c.getContext('2d'); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({ map: t })); const grpS = grp(at(box(10.6, 6.6, 0.5, '#1b1817'), 0, 0, -0.3), m, at(box(0.4, 12, 0.4, '#1b1817'), -3, -8, -0.4), at(box(0.4, 12, 0.4, '#1b1817'), 3, -8, -0.4));
  let last = ''; grpS.set = (a, sa, b, sb, extra = '') => { const key = [a, sa, b, sb, extra].join('|'); if (key === last) return; last = key; g.fillStyle = '#231f1e'; g.fillRect(0, 0, 640, 384); g.textAlign = 'center'; g.fillStyle = '#f2b46a'; g.font = '600 56px Montserrat'; g.fillText(a, 160, 90); g.fillText(b, 480, 90); g.fillStyle = '#fdfe86'; g.font = '700 170px Montserrat'; g.fillText(String(sa), 160, 280); g.fillText(String(sb), 480, 280); if (extra) { g.fillStyle = '#fff'; g.font = '700 44px Montserrat'; g.fillText(extra, 320, 360); } t.needsUpdate = true; };
  grpS.set('GUEST', 0, 'HOME', 0); return grpS;
}
export function bleachers(w = 40, rows = 5, color = '#8d8f96') { const g = grp(); for (let i = 0; i < rows; i++) g.add(at(box(w, 1.1, 2.2, shade(color, -i * 0.03)), 0, 0.55 + i * 1.1, -i * 2.2)); g.seat = (k, row) => [(k - 0.5) * w, 1.1 + row * 1.1, -row * 2.2 + 0.2]; return g; }
export function goldfishBowl() { const g = grp(); const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.6, 28, 20), new THREE.MeshPhongMaterial({ color: '#cfe9ff', transparent: true, opacity: 0.32, shininess: 120, specular: '#ffffff', depthWrite: false })); bowl.position.y = 1.6; const water = new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 16, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), new THREE.MeshLambertMaterial({ color: '#7fc4ff', transparent: true, opacity: 0.35, depthWrite: false })); water.position.y = 1.6; const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.25, 24), mat('#efe6cf')); base.position.y = 0.12;
  const fish = grp(at(box(0.9, 0.7, 0.45, '#ff8a2a', 0.2), 0, 0, 0), at(box(0.45, 0.6, 0.12, '#ffb04a', 0.05), -0.62, 0, 0)); fish.add(at(box(0.08, 0.08, 0.08, '#111'), 0.3, 0.12, 0.24)); fish.position.y = 1.5; g.add(base, water, fish, bowl); g.fish = fish; return g; }

// ───────────── sets (each returns { group, light, update? })
export const TOWN = {
  // night suburban street: road along x at z = 8..20, sidewalks, houses behind at z = -10, lamps, parked cars
  street(o = {}) {
    const night = (o.time || 'night') === 'night', g = grp(skyDome(o.time || 'night'), hills(night ? '#1d3320' : '#5c8a4a'));
    g.add(at(floor(260, 140, TEX.grass(night ? '#2b4a26' : '#5aa04a'), 6), 0, -0.03, -40), at(floor(260, 5, TEX.concrete(night ? '#8a8c92' : '#cfcbc4'), 4), 0, 0.02, 4.5), at(floor(260, 12, TEX.road(), 6), 0, 0.01, 13), at(floor(260, 5, TEX.concrete(night ? '#8a8c92' : '#cfcbc4'), 4), 0, 0.02, 21.5));
    for (let i = -14; i <= 14; i++) g.add(at(box(3, 0.04, 0.4, '#e8c33a'), i * 8, 0.04, 13));
    const cols = ['#c97a8e', '#3e66c9', '#d9b56a', '#8fbf9a', '#b07ad0', '#e09a6a', '#7aa0d8'], r = rng(o.seed || 4);
    for (let i = -6; i <= 6; i++) g.add(at(house({ color: cols[(i + 7) % cols.length], lit: o.litAll ? 1 : (o.lit ?? 0.35), seed: i + 9, roof: night ? '#252a36' : '#5a3a2e' }), i * 19, 0, -8 - r() * 3));
    for (let i = -6; i <= 6; i++) g.add(at(house({ color: cols[(i + 10) % cols.length], lit: o.litAll ? 1 : (o.lit ?? 0.3), seed: i + 30 }), i * 19 + 9, 0, 33, Math.PI));
    const lamps = []; for (const x of [-40, -16, 8, 32]) { g.add(at(lampPost(10), x, 0, 6.6)); if (night && o.lamps !== false) { const L = new THREE.PointLight('#ffd9a0', 220, 26, 2); L.position.set(x, 10.2, 6.6); g.add(L); lamps.push(L); } }
    g.add(at(car('#2f9e55'), -6, 0, 9.4, Math.PI / 2), at(car('#d23a3a'), 22, 0, 16.6, -Math.PI / 2), at(car('#e8e8ea'), 40, 0, 9.4, Math.PI / 2), at(tree(9, night ? '#24452a' : '#3f9b3f'), -28, 0, 1), at(tree(10, night ? '#24452a' : '#3f9b3f'), 18, 0, 0.5), at(bush(night ? '#24452a' : '#3f9b3f'), -10, 0, 2), at(bush(night ? '#24452a' : '#3f9b3f'), 2, 0, 1.5));
    return { group: g, light: o.light || (night ? 'townNight' : o.time === 'sunset' ? 'sunset' : 'overcast') };
  },
  // backyard pool party at night: pool, floats, diving board, wooden fence, string lights, flags, speakers. Party wash on.
  pool(o = {}) {
    const g = grp(skyDome('night'), hills('#1d3320', -120));
    g.add(at(floor(120, 80, TEX.concrete('#d9c9d6'), 3), 0, -0.02, 0));
    const water = new THREE.Mesh(new THREE.PlaneGeometry(22, 12), new THREE.MeshLambertMaterial({ color: '#3aa0ff', emissive: new THREE.Color('#1d6fd0'), emissiveIntensity: 0.3 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.05, 0); water.receiveShadow = true;
    g.add(water, at(box(23, 0.3, 0.8, '#e8e2ea'), 0, 0.15, 6.4), at(box(23, 0.3, 0.8, '#e8e2ea'), 0, 0.15, -6.4), at(box(0.8, 0.3, 13.6, '#e8e2ea'), 11.4, 0.15, 0), at(box(0.8, 0.3, 13.6, '#e8e2ea'), -11.4, 0.15, 0));
    for (const [x, z] of [[-6, 3], [5, -2], [8, 4]]) { const s = new THREE.Mesh(new THREE.CircleGeometry(1.1, 20), glow('#ffffff', 1.8)); s.rotation.x = -Math.PI / 2; s.position.set(x, 0.08, z); g.add(s); }
    const ring = (c, x, z) => { const t = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.42, 10, 20), mat(c)); t.rotation.x = Math.PI / 2; t.position.set(x, 0.3, z); g.add(t); }; ring('#d9c23a', -8, -3); ring('#d9466a', 7, -4.5);
    g.add(at(box(2, 0.3, 6, '#3d6fe0'), 3, 1, -8), at(box(1.2, 1, 1.2, '#3d6fe0'), 3, 0.5, -10.5));
    g.add(at(fence(80, 5), 0, 0, -16), at(box(2.6, 4.5, 2.6, '#1b1c22'), -12, 2.25, -14), at(box(2.6, 4.5, 2.6, '#1b1c22'), -15.5, 2.25, -14));
    g.add(at(stringLights(46, 1.6), 0, 10, -14), at(flags(46), 0, 9, -13.6), at(balloons(1, 3), -19, 0, -12), at(balloons(3, 3), 19, 0, -12));
    for (let i = -3; i <= 3; i++) g.add(at(house({ color: ['#3a3a52', '#5a3a4a', '#2e4a3a'][(i + 3) % 3], lit: 0.5, seed: i + 50 }), i * 20, 0, -36));
    const umb = grp(at(box(0.2, 7, 0.2, '#ddd'), 0, 3.5, 0)); const top = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.2, 12), mat('#d9466a')); top.position.y = 7.3; umb.add(top); g.add(at(umb, 14, 0, -9));
    const P = partyWash(g); return { group: g, light: 'partyNight', update: (t) => P.update(t) };
  },
  // backyard party: long table with pizzas, coloured chairs, flags, balloons, house wall behind. Party wash on.
  partyTable(o = {}) {
    const g = grp(skyDome('night'), at(floor(120, 80, TEX.grass('#2f5a2a'), 5), 0, -0.02, 0), at(house({ w: 30, h: 13, d: 12, color: o.wall || '#b886b4', lit: 0.8, seed: 7 }), 0, 0, -14));
    const t = table(14, 3.6, '#f4f2ef', 2.8); g.add(t); const cs = ['#f2b01e', '#2b7de0', '#8a4fd0', '#2e9e59', '#e8632b', '#d9466a'];
    for (let i = 0; i < 6; i++) { g.add(at(chair(cs[i], 1.6), -5.5 + i * 2.2, 0, 3, Math.PI)); g.add(at(chair(cs[(i + 3) % 6], 1.6), -5.5 + i * 2.2, 0, -3)); }
    for (const x of [-4, 0, 4]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 20), mat('#f2c25a')); p.position.set(x, 3.0, 0); g.add(p); for (let k = 0; k < 6; k++) g.add(at(box(0.25, 0.06, 0.25, '#c73a2a', 0.04), x + Math.cos(k) * 0.6, 3.08, Math.sin(k) * 0.6)); }
    g.add(at(flags(34), 0, 10.5, -6), at(balloons(2, 3), -11, 0, -4), at(balloons(4, 3), 11, 0, -4));
    const P = partyWash(g); return { group: g, light: 'partyNight', update: (t) => P.update(t) };
  },
  // outdoor basketball court. time: 'night' | 'sunset' | 'day'. Bleachers + crowd slots, banner, live scoreboard, string lights.
  court(o = {}) {
    const time = o.time || 'sunset', night = time === 'night', g = grp(skyDome(time), hills(night ? '#1d3320' : '#6f9a54', -160));
    const courtTex = canvasTex(1024, 512, (c, w, h) => { c.fillStyle = o.courtColor || '#3f6fd6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(20, 20, w - 40, h - 40); c.beginPath(); c.moveTo(w / 2, 20); c.lineTo(w / 2, h - 20); c.stroke(); c.fillStyle = '#f2d33c'; c.beginPath(); c.arc(w / 2, h / 2, 70, 0, 7); c.fill(); c.stroke(); for (const s of [0, 1]) { const x = s ? w - 20 : 20; c.fillStyle = '#f07a3a'; c.fillRect(s ? x - 170 : x, h / 2 - 80, 170, 160); c.strokeRect(s ? x - 170 : x, h / 2 - 80, 170, 160); c.beginPath(); c.arc(x, h / 2, 230, s ? Math.PI / 2 : -Math.PI / 2, s ? Math.PI * 1.5 : Math.PI / 2); c.stroke(); } });
    const cf = new THREE.Mesh(new THREE.PlaneGeometry(64, 32), tmat(courtTex)); cf.rotation.x = -Math.PI / 2; cf.position.set(0, 0.02, 0); cf.receiveShadow = true;
    g.add(at(floor(300, 200, TEX.grass(night ? '#2b4a26' : '#5c9a48'), 6), 0, -0.03, 0), at(floor(80, 44, TEX.concrete(night ? '#6c6e74' : '#c9c6c0'), 4), 0, 0.0, 0), cf);
    const hl = hoop(), hr = hoop(); g.add(at(hl, -29, 0, 0, Math.PI / 2), at(hr, 29, 0, 0, -Math.PI / 2));
    const bl = bleachers(44, 5); g.add(at(bl, 0, 0, -19));
    if (o.banner !== false) { const b = sign(o.banner || 'SUMMER CUP', 22, 2.4, { bg: '#c9962a', fg: '#7a1f12' }); g.add(at(b, 0, 11, -30), at(box(0.3, 11, 0.3, '#1b1c20'), -11.2, 5.5, -30.2), at(box(0.3, 11, 0.3, '#1b1c20'), 11.2, 5.5, -30.2)); }
    const sb = scoreboard(); g.add(at(sb, 29, 15, -4, -Math.PI / 2));
    for (let i = 0; i < 9; i++) g.add(at(box(0.2, 5, 0.2, '#ffffff'), -40 + i * 10, 2.5, 22), at(box(10, 0.15, 0.15, '#ffffff'), -35 + i * 10, 4.9, 22));
    if (o.lamps !== false) g.add(at(stringLights(70, 2), 0, 12, -24)); g.add(at(flags(70), 0, 11, -23.5));
    for (let i = -4; i <= 4; i++) g.add(at(house({ color: ['#3e66c9', '#c97a8e', '#d9b56a', '#8fbf9a'][(i + 4) % 4], lit: night ? 0.6 : 0, seed: i + 70, roof: night ? '#252a36' : '#6a3a2e' }), i * 22, 0, -62));
    if (night && o.lamps !== false) for (const x of [-30, 30]) { const L = new THREE.PointLight('#ffe2b0', 300, 40, 2); L.position.set(x, 14, 10); g.add(L); }
    return { group: g, light: o.light || (night ? 'townNight' : time === 'day' ? 'overcast' : 'sunset'), bleachers: bl, scoreboard: sb, hoopL: hl, hoopR: hr };
  },
  // night interior (bedroom / gym / living room) lit by one warm ceiling lamp: the "everyone is grinding" montage
  roomNight(o = {}) {
    const g = room({ floorTex: TEX.wood(o.floor || '#8a5a34'), tile: 6, wallColor: o.wall || '#3e4f8f', trim: shade(o.wall || '#3e4f8f', -0.25), trimY: 0.6, w: 30, d: 22, h: 12, lights: 0, ceiling: '#1a1f30' });
    g.add(at(windowPane(5, 4, '#1a2340'), 6, 7, -5.85), at(rug(10, 7, o.rug || '#d9b33a'), 0, 0, 2));
    if (o.mats) g.add(at(box(10, 0.4, 7, '#2f4fc4'), -2, 0.2, 1), at(box(8, 0.4, 7, '#c33a3a'), 6.5, 0.2, 1));
    if (o.bag) { const b = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 16), mat('#8a1f2a')); b.position.set(6, 7.5, -2); g.add(b, at(box(0.06, 3, 0.06, '#222'), 6, 10.5, -2)); }
    if (o.bed) g.add(at(bed(o.bed), -9, 0, -1)); if (o.shelf) g.add(at(bookshelf(4, 6), 11, 0, -5));
    const lamp = new THREE.PointLight('#ffe0b0', 260, 34, 2); lamp.position.set(0, 11, 2); g.add(lamp, at(new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 12), glow('#fff2d0', 2)), 0, 11, 2));
    return { group: g, light: 'roomNight' };
  },
};

// ───────────── party light wash: the whole frame hard-cycles hue every 5 frames (measured 4-6) during parties
export const PARTY = ['#ff6fd8', '#7dffa8', '#ffe46a', '#7ab8ff', '#c18cff'];
export function partyWash(group, o = {}) {
  const a = new THREE.AmbientLight('#ffffff', 0), p1 = new THREE.PointLight('#ffffff', 0, 60, 1.6), p2 = new THREE.PointLight('#ffffff', 0, 60, 1.6);
  p1.position.set(-10, 9, 8); p2.position.set(12, 8, 4); group.add(a, p1, p2);
  const step = o.frames || 5, k = o.strength || 0.5;
  return { update(t, on = true) { if (!on) { a.intensity = p1.intensity = p2.intensity = 0; return; } const f = Math.floor(t * 30 / step), c1 = PARTY[f % PARTY.length], c2 = PARTY[(f + 2) % PARTY.length]; a.color.set(c1); a.intensity = 0.55 * k; p1.color.set(c1); p1.intensity = 420 * k; p2.color.set(c2); p2.intensity = 260 * k; } };
}

// ───────────── cast helpers
// The narrator: blue knit beanie with a star patch, blue hoodie with gold drawstrings and a print, scattered confetti stars.
// print: the words on the chest (keep it short; default none). Change colours to make him your own.
export function makeNarrator(o = {}) {
  const c = o.color || '#3553b8', gold = o.gold || '#e2b23a';
  const av = makeAvatar({ seed: o.seed || 11, skin: o.skin || '#f0c49a', hair: 'buzz', hairColor: '#3a2416', top: 'plain', topColor: c, sleeves: 'long', bottom: 'plain', bottomColor: shade(c, -0.08), shoe: shade(c, -0.2), sole: '#e8e8e8', face: 'calm' });
  const front = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = c; g.fillRect(0, 0, w, h); const r = rng(5);
    for (let i = 0; i < 46; i++) { const x = r() * w, y = r() * h, s = 2 + r() * 4; g.fillStyle = ['#ffffff', '#ffd7f0', '#fff3a8', '#bfe6ff'][i % 4]; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? s * 0.45 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }
    g.strokeStyle = shade(c, -0.3); g.lineWidth = 6; g.beginPath(); g.arc(w / 2, -10, 60, 0.15, Math.PI - 0.15); g.stroke();
    g.fillStyle = gold; for (const s of [-1, 1]) { g.fillRect(w / 2 + s * 22 - 4, 34, 8, 64); g.beginPath(); g.ellipse(w / 2 + s * 22, 102, 7, 9, 0, 0, 7); g.fill(); }
    if (o.print) { g.font = `800 ${Math.min(40, 420 / o.print.length)}px Montserrat`; g.textAlign = 'center'; g.fillStyle = gold; g.fillText(o.print, w / 2, 160); }
    g.strokeStyle = shade(c, -0.25); g.lineWidth = 4; g.strokeRect(70, 186, w - 140, 54); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 240, w, 16);
  });
  av.torso.material[4] = tmat(front);
  const b = beanie(o.beanie || c, gold); av.head.add(b); av.hair.visible = false; av.beanie = b;
  return av;
}
// attach a party hat to anyone: const h = hatOn(av, '#f2b01e'); h.visible = false to remove
export function hatOn(av, color = '#f2b01e', stripe = '#ffffff') { const h = partyHat(color, stripe); h.position.y = 1.15; h.rotation.z = 0.12; av.head.add(h); return h; }
// dribble: puts ball b next to av's right hand and bounces it (period 0.42 s, the reference's HUSS rhythm)
export function dribble(av, b, t, o = {}) { const p = av.root.position, s = av.root.scale.x, side = o.side || -1.6, period = o.period || 0.42, k = (t % period) / period, y = 0.55 + Math.abs(Math.cos(k * Math.PI)) * 2.6; const ry = av.root.rotation.y; b.position.set(p.x + Math.cos(ry) * side * s + Math.sin(ry) * 0.8 * s, p.y + y * s, p.z - Math.sin(ry) * side * s + Math.cos(ry) * 0.8 * s); b.rotation.x = t * 9; b.visible = true; av.armR.rotation.x = -(0.5 + 0.5 * Math.cos(k * Math.PI * 2)) * 0.9; return b; }
// a ball on an arc from a to b over dur seconds starting at t0 (a shot), with spin
export function arc(b, lt, t0, dur, a, z, hgt = 6) { const k = remap(lt, t0, t0 + dur); b.visible = lt >= t0; b.position.set(lerp(a[0], z[0], k), lerp(a[1], z[1], k) + Math.sin(k * Math.PI) * hgt, lerp(a[2], z[2], k)); b.rotation.z = -lt * 8; return k; }

// ───────────── camera moves (all deterministic; pass as shot.cam)
const n1 = (t, s) => Math.sin(t * 1.7 + s) * 0.6 + Math.sin(t * 3.1 + s * 2) * 0.3 + Math.sin(t * 7.3 + s * 3) * 0.1;
// handheld: a static framing with a phone-in-hand drift (used for the game / action shots, about 15% of the reference)
export function handheld(cam, amt = 1, seed = 1) { return (lt, s) => { const c = typeof cam === 'function' ? cam(lt, s) : cam, a = 0.12 * amt; return { ...c, pos: [c.pos[0] + n1(lt, seed) * a, c.pos[1] + n1(lt, seed + 5) * a * 0.7, c.pos[2] + n1(lt, seed + 9) * a * 0.5], look: [c.look[0] + n1(lt, seed + 13) * a * 1.4, c.look[1] + n1(lt, seed + 17) * a, c.look[2]], roll: (c.roll || 0) + n1(lt, seed + 21) * 1.2 * amt }; }; }
// follow: camera trails a moving target fn(lt) -> [x,y,z] at offset off, looking at it
export function follow(target, off = [0, 3, 12], o = {}) { return (lt) => { const p = target(lt); return { pos: [p[0] + off[0], p[1] + off[1], p[2] + off[2]], look: [p[0], p[1] + (o.lookY || 3), p[2]], fov: o.fov || 60, blur: o.blur ?? 0.15, push: 0 }; }; }
// whip: fast pan from look a to look b between t0 and t0+0.25 s (the game-time energy move). Motion blur comes from the speed + 1-frame cut.
export function whip(pos, a, b, t0, o = {}) { return (lt) => { const k = E.inOut(remap(lt, t0, t0 + (o.dur || 0.25))); return { pos, look: [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)], fov: o.fov || 62, blur: 0.1, push: 0, roll: Math.sin(k * Math.PI) * (o.roll ?? 6) }; }; }
// drone: high establishing shot looking down ~30°, slow drift + push (the town / court wides)
export function drone(center, o = {}) { const { h = 42, back = 60, drift = [6, 0, -4], fov = 50 } = o; return { pos: [center[0], h, center[2] + back], look: [center[0], center[1] || 0, center[2]], fov, blur: 0, push: 0.03, to: { pos: [center[0] + drift[0], h + drift[1], center[2] + back + drift[2]] }, ease: 'lin' }; }

// ───────────── fly-through transition: the camera dives into a bush/hedge, the frame goes leafy dark green, then cut out
// Use on the LAST ~0.35 s of a shot: veil.at(dt) where dt = seconds since the dive started (0..0.35)
export function makeVeil(parent, color = '#163014') {
  const t = canvasTex(256, 512, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); g.filter = 'blur(14px)'; const r = rng(8); for (let i = 0; i < 26; i++) { g.fillStyle = shade(color, (r() - 0.5) * 0.45); g.beginPath(); g.moveTo(r() * w, r() * h); g.lineTo(r() * w, r() * h); g.lineTo(r() * w, r() * h); g.fill(); } g.filter = 'none'; });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false })); m.renderOrder = 999; m.visible = false; parent.add(m); PRE.push(() => { m.visible = false; });
  return { at(dt, camera, dur = 0.35) { if (dt < 0) return; m.visible = true; const k = clamp(dt / dur * 3); m.material.opacity = k; m.position.copy(camera.position); m.quaternion.copy(camera.quaternion); m.translateZ(-0.5); const s = 0.5 * Math.tan(camera.fov * Math.PI / 360) * 2.2; m.scale.set(s * 0.6 * (1 + dt), s * (1 + dt), 1); m.rotation.z += dt * 0.6; } };
}
export { mat, glow, box, at, grp, sign, rng, shade, clamp, remap, lerp, E };
