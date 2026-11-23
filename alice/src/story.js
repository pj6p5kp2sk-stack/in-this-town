// story.js: 3-part "Alice in Borderland" recap (seasons 1-2) in the town-story look. ?part=1|2|3 picks the part.
import * as THREE from 'three';
import { start, shot, frame, LIGHTS } from './core.js';
import { makeAvatar } from './avatar.js';
import { SETS, TEX, floor, table, chair, room, bed, windowPane, tree, bush, lampPost } from './sets.js';
import { TOWN, makeNarrator, handheld, follow, drone, skyDome, hills, house, partyWash, hatOn, stringLights, fence } from './town.js';
import { makeSparkles, makePuff } from './fx.js';
import { canvasTex, mat, tmat, glow, box, at, grp, sign, rng, shade, clamp, remap, lerp, E } from './util.js';

const PART = +(new URLSearchParams(location.search).get('part') || 1);
Object.assign(LIGHTS, {
  neon: { amb: 0.6, hemi: 0.5, sun: 0.9, dir: [-8, 14, 10], sunColor: '#c6d0f2', bg: '#141a33', exposure: 1.1 },
  dark: { amb: 0.6, hemi: 0.55, sun: 1.0, dir: [-8, 14, 10], sunColor: '#a8b8f0', bg: '#0b0f1f', exposure: 1.12 },
  fire: { amb: 0.45, hemi: 0.35, sun: 0.9, dir: [8, 10, 10], sunColor: '#ff9a4a', bg: '#1a0c08', exposure: 1.05 },
  joker: { amb: 0.4, hemi: 0.3, sun: 0.7, dir: [-6, 14, 10], sunColor: '#c18cff', bg: '#120a1c', exposure: 1.05 },
});

// ───────────── card art (suits drawn as shapes so no font glyphs are needed)
function suit(g, s, x, y, r) {
  g.beginPath();
  if (s === 'H') { g.moveTo(x, y + r); g.bezierCurveTo(x - r * 1.9, y - r * 0.2, x - r * 1.1, y - r * 1.6, x, y - r * 0.6); g.bezierCurveTo(x + r * 1.1, y - r * 1.6, x + r * 1.9, y - r * 0.2, x, y + r); }
  if (s === 'D') { g.moveTo(x, y - r * 1.2); g.lineTo(x + r * 0.85, y); g.lineTo(x, y + r * 1.2); g.lineTo(x - r * 0.85, y); }
  if (s === 'S') { g.moveTo(x, y - r * 1.1); g.bezierCurveTo(x - r * 1.9, y + r * 0.2, x - r * 1.1, y + r * 1.4, x, y + r * 0.5); g.bezierCurveTo(x + r * 1.1, y + r * 1.4, x + r * 1.9, y + r * 0.2, x, y - r * 1.1); g.moveTo(x, y + r * 0.3); g.lineTo(x - r * 0.45, y + r * 1.25); g.lineTo(x + r * 0.45, y + r * 1.25); }
  if (s === 'C') { for (const [dx, dy] of [[0, -0.55], [-0.6, 0.2], [0.6, 0.2]]) { g.moveTo(x + dx * r + r * 0.5, y + dy * r); g.arc(x + dx * r, y + dy * r, r * 0.5, 0, 7); } g.moveTo(x, y); g.lineTo(x - r * 0.4, y + r * 1.2); g.lineTo(x + r * 0.4, y + r * 1.2); }
  g.closePath(); g.fill();
}
function card(rank, s, o = {}) {
  const t = canvasTex(300, 420, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.beginPath(); g.roundRect(0, 0, w, h, 26); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 6; g.stroke();
    if (rank === 'JOKER') { g.fillStyle = '#5a1fa0'; g.font = '900 64px Montserrat'; g.textAlign = 'center'; g.fillText('JOKER', w / 2, 80);
      g.fillStyle = '#f2c230'; g.beginPath(); g.ellipse(w / 2, 250, 70, 80, 0, 0, 7); g.fill(); g.fillStyle = '#c0262d'; for (const [a, c] of [[-1, '#c0262d'], [0, '#5a1fa0'], [1, '#2a8a4a']]) { g.fillStyle = c; g.beginPath(); g.moveTo(w / 2 - 70 + (a + 1) * 46, 190); g.lineTo(w / 2 - 50 + a * 70, 110); g.lineTo(w / 2 - 22 + (a + 1) * 46, 190); g.fill(); }
      g.fillStyle = '#111'; for (const sx of [-1, 1]) { g.beginPath(); g.arc(w / 2 + sx * 26, 240, 9, 0, 7); g.fill(); } g.lineWidth = 7; g.strokeStyle = '#111'; g.beginPath(); g.arc(w / 2, 268, 32, 0.2, Math.PI - 0.2); g.stroke();
      g.fillStyle = '#5a1fa0'; g.font = '900 64px Montserrat'; g.fillText('JOKER', w / 2, 395); return; }
    const red = s === 'H' || s === 'D'; g.fillStyle = red ? '#d0202a' : '#151515';
    g.font = '900 78px Montserrat'; g.textAlign = 'center'; g.fillText(rank, 52, 86); suit(g, s, 52, 130, 22);
    g.save(); g.translate(w, h); g.rotate(Math.PI); g.fillText(rank, 52, 86); suit(g, s, 52, 130, 22); g.restore();
    if (/[JQK]/.test(rank)) { g.fillStyle = red ? '#d0202a' : '#151515'; g.font = '900 170px Montserrat'; g.fillText(rank, w / 2, 280); suit(g, s, w / 2, 330, 28); }
    else suit(g, s, w / 2, h / 2, 70);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 4.2), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, transparent: true })); return grp(m);
}
// ───────────── props
const windows = (lit, seed) => canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#2a2e3a'; g.fillRect(0, 0, w, h); const r = rng(seed); for (let y = 8; y < h - 8; y += 18) for (let x = 8; x < w - 8; x += 20) { g.fillStyle = lit && r() < 0.6 ? ['#ffe7a8', '#bfe6ff', '#fff'][Math.floor(r() * 3)] : '#151822'; g.fillRect(x, y, 13, 11); } });
function tower(w, h, d, lit, seed, color = '#3a3f4e') { const t = windows(lit, seed); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / 10, h / 20); const face = lit ? new THREE.MeshBasicMaterial({ map: t }) : tmat(t); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [mat(color), mat(color), mat(color), mat(color), face, mat(color)]); m.position.y = h / 2; return grp(m); }
function laser() { const g = grp(); const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 220, 10), glow('#ff2020', 2.6)); beam.position.y = 110; const halo = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 220, 12), new THREE.MeshBasicMaterial({ color: '#ff3030', transparent: true, opacity: 0.25, depthWrite: false })); halo.position.y = 110; const spot = new THREE.Mesh(new THREE.CircleGeometry(1.6, 24), glow('#ff4040', 2)); spot.rotation.x = -Math.PI / 2; spot.position.y = 0.06; g.add(beam, halo, spot); g.visible = false; return g; }
function blimp(rank, s) { const g = grp(); const b = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat('#d8dce4')); b.scale.set(9, 3.2, 3.2); g.add(b, at(box(3, 1, 1.4, '#9aa0aa'), 0, -3.3, 0)); for (const s2 of [-1, 1]) g.add(at(box(0.2, 2.4, 2, '#b0b4be'), -8.4, 0, s2 * 0.8)); const c = card(rank, s); c.scale.setScalar(1.25); c.position.set(0, -8.4, 0.2); g.add(c, at(box(0.06, 3.6, 0.06, '#888'), 0, -5, 0)); return g; }
function gun() { return grp(at(box(0.36, 0.5, 2.6, '#151515', 0.05), 0, 0, 0.9), at(box(0.16, 0.16, 1.4, '#2a2a2a'), 0, 0.1, 2.7), at(box(0.3, 0.8, 0.3, '#151515'), 0, -0.5, 0.4)); }
function topHat() { const g = grp(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.1, 20), mat('#141414')); c.position.y = 1.65; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 24), mat('#141414')); b.position.y = 1.12; const r = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.18, 20), mat('#8a1a2a')); r.position.y = 1.26; g.add(c, b, r); return g; }
function teaSet() { const g = grp(); for (const x of [-0.8, 0.8]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.4, 16), mat('#ffffff')); cup.position.set(x, 0.25, 0); const tea = new THREE.Mesh(new THREE.CircleGeometry(0.28, 16), mat('#a8582a')); tea.rotation.x = -Math.PI / 2; tea.position.set(x, 0.43, 0); g.add(cup, tea, at(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20), mat('#f2e8f0')), x, 0.03, 0)); } const pot = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), mat('#ff8fbd')); pot.position.set(0, 0.55, -0.6); g.add(pot); return g; }
function flames() { const g = grp(); const r = rng(4); for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.7 + r() * 0.6, 2.5 + r() * 2.5, 8), glow(['#ff6a1a', '#ffb02a', '#ff3a1a'][i % 3], 1.8)); f.position.set((r() - 0.5) * 3, 1.5, (r() - 0.5) * 3); g.add(f); } const L = new THREE.PointLight('#ff8a3a', 500, 40, 2); L.position.y = 4; g.add(L); return g; }

start(() => {
  // ───────────── cast
  const ME = { color: '#3553b8', print: 'BINGE' };
  const O = {
    arisu: { seed: 61, skin: 'light', hair: 'messy', hairColor: '#141012', top: 'zip', topColor: '#2a2a33', inner: '#e8e8e8', sleeves: 'long', bottom: 'jeans', bottomColor: '#2a3550' },
    karube: { seed: 62, skin: 'tan', hair: 'spiky', hairColor: '#e8d070', top: 'tee', topColor: '#151515', bottom: 'jeans', bottomColor: '#3a4f7a' },
    chota: { seed: 63, skin: 'light', hair: 'long', hairColor: '#2a1a12', top: 'hoodie', topColor: '#7a6a5a', bottom: 'cargo', bottomColor: '#4a4a3a', glasses: true },
    usagi: { seed: 64, skin: 'light', hair: 'ponytail', hairColor: '#1a1210', top: 'tee', topColor: '#e8632b', bottom: 'cargo', bottomColor: '#4a4a3a' },
    chishiya: { seed: 65, skin: 'fair', hair: 'swoop', hairColor: '#f0e0b0', top: 'hoodie', topColor: '#f4f4f4', bottom: 'slacks', bottomColor: '#5a5a6a' },
    hatter: { seed: 66, skin: 'light', hair: 'short', hairColor: '#2a1a12', top: 'suit', topColor: '#5a1f2a', tie: '#e2b23a', sleeves: 'long', bottom: 'slacks', bottomColor: '#2a1a1a' },
    mil: { seed: 67, skin: 'tan', hair: 'buzz', hairColor: '#1a1210', top: 'vest', topColor: '#1a1a1a', inner: '#3a3a30', sleeves: 'long', bottom: 'cargo', bottomColor: '#2a2a22', cap: '#1a1a1a' },
    kingS: { seed: 68, skin: 'brown', hair: 'buzz', hairColor: '#111', top: 'vest', topColor: '#3a3a44', inner: '#5a5a62', sleeves: 'long', bottom: 'cargo', bottomColor: '#1a1a1a', height: 1.45, glasses: '#111', face: 'serious' },
    mira: { seed: 69, skin: 'fair', hair: 'long', hairColor: '#1a1210', top: 'dress', topColor: '#f6f2f6', sleeves: 'long', bottom: 'plain', bottomColor: '#f6f2f6', face: 'smirk' },
    g1: { seed: 41, skin: 'tan', hair: 'ponytail', hairColor: '#5a3a1a', top: 'tee', topColor: '#7dffa8', bottom: 'shorts', bottomColor: '#3a3a8a' },
    g2: { seed: 42, skin: 'light', hair: 'spiky', hairColor: '#e8a03a', top: 'tee', topColor: '#ffe46a', bottom: 'shorts', bottomColor: '#3a4f7a' },
    g3: { seed: 43, skin: 'deep', hair: 'buns', hairColor: '#1b1210', top: 'stripes', topColor: '#ff9ac8', bottom: 'shorts', bottomColor: '#4f79a7' },
    g4: { seed: 44, skin: 'fair', hair: 'curly', hairColor: '#8a4a2a', top: 'tee', topColor: '#7ab8ff', bottom: 'shorts', bottomColor: '#2a2a33' },
  };
  const castIn = (set, names) => { const C = {}; for (const n of names) { C[n] = n === 'me' ? makeNarrator(ME) : makeAvatar(O[n]); set.group.add(C[n].root); if (n === 'hatter') C[n].head.add(topHat()); if (n === 'mil' || n === 'kingS') { const gn = gun(); C[n].handR.add(gn); gn.position.set(0, -0.2, 0); C[n].gun = gn; } } C.sp = makeSparkles(set.group, 7); C.puff = makePuff(set.group); return C; };
  const on = a => a.reset().size(a.baseHeight);
  const aim = a => { a.pose({ aR: [88, -6], aL: [80, 26] }); if (a.gun) a.gun.rotation.x = -a.armR.rotation.x; return a; };
  const zap = (c, t0, dur = 0.12, k = 0.55) => { c.shot.flash = () => (c.lt >= t0 && c.lt < t0 + dur ? k : 0); };
  const fadeOut = (av, C, lt, t0) => { const dt = lt - t0; if (dt < 0) return; C.sp.at(dt, av.root.position.toArray(), 1); if (dt > 0.5) av.root.visible = false; };

  // ───────────── sets (built per part)
  const S = {};
  S.shib = (o = {}) => { const lit = o.lit !== false, g = grp(skyDome('night'), at(floor(500, 500, TEX.road(), 6), 0, -0.02, 0));
    for (const [x, z, sx, sz] of [[0, -9, 26, 1.2], [0, 9, 26, 1.2], [-9, 0, 1.2, 26], [9, 0, 1.2, 26]]) for (let i = 0; i < 9; i++) g.add(at(box(sx === 26 ? 1.4 : 4.5, 0.04, sz === 26 ? 1.4 : 4.5, '#e8e8e8'), x + (sx === 26 ? -12 + i * 3 : 0), 0.03, z + (sz === 26 ? -12 + i * 3 : 0)));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = 22, x = Math.sin(a) * 12, z = Math.cos(a) * 12; g.add(at(box(1.2, 0.04, 4.5, '#e8e8e8'), x * 0.5, 0.035, z * 0.5, a)); }
    const B = [[-30, -32, 18, 46, 14], [-8, -38, 16, 60, 14], [14, -34, 20, 40, 14], [34, -30, 16, 52, 14], [-34, -6, 12, 34, 16], [34, -4, 12, 30, 16], [-34, 22, 12, 38, 16], [34, 22, 12, 42, 16]];
    B.forEach(([x, z, w, h, d], i) => g.add(at(tower(w, h, d, lit, i + 3), x, 0, z)));
    const scr = (txt, x, y, z, w, h, ry = 0, bg = '#0a1a3a', fg = '#7ab8ff') => { const s = sign(txt, w, h, { bg, fg, glowing: true }); s.visible = lit; g.add(at(s, x, y, z, ry)); return s; };
    scr('SHIBUYA', -8, 30, -30.9, 12, 3, 0, '#1a0a2a', '#ff6fd8'); scr(['NEW', 'MUSIC'], 14, 24, -26.9, 10, 6, 0, '#0a2a1a', '#7dffa8'); scr('24/7', -27.9, 20, -6, 8, 4, Math.PI / 2, '#2a1a0a', '#ffe46a');
    const entry = sign(['GAME', 'ENTRY'], 10, 6, { bg: '#050505', fg: '#ff3030', glowing: true }); entry.visible = false; g.add(at(entry, 27.9, 12, -4, -Math.PI / 2));
    const visa = sign(['VISA:', '0 DAYS'], 8, 5, { bg: '#050505', fg: '#ff3030', glowing: true }); visa.visible = false; g.add(at(visa, -27.9, 9, -6, Math.PI / 2));
    for (const [x, z] of [[-14, 14], [14, 14], [-14, -14], [14, -14]]) g.add(at(lampPost(10), x, 0, z));
    const s = { group: g, light: lit ? 'neon' : 'dark', entry, visa, lasers: [laser(), laser()], blimps: [] }; s.lasers.forEach(l => g.add(l));
    if (o.blimps) { [['J', 'S', -16, 34, -20], ['Q', 'H', 8, 40, -30], ['K', 'C', 22, 30, -12]].forEach(([r, su, x, y, z]) => { const b = blimp(r, su); b.position.set(x, y, z); b.userData.y = y; g.add(b); s.blimps.push(b); }); s.update = t => s.blimps.forEach((b, i) => { b.position.y = b.userData.y + Math.sin(t * 0.6 + i) * 0.8; b.rotation.y = 0.3 + Math.sin(t * 0.2 + i) * 0.1; }); }
    if (o.meteor) { const m = grp(new THREE.Mesh(new THREE.SphereGeometry(3, 16, 12), glow('#ffb04a', 2.2))); const tail = new THREE.Mesh(new THREE.ConeGeometry(2.6, 30, 12), new THREE.MeshBasicMaterial({ color: '#ff7a2a', transparent: true, opacity: 0.6, depthWrite: false })); tail.rotation.z = -Math.PI / 2.6; tail.position.set(13, 6, 0); m.add(tail); m.visible = false; g.add(m); s.meteor = m; }
    s.reset = () => { s.lasers.forEach(l => l.visible = false); entry.visible = false; visa.visible = false; if (s.meteor) s.meteor.visible = false; }; return s; };
  S.room = () => { const s = TOWN.roomNight({ wall: '#2a2f4a', bed: '#3a3a5a', shelf: true }); s.group.add(at(SETS_tv(), 2, 0, 11, Math.PI)); const L = new THREE.PointLight('#8fb4ff', 300, 30, 2); L.position.set(2, 4.5, 9); s.group.add(L); return s; };
  const SETS_tv = () => grp(at(box(6, 1.6, 1.6, '#3a2a1a'), 0, 0.8, 0), at(box(5.2, 3, 0.25, '#17181c'), 0, 3.3, 0), at(box(4.8, 2.6, 0.06, glow('#7fd0ff', 1.1)), 0, 3.3, 0.14));
  S.cards = () => { const g = grp(); const bg = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: '#0c0f1e' })); bg.position.z = -20; g.add(bg); const cs = { S: card('A', 'S'), C: card('7', 'C'), D: card('5', 'D'), H: card('10', 'H') }; const L = new THREE.PointLight('#ffffff', 0, 1); g.add(L);
    Object.values(cs).forEach(c => { c.visible = false; g.add(c); }); const s = { group: g, light: 'dark', cs, reset() { Object.values(cs).forEach(c => c.visible = false); } }; return s; };
  S.garden = () => { const s = SETS.park(); s.light = 'dark'; for (let i = 0; i < 6; i++) s.group.add(at(box(6, 4, 1.6, '#1e4a26', 0.2), -18 + i * 7.2, 2, -6 + (i % 2) * 3)); const scr = grp(at(box(5.6, 7.6, 0.3, '#111'), 0, 0, -0.2), at(card('7', 'H'), 0, 0, 0.05)); s.group.add(at(scr, 6, 8.5, -8), at(box(0.4, 5, 0.4, '#111'), 6, 2.5, -8.4)); const rule = sign(['ONLY ONE', 'CAN SURVIVE'], 8, 4, { bg: '#050505', fg: '#ff3030', glowing: true }); s.group.add(at(rule, -8, 8, -8.2)); s.group.children[0].material.color.set('#3a4a7a'); return s; };
  S.beach = (o = {}) => { const s = TOWN.pool(); const g = s.group;
    const hotel = grp(at(box(60, 26, 10, '#e8e2d4'), 0, 13, 0)); for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) hotel.add(at(box(2.4, 2.6, 0.2, glow(['#ffe7a8', '#ffd0f0', '#bfe6ff'][(r + i) % 3], 1.2)), -26 + i * 4.8, 6 + r * 5, 5.05));
    hotel.add(at(sign('THE BEACH', 22, 4, { bg: '#0a1a3a', fg: '#ff6fd8', glowing: true }), 0, 23, 5.2)); g.add(at(hotel, 0, 0, -30));
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshBasicMaterial({ map: canvasTex(468, 208, (c, w, h) => { c.fillStyle = '#1a1a2a'; c.fillRect(0, 0, w, h); const S2 = ['S', 'C', 'D', 'H']; for (let r = 0; r < 4; r++) for (let i = 0; i < 13; i++) { const full = o.full || ((i * 7 + r * 3) % 5 !== 0 && i < 10); c.fillStyle = full ? '#fbfaf6' : '#2a2a3e'; c.fillRect(8 + i * 35, 8 + r * 50, 28, 42); if (full) { c.fillStyle = r > 1 ? '#d0202a' : '#151515'; suit(c, S2[r], 22 + i * 35, 28 + r * 50, 8); } } }) }));
    g.add(at(wall, -16, 5, -15.7)); const fire = flames(); fire.visible = false; g.add(at(fire, 8, 0, -11)); s.fire = fire;
    const timer = sign(['TIME LEFT', '00:59'], 6, 3.4, { bg: '#050505', fg: '#ff3030', glowing: true }); timer.visible = false; g.add(at(timer, 16, 6, -15.7)); s.timer = timer;
    s.reset = () => { fire.visible = false; timer.visible = false; }; return s; };
  S.prison = () => { const g = room({ floorTex: TEX.concrete('#5a5a60'), tile: 4, wallColor: '#3a3d44', trim: '#2a2d34', trimY: 3, w: 34, d: 24, h: 13, lights: 2, ceiling: '#1a1c22' });
    for (let i = 0; i < 6; i++) { const x = -12.5 + i * 5; g.add(at(box(0.25, 9, 0.25, '#6a6e76'), x, 4.5, -2)); for (let b = 1; b < 5; b++) g.add(at(box(0.12, 9, 0.12, '#8a8e96'), x + b, 4.5, -2)); }
    g.add(at(sign(['JACK', 'OF HEARTS'], 6, 2.6, { bg: '#111', fg: '#ff3040', glowing: true }), 0, 10.5, -5.85)); return { group: g, light: 'dark' }; };
  S.arena = () => { const g = room({ floorTex: TEX.checker('#1f3a7a', '#2a4a8a'), tile: 4, wallColor: '#141a2a', trim: '#2a3a5a', trimY: 3, w: 36, d: 24, h: 14, lights: 3, ceiling: '#0e1220' });
    g.add(at(sign(['TEAM A   1450', 'TEAM B   1380'], 14, 5, { bg: '#050505', fg: '#7dffa8', glowing: true, align: 'left' }), 0, 9, -5.85), at(card('K', 'C'), -12, 9, -5.8), at(card('K', 'C'), 12, 9, -5.8)); return { group: g, light: 'neon' }; };
  S.croquet = () => { const s = SETS.park(); for (let i = 0; i < 8; i++) s.group.add(at(box(5, 3.4, 1.4, '#2f8a3a', 0.2), -20 + i * 5.6, 1.7, -8)); s.group.add(at(table(5, 3, '#ffffff', 2.7), 6, 0, 1), at(teaSet(), 7.6, 2.83, 1.6), at(chair('#ff8fbd'), 6, 0, -1.4));
    for (const [x, z] of [[-6, 2], [-2, 4], [-9, 5]]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.07, 6, 16, Math.PI), mat('#f4f4f4')); h.position.set(x, 0, z); s.group.add(h); }
    for (const [x, z, c] of [[-4, 3, '#d0202a'], [-7, 4.5, '#2a6ad0']]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 10), mat(c)); b.position.set(x, 0.35, z); s.group.add(b); }
    s.group.add(at(card('Q', 'H'), 14, 6, -7.2)); return s; };
  S.hosp = () => { const g = room({ floorTex: TEX.checker('#ffffff', '#dfe8ee'), wallColor: '#eef4f6', trim: '#9fc8d8', trimY: 3, w: 34, d: 24, lights: 3 });
    for (const x of [-8, 0, 8]) g.add(at(bed('#bfe0f0'), x, 0, -1.4)); g.add(at(windowPane(6, 4.5, '#bfe8ff'), 0, 7.4, -5.85), at(sign('TOKYO HOSPITAL', 8, 1.4, { bg: '#ffffff', fg: '#2a6ad0' }), -10, 9.5, -5.85)); return { group: g, light: 'indoor' }; };
  S.jtable = () => { const g = room({ floorTex: TEX.wood('#3a2418'), tile: 6, wallColor: '#1a1424', trim: '#3a2a4a', trimY: 3, w: 30, d: 22, h: 12, lights: 0, ceiling: '#0c0812' }); g.add(at(table(10, 6, '#2a6a3a', 2.7), 0, 0, 1));
    const r = rng(9), S2 = ['S', 'C', 'D', 'H'], R = ['A', '2', '5', '7', '9', '10', 'J', 'Q', 'K']; for (let i = 0; i < 26; i++) { const c = card(R[i % R.length], S2[i % 4]); c.scale.setScalar(0.32); c.rotation.set(-Math.PI / 2, 0, (r() - 0.5) * 1.2); c.position.set((r() - 0.5) * 8.4, 2.85 + i * 0.002, 1 + (r() - 0.5) * 5); if (Math.abs(c.position.x) < 1.3 && Math.abs(c.position.z - 1.2) < 1.2) continue; g.add(c); }
    const jk = card('JOKER'); jk.scale.setScalar(0.45); jk.rotation.set(-Math.PI / 2, 0, 0.05); jk.position.set(0, 2.9, 1.2); g.add(jk); const L = new THREE.PointLight('#c18cff', 260, 20, 2); L.position.set(0, 8, 2); g.add(L); return { group: g, light: 'joker', joker: jk }; };

  // ═════════ PART 1
  if (PART === 1) {
    const sh = S.shib(), shD = S.shib({ lit: false }), rm = S.room(), cd = S.cards(), gd = S.garden();
    const A = castIn(sh, ['arisu', 'karube', 'chota', 'g1', 'g2', 'g3', 'g4']), D = castIn(shD, ['arisu', 'karube', 'chota']), R = castIn(rm, ['arisu']), M = castIn(rm, ['me']), G = castIn(gd, ['arisu', 'karube', 'chota']);
    const trio = (C, t, face, z = 4, ry = 0) => { on(C.arisu).place(0, z, ry).setFace(face).idle(t); on(C.karube).place(-3, z + 0.3, ry + 0.25).setFace(face).idle(t + 1); on(C.chota).place(3, z + 0.3, ry - 0.25).setFace(face).idle(t + 2); };
    const crowd = (C, t) => [C.g1, C.g2, C.g3, C.g4].forEach((a, i) => on(a).place(-14 + ((t * 2 + i * 7) % 28), [-6, -3, 8, 11][i], Math.PI / 2 * (i % 2 ? -1 : 1)).walk(t, 0.8).setFace('calm'));
    shot({ line: 'In this town,', set: sh, sfx: [['whoosh', 0]], cam: drone([0, 2, 0], { h: 34, back: 44, drift: [8, -2, -8], fov: 54 }) });
    shot({ line: 'if your visa runs out,', set: shD, sfx: [['tick', 'out', 0.8]], cam: { pos: [-27.9 + 14, 9, -6], look: [-27.9, 9, -6], fov: 46, blur: 0, push: 0.1 },
      act(lt, c) { shD.visa.visible = true; } });
    shot({ line: 'a red laser falls from the sky', set: shD, sfx: [['rise', 'laser', 0.6]], cam: handheld({ pos: [6, 3, 18], look: [0, 12, 0], fov: 60, blur: 0, push: 0.05 }, 1),
      act(lt, c) { const l = shD.lasers[0]; l.visible = lt >= c.w('laser'); l.position.set(-2, 0, -2); l.scale.y = clamp((lt - c.w('laser')) * 3); } });
    shot({ line: 'and kills you.', set: rm, sfx: [['thud', 'kills']], cam: frame(2, 2.5, { size: 'close', side: -10, push: 0.1 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace(lt < c.w('kills') ? 'uneasy' : 'gasp').idle(c.t); } });
    shot({ line: "Arisu didn't know that yet.", set: rm, cam: frame(-1, 2, { size: 'close', side: 14 }),
      act(lt, c) { on(R.arisu).place(-1, 2, 0).pose({ aL: [60, -20], aR: [60, -20] }).setFace('calm').idle(c.t, 0.5); } });
    shot({ line: 'He was just a lazy gamer,', set: rm, cam: { pos: [-4, 7, 10], look: [-1, 2.5, 1], fov: 52, blur: 0.1, push: 0.07 },
      act(lt, c) { on(R.arisu).place(-1, 2, 0).sit(0.6).pose({ aL: [60, -20], aR: [60, -20] }).setFace('sleepy').idle(c.t, 0.4); } });
    shot({ line: 'standing in the middle of Shibuya', set: sh, cam: drone([0, 2, 4], { h: 24, back: 34, drift: [-6, -2, -6], fov: 54 }),
      act(lt, c) { trio(A, c.t, 'calm'); crowd(A, c.t); } });
    shot({ line: 'with his two best friends,', set: sh, cam: frame(0, 4, { size: 'medium', side: 8, dist: 1.6 }),
      act(lt, c) { trio(A, c.t, 'joy'); } });
    shot({ line: 'Karube and Chota.', set: sh, cam: frame(1.5, 4.3, { size: 'medium', side: -14, dist: 1.4 }),
      act(lt, c) { trio(A, c.t, 'joy'); A.karube.pose('wave'); A.chota.pose('open'); } });
    shot({ line: 'Then, for a few seconds,', set: sh, cam: frame(0, 4, { size: 'close', side: -12 }),
      act(lt, c) { on(A.arisu).place(0, 4, 0).setFace('uneasy').lookAt(10, -10).idle(c.t); } });
    shot({ line: 'the whole city went dark.', set: sh, sfx: [['thud', 'dark']], cam: { pos: [-16, 8, 26], look: [0, 12, -10], fov: 56, blur: 0, push: 0.06 },
      act(lt, c) { if (lt >= c.w('dark')) c.shot.light = 'dark'; else c.shot.light = 'neon'; trio(A, c.t, 'gasp'); crowd(A, c.t); if (lt >= c.w('dark')) c.shot.flash = () => -0; } , light: 'neon' });
    shot({ line: 'When the lights came back on,', set: sh, cam: { pos: [12, 5, 20], look: [0, 6, 0], fov: 56, blur: 0, push: 0.06 },
      act(lt, c) { trio(A, c.t, 'calm'); } });
    shot({ line: 'every single person in Tokyo was gone.', set: sh, cam: drone([0, 2, 4], { h: 40, back: 30, drift: [0, 6, 6], fov: 54 }),
      act(lt, c) { trio(A, c.t, 'gasp'); } });
    shot({ line: 'No cars.', set: sh, cam: { pos: [-20, 2.5, 8], look: [10, 1, -6], fov: 50, blur: 0, push: 0.1 } });
    shot({ line: 'No phones.', set: sh, cam: frame(3, 4.3, { size: 'close', side: 16 }),
      act(lt, c) { on(A.chota).place(3, 4.3, -0.2).pose({ aR: [100, -20], head: [16, 0, 0] }).setFace('worried').idle(c.t); } });
    shot({ line: 'No people.', set: sh, cam: { pos: [0, 18, 30], look: [0, 4, -20], fov: 50, blur: 0, push: 0.08 } });
    shot({ line: 'That night, a glowing screen', set: shD, sfx: [['pop', 'glowing', 0.6]], cam: { pos: [4, 5, 12], look: [27.9, 11, -4], fov: 50, blur: 0, push: 0.08 },
      act(lt, c) { shD.entry.visible = true; shD.entry.scale.setScalar(lt < c.w('glowing') ? 0.001 : E.back(remap(lt, c.w('glowing'), c.w('glowing') + 0.25))); } });
    shot({ line: 'invited them to play a game.', set: shD, cam: follow(lt => [6 + lt * 3, 0, -4], [-7, 4, 9], { lookY: 3.5 }),
      act(lt, c) { shD.entry.visible = true; [D.arisu, D.karube, D.chota].forEach((a, i) => on(a).place(6 + lt * 3 - i * 1.5, -4 + (i - 1) * 2.4, Math.PI / 2).walk(c.t + i, 0.7).setFace('uneasy')); } });
    shot({ line: 'Every game had a playing card.', set: cd, cam: { pos: [0, 0, 12], look: [0, 0, 0], fov: 50, blur: 0, push: 0.06 },
      act(lt, c) { Object.values(cd.cs).forEach((k, i) => { k.visible = true; k.position.set(-4.95 + i * 3.3, 0, 0); k.rotation.y = Math.sin(c.t * 2 + i) * 0.25; }); } });
    for (const [line, s, w] of [['Spades were physical.', 'S', 'physical'], ['Clubs were teamwork.', 'C', 'teamwork'], ['Diamonds were brains.', 'D', 'brains']])
      shot({ line, set: cd, sfx: [['pop', w, 0.6]], cam: { pos: [0, 0, 7.5], look: [0, 0, 0], fov: 46, blur: 0, push: 0.12 }, act(lt, c) { const k = cd.cs[s]; k.visible = true; k.position.set(0, 0, 0); k.rotation.y = (1 - E.out(remap(lt, 0, 0.35))) * Math.PI; } });
    shot({ line: 'And hearts were the worst,', set: cd, sfx: [['thud', 'worst']], light: 'joker', cam: { pos: [0, 0, 7.5], look: [0, 0, 0], fov: 46, blur: 0, push: 0.14 },
      act(lt, c) { const k = cd.cs.H; k.visible = true; k.position.set(0, 0, 0); k.rotation.y = (1 - E.out(remap(lt, 0, 0.35))) * Math.PI; k.rotation.z = Math.sin(c.t * 9) * 0.03; } });
    shot({ line: 'because hearts play with your feelings.', set: rm, cam: frame(2, 2.5, { size: 'close', side: 12 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('serious').idle(c.t); } });
    shot({ line: 'Win, and you get a visa,', set: shD, sfx: [['sparkle', 'visa', 0.7]], cam: frame(0, 4, { size: 'medium', side: 14 }),
      act(lt, c) { on(D.arisu).place(0, 4, 0.2).pose('cheer').setFace('joy').idle(c.t); D.sp.at(lt - c.w('visa'), [0, 0, 4], 1); } });
    shot({ line: 'a few more days to live.', set: shD, cam: frame(0, 4, { size: 'close', side: -10 }),
      act(lt, c) { on(D.arisu).place(0, 4, -0.1).setFace('smile').idle(c.t); } });
    shot({ line: 'Lose, and the laser finds you.', set: shD, sfx: [['rise', 'laser', 0.6], ['thud', 'finds']], cam: { pos: [-10, 6, 22], look: [4, 6, 0], fov: 56, blur: 0, push: 0.07 },
      act(lt, c) { shD.lasers.forEach((l, i) => { const t0 = c.w('laser') + i * 0.25; l.visible = lt >= t0; l.position.set(i ? 8 : -2, 0, i ? -6 : 3); }); zap(c, c.w('finds'), 0.1, 0.4); } });
    shot({ line: 'Arisu was good at games,', set: shD, cam: frame(0, 4, { size: 'close', side: 14 }),
      act(lt, c) { on(D.arisu).place(0, 4, 0.1).setFace('smug').idle(c.t); } });
    shot({ line: 'so for a while, they kept winning.', set: shD, cam: frame(0, 4, { size: 'full', side: -12, low: 0.4, dist: 1.2 }),
      act(lt, c) { [D.arisu, D.karube, D.chota].forEach((a, i) => on(a).place((i - 1) * 3, 4, (1 - i) * 0.25).pose('cheer').setFace('joy').jump((c.t * 1.6 + i * 0.3) % 1, 0.7)); } });
    shot({ line: 'Then they walked into a dark garden,', set: gd, cam: { pos: [-6, 6, 18], look: [0, 4, -4], fov: 54, blur: 0, push: 0.06 },
      act(lt, c) { [G.arisu, G.karube, G.chota].forEach((a, i) => on(a).place(-4 + i * 3, 6 - lt * 1.5, Math.PI).walk(c.t + i, 0.6).setFace('uneasy')); } });
    shot({ line: 'and the card on the screen was a heart.', set: gd, sfx: [['thud', 'heart', 0.8]], cam: { pos: [6, 8.5, 0], look: [6, 8.5, -8], fov: 48, blur: 0, push: 0.11 } });
    shot({ line: 'The game was hide and seek.', set: gd, cam: frame(0, 2, { size: 'medium', side: 10, dist: 1.6 }),
      act(lt, c) { [G.karube, G.arisu, G.chota].forEach((a, i) => on(a).place((i - 1) * 3, 2, (1 - i) * 0.3).setFace('worried').idle(c.t + i)); } });
    shot({ line: 'And then they heard the last rule.', set: gd, cam: frame(0, 2, { size: 'close', side: -12 }),
      act(lt, c) { on(G.arisu).place(0, 2, 0).setFace('uneasy').lookAt(-8, -8).idle(c.t); } });
    shot({ line: 'Only one of you can survive. //', set: gd, sfx: [['thud', 'survive']], cam: { pos: [-8, 8, -0.5], look: [-8, 8, -8.2], fov: 46, blur: 0, push: 0.1 } });
    shot({ line: 'Arisu looked at his friends.', set: gd, cam: frame(0, 2, { size: 'close', side: 14 }),
      act(lt, c) { on(G.arisu).place(0, 2, 0).setFace('worried').lookAt(-3, 2).idle(c.t); } });
    shot({ line: 'His friends looked at him.', set: gd, cam: frame(-1.5, 2, { size: 'medium', side: -10, dist: 1.2 }),
      act(lt, c) { on(G.karube).place(-3, 2, 0.4).setFace('sad').idle(c.t); on(G.chota).place(0, 2, -0.4).setFace('sad').idle(c.t + 1); } });
    shot({ line: 'Karube and Chota gave their lives,', set: gd, sfx: [['sad', 'gave', 0.7], ['sparkle', 'lives', 0.5]], cam: frame(-1.5, 2, { size: 'medium', side: 12, dist: 1.3 }),
      act(lt, c) { on(G.karube).place(-3, 2, 0.2).setFace('smile').idle(c.t); on(G.chota).place(0, 2, -0.2).setFace('smile').idle(c.t + 1); fadeOut(G.karube, G, lt, c.w('lives')); fadeOut(G.chota, G, lt, c.w('lives') + 0.1); } });
    shot({ line: 'so Arisu could live.', set: gd, cam: { pos: [0, 6, 16], look: [0, 3, 2], fov: 50, blur: 0, push: 0.05 },
      act(lt, c) { on(G.arisu).place(0, 2, 0).pose('slump').setFace('cry').idle(c.t, 0.3); } });
    shot({ line: 'Alone and broken,', set: shD, cam: frame(0, 6, { size: 'full', side: -14 }),
      act(lt, c) { on(D.arisu).place(0, 6, 0.2).sit(0.3).pose('slump').setFace('cry').idle(c.t, 0.3); } });
    shot({ line: 'Arisu wanted to give up.', set: shD, cam: frame(0, 6, { size: 'close', side: 10, push: 0.1 }),
      act(lt, c) { on(D.arisu).place(0, 6, 0).setFace('cry').idle(c.t, 0.3); } });
    shot({ line: 'Until someone told him about a place', set: shD, cam: frame(0, 6, { size: 'close', side: -16 }),
      act(lt, c) { on(D.arisu).place(0, 6, -0.2).setFace(lt < c.w('place') ? 'sad' : 'wow').lookAt(-10, 0).idle(c.t); } });
    shot({ line: 'where players had a plan to go home.', set: shD, cam: frame(0, 6, { size: 'close', side: 18, low: 0.3 }),
      act(lt, c) { on(D.arisu).place(0, 6, 0.3).setFace('wow').lookAt(-10, -20).idle(c.t); } });
    shot({ line: 'The Beach. ///', set: S.beach(), sfx: [['pop', 'beach', 0.6]], cam: { pos: [0, 20, 6], look: [0, 22, -24.8], fov: 50, blur: 0, push: 0.08 } });
  }

  // ═════════ PART 2
  if (PART === 2) {
    const bc = S.beach(), bcF = S.beach({ full: true }), rm = S.room(), shB = S.shib({ blimps: true }), cd = S.cards();
    const B = castIn(bc, ['arisu', 'usagi', 'chishiya', 'hatter', 'mil', 'g1', 'g2', 'g3', 'g4']), F = castIn(bcF, ['arisu', 'usagi']), M = castIn(rm, ['me']), H = castIn(shB, ['arisu', 'usagi', 'kingS']);
    const dance = (t, face = 'joy') => [B.g1, B.g2, B.g3, B.g4].forEach((a, i) => on(a).place([-7, 6, -2, 9][i], [8, 9, 10, 7.5][i], [0.4, -0.4, 0.1, -0.2][i]).pose(i % 2 ? 'cheer' : 'wave').setFace(face).jump((t * 2.2 + i * 0.3) % 1, 0.5));
    const jqk = [card('J', 'S'), card('Q', 'H'), card('K', 'C')]; jqk.forEach(k => { k.visible = false; cd.group.add(k); }); const lvl = sign(['STAGE 1', 'CLEAR'], 8, 4, { bg: '#050505', fg: '#7dffa8', glowing: true }); lvl.visible = false; cd.group.add(lvl);
    cd.reset = () => { Object.values(cd.cs).forEach(c => c.visible = false); jqk.forEach(k => k.visible = false); lvl.visible = false; };
    shot({ line: 'In this town, the safest place to live', set: bc, sfx: [['whoosh', 0]], cam: drone([0, 2, -6], { h: 26, back: 40, drift: [8, -2, -8], fov: 54 }), act(lt, c) { dance(c.t); } });
    shot({ line: 'is a hotel called the Beach.', set: bc, cam: { pos: [0, 18, 8], look: [0, 22, -24.8], fov: 50, blur: 0, push: 0.08 } });
    shot({ line: "At least, that's what everyone thinks.", set: rm, cam: frame(2, 2.5, { size: 'close', side: -12 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('sus').idle(c.t); } });
    shot({ line: 'Arisu arrived with Usagi,', set: bc, cam: follow(lt => [-14 + lt * 3, 0, 10], [-5, 4, 9], { lookY: 3.5 }),
      act(lt, c) { on(B.arisu).place(-14 + lt * 3, 10, Math.PI / 2).walk(c.t, 0.7).setFace('uneasy'); on(B.usagi).place(-15.5 + lt * 3, 12, Math.PI / 2).walk(c.t + 0.4, 0.7).setFace('calm'); } });
    shot({ line: 'a mountain climber', set: bc, cam: frame(-6, 12, { size: 'medium', side: -16 }),
      act(lt, c) { on(B.usagi).place(-6, 12, -0.2).pose('hips').setFace('serious').idle(c.t); } });
    shot({ line: 'who had lost everything too.', set: bc, cam: frame(-6, 12, { size: 'close', side: 14 }),
      act(lt, c) { on(B.usagi).place(-6, 12, 0).setFace('sad').idle(c.t); } });
    shot({ line: 'The Beach was full of pool parties,', set: bc, sfx: [['pop', 'parties', 0.6]], cam: { pos: [-12, 7, 22], look: [0, 3, 4], fov: 56, blur: 0, push: 0.07 }, act(lt, c) { dance(c.t); } });
    shot({ line: 'loud music and hundreds of players in swimsuits,', set: bc, cam: handheld(frame(-2, 10, { size: 'medium', side: 12, dist: 1.5 }), 0.8), act(lt, c) { dance(c.t, 'winkjoy'); } });
    shot({ line: 'all following one rule.', set: bc, cam: frame(0, 2, { size: 'medium', side: -14 }),
      act(lt, c) { on(B.hatter).place(0, 2, 0.2).pose('point').setFace('serious').idle(c.t); } });
    shot({ line: 'Give every card you win to the Hatter.', set: bc, cam: frame(0, 2, { size: 'close', side: 12, push: 0.1 }),
      act(lt, c) { on(B.hatter).place(0, 2, -0.1).pose('hips').setFace('smug').idle(c.t); } });
    shot({ line: 'The Hatter promised', set: bc, cam: frame(0, 2, { size: 'medium', side: 18, dist: 1.2 }),
      act(lt, c) { on(B.hatter).place(0, 2, 0.3).pose('open').setFace('say').talk(c.t); dance(c.t, 'calm'); } });
    shot({ line: 'that if they collected the whole deck,', set: bc, cam: frame(0, 2, { size: 'close', side: -16 }),
      act(lt, c) { on(B.hatter).place(0, 2, -0.2).pose({ aR: [100, -10] }).setFace('talk').talk(c.t); } });
    shot({ line: 'from ace to king,', set: bc, cam: { pos: [-16, 5, -10.5], look: [-16, 5, -15.7], fov: 50, blur: 0, push: 0.1 } });
    shot({ line: 'they could all go home.', set: bc, sfx: [['sparkle', 'home', 0.6]], cam: frame(0, 2, { size: 'full', side: -12, low: 0.4 }),
      act(lt, c) { on(B.hatter).place(0, 2, -0.2).pose('cheer').setFace('joy').idle(c.t); B.sp.at(lt - c.w('home'), [0, 0, 2], 1); } });
    shot({ line: 'But the Beach was hiding things.', set: rm, cam: frame(2, 2.5, { size: 'close', side: 12, push: 0.1 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('uneasy').idle(c.t); } });
    shot({ line: 'Chishiya,', set: bc, cam: frame(-12, -12, { size: 'medium', side: -18 }),
      act(lt, c) { on(B.chishiya).place(-12, -12, -0.2).setFace('blank').idle(c.t, 0.4); } });
    shot({ line: 'a quiet genius in a white hoodie,', set: bc, cam: frame(-12, -12, { size: 'close', side: 16 }),
      act(lt, c) { on(B.chishiya).place(-12, -12, 0.2).setFace('smirk').idle(c.t, 0.4); } });
    shot({ line: 'was planning to steal the cards.', set: bc, cam: { pos: [-11, 5.5, -4], look: [-15, 4.5, -15.7], fov: 50, blur: 0.1, push: 0.08 },
      act(lt, c) { on(B.chishiya).place(-13, -13, Math.PI * 0.85).setFace('smirk').idle(c.t); } });
    shot({ line: 'A group with guns wanted to take control.', set: bc, cam: frame(8, 2, { size: 'medium', side: -14, low: 0.3 }),
      act(lt, c) { aim(on(B.mil).place(8, 2, -0.2)).setFace('angry').idle(c.t, 0.4); } });
    shot({ line: 'And one night,', set: bc, light: 'dark', cam: { pos: [-10, 14, 10], look: [0, 18, -25], fov: 52, blur: 0, push: 0.07 } });
    shot({ line: 'a girl was found dead in her room.', set: bc, sfx: [['thud', 'dead']], light: 'dark', cam: { pos: [-4, 6, 18], look: [0, 4, 2], fov: 54, blur: 0, push: 0.07 },
      act(lt, c) { dance(c.t, 'gasp'); [B.g1, B.g2, B.g3, B.g4].forEach(a => a.pose({ aL: [150, 30], aR: [150, 30] })); } });
    shot({ line: 'Suddenly,', set: bc, light: 'dark', cam: frame(0, 6, { size: 'close', side: 14 }),
      act(lt, c) { on(B.arisu).place(0, 6, 0.1).setFace('gasp').idle(c.t); } });
    shot({ line: 'the whole hotel became a game.', set: bc, light: 'dark', sfx: [['pop', 'game', 0.6]], cam: { pos: [16, 6, -9], look: [16, 6, -15.7], fov: 50, blur: 0, push: 0.1 },
      act(lt, c) { bc.timer.visible = true; } });
    shot({ line: 'Find the killer before time runs out,', set: bc, light: 'dark', cam: frame(0, 6, { size: 'close', side: -12 }),
      act(lt, c) { on(B.arisu).place(0, 6, 0).setFace('serious').idle(c.t); } });
    shot({ line: 'or everyone dies.', set: bc, light: 'dark', cam: frame(0, 6, { size: 'face', side: 10, push: 0.12 }),
      act(lt, c) { on(B.arisu).place(0, 6, 0).setFace('gasp').idle(c.t, 0.3); } });
    shot({ line: 'Friends turned on friends,', set: bc, light: 'fire', cam: handheld(frame(0, 8, { size: 'medium', side: 0, dist: 1.4 }), 1),
      act(lt, c) { on(B.g1).place(-2, 8, 0.6).pose('point').setFace('angry').talk(c.t); on(B.g2).place(2, 8, -0.6).pose('point').setFace('mad').talk(c.t + 1); } });
    shot({ line: 'guns came out,', set: bc, light: 'fire', cam: handheld(frame(8, 2, { size: 'close', side: 14, low: 0.3 }), 1.3),
      act(lt, c) { aim(on(B.mil).place(8, 2, -0.3)).setFace('angry'); } });
    shot({ line: 'and the Beach burned.', set: bc, light: 'fire', sfx: [['whoosh', 'burned']], cam: handheld({ pos: [8, 5, 6], look: [8, 3, -11], fov: 56, blur: 0, push: 0.08 }, 1),
      act(lt, c) { bc.fire.visible = true; bc.fire.scale.setScalar(1 + Math.sin(c.t * 14) * 0.06); } });
    shot({ line: 'Arisu solved the game,', set: bc, light: 'fire', sfx: [['sparkle', 'solved', 0.6]], cam: frame(0, 6, { size: 'close', side: 14 }),
      act(lt, c) { bc.fire.visible = true; on(B.arisu).place(0, 6, 0.1).setFace('serious').idle(c.t); B.sp.at(lt - c.w('solved'), [0, 0, 6], 1); } });
    shot({ line: 'but the dream of going home was gone.', set: bc, light: 'dark', cam: frame(1.5, 6, { size: 'medium', side: -12, dist: 1.3 }),
      act(lt, c) { on(B.arisu).place(0, 6, 0.2).pose('slump').setFace('sad').idle(c.t, 0.3); on(B.usagi).place(3, 6, -0.2).pose('slump').setFace('sad').idle(c.t, 0.3); } });
    shot({ line: 'Then, one by one,', set: bcF, cam: { pos: [-20, 6, -6], look: [-16, 5, -15.7], fov: 50, blur: 0, push: 0.08 } });
    shot({ line: 'every number card in Tokyo was cleared.', set: bcF, sfx: [['ding', 'cleared', 0.6]], cam: { pos: [-16, 5, -9.5], look: [-16, 5, -15.7], fov: 52, blur: 0, push: 0.09 } });
    shot({ line: 'Giant balloons rose over the city,', set: shB, sfx: [['whoosh', 0, 0.5]], cam: { pos: [0, 6, 34], look: [0, 30, -16], fov: 58, blur: 0, push: 0.05 } });
    shot({ line: 'carrying new cards.', set: shB, cam: { pos: [-8, 26, 4], look: [8, 32, -30], fov: 48, blur: 0, push: 0.08 } });
    shot({ line: 'Jacks, queens and kings.', set: cd, sfx: [['pop', 'jacks', 0.5], ['pop', 'queens', 0.5], ['pop', 'kings', 0.5]], cam: { pos: [0, 0, 21], look: [0, 0, 0], fov: 50, blur: 0, push: 0.05 },
      act(lt, c) { jqk.forEach((k, i) => { const t0 = c.w(['jacks', 'queens', 'kings'][i]); k.visible = lt >= t0; k.position.set((i - 1) * 3.4, 0, 0); k.scale.setScalar(E.back(remap(lt, t0, t0 + 0.2))); }); } });
    shot({ line: 'That was the real twist.', set: rm, cam: frame(2, 2.5, { size: 'close', side: -10, push: 0.1 }),
      act(lt, c) { on(M.me).place(2, 2.5, 0).setFace('gasp').idle(c.t); } });
    shot({ line: 'Collecting the cards was never the way out.', set: bcF, cam: frame(0, 6, { size: 'close', side: 12 }),
      act(lt, c) { on(F.arisu).place(0, 6, 0).setFace('uneasy').idle(c.t); } });
    shot({ line: 'It was only the first level.', set: cd, cam: { pos: [0, 0, 9], look: [0, 0, 0], fov: 50, blur: 0, push: 0.1 }, act(lt, c) { lvl.visible = true; } });
    shot({ line: 'The face cards were not players.', set: shB, cam: { pos: [6, 4, 24], look: [-2, 9, -2], fov: 50, blur: 0.05, push: 0.07 },
      act(lt, c) { aim(on(H.kingS).place(-2, -2, 0.2)).setFace('serious').idle(c.t, 0.3); } });
    shot({ line: 'They were the people', set: shB, cam: frame(-2, -2, { size: 'medium', h: 1.45, side: 16, low: 0.4 }),
      act(lt, c) { aim(on(H.kingS).place(-2, -2, -0.2)).setFace('serious').idle(c.t, 0.3); } });
    shot({ line: 'who live in the borderland', set: shB, cam: frame(-2, -2, { size: 'close', h: 1.45, side: -12, low: 0.3 }),
      act(lt, c) { on(H.kingS).place(-2, -2, 0).setFace('serious').idle(c.t, 0.3); } });
    shot({ line: 'and make the rules.', set: shB, cam: { pos: [0, 30, 14], look: [8, 36, -30], fov: 50, blur: 0, push: 0.08 } });
    shot({ line: 'And to go home,', set: shB, cam: frame(1.5, 6, { size: 'medium', side: 10, dist: 1.3 }),
      act(lt, c) { on(H.arisu).place(0, 6, 0.2).setFace('serious').idle(c.t); on(H.usagi).place(3, 6, -0.2).setFace('serious').idle(c.t); } });
    shot({ line: 'Arisu would have to beat', set: shB, cam: frame(0, 6, { size: 'close', side: 12 }),
      act(lt, c) { on(H.arisu).place(0, 6, 0).setFace('serious').idle(c.t); } });
    shot({ line: 'every single one of them. ///', set: shB, cam: frame(0, 6, { size: 'full', side: -16, low: 0.5, push: 0.06 }),
      act(lt, c) { on(H.arisu).place(0, 6, -0.2).pose('hips').setFace('serious').idle(c.t, 0.4); } });
  }

  // ═════════ PART 3
  if (PART === 3) {
    const cq = S.croquet(), shD = S.shib({ lit: false, meteor: true }), sh = S.shib(), pr = S.prison(), ar = S.arena(), hp = S.hosp(), jt = S.jtable(), rm = S.room(), gd = S.garden();
    const C = castIn(cq, ['arisu', 'mira']), D = castIn(shD, ['arisu', 'usagi', 'kingS', 'g1', 'g2']), L = castIn(sh, ['arisu', 'karube', 'chota']), P = castIn(pr, ['usagi', 'chishiya', 'g3', 'g4']), A = castIn(ar, ['arisu', 'usagi', 'g1', 'g2', 'g3', 'g4']), Hh = castIn(hp, ['arisu', 'usagi']), M = castIn(rm, ['me']), G = castIn(gd, ['arisu']);
    const collars = [P.usagi, P.chishiya, P.g3, P.g4].map((a, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 8, 20), glow(['#ff3040', '#3a8aff', '#ffe14a', '#7dffa8'][i], 1.6)); t.rotation.x = Math.PI / 2; t.position.y = 0.1; a.head.add(t); return t; });
    const qh = card('Q', 'H'); qh.visible = false; jt.group.add(at(qh, 0, 7, -3)); const qhR = () => { qh.visible = false; }; const jtReset = jt.reset; jt.reset = () => { qhR(); };
    shot({ line: 'In this town,', set: cq, sfx: [['whoosh', 0]], cam: drone([0, 2, 0], { h: 22, back: 34, drift: [8, -2, -8], fov: 54 }),
      act(lt, c) { on(C.mira).place(6, -1.4, 0).sit(1.5).setFace('smirk').idle(c.t, 0.4); on(C.arisu).place(-4, 3.5, 0.6).setFace('serious').idle(c.t); } });
    shot({ line: "the last game isn't played with guns.", set: shD, cam: frame(0, 2, { size: 'medium', h: 1.45, side: 14, low: 0.35 }),
      act(lt, c) { aim(on(D.kingS).place(0, 2, -0.2)).setFace('serious').idle(c.t, 0.3); } });
    shot({ line: "It's played with a cup of tea.", set: cq, sfx: [['ding', 'tea', 0.5]], cam: { pos: [7.8, 4.4, 4.6], look: [7.6, 3, 1.6], fov: 44, blur: 0.2, push: 0.1 } });
    shot({ line: 'But first,', set: shD, cam: drone([0, 2, 0], { h: 30, back: 40, drift: [-6, -2, -6], fov: 54 }) });
    shot({ line: 'Arisu had to survive the face cards.', set: shD, cam: frame(0, 6, { size: 'close', side: 12 }),
      act(lt, c) { on(D.arisu).place(0, 6, 0).setFace('serious').idle(c.t); } });
    shot({ line: 'The King of Spades', set: shD, sfx: [['thud', 'king', 0.6]], cam: frame(0, 2, { size: 'close', h: 1.45, side: -12, low: 0.4 }),
      act(lt, c) { on(D.kingS).place(0, 2, 0.1).setFace('serious').idle(c.t, 0.3); } });
    shot({ line: 'walked through the streets with a giant gun,', set: shD, sfx: [['thud', 'walked', 0.6]], cam: handheld(follow(lt => [-12 + lt * 2.2, 0, -4], [-6, 5, 14], { lookY: 5 }), 1),
      act(lt, c) { aim(on(D.kingS).place(-12 + lt * 2.2, -4, Math.PI / 2 - 0.4)).walk(c.t, 0.5, 20).setFace('serious'); aim(D.kingS); } });
    shot({ line: 'hunting every player he could find.', set: shD, cam: handheld({ pos: [10, 4, 16], look: [0, 3, 2], fov: 56, blur: 0, push: 0.06 }, 1.2),
      act(lt, c) { [D.g1, D.g2].forEach((a, i) => on(a).place(4 + lt * 5 + i * 2, 4 + i * 2, Math.PI / 2).run(c.t + i).setFace('scream')); } });
    shot({ line: 'The Jack of Hearts locked people in a prison,', set: pr, sfx: [['thud', 'locked']], cam: { pos: [-6, 6, 14], look: [0, 4, -3], fov: 54, blur: 0, push: 0.07 },
      act(lt, c) { [P.usagi, P.chishiya, P.g3, P.g4].forEach((a, i) => on(a).place(-10 + i * 5, -4, 0).setFace('worried').idle(c.t + i, 0.5)); } });
    shot({ line: 'where your life depended', set: pr, cam: frame(0, 2, { size: 'close', side: 12, push: 0.1 }),
      act(lt, c) { on(P.usagi).place(0, 2, 0).setFace('worried').lookAt(4, 2).idle(c.t); } });
    shot({ line: "on a collar you couldn't see", set: pr, cam: frame(4, 2, { size: 'face', side: -10 }),
      act(lt, c) { on(P.chishiya).place(4, 2, 0).setFace('sus').idle(c.t); } });
    shot({ line: 'and the lies of everyone around you.', set: pr, cam: frame(1.5, 2, { size: 'medium', side: -14, dist: 1.3 }),
      act(lt, c) { on(P.chishiya).place(0, 2, 0.5).pose('point').setFace('smirk').talk(c.t); on(P.g3).place(3, 2, -0.5).setFace('sus').idle(c.t); } });
    shot({ line: 'The King of Clubs made teams fight for points', set: ar, cam: { pos: [0, 7, 15], look: [0, 6, -4], fov: 54, blur: 0, push: 0.07 },
      act(lt, c) { [A.g1, A.g2, A.g3, A.g4].forEach((a, i) => on(a).place(-7 + i * 4.6, 1 + (i % 2), (i < 2 ? 0.4 : -0.4)).pose(i < 2 ? 'cheer' : 'point').setFace(i < 2 ? 'joy' : 'angry').idle(c.t + i)); } });
    shot({ line: 'until only one team was left.', set: ar, cam: frame(0, 2, { size: 'medium', side: 12, dist: 1.4 }),
      act(lt, c) { on(A.arisu).place(-1.5, 2, 0.2).setFace('serious').idle(c.t); on(A.usagi).place(1.5, 2, -0.2).setFace('worried').idle(c.t); } });
    shot({ line: 'Usagi almost gave up.', set: ar, sfx: [['sad', 'gave', 0.6]], cam: frame(1.5, 2, { size: 'close', side: -12 }),
      act(lt, c) { on(A.usagi).place(1.5, 2, 0).pose('slump').setFace('cry').idle(c.t, 0.3); } });
    shot({ line: 'Arisu almost lost his mind.', set: ar, cam: handheld(frame(-1.5, 2, { size: 'close', side: 14 }), 1.4),
      act(lt, c) { on(A.arisu).place(-1.5, 2, 0).pose({ aL: [150, -30], aR: [150, -30], head: [10, 0, 0] }).setFace('scream').idle(c.t); } });
    shot({ line: 'But they kept going, together.', set: shD, cam: follow(lt => [-6 + lt * 2.5, 0, 6], [-4, 4, 10], { lookY: 3.5 }),
      act(lt, c) { on(D.arisu).place(-6 + lt * 2.5, 6, Math.PI / 2).walk(c.t, 0.7).setFace('serious'); on(D.usagi).place(-7.5 + lt * 2.5, 8, Math.PI / 2).walk(c.t + 0.4, 0.7).setFace('serious'); } });
    shot({ line: 'At the very end,', set: cq, cam: { pos: [-14, 6, 14], look: [4, 3, -2], fov: 50, blur: 0, push: 0.06 },
      act(lt, c) { on(C.arisu).place(-6 + lt * 1.5, 5, Math.PI / 2 + 0.4).walk(c.t, 0.6).setFace('serious'); } });
    shot({ line: 'only one card was left.', set: jt, cam: { pos: [0, 7, 7], look: [0, 7, -3], fov: 48, blur: 0, push: 0.1 }, act(lt, c) { qh.visible = true; qh.rotation.y = Math.sin(c.t) * 0.2; } });
    shot({ line: 'The Queen of Hearts.', set: cq, sfx: [['thud', 'queen', 0.7]], cam: frame(6, -1.4, { size: 'close', side: -10, push: 0.1 }),
      act(lt, c) { on(C.mira).place(6, -1.4, 0).sit(1.5).setFace('smirk').idle(c.t, 0.3); } });
    shot({ line: 'Her name was Mira,', set: cq, cam: frame(6, -1.4, { size: 'face', side: 12 }),
      act(lt, c) { on(C.mira).place(6, -1.4, 0.1).sit(1.5).setFace('grin').idle(c.t, 0.3); } });
    shot({ line: 'and her game was croquet.', set: cq, cam: { pos: [-10, 4, 12], look: [-5, 1, 3], fov: 52, blur: 0, push: 0.07 },
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0.8).pose({ aL: [40, -10], aR: [40, -10] }).setFace('uneasy').idle(c.t); } });
    shot({ line: 'Just croquet, and tea.', set: cq, cam: frame(6, -1.4, { size: 'medium', side: -16, dist: 1.2 }),
      act(lt, c) { on(C.mira).place(6, -1.4, -0.2).sit(1.5).pose({ aR: [70, -20] }).setFace('happy').idle(c.t, 0.3); } });
    shot({ line: 'But while they played,', set: cq, cam: { pos: [-12, 5, 10], look: [-4, 2, 3.5], fov: 52, blur: 0, push: 0.07 },
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0.9).pose({ aL: [lerp(20, 60, Math.abs(Math.sin(c.t * 2))), -10], aR: [lerp(20, 60, Math.abs(Math.sin(c.t * 2))), -10] }).setFace('serious').idle(c.t); } });
    shot({ line: 'Mira told Arisu a terrible story.', set: cq, cam: frame(6, -1.4, { size: 'close', side: 16 }),
      act(lt, c) { on(C.mira).place(6, -1.4, 0.2).sit(1.5).setFace('say').talk(c.t); } });
    shot({ line: 'None of this was real.', set: cq, cam: frame(-4, 3.5, { size: 'close', side: -12, push: 0.1 }),
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0).setFace('gasp').idle(c.t, 0.4); } });
    shot({ line: 'There was no borderland.', set: shD, flash: lt => Math.min(0.85, lt * 0.9), cam: { pos: [0, 18, 30], look: [0, 4, -20], fov: 50, blur: 0, push: 0.08 } });
    shot({ line: 'He was making it all up in his head.', set: cq, cam: handheld(frame(-4, 3.5, { size: 'close', side: 14, roll: 6 }), 1.4),
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0).pose({ aL: [150, -30], aR: [150, -30], head: [10, 0, 0] }).setFace('worried').idle(c.t); } });
    shot({ line: 'Arisu started to believe her.', set: cq, cam: frame(-4, 3.5, { size: 'full', side: -14 }),
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0.3).sit(0.3).pose('slump').setFace('sad').idle(c.t, 0.3); } });
    shot({ line: 'Then he remembered Karube, Chota,', set: sh, sfx: [['sparkle', 'remembered', 0.5]], cam: frame(0, 4, { size: 'medium', side: 8, dist: 1.6 }),
      act(lt, c) { [L.karube, L.arisu, L.chota].forEach((a, i) => on(a).place((i - 1) * 3, 4, (1 - i) * 0.25).pose(i === 1 ? 'idle' : 'wave').setFace('joy').idle(c.t + i)); L.sp.at(lt - c.w('remembered'), [0, 0, 4], 1.4); } });
    shot({ line: 'and everyone who died to keep him alive,', set: gd, cam: { pos: [0, 6, 16], look: [0, 3, 2], fov: 50, blur: 0, push: 0.05 },
      act(lt, c) { on(G.arisu).place(0, 2, 0).setFace('sad').idle(c.t, 0.3); } });
    shot({ line: 'and he refused to quit.', set: cq, cam: frame(-4, 3.5, { size: 'full', side: 16, low: 0.5 }),
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0.2).pose('hips').setFace('serious').idle(c.t); } });
    shot({ line: 'He won.', set: cq, sfx: [['sparkle', 'won']], cam: frame(6, -1.4, { size: 'close', side: 8 }),
      act(lt, c) { on(C.mira).place(6, -1.4, 0).sit(1.5).setFace(lt < c.w('won') + 0.1 ? 'smirk' : 'smile').idle(c.t, 0.3); C.sp.at(lt - c.w('won'), [6, 1.5, -1.4], 1); } });
    shot({ line: 'And then,', set: cq, flash: lt => Math.min(1, lt * 2), cam: frame(-4, 3.5, { size: 'close', side: 8 }),
      act(lt, c) { on(C.arisu).place(-4, 3.5, 0).setFace('sleepy').idle(c.t, 0.3); } });
    shot({ line: 'he opened his eyes in a hospital bed.', set: hp, flash: lt => Math.max(0, 0.9 - lt * 2.5), cam: { pos: [3, 7, 5], look: [0, 2.6, -1.4], fov: 50, blur: 0.1, push: 0.07 },
      act(lt, c) { on(Hh.arisu).place(0, 1.6, 0, 2.5); Hh.arisu.root.rotation.x = -Math.PI / 2; Hh.arisu.setFace(lt < c.w('opened') ? 'sleepy' : 'wow'); } });
    shot({ line: 'A meteor had crashed into Shibuya,', set: shD, sfx: [['whoosh', 0], ['thud', 'crashed']], cam: { pos: [0, 10, 40], look: [0, 20, -10], fov: 60, blur: 0, push: 0.04 },
      act(lt, c) { const k = remap(lt, 0, c.w('crashed')); shD.meteor.visible = k < 1; shD.meteor.position.set(lerp(-60, 0, k), lerp(90, 2, k), lerp(-60, -6, k)); zap(c, c.w('crashed'), 0.25, 0.9); } });
    shot({ line: 'and everyone in the borderland', set: hp, cam: { pos: [-12, 7, 12], look: [2, 3, -1.4], fov: 54, blur: 0, push: 0.06 },
      act(lt, c) { on(Hh.arisu).place(0, 1.6, 0, 2.5); Hh.arisu.root.rotation.x = -Math.PI / 2; Hh.arisu.setFace('calm'); } });
    shot({ line: 'had been stuck between life and death.', set: hp, cam: { pos: [2, 5.2, 3.2], look: [0, 3, -3], fov: 48, blur: 0.15, push: 0.1 },
      act(lt, c) { on(Hh.arisu).place(0, 1.6, 0, 2.5); Hh.arisu.root.rotation.x = -Math.PI / 2; Hh.arisu.setFace('sleepy'); } });
    shot({ line: 'Arisu and Usagi survived,', set: hp, cam: frame(1.5, 3, { size: 'medium', side: 10, dist: 1.3 }),
      act(lt, c) { on(Hh.arisu).place(0, 3, 0.4).setFace('calm').idle(c.t); on(Hh.usagi).place(3, 3, -0.4).setFace('calm').idle(c.t); } });
    shot({ line: 'and they finally met in the real world.', set: hp, sfx: [['ding', 'real', 0.5]], cam: frame(1.5, 3, { size: 'close', side: -12, dist: 1.3 }),
      act(lt, c) { on(Hh.arisu).place(0, 3, 0.5).setFace('joy').idle(c.t); on(Hh.usagi).place(3, 3, -0.5).setFace('joy').idle(c.t); } });
    shot({ line: 'But somewhere,', set: shD, cam: { pos: [0, 18, 30], look: [0, 4, -20], fov: 50, blur: 0, push: 0.06 } });
    shot({ line: 'on a table full of cards,', set: jt, cam: { pos: [-6, 9, 9], look: [0, 2.8, 1], fov: 50, blur: 0, push: 0.07 } });
    shot({ line: 'one card was still left.', set: jt, cam: { pos: [0, 7.5, 4.5], look: [0, 2.9, 1.2], fov: 48, blur: 0, push: 0.1 } });
    shot({ line: 'The Joker. ///', set: jt, sfx: [['pop', 'joker', 0.7]], cam: { pos: [0, 5.6, 2.2], look: [0, 2.9, 1.2], fov: 46, blur: 0, push: 0.12 } });
  }
}, `timings${PART}.json`);
