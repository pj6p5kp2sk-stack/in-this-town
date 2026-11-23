// story.js: "In this town, there is only one rule. No peeing."
//
// THE SCRIPT (approved):
//   In this town, there is only one rule. No peeing. Ever. Because if you pee, you teleport, and nobody ever sees you
//   again. Nobody in this town has peed in sixty-seven years. The last person who did was my grandpa. He was at the
//   town picnic, he drank one lemonade too many, and HUSS! He was gone. My dad was a baby back then, so the only thing
//   I know about Grandpa is one old photo on our fridge. Because of the rule, life here is a little weird. Nobody
//   drinks anything after breakfast. Our school has no water fountains. And every bathroom in town is locked. I've
//   held it my whole life, and I've never had a single problem. Until last Friday. My best friend Max was sleeping
//   over, and we were watching a scary movie in the dark. At the scariest part, Max jumped out from behind the couch
//   and screamed, BOO! I screamed too. And then I felt something warm in my underpants. It was pee. [hold] I looked at
//   Max. Max looked at me. And then, HUSS! Everything went white. When I opened my eyes, I was standing on a hill. A
//   brown hill. Brown sky, brown river, brown trees, and a smell so bad my eyes started watering. I was in a world
//   made completely of poop. [hold] And in the middle of it all, on a giant golden toilet, sat an old man with a
//   crown. He looked exactly like the photo on our fridge. It was Grandpa. He wasn't scared. He was smiling. He said,
//   "I've been waiting sixty-seven years for this. Here, the rule is simple. Whoever peed last is the king of this
//   world, and the king before him finally gets to go home." Then he put his crown on my head, and HUSS! He was gone.
//   [long hold] So now I'm the king of a world of poop. I have a golden toilet, a brown castle and absolutely nobody
//   to talk to. Back home, Grandpa is finally eating dinner with my dad. And the only way I'm getting out of here is
//   if somebody else in that town pees. So Max, if you're watching this, drink some water. A lot of water.
import * as THREE from 'three';
import { start, shot, frame, LIGHTS } from './core.js';
import { makeAvatar } from './avatar.js';
import { SETS, TEX, floor, tree, table, chair, sofa, tv, rug, room, windowPane, door, counter, bunting, lampPost } from './sets.js';
import { TOWN, makeNarrator, handheld, follow, drone, hills, skyDome } from './town.js';
import { makeSparkles, makePuff } from './fx.js';
import { canvasTex, mat, tmat, glow, box, at, grp, sign, rng, shade, clamp, remap, lerp, E } from './util.js';

Object.assign(LIGHTS, {
  poop: { amb: 0.95, hemi: 0.7, sun: 1.45, dir: [-10, 14, 10], sunColor: '#f2cc94', bg: '#6a4a2a', exposure: 1.0 },
});

// ───────────── props for this story
const GOLD = () => mat('#f2c230', { emissive: new THREE.Color('#5a3c00') });
function glassCup(full) {
  const g = grp(), c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.8, 16), new THREE.MeshLambertMaterial({ color: '#e8f4ff', transparent: true, opacity: 0.45, depthWrite: false }));
  c.position.y = 0.4; g.add(c);
  if (full) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.23, 0.6, 16), mat('#ffe14a', { emissive: new THREE.Color('#6a5a00') })); l.position.y = 0.33; g.add(l); }
  return g;
}
function pitcher() { const g = grp(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.6, 20), new THREE.MeshLambertMaterial({ color: '#ffe14a', transparent: true, opacity: 0.85, emissive: new THREE.Color('#5a4a00') })); b.position.y = 0.8; g.add(b, at(box(0.15, 1, 0.5, '#ffffff'), 0.7, 0.9, 0)); return g; }
function photo() { // the old photo of young Grandpa on the fridge
  const t = canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8a878'; g.fillRect(16, 16, w - 32, h - 90);
    const cx = w / 2; g.fillStyle = '#2e8a57'; g.fillRect(cx - 62, 150, 124, 90); g.fillStyle = '#f4efe6'; g.fillRect(cx - 18, 150, 36, 90);
    g.fillStyle = '#f2c7a0'; g.beginPath(); g.roundRect(cx - 44, 64, 88, 88, 22); g.fill();
    g.fillStyle = '#3a2416'; g.beginPath(); g.roundRect(cx - 48, 54, 96, 32, 14); g.fill();
    g.strokeStyle = '#17120f'; g.lineWidth = 4; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 18, 104, 12, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(cx - 6, 104); g.lineTo(cx + 6, 104); g.stroke();
    g.beginPath(); g.arc(cx, 124, 16, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = 'rgba(110,70,20,0.18)'; g.fillRect(16, 16, w - 32, h - 90);
    g.fillStyle = '#2a2a6a'; g.font = '700 30px Montserrat'; g.textAlign = 'center'; g.fillText("GRANDPA '59", cx, h - 30);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), tmat(t)); return grp(p, at(box(0.35, 0.35, 0.15, '#e8413c', 0.08), 0, 0.92, 0.06));
}
function crown() {
  const g = grp(), m = GOLD(); m.side = THREE.DoubleSide;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.72, 0.38, 24, 1, true), m); band.position.y = 0.19; g.add(band);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.48, 8), m); c.position.set(Math.sin(a) * 0.74, 0.6, Math.cos(a) * 0.74); g.add(c); const j = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), glow(i % 2 ? '#ff3b5b' : '#3bb0ff', 1.4)); j.position.set(Math.sin(a) * 0.77, 0.19, Math.cos(a) * 0.77); g.add(j); }
  return g;
}
function poopPile(s = 1, c = '#6b3f1d') {
  const g = grp(), m = mat(c), m2 = mat(shade(c, 0.1));
  [[1.3, 0.6], [1.0, 1.45], [0.7, 2.15]].forEach(([r, y], i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r * 0.72, r * 0.46, 12, 24), i % 2 ? m2 : m); t.rotation.x = Math.PI / 2; t.position.y = y; t.castShadow = true; g.add(t); const f = new THREE.Mesh(new THREE.SphereGeometry(r * 0.8, 14, 10), m); f.position.y = y; g.add(f); });
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 14), m); tip.position.set(0.1, 2.85, 0); tip.rotation.z = -0.35; g.add(tip);
  g.scale.setScalar(s); return g;
}
function stinkLine() { const pts = []; for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(Math.sin(i * 1.3) * 0.35, i * 0.5, 0)); return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.09, 6, false), new THREE.MeshBasicMaterial({ color: '#a8e04a', transparent: true, opacity: 0.7, depthWrite: false })); }
function goldToilet() {
  const g = grp(), m = GOLD();
  g.add(at(box(10, 0.6, 10, '#a8822a'), 0, 0.3, 0), at(box(7.4, 0.6, 7.4, '#c9a03a'), 0, 0.9, 0));
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.6, 3, 28), m); bowl.position.y = 2.7; bowl.castShadow = true;
  const seat = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.32, 12, 32), m); seat.rotation.x = Math.PI / 2; seat.position.y = 4.25;
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), mat('#7a4a22')); water.rotation.x = -Math.PI / 2; water.position.y = 4.12;
  const tank = box(4.6, 4.4, 1.9, m, 0.3); tank.position.set(0, 5.6, -2.4);
  const lid = box(5, 0.45, 2.2, m, 0.15); lid.position.set(0, 7.95, -2.4);
  const handle = box(0.9, 0.28, 0.3, m, 0.1); handle.position.set(-1.7, 6.8, -1.4);
  g.add(bowl, seat, water, tank, lid, handle);
  [[-1.1, 5.4, '#ff3b5b'], [0, 6.3, '#3bb0ff'], [1.1, 5.4, '#4bff8a']].forEach(([x, y, c]) => { const j = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), glow(c, 1.5)); j.position.set(x, y, -1.42); g.add(j); });
  return g;
}
function castle(c = '#6b4423') {
  const g = grp(), d = shade(c, -0.3);
  g.add(at(box(22, 14, 12, c), 0, 7, 0));
  for (const [x, z] of [[-11, 6], [11, 6], [-11, -6], [11, -6]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 20, 16), mat(shade(c, 0.06))); t.position.set(x, 10, z); t.castShadow = true; const r = new THREE.Mesh(new THREE.ConeGeometry(3.8, 6, 16), mat('#4a2c14')); r.position.set(x, 23, z); g.add(t, r); }
  for (let i = 0; i < 9; i++) g.add(at(box(1.4, 1.6, 1.4, c), -9.6 + i * 2.4, 14.8, 6));
  g.add(at(box(5, 7, 0.4, '#2a1a0c'), 0, 3.5, 6.1), at(box(0.3, 8, 0.3, '#2a1a0c'), 0, 29, 6), at(box(3.2, 2, 0.15, '#f2c230'), 1.6, 31.5, 6));
  for (const x of [-6, 6]) g.add(at(box(2, 3, 0.3, '#2a1a0c'), x, 9, 6.1));
  return g;
}
function poopSky() {
  const t = canvasTex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3f2712'); gr.addColorStop(0.42, '#7a5230'); gr.addColorStop(0.52, '#b98a55'); gr.addColorStop(1, '#b98a55'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(13); for (let i = 0; i < 18; i++) { const x = r() * w, y = 60 + r() * 150; g.fillStyle = 'rgba(150,100,50,0.45)'; for (let j = 0; j < 6; j++) { g.beginPath(); g.ellipse(x + j * 16 - 40, y + (j % 2) * 5, 28, 10, 0, 0, 7); g.fill(); } } });
  const m = new THREE.Mesh(new THREE.SphereGeometry(420, 40, 20), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false }));
  const sun = new THREE.Mesh(new THREE.CircleGeometry(16, 32), glow('#ffcf7a', 1.6)); sun.position.set(80, 140, -330); sun.lookAt(0, 0, 0);
  return grp(m, sun);
}

start(() => {
  // ───────────── sets
  const streetN = TOWN.street({ time: 'night', lit: 0.55 });
  const billboard = grp(at(sign(['ONLY ONE RULE:', 'NO PEEING!'], 10, 5, { bg: '#fbf6ea', fg: '#c0262d', border: '#c0262d', glowing: true }), 0, 6.5, 0.2), at(box(0.4, 9, 0.4, '#2a2b30'), -3.5, 4.5, 0), at(box(0.4, 9, 0.4, '#2a2b30'), 3.5, 4.5, 0));
  streetN.group.add(at(billboard, -5, 0, -0.5));
  const counterBoard = grp(at(sign('DAYS WITHOUT PEEING', 9, 1.4, { bg: '#c0262d', fg: '#ffffff', glowing: true }), 0, 8.4, 0.25), at(sign('24,472', 9, 3.2, { bg: '#151a2c', fg: '#ffe46a', glowing: true }), 0, 6, 0.25), at(box(9.6, 5.4, 0.4, '#2a2b30'), 0, 7, 0), at(box(0.4, 5, 0.4, '#2a2b30'), -3, 2.5, 0), at(box(0.4, 5, 0.4, '#2a2b30'), 3, 2.5, 0));
  streetN.group.add(at(counterBoard, 25, 0, -0.5));
  const streetD = TOWN.street({ time: 'day' });

  const picnic = SETS.park(); picnic.light = 'warm';
  const blanket = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.5), tmat(canvasTex(128, 96, (g, w, h) => { for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#ffffff' : '#d8343a'; g.fillRect(x * 16, y * 16, 16, 16); } })));
  blanket.rotation.x = -Math.PI / 2; blanket.position.set(-9, 0.05, 4.5); blanket.receiveShadow = true;
  picnic.group.add(blanket, at(table(9, 3.2, '#c9442f', 2.7), 0, 0, 0), at(pitcher(), -2.6, 2.83, 0.3));
  for (let i = 0; i < 8; i++) picnic.group.add(at(glassCup(false), -1.4 + i * 0.6, 2.83, 0.9));
  picnic.group.add(at(sign('TOWN PICNIC', 12, 2, { bg: '#fff3c9', fg: '#c9442f', border: '#c9442f' }), 0, 10, -4.2), at(box(0.3, 10, 0.3, '#6a4a2a'), -6.2, 5, -4.4), at(box(0.3, 10, 0.3, '#6a4a2a'), 6.2, 5, -4.4), at(bunting(26), 0, 12.4, -3));

  const kitchen = { group: room({ floorTex: TEX.checker('#ffffff', '#e8d7b0'), wallColor: '#f3e2b8', trim: '#c98f52', trimY: 4, w: 34, d: 24, lights: 1 }), light: 'warm' };
  const fridge = grp(at(box(4.4, 8.5, 3, '#f4f4f6', 0.25), 0, 4.25, 0), at(box(0.25, 2.6, 0.3, '#b9bcc4'), -1.7, 6, 1.6), at(box(0.25, 1.8, 0.3, '#b9bcc4'), -1.7, 2.6, 1.6), at(box(4.2, 0.08, 0.1, '#c9ccd4'), 0, 4.6, 1.52));
  const ph = photo(); fridge.add(at(ph, 0.4, 6.1, 1.58));
  kitchen.group.add(at(fridge, 9, 0, -4), at(table(7, 3.2, '#d9a86a', 2.7), -4, 0, 1), at(chair('#2e9e59'), -5.6, 0, -1.3), at(chair('#e8632b'), -2.4, 0, -1.3));
  kitchen.group.add(at(counter(8, '#ffffff', '#5f86a9'), -12, 0, -4.6), at(windowPane(5, 4, '#9fd8ff'), -12, 7.4, -5.85), at(sign(['LAST DRINK:', '8:00 AM'], 6, 2.6, { bg: '#ffffff', fg: '#c0262d', border: '#c0262d' }), -2, 8.2, -5.85));
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 24), mat('#ffffff')); clock.rotation.x = Math.PI / 2; clock.position.set(3.4, 8.2, -5.8); kitchen.group.add(clock, at(box(0.1, 0.8, 0.1, '#222'), 3.4, 8.5, -5.65), at(box(0.55, 0.1, 0.1, '#222'), 3.15, 8.2, -5.65));
  const dadGlass = glassCup(true); kitchen.group.add(at(dadGlass, -5.4, 2.83, 0.4));
  const plates = grp(); for (const x of [-5.6, -2.4]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 20), mat('#ffffff')); p.position.set(x, 2.88, 0.6); plates.add(p, at(box(0.9, 0.3, 0.6, '#c9742f', 0.1), x, 3.05, 0.6), at(box(0.4, 0.25, 0.4, '#58b94a', 0.1), x + 0.4, 3.05, 0.8)); } kitchen.group.add(plates);
  const pendant = new THREE.PointLight('#ffd9a0', 170, 26, 2); pendant.position.set(-4, 9, 2); kitchen.group.add(pendant, at(new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 10), glow('#fff2d0', 2)), -4, 9.4, 1));
  kitchen.reset = () => { dadGlass.visible = true; plates.visible = false; };

  const hall = SETS.hallway({ banner: 'STAY\nDRY!', bannerBg: '#2f9e55', poster: 'HOLD\nIT!' });
  const fountain = grp(at(box(2.4, 1.2, 1.4, '#c9ccd4', 0.15), 0, 3.2, 0), at(box(0.3, 2.6, 0.3, '#9a9da6'), 0, 1.3, -0.3));
  for (const r of [0.75, -0.75]) { const x = box(4.4, 0.4, 0.2, glow('#e8202a', 1.1)); x.rotation.z = r; x.position.set(0, 3.2, 0.8); fountain.add(x); }
  fountain.add(at(sign(['NO WATER', 'FOUNTAINS'], 4.6, 2.2, { bg: '#e84b4b', fg: '#fff' }), 0, 7, -0.6));
  hall.group.add(at(fountain, 25, 0, -5.2));
  const bathDoor = door('BATHROOM', '#7a8a9a'); hall.group.add(at(bathDoor, -24, 0, -5.9));
  for (const r of [0.55, -0.55]) { const ch = box(4.6, 0.25, 0.2, '#8a8d96'); ch.rotation.z = r; ch.position.set(-24, 3.9, -5.45); hall.group.add(ch); }
  const lock = grp(at(box(1, 1.1, 0.45, '#e2b23a', 0.12), 0, 0, 0)); const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 8, 16, Math.PI), mat('#b9bcc4')); shackle.position.y = 0.55; lock.add(shackle, at(box(0.18, 0.3, 0.05, '#222'), 0, -0.1, 0.24)); hall.group.add(at(lock, -24, 3.6, -5.15));

  const livingN = { group: room({ floorTex: TEX.wood('#8a5a34'), tile: 6, wallColor: '#3e4f8f', trim: '#2c3a6a', trimY: 0.6, w: 34, d: 26, h: 12, lights: 0, ceiling: '#1a1f30' }), light: 'roomNight' };
  const ghost = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.5), new THREE.MeshBasicMaterial({ map: canvasTex(460, 250, (g, w, h) => { g.fillStyle = '#0c1430'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a2a50'; g.fillRect(0, h * 0.72, w, h); g.fillStyle = '#f4f6ff'; g.beginPath(); g.moveTo(w / 2 - 70, h * 0.9); g.lineTo(w / 2 - 70, 90); g.arc(w / 2, 90, 70, Math.PI, 0); g.lineTo(w / 2 + 70, h * 0.9); for (let i = 0; i < 4; i++) { g.lineTo(w / 2 + 70 - i * 35 - 17, h * 0.82); g.lineTo(w / 2 + 70 - (i + 1) * 35, h * 0.9); } g.fill(); g.fillStyle = '#111'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * 26, 95, 12, 20, 0, 0, 7); g.fill(); } g.beginPath(); g.ellipse(w / 2, 140, 18, 24, 0, 0, 7); g.fill(); }) }));
  ghost.position.set(0, 3.3, 9.75); ghost.rotation.y = Math.PI;
  livingN.group.add(at(sofa('#c33a3a'), 0, 0, -1.5), at(rug(12, 7, '#d9b33a'), 0, 0, 2.5), at(tv(), 0, 0, 10, Math.PI), ghost, at(windowPane(5, 4, '#1a2340'), -9, 7, -5.85), at(box(3, 0.6, 6, '#2f9e55', 0.25), 7, 0.3, 2.5));
  livingN.group.add(at(sign('FRIDAY', 3.4, 1.4, { bg: '#ffffff', fg: '#d23a3a', glowing: true }), 8, 7.2, -5.84), at(sign('NOV', 3.4, 0.7, { bg: '#d23a3a', fg: '#ffffff', glowing: true }), 8, 8.25, -5.84));
  const tvLight = new THREE.PointLight('#8fb4ff', 320, 34, 2); tvLight.position.set(0, 4.5, 8); const lampL = new THREE.PointLight('#ffcf9a', 60, 18, 2); lampL.position.set(-12, 6, -3); livingN.group.add(tvLight, lampL);
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshLambertMaterial({ color: '#f2d33c', transparent: true, opacity: 0.85, emissive: new THREE.Color('#5a4a00') })); puddle.rotation.x = -Math.PI / 2; livingN.group.add(puddle);
  livingN.reset = () => { puddle.visible = false; };

  // the world of poop
  const poop = { group: grp(poopSky(), hills('#4e3018', -150, 5), hills('#5c3a1c', -230, 9)), light: 'poop' };
  poop.group.add(at(floor(500, 500, TEX.grass('#6b4423'), 6), 0, -0.02, 0));
  const river = new THREE.Mesh(new THREE.PlaneGeometry(500, 9), mat('#7a4a22', { emissive: new THREE.Color('#2a1608') })); river.rotation.x = -Math.PI / 2; river.position.set(0, 0.03, -40); poop.group.add(river);
  for (let i = 0; i < 40; i++) poop.group.add(at(box(1.5 + (i % 3), 0.04, 0.3, '#9a6a3a'), -120 + i * 6.3, 0.06, -40 + ((i * 7) % 9) - 4));
  const hill = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 16), mat('#7a5230')); hill.scale.y = 0.22; hill.position.set(-24, -0.5, -4); hill.receiveShadow = true; poop.group.add(hill);
  for (const [x, z, h] of [[-40, -20, 10], [-48, -12, 8], [-36, -28, 11], [-54, -24, 9], [30, -28, 9], [44, -22, 10], [52, -32, 11], [-12, -30, 8]]) poop.group.add(at(tree(h, '#7a5230'), x, 0, z));
  const piles = [[-8, -8, 1.2], [6, -4, 0.8], [26, -8, 1.4], [32, 2, 1], [-40, 2, 1.6], [0, -26, 2], [20, -32, 1.5], [-22, -26, 1.8], [40, -12, 1.1], [-6, -46, 2.4], [24, -52, 2.2]];
  for (const [x, z, s] of piles) poop.group.add(at(poopPile(s, ['#6b3f1d', '#7a4a22', '#5e3618'][Math.abs(x) % 3]), x, 0, z));
  const throne = goldToilet(); poop.group.add(at(throne, 14, 0, -16));
  poop.group.add(at(castle(), 42, 0, -80));
  const stinks = []; for (const [x, z, s] of piles.slice(0, 6)) for (let k = 0; k < 3; k++) { const l = stinkLine(); l.userData = { x: x + (k - 1) * 0.9 * s, z, y: 3 * s, ph: k * 0.5 + x * 0.1 }; poop.group.add(l); stinks.push(l); }
  const flies = []; for (const [x, z, s] of piles.slice(0, 4)) for (let k = 0; k < 5; k++) { const f = grp(box(0.2, 0.14, 0.14, '#111'), at(box(0.22, 0.02, 0.12, glow('#ffffff', 0.9)), 0, 0.1, 0)); f.userData = { x, z, r: 1.4 * s + k * 0.3, h: 2.2 * s + k * 0.35, ph: k * 1.3 }; poop.group.add(f); flies.push(f); }
  poop.update = (t) => {
    for (const l of stinks) { const u = l.userData, k = ((t * 0.7 + u.ph) % 1.6) / 1.6; l.position.set(u.x, u.y + k * 2.2, u.z); l.material.opacity = Math.sin(k * Math.PI) * 0.8; }
    for (const f of flies) { const u = f.userData, a = t * 4.2 + u.ph; f.position.set(u.x + Math.cos(a) * u.r, u.h + Math.sin(t * 9 + u.ph) * 0.3, u.z + Math.sin(a) * u.r); f.rotation.y = -a; }
  };
  poop.reset = () => { crownG.visible = true; crownMe.visible = false; };

  // ───────────── cast (one copy per set, identical options)
  const ME = { color: '#3553b8', print: 'HOLD IT' };
  const GPA = { seed: 7, skin: 'fair', hair: 'short', hairColor: '#eeeeee', top: 'cardigan', topColor: '#2e8a57', inner: '#f4efe6', sleeves: 'long', bottom: 'slacks', bottomColor: '#6a5440', shoe: '#3a2a1e', sole: '#2a1a10', glasses: true };
  const OPTS = {
    gpa: GPA, gpaY: { ...GPA, hairColor: '#3a2416' },
    dad: { seed: 4, skin: 'fair', hair: 'swoop', hairColor: '#3a2416', top: 'shirt', topColor: '#5a8ad6', sleeves: 'long', bottom: 'slacks', bottomColor: '#39404c' },
    baby: { seed: 9, skin: 'fair', hair: 'buzz', hairColor: '#c9a070', top: 'plain', topColor: '#9fd8ff', bottom: 'plain', bottomColor: '#9fd8ff', shoe: '#ffffff', height: 0.45, face: 'cute' },
    max: { seed: 2, skin: 'brown', hair: 'curly', hairColor: '#1b1210', top: 'hoodie', topColor: '#e94b3c', bottom: 'joggers', bottomColor: '#2a2a33' },
    w1: { seed: 5, skin: 'tan', hair: 'ponytail', hairColor: '#5a3a1a', top: 'tee', topColor: '#f2b01e', bottom: 'skirt', bottomColor: '#3a6fd0' },
    m1: { seed: 6, skin: 'light', hair: 'short', hairColor: '#8a5a2a', top: 'vest', topColor: '#2f9e55', sleeves: 'long', bottom: 'jeans', bottomColor: '#3a4f7a', cap: '#d23a3a' },
    k1: { seed: 8, skin: 'deep', hair: 'buns', hairColor: '#1b1210', top: 'stripes', topColor: '#ff9ac8', bottom: 'jeans', bottomColor: '#4f79a7', backpack: '#7b3fc4' },
    k2: { seed: 10, skin: 'light', hair: 'messy', hairColor: '#e8c070', top: 'zip', topColor: '#2f9e8a', bottom: 'cargo', bottomColor: '#6a6a50', backpack: '#e8632b' },
  };
  const castIn = (set, names) => { const C = {}; for (const n of names) { C[n] = n === 'me' ? makeNarrator(ME) : makeAvatar(OPTS[n]); set.group.add(C[n].root); } C.sp = makeSparkles(set.group, 3); C.puff = makePuff(set.group); return C; };
  const N = castIn(streetN, ['me', 'w1', 'm1', 'k1']), D = castIn(streetD, ['me', 'w1', 'm1']), PI_ = castIn(picnic, ['gpaY', 'baby', 'w1', 'm1']);
  const K = castIn(kitchen, ['me', 'dad', 'gpa']), H = castIn(hall, ['k1', 'k2', 'w1']), L = castIn(livingN, ['me', 'max']), P = castIn(poop, ['me', 'gpa']);
  const glassG = glassCup(true); PI_.gpaY.handR.add(glassG); glassG.position.set(0, -0.35, 0.55);
  const crownG = crown(); P.gpa.head.add(crownG); crownG.position.y = 1.08;
  const crownMe = crown(); P.me.head.add(crownMe); crownMe.position.y = 1.3;

  // helpers
  const on = a => a.reset().size(a.baseHeight);
  const hand = (av, g) => { g.rotation.x = -av.armR.rotation.x; };
  // teleport: squash + stretch out of existence on t0 with the sparkle burst. Returns false once gone.
  const vanish = (av, C, lt, t0) => { const dt = lt - t0; if (dt < 0) return true; C.sp.at(dt, av.root.position.toArray(), av.baseHeight); C.puff.at(dt, av.root.position.toArray()); if (dt < 0.16) { const k = dt / 0.16, s = av.baseHeight; av.root.scale.set(s * (1 - k * 0.9), s * (1 + k * 0.7), s * (1 - k * 0.9)); av.setFace('scream'); return true; } av.root.visible = false; return false; };
  const flashAt = (c, t0, peak = 0.75) => { const dt = c.lt - t0; c.shot.flash = () => (dt >= 0 && dt < 0.3 ? peak * (1 - dt / 0.3) : 0); };
  const GT = [14, -15.6], GY = 2.75; // Grandpa on the throne: position + head-height offset

  // ═════════ ACT 1: the rule
  shot({ line: 'In this town,', set: streetN, sfx: [['whoosh', 0]], cam: drone([2, 4, 0], { h: 30, back: 46, drift: [8, -2, -8], fov: 52 }),
    act(lt, c) { on(N.w1).place(-12 + lt * 3, 4.5, Math.PI / 2).walk(c.t, 0.8).setFace('calm'); on(N.m1).place(14 - lt * 3, 3.5, -Math.PI / 2).walk(c.t, 0.8).setFace('calm'); } });
  shot({ line: 'there is only one rule.', set: streetN, cam: { pos: [-1, 5.5, 15], look: [-5, 6.5, -0.5], fov: 46, blur: 0.1, push: 0.08 },
    act(lt, c) { on(N.w1).place(-12 + (lt + 1.2) * 3, 4.5, Math.PI / 2).walk(c.t, 0.8).setFace('calm'); } });
  shot({ line: 'No peeing.', set: streetN, sfx: [['pop', 'no']], cam: { pos: [-5, 6.4, 21], look: [-5, 6.6, -0.5], fov: 40, blur: 0, push: 0.12 } });
  shot({ line: 'Ever.', set: streetN, cam: frame(2, 4, { size: 'close', side: -14 }),
    act(lt, c) { on(N.me).place(2, 4, -0.15).setFace('serious').idle(c.t); } });
  shot({ line: 'Because if you pee,', set: streetN, cam: frame(10, 4, { size: 'medium', side: 16 }),
    act(lt, c) { on(N.w1).place(10, 4, -0.2).setFace('worried').idle(c.t); } });
  shot({ line: 'you teleport,', set: streetN, sfx: [['sparkle', 'teleport'], ['whoosh', 'teleport', 0.7]], cam: handheld(frame(10, 4, { size: 'full', side: -22 }), 0.8),
    act(lt, c) { on(N.w1).place(10, 4, 0.3).setFace('gasp').idle(c.t); vanish(N.w1, N, lt, c.w('teleport')); flashAt(c, c.w('teleport'), 0.4); } });
  shot({ line: 'and nobody ever sees you again.', set: streetN, cam: { pos: [12.5, 4.2, 15], look: [11, 3, 4], fov: 54, blur: 0.15, push: 0.06 },
    act(lt, c) { on(N.m1).place(15, 4.5, -0.6).setFace('gasp').idle(c.t); on(N.k1).place(6.5, 5, 0.5).setFace('worried').idle(c.t); } });
  shot({ line: 'Nobody in this town', set: streetN, cam: { pos: [-28, 9, 26], look: [-6, 4, 0], fov: 50, blur: 0, push: 0.06 },
    act(lt, c) { on(N.w1).place(-18 + lt * 3, 4.5, Math.PI / 2).walk(c.t, 0.8).setFace('calm'); on(N.m1).place(-2 - lt * 3, 3.6, -Math.PI / 2).walk(c.t, 0.8).setFace('calm'); on(N.k1).place(-10 + lt * 2.5, 5.2, Math.PI / 2).walk(c.t).setFace('calm'); } });
  shot({ line: 'has peed in sixty-seven years.', set: streetN, cam: { pos: [25, 6.4, 15], look: [25, 6.8, -0.5], fov: 44, blur: 0, push: 0.09 } });
  shot({ line: 'The last person who did', set: picnic, sfx: [['whoosh', 0, 0.6]], cam: frame(-3, 2.6, { size: 'close', side: 14 }),
    act(lt, c) { on(PI_.gpaY).place(-3, 2.6, -0.15).setFace('calm').idle(c.t); glassG.visible = false; } });
  shot({ line: 'was my grandpa.', set: picnic, cam: frame(-3, 2.6, { size: 'medium', side: -16 }),
    act(lt, c) { on(PI_.gpaY).place(-3, 2.6, 0.2).pose('wave').setFace('joy').idle(c.t); glassG.visible = false; } });
  shot({ line: 'He was at the town picnic,', set: picnic, cam: drone([0, 2, 0], { h: 20, back: 32, drift: [6, -2, -6], fov: 52 }),
    act(lt, c) { on(PI_.gpaY).place(-3, 2.6, 0.2).setFace('joy').idle(c.t); glassG.visible = false; on(PI_.w1).place(3.5, 2.6, -0.3).pose('open').setFace('joy').talk(c.t); on(PI_.m1).place(5.5, 6, -0.6).pose('wave').setFace('joy').idle(c.t); on(PI_.baby).place(-9, 4.5, 0.3).sit(0.2).setFace('cute'); } });
  shot({ line: 'he drank one lemonade', set: picnic, cam: frame(-3, 2.6, { size: 'close', side: -10 }),
    act(lt, c) { on(PI_.gpaY).place(-3, 2.6, 0).pose({ aR: [128, -28], head: [-14, 0, 0] }).setFace(lt < c.w('lemonade') ? 'calm' : 'happy').idle(c.t, 0.5); glassG.visible = true; hand(PI_.gpaY, glassG); } });
  shot({ line: 'too many,', set: picnic, cam: { pos: [0.5, 7.5, 6], look: [0, 2.9, 0.9], fov: 46, blur: 0.1, push: 0.1 } });
  shot({ line: 'and HUSS!', set: picnic, sfx: [['sparkle', 'huss'], ['whoosh', 'huss']], cam: handheld(frame(-3, 2.6, { size: 'medium', side: 12 }), 0.9),
    act(lt, c) { on(PI_.gpaY).place(-3, 2.6, 0).setFace('gasp').idle(c.t); glassG.visible = true; hand(PI_.gpaY, glassG); vanish(PI_.gpaY, PI_, lt, c.w('huss')); flashAt(c, c.w('huss'), 0.5); } });
  shot({ line: 'He was gone.', set: picnic, cam: { pos: [-1, 3.4, 9], look: [-3, 2.4, 2.6], fov: 52, blur: 0.25, push: 0.07 },
    act(lt, c) { on(PI_.w1).place(1, 1.5, -0.6).setFace('gasp').idle(c.t); } });
  shot({ line: 'My dad was a baby back then,', set: picnic, cam: frame(-9, 4.5, { size: 'close', h: 0.45, side: 14 }),
    act(lt, c) { on(PI_.baby).place(-9, 4.5, 0.1).sit(0.2).pose({ aL: [100, 30], aR: [100, 30] }).setFace(lt < c.w('baby') ? 'calm' : 'cute').idle(c.t); } });
  shot({ line: 'so the only thing I know about Grandpa', set: kitchen, cam: frame(5, 1.5, { size: 'close', side: -18 }),
    act(lt, c) { on(K.me).place(5, 1.5, -0.2).setFace('say').talk(c.t); } });
  shot({ line: 'is one old photo on our fridge.', set: kitchen, cam: { pos: [9.6, 6.1, 1.8], look: [9.4, 6.1, -2.4], fov: 40, blur: 0.2, push: 0.1 } });

  // life with the rule
  shot({ line: 'Because of the rule,', set: streetD, cam: drone([0, 3, 2], { h: 32, back: 48, drift: [-8, -2, -8], fov: 52 }),
    act(lt, c) { on(D.w1).place(-6 + lt * 3, 4.5, Math.PI / 2).walk(c.t, 0.8).setFace('calm'); on(D.m1).place(10 - lt * 3, 3.6, -Math.PI / 2).walk(c.t, 0.8).setFace('calm'); } });
  shot({ line: 'life here is a little weird.', set: streetD, cam: frame(2, 4, { size: 'medium', side: 16 }),
    act(lt, c) { on(D.me).place(2, 4, 0.2).pose('shrug').setFace(lt < c.w('weird') ? 'calm' : 'uneasy').idle(c.t); } });
  shot({ line: 'Nobody drinks anything', set: kitchen, cam: frame(-5.6, -1.3, { size: 'close', side: 14 }),
    act(lt, c) { on(K.dad).place(-5.6, -1.3, 0).sit(1.5).pose({ aR: [74, 0], aL: [60, 6] }).setFace('serious').idle(c.t, 0.4); } });
  shot({ line: 'after breakfast.', set: kitchen, cam: { pos: [-1.5, 7.6, 12], look: [-1.5, 8.2, -5.85], fov: 40, blur: 0, push: 0.1 } });
  shot({ line: 'Our school', set: hall, cam: { pos: [-4, 6, 18], look: [2, 4.5, -4], fov: 56, blur: 0, push: 0.06 },
    act(lt, c) { on(H.k1).place(-8 + lt * 3, 2, Math.PI / 2).walk(c.t).setFace('calm'); on(H.k2).place(8 - lt * 2.6, 3.4, -Math.PI / 2).walk(c.t).setFace('calm'); } });
  shot({ line: 'has no water fountains.', set: hall, cam: { pos: [23.5, 4.6, 6.5], look: [25, 4.4, -5.2], fov: 50, blur: 0.15, push: 0.09 },
    act(lt, c) { on(H.k2).place(21.5, -1.5, 0.4).setFace('sad').idle(c.t); } });
  shot({ line: 'And every bathroom in town', set: hall, cam: { pos: [-21, 5, 9], look: [-24, 4.6, -5.9], fov: 52, blur: 0.1, push: 0.07 },
    act(lt, c) { on(H.w1).place(-20.5, -2, 0.5).pose({ aR: [70, 0] }).setFace('worried').idle(c.t); } });
  shot({ line: 'is locked.', set: hall, sfx: [['thud', 'locked']], cam: { pos: [-24, 3.9, -1.6], look: [-24, 3.7, -5.4], fov: 44, blur: 0, push: 0.12 } });
  shot({ line: "I've held it my whole life,", set: streetD, cam: frame(2, 4, { size: 'close', side: -12 }),
    act(lt, c) { on(D.me).place(2, 4, -0.1).setFace('smug').idle(c.t); } });
  shot({ line: "and I've never had a single problem.", set: streetD, cam: frame(2, 4, { size: 'full', side: 18, low: 0.45 }),
    act(lt, c) { on(D.me).place(2, 4, 0.25).pose('hips').setFace('joy').idle(c.t); } });
  shot({ line: 'Until last Friday.', set: livingN, sfx: [['thud', 'friday', 0.8]], cam: { pos: [8, 7.4, -1.2], look: [8, 7.5, -5.84], fov: 44, blur: 0, push: 0.12 } });

  // ═════════ ACT 2: the sleepover
  shot({ line: 'My best friend Max', set: livingN, cam: frame(-1.5, -1.3, { size: 'close', side: 12 }),
    act(lt, c) { on(L.max).place(-1.5, -1.3, 0.1).sit(1.3).pose({ aR: [165, 28] }).setFace('joy').idle(c.t); on(L.me).place(1.5, -1.3, -0.1).sit(1.3).setFace('calm').idle(c.t); } });
  shot({ line: 'was sleeping over,', set: livingN, cam: { pos: [-8, 7, 11], look: [0, 2.5, -1.2], fov: 54, blur: 0.1, push: 0.07 },
    act(lt, c) { on(L.max).place(-1.5, -1.3, 0.1).sit(1.3).setFace('joy').talk(c.t); on(L.me).place(1.5, -1.3, -0.1).sit(1.3).setFace('joy').idle(c.t); } });
  shot({ line: 'and we were watching a scary movie', set: livingN, cam: { pos: [0.5, 4.2, 2], look: [0, 3.3, 10], fov: 46, blur: 0.15, push: 0.1 } });
  shot({ line: 'in the dark.', set: livingN, cam: frame(0, -1.3, { size: 'medium', side: -10, dist: 1.25 }),
    act(lt, c) { on(L.max).place(-1.5, -1.3, 0.1).sit(1.3).setFace('worried').idle(c.t, 0.4); on(L.me).place(1.5, -1.3, -0.1).sit(1.3).setFace('worried').idle(c.t, 0.4); } });
  shot({ line: 'At the scariest part,', set: livingN, cam: frame(1.5, -1.3, { size: 'close', side: -12, push: 0.1 }),
    act(lt, c) { on(L.me).place(1.5, -1.3, 0).sit(1.3).pose('shy').setFace('worried').idle(c.t, 0.4); } });
  shot({ line: 'Max jumped out from behind the couch', set: livingN, sfx: [['boing', 'jumped', 0.7]], cam: handheld(frame(0, -1.5, { size: 'medium', side: 14, dist: 1.3 }), 0.9),
    act(lt, c) { const k = E.out(remap(lt, c.w('jumped'), c.w('jumped') + 0.25)); on(L.max).place(-1.5, -4.3, 0, lerp(-3.6, 0, k)).pose('reach').setFace('angry').idle(c.t); on(L.me).place(1.5, -1.3, 0).sit(1.3).pose('shy').setFace(k > 0.5 ? 'gasp' : 'worried'); } });
  shot({ line: 'and screamed, BOO!', set: livingN, sfx: [['pop', 'boo']], cam: handheld(frame(-1.5, -4.3, { size: 'close', side: -8, low: 0.3 }), 1.1),
    act(lt, c) { on(L.max).place(-1.5, -4.3, 0).pose('reach').setFace(lt < c.w('boo') ? 'say' : 'angry').talk(c.t, 2); } });
  shot({ line: 'I screamed too.', set: livingN, sfx: [['boing', 'screamed', 0.6]], cam: frame(1.5, 1.6, { size: 'medium', side: 10 }),
    act(lt, c) { const k = remap(lt, 0, 0.3); on(L.me).place(1.5, 1.6, 0).pose({ aL: [150, 50], aR: [150, 50] }).setFace('scream').jump(k, 1.2); } });
  shot({ line: 'And then I felt', set: livingN, cam: frame(1.5, 1.6, { size: 'close', side: -14 }),
    act(lt, c) { on(L.me).place(1.5, 1.6, -0.1).setFace('calm').idle(c.t); } });
  shot({ line: 'something warm in my underpants.', set: livingN, cam: frame(1.5, 1.6, { size: 'close', side: 12, push: 0.1 }),
    act(lt, c) { on(L.me).place(1.5, 1.6, 0.1).pose('shy').setFace(lt < c.w('warm') ? 'uneasy' : 'gasp').idle(c.t, 0.4); } });
  shot({ line: 'It was pee. //', set: livingN, cam: { pos: [2.5, 2.6, 8.5], look: [1.5, 1.2, 1.8], fov: 48, blur: 0.1, push: 0.07 },
    act(lt, c) { on(L.me).place(1.5, 1.6, 0.1).pose('shy').setFace('gasp'); puddle.visible = true; puddle.position.set(1.5, 0.08, 1.9); puddle.scale.setScalar(lerp(0.3, 1.5, E.out(remap(lt, 0, 1.2)))); } });
  shot({ line: 'I looked at Max.', set: livingN, cam: frame(1.5, 1.6, { size: 'close', side: -16 }),
    act(lt, c) { on(L.me).place(1.5, 1.6, -0.2).setFace('gasp').lookAt(-1.5, -4.3); L.me.head.rotation.y *= remap(lt, 0, 0.3); puddle.visible = true; puddle.position.set(1.5, 0.08, 1.9); puddle.scale.setScalar(1.5); } });
  shot({ line: 'Max looked at me.', set: livingN, cam: frame(-1.5, -4.3, { size: 'close', side: 16 }),
    act(lt, c) { on(L.max).place(-1.5, -4.3, 0.2).setFace('gasp').lookAt(1.5, 1.6); L.max.head.rotation.y *= remap(lt, 0, 0.3); } });
  shot({ line: 'And then, HUSS!', set: livingN, sfx: [['sparkle', 'huss'], ['whoosh', 'huss']], cam: handheld(frame(0, -1, { size: 'medium', side: -14, dist: 1.4 }), 1),
    act(lt, c) { on(L.max).place(-1.5, -4.3, 0.3).setFace('gasp').idle(c.t); on(L.me).place(1.5, 1.6, -0.2).setFace('gasp').idle(c.t); vanish(L.me, L, lt, c.w('huss')); flashAt(c, c.w('huss'), 0.6); puddle.visible = true; puddle.position.set(1.5, 0.08, 1.9); puddle.scale.setScalar(1.5); } });
  shot({ line: 'Everything went white.', set: livingN, flash: lt => Math.min(1, 0.35 + lt * 2.5), cam: { pos: [1.5, 5, 9], look: [1.5, 3.5, 1.6], fov: 54, blur: 0, push: 0.1 } });

  // ═════════ ACT 3: the world of poop
  shot({ line: 'When I opened my eyes,', set: poop, sfx: [['whoosh', 0, 0.6]], flash: lt => Math.max(0, 1 - lt * 3), cam: frame(-24, -4, { y: 3, size: 'close', side: 10 }),
    act(lt, c) { on(P.me).place(-24, -4, -0.1, 3).setFace(lt < c.w('eyes') ? 'sleepy' : 'gasp').idle(c.t, 0.5); } });
  shot({ line: 'I was standing on a hill.', set: poop, cam: frame(-24, -4, { y: 3, size: 'wide', side: -24, low: 0.25 }),
    act(lt, c) { on(P.me).place(-24, -4, -0.3, 3).setFace('uneasy').idle(c.t); } });
  shot({ line: 'A brown hill.', set: poop, cam: { pos: [-9, 1.4, 12], look: [-24, 5, -4], fov: 50, blur: 0, push: 0.05 },
    act(lt, c) { on(P.me).place(-24, -4, 0.6, 3).setFace('uneasy').idle(c.t); } });
  shot({ line: 'Brown sky,', set: poop, cam: { pos: [-24, 7, 6], look: [10, 60, -160], fov: 62, blur: 0, push: 0.04 } });
  shot({ line: 'brown river,', set: poop, cam: { pos: [6, 9, -21], look: [16, 0, -42], fov: 56, blur: 0, push: 0.06 } });
  shot({ line: 'brown trees,', set: poop, cam: { pos: [-28, 5, -2], look: [-44, 6, -20], fov: 56, blur: 0, push: 0.06 } });
  shot({ line: 'and a smell so bad', set: poop, cam: { pos: [-6.5, 3.8, -0.5], look: [-8, 2.6, -8], fov: 52, blur: 0.15, push: 0.08 } });
  shot({ line: 'my eyes started watering.', set: poop, sfx: [['sad', 'watering', 0.5]], cam: frame(-24, -4, { y: 3, size: 'close', side: -12, push: 0.1 }),
    act(lt, c) { on(P.me).place(-24, -4, 0.1, 3).setFace(lt < c.w('watering') ? 'uneasy' : 'cry').idle(c.t, 0.5); } });
  shot({ line: 'I was in a world', set: poop, cam: frame(-24, -4, { y: 3, size: 'medium', side: 20 }),
    act(lt, c) { on(P.me).place(-24, -4, Math.sin(lt * 3) * 0.6, 3).pose('shrug').setFace('gasp').idle(c.t); } });
  shot({ line: 'made completely of poop. //', set: poop, cam: drone([0, 0, -14], { h: 44, back: 58, drift: [-8, -2, -6], fov: 54 }),
    act(lt, c) { on(P.me).place(-24, -4, 0, 3).setFace('gasp'); on(P.gpa).place(GT[0], GT[1], 0).sit(4.25).setFace('calm'); } });
  shot({ line: 'And in the middle of it all,', set: poop, cam: { pos: [-14, 8, 16], look: [14, 4, -16], fov: 44, blur: 0, push: 0.06 },
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0).sit(4.25).setFace('calm').idle(c.t); } });
  shot({ line: 'on a giant golden toilet,', set: poop, sfx: [['sparkle', 'golden', 0.7]], cam: { pos: [21, 1.6, -4], look: [14, 5.5, -16], fov: 54, blur: 0, push: 0.1 },
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0).sit(4.25).setFace('calm').idle(c.t); P.sp.at(lt - c.w('golden'), [14, 3, -14], 1.6); } });
  shot({ line: 'sat an old man with a crown.', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'medium', side: 14 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], -0.15).sit(4.25).setFace('calm').idle(c.t); } });
  shot({ line: 'He looked exactly like', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: -10 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0.1).sit(4.25).setFace('smile').idle(c.t); } });
  shot({ line: 'the photo on our fridge.', set: kitchen, cam: { pos: [8.4, 6.4, 2.4], look: [9.4, 6.1, -2.4], fov: 38, blur: 0.2, push: 0.1 } });
  shot({ line: 'It was Grandpa.', set: poop, sfx: [['pop', 'grandpa']], cam: frame(14, -6, { size: 'close', side: 10, push: 0.1 }),
    act(lt, c) { on(P.me).place(14, -6, 0).setFace(lt < c.w('grandpa') ? 'gasp' : 'wow').idle(c.t); } });
  shot({ line: "He wasn't scared.", set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: 16 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], -0.1).sit(4.25).setFace('calm').idle(c.t); } });
  shot({ line: 'He was smiling.', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'face', side: -8 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0.05).sit(4.25).setFace('grin').idle(c.t); } });
  shot({ line: `He said, "I've been waiting`, set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'medium', side: -18 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0.15).sit(4.25).pose({ aL: [38, 52], aR: [38, 52] }).setFace('say').talk(c.t); } });
  shot({ line: 'sixty-seven years for this.', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: 12 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], -0.1).sit(4.25).setFace('talk').talk(c.t); } });
  shot({ line: 'Here, the rule is simple.', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'medium', side: 20, low: 0.3 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], -0.2).sit(4.25).pose({ aR: [165, 10] }).setFace('say').talk(c.t); } });
  shot({ line: 'Whoever peed last', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: -14 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0.1).sit(4.25).pose('point').setFace('smirk').talk(c.t); } });
  shot({ line: 'is the king of this world,', set: poop, cam: drone([16, 0, -36], { h: 34, back: 58, drift: [8, -2, -8], fov: 54 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0).sit(4.25).pose('cheer').setFace('joy'); } });
  shot({ line: 'and the king before him', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: 18 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], -0.15).sit(4.25).pose('hug').setFace('say').talk(c.t); } });
  shot({ line: 'finally gets to go home."', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: -16, push: 0.1 }),
    act(lt, c) { on(P.gpa).place(GT[0], GT[1], 0.15).sit(4.25).setFace(lt < c.w('home') ? 'talk' : 'joy').talk(c.t); } });
  shot({ line: 'Then he put his crown on my head,', set: poop, cam: frame(14, -8.5, { size: 'medium', side: 6, dist: 1.55 }),
    act(lt, c) { const tH = c.w('head'), k = remap(lt, c.w('crown') - 0.2, tH); on(P.gpa).place(12.4, -8.5, 0.55).pose({ aL: [lerp(10, 150, k), lerp(5, -30, k)], aR: [lerp(10, 150, k), lerp(5, -10, k)] }).setFace('joy').idle(c.t); on(P.me).place(15.6, -8.5, -0.35).setFace(lt < tH ? 'gasp' : 'wow').idle(c.t); crownG.visible = lt < tH; crownMe.visible = lt >= tH; } });
  shot({ line: 'and HUSS!', set: poop, sfx: [['sparkle', 'huss'], ['whoosh', 'huss']], cam: handheld(frame(14, -8.5, { size: 'medium', side: -16, dist: 1.55 }), 1),
    act(lt, c) { crownG.visible = false; crownMe.visible = true; on(P.gpa).place(12.4, -8.5, 0.55).pose('wave').setFace('winkjoy').idle(c.t); vanish(P.gpa, P, lt, c.w('huss')); on(P.me).place(15.6, -8.5, -0.35).setFace('gasp').idle(c.t); flashAt(c, c.w('huss'), 0.5); } });
  shot({ line: 'He was gone. ///', set: poop, cam: frame(15.6, -8.5, { size: 'close', side: 8, push: 0.09 }),
    act(lt, c) { crownMe.visible = true; on(P.me).place(15.6, -8.5, -0.1).setFace('gasp').idle(c.t, lt < 1.2 ? 1 : 0.3); } });

  // ═════════ ACT 4: the new king
  shot({ line: "So now I'm the king", set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'full', side: 28, low: 0.15 }),
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0).sit(4.25).setFace('uneasy').idle(c.t); } });
  shot({ line: 'of a world of poop.', set: poop, cam: { pos: [15, 10, 2], look: [14, 5, -16], fov: 50, blur: 0, push: 0, to: { pos: [17, 24, 30], look: [14, 3, -18] }, ease: 'lin' },
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0).sit(4.25).setFace('uneasy').idle(c.t); } });
  shot({ line: 'I have a golden toilet,', set: poop, sfx: [['sparkle', 'golden', 0.6]], cam: { pos: [23, 6, -9], look: [14, 5.2, -16], fov: 48, blur: 0.1, push: 0.08 },
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0.3).sit(4.25).pose('open').setFace('smile').idle(c.t); P.sp.at(lt - c.w('golden'), [14, 3, -14], 1.6); } });
  shot({ line: 'a brown castle', set: poop, cam: { pos: [30, 7, -44], look: [42, 12, -80], fov: 50, blur: 0, push: 0.06 } });
  shot({ line: 'and absolutely nobody to talk to.', set: poop, sfx: [['sad', 'nobody', 0.7]], cam: { pos: [-6, 5, 12], look: [14, 5, -16], fov: 38, blur: 0, push: 0.05 },
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0).sit(4.25).pose('slump').setFace('sad').idle(c.t, 0.4); } });
  shot({ line: 'Back home,', set: streetN, cam: drone([0, 4, -2], { h: 28, back: 42, drift: [-6, -2, -6], fov: 52 }) });
  shot({ line: 'Grandpa is finally eating dinner', set: kitchen, light: 'roomNight', cam: frame(-2.4, -1.3, { size: 'close', side: -12 }),
    act(lt, c) { dadGlass.visible = false; plates.visible = true; on(K.gpa).place(-2.4, -1.3, 0).sit(1.5).pose({ aR: [70, 0], aL: [30, 6] }).setFace('joy').talk(c.t); } });
  shot({ line: 'with my dad.', set: kitchen, light: 'roomNight', cam: frame(-4, -1.3, { size: 'medium', side: 10, dist: 1.15 }),
    act(lt, c) { dadGlass.visible = false; plates.visible = true; on(K.gpa).place(-2.4, -1.3, -0.35).sit(1.5).setFace('joy').talk(c.t); on(K.dad).place(-5.6, -1.3, 0.35).sit(1.5).pose({ aL: [60, -10] }).setFace('winkjoy').idle(c.t); } });
  shot({ line: "And the only way I'm getting out of here", set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: -14 }),
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0.1).sit(4.25).setFace('sad').idle(c.t, 0.5); } });
  shot({ line: 'is if somebody else in that town pees.', set: streetN, cam: { pos: [-20, 7, 24], look: [-2, 4, 2], fov: 52, blur: 0, push: 0.06 },
    act(lt, c) { on(N.w1).place(-12 + lt * 2.6, 4.5, Math.PI / 2).walk(c.t, 0.8).setFace('calm'); on(N.m1).place(6 - lt * 2.6, 3.6, -Math.PI / 2).walk(c.t, 0.8).setFace('calm'); on(N.k1).place(-4, 5.2, 0.2).setFace('calm').idle(c.t); } });
  shot({ line: 'So Max,', set: livingN, cam: frame(0, -1.3, { size: 'close', side: 10 }),
    act(lt, c) { on(L.max).place(0, -1.3, 0).sit(1.3).setFace('calm').idle(c.t); } });
  shot({ line: "if you're watching this,", set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'close', side: 8 }),
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0).sit(4.25).pose('point').setFace('say').talk(c.t); } });
  shot({ line: 'drink some water.', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'medium', side: -14 }),
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0.1).sit(4.25).pose('open').setFace('talk').talk(c.t); } });
  shot({ line: 'A lot of water. ///', set: poop, cam: frame(GT[0], GT[1], { y: GY, size: 'face', side: 6, push: 0.12 }),
    act(lt, c) { crownMe.visible = true; on(P.me).place(GT[0], GT[1], 0).sit(4.25).setFace(lt < c.w('water') ? 'say' : 'worried').talk(c.t, lt < c.w('water') + 0.4 ? 1 : 0); } });
});
