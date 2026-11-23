// story.js: "U ovom gradu postoji samo jedno pravilo: svi moraju da iznajme Canon G7X kamericu." (30 s, srpski, sve žene)
import * as THREE from 'three';
import { start, shot, frame } from './core.js';
import { makeAvatar } from './avatar.js';
import { SETS, TEX, floor, table, counter, room, tree, rug } from './sets.js';
import { TOWN, beanie, handheld, drone, skyDome, hills } from './town.js';
import { makeSparkles, makePuff } from './fx.js';
import { canvasTex, mat, tmat, glow, box, at, grp, sign, shade, remap, lerp, E } from './util.js';

function camera() { // compact camera prop (no real logo)
  const g = grp(at(box(1.1, 0.66, 0.42, '#16161a', 0.08), 0, 0, 0));
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.3, 20), mat('#3a3a42')); lens.rotation.x = Math.PI / 2; lens.position.set(0.12, 0, 0.32);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20), glow('#5a7ac9', 1.2)); glass.position.set(0.12, 0, 0.48);
  g.add(lens, glass, at(box(0.18, 0.1, 0.06, '#d8d8de'), -0.36, 0.2, 0.22), at(box(0.2, 0.08, 0.2, '#9a9aa2'), 0.3, 0.37, 0), at(box(0.9, 0.5, 0.04, glow('#9fd8ff', 0.8)), 0, 0, -0.23));
  return g;
}
function cat(c = '#e8862a') {
  const g = grp(at(box(0.9, 0.9, 1.7, c, 0.3), 0, 0.75, 0), at(box(0.85, 0.8, 0.8, c, 0.25), 0, 1.45, 0.85));
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), mat(c)); e.position.set(s * 0.26, 1.98, 0.85); g.add(e, at(box(0.12, 0.16, 0.04, '#111'), s * 0.2, 1.52, 1.26)); }
  g.add(at(box(0.16, 0.1, 0.04, '#ff8aa8'), 0, 1.36, 1.26));
  const tail = grp(at(box(0.16, 1.3, 0.16, c, 0.08), 0, 0.65, 0)); tail.position.set(0, 1, -0.8); tail.rotation.x = -0.5; g.add(tail); g.tail = tail; return g;
}
function magazine() {
  const t = canvasTex(360, 480, (g, w, h) => {
    g.fillStyle = '#fff6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8413c'; g.font = '900 78px Montserrat'; g.textAlign = 'center'; g.fillText('UKUS', w / 2, 86);
    g.fillStyle = '#7ab8ff'; g.fillRect(24, 110, w - 48, 300); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(w / 2, 270, 120, 80, 0, 0, 7); g.fill();
    g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(w / 2 - 30, 260, 36, 0, 7); g.fill(); g.fillStyle = '#c9742f'; g.fillRect(w / 2 + 20, 230, 80, 60);
    g.fillStyle = '#1a1a1a'; g.font = '800 30px Montserrat'; g.fillText('DORUČAK GODINE', w / 2, 450);
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.8), new THREE.MeshBasicMaterial({ map: t }));
}

start(() => {
  // ───────────── sets
  const street = TOWN.street({ time: 'sunset' });
  street.group.add(at(grp(at(sign(['PRAVILO:', 'IZNAJMI KAMERICU!'], 10, 5, { bg: '#fff4f8', fg: '#d0457a', border: '#d0457a' }), 0, 6.5, 0.2), at(box(0.4, 9, 0.4, '#2a2b30'), -3.5, 4.5, 0), at(box(0.4, 9, 0.4, '#2a2b30'), 3.5, 4.5, 0)), -5, 0, -0.5));
  const hero = camera(); hero.scale.setScalar(3); street.group.add(at(hero, 8, 4.5, 6)); const ped = box(2.6, 3, 2.6, '#ffffff', 0.1); street.group.add(at(ped, 8, 1.5, 6));

  const shop = { group: room({ floorTex: TEX.checker('#ffffff', '#ffd6e6'), wallColor: '#ffe3ee', trim: '#ff8fbd', w: 34, d: 24, lights: 3 }), light: 'indoor' };
  shop.group.add(at(counter(10, '#ffffff', '#d0457a'), 0, 0, -1.5), at(sign('IZNAJMI KAMERICU', 12, 1.8, { bg: '#d0457a', fg: '#ffffff' }), 0, 10.4, -5.85));
  for (let r = 0; r < 3; r++) { shop.group.add(at(box(16, 0.25, 1.2, '#ffffff'), 0, 4.6 + r * 1.8, -5.4)); for (let i = 0; i < 9; i++) shop.group.add(at(camera(), -7 + i * 1.75, 5.08 + r * 1.8, -5.2)); }
  const price = sign('20€', 5, 3, { bg: '#ffe46a', fg: '#d0457a', border: '#d0457a', glowing: true }); shop.group.add(at(price, 10.5, 6, -5.8));
  const cafe = { group: room({ floorTex: TEX.wood('#d8a25c'), tile: 6, wallColor: '#fff0d0', trim: '#e8a03a', trimY: 4, w: 30, d: 22, lights: 1 }), light: 'warm' };
  cafe.group.add(at(table(6, 3.6, '#ffffff', 2.7), 0, 0, 1));
  const plate = grp(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.1, 24), mat('#ffffff'))); plate.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 20), mat('#ffd23f')), -0.3, 0.08, 0), at(box(0.8, 0.25, 0.7, '#c9742f', 0.1), 0.45, 0.15, 0.1), at(box(0.3, 0.2, 0.3, '#ff5a5a', 0.06), 0.1, 0.12, 0.6));
  cafe.group.add(at(plate, 0, 2.88, 1.6), at(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 16), mat('#ff9a2a')), 1.8, 3.23, 1.2), at(sign('KAFIĆ', 5, 1.6, { bg: '#e8a03a', fg: '#ffffff' }), 0, 8.6, -5.85));
  const mag = magazine(); cafe.group.add(at(mag, 8, 5, -5.8));
  const liv = SETS.livingRoom({ sofa: '#7b3fc4' }); const kitty = cat(); liv.group.add(at(kitty, -6.2, 1.75, -3.5, 0.3));
  const subs = sign(['100.000', 'PRATILACA'], 6, 3.4, { bg: '#ff5fa8', fg: '#ffffff', glowing: true }); liv.group.add(at(subs, 12, 7, -5.84));
  const beach = { group: grp(skyDome('day'), at(floor(300, 200, TEX.concrete('#f2dca0'), 4), 0, -0.02, 0)), light: 'outdoor' };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 120), mat('#3aa0ff', { emissive: new THREE.Color('#0a3a7a') })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.03, -70); beach.group.add(sea);
  const umb = grp(at(box(0.2, 7, 0.2, '#ddd'), 0, 3.5, 0)); const top = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.2, 12), mat('#ff5fa8')); top.position.y = 7.3; umb.add(top); beach.group.add(at(umb, -6, 0, -3), at(tree(11, '#3f9b3f'), 9, 0, -6), at(box(4, 0.3, 2, '#7ab8ff'), -6, 0.15, -1));

  // ───────────── cast: all women
  const O = {
    me: { seed: 51, skin: 'light', hair: 'long', hairColor: '#5a3216', top: 'hoodie', topColor: '#d0457a', sleeves: 'long', logo: 'FOTO', logoColor: '#ffe46a', bottom: 'jeans', bottomColor: '#3a4f7a', shoe: '#ffffff' },
    mil: { seed: 52, skin: 'tan', hair: 'ponytail', hairColor: '#1a1210', top: 'tee', topColor: '#f2d33c', bottom: 'skirt', bottomColor: '#3a6fd0' },
    baka: { seed: 53, skin: 'fair', hair: 'bob', hairColor: '#e8e8ec', top: 'cardigan', topColor: '#9a6ad6', inner: '#f4efe6', sleeves: 'long', bottom: 'skirt', bottomColor: '#6a4a8a', glasses: true },
    uci: { seed: 54, skin: 'brown', hair: 'buns', hairColor: '#2a1a12', top: 'dress', topColor: '#2fb8a0', bottom: 'plain', bottomColor: '#2fb8a0', glasses: '#c9a03a' },
    w1: { seed: 55, skin: 'light', hair: 'long', hairColor: '#f0d890', top: 'stripes', topColor: '#ffffff', stripe: '#3a6fd0', bottom: 'jeans', bottomColor: '#4f79a7' },
    w2: { seed: 56, skin: 'deep', hair: 'curly', hairColor: '#1b1210', top: 'zip', topColor: '#7dffa8', bottom: 'skirt', bottomColor: '#2a2a33' },
  };
  const all = [];
  const castIn = (set, names) => { const C = {}; for (const n of names) { const a = makeAvatar(O[n]); if (n === 'me') { const b = beanie('#ff8fbd', '#ffe46a'); a.head.add(b); } a.cam = camera(); a.handR.add(a.cam); a.cam.position.set(0, -0.3, 0.55); set.group.add(a.root); C[n] = a; all.push(a); } C.sp = makeSparkles(set.group, 5); return C; };
  const ST = castIn(street, ['me', 'mil', 'w1', 'w2']), SH = castIn(shop, ['me']), CF = castIn(cafe, ['mil']), LV = castIn(liv, ['baka']), BE = castIn(beach, ['uci']);
  const on = (a, holdCam = false) => { a.reset().size(a.baseHeight); a.cam.visible = holdCam; return a; };
  const level = a => { a.cam.rotation.x = -a.armR.rotation.x; };   // keep the camera upright whatever the arm does
  const SNAP = { aR: [95, -18] };                                    // camera held up in front of the face

  // ───────────── shots
  shot({ line: 'U ovom gradu postoji samo jedno pravilo:', set: street, sfx: [['whoosh', 0]], cam: drone([-2, 4, 2], { h: 26, back: 40, drift: [8, -2, -8], fov: 52 }),
    act(lt, c) { [ST.mil, ST.w1, ST.w2].forEach((a, i) => { on(a, true).place(-14 + i * 6 + lt * 2.5, 4 + (i % 2), Math.PI / 2).walk(c.t, 0.8).setFace('calm'); }); } });
  shot({ line: 'svi moraju da iznajme', set: street, cam: { pos: [2, 4.5, 16], look: [0, 3.5, 4], fov: 54, blur: 0.1, push: 0.07 },
    act(lt, c) { [ST.mil, ST.w1, ST.w2].forEach((a, i) => { on(a, true).place(-4 + i * 4, 4 + (i % 2) * 0.8, [0.3, 0, -0.3][i]).pose(SNAP).setFace('joy').idle(c.t); level(a); }); } });
  shot({ line: 'Canon G7X kamericu.', set: street, sfx: [['sparkle', 'kamericu', 0.7]], cam: { pos: [8, 5.2, 17], look: [8, 4.4, 6], fov: 40, blur: 0.2, push: 0.1 },
    act(lt, c) { hero.rotation.y = -0.45 + lt * 0.45; ST.sp.at(lt - c.w('kamericu'), [8, 2, 6], 1); } });
  shot({ line: 'Zašto?', set: street, cam: frame(2, 4, { size: 'close', side: -12 }),
    act(lt, c) { on(ST.me).place(2, 4, 0).pose('hips').setFace('sus').idle(c.t); } });
  shot({ line: 'Zato što je to', set: street, cam: frame(2, 4, { size: 'medium', side: 14 }),
    act(lt, c) { on(ST.me).place(2, 4, 0.2).pose('open').setFace('say').talk(c.t); } });
  shot({ line: 'najbolja kamerica na svetu.', set: street, sfx: [['sparkle', 'najbolja', 0.7]], cam: frame(2, 4, { size: 'full', side: -18, low: 0.45 }),
    act(lt, c) { on(ST.me, true).place(2, 4, -0.2).pose({ aR: [165, 10] }).setFace('joy').idle(c.t); level(ST.me); ST.sp.at(lt - c.w('najbolja'), [2, 0, 4], 1); } });
  shot({ line: 'Moja drugarica Milica', set: cafe, cam: frame(0, -1, { size: 'close', side: 12 }),
    act(lt, c) { on(CF.mil).place(0, -1.2, -0.1).pose('wave').setFace('joy').idle(c.t); } });
  shot({ line: 'je slikala svoj doručak,', set: cafe, sfx: [['pop', 'doručak', 0.6]], cam: { pos: [3, 6.4, 8], look: [0, 3.6, 0.6], fov: 50, blur: 0.15, push: 0.08 },
    act(lt, c) { on(CF.mil, true).place(0, -1.2, 0).pose({ aR: [70, -12], head: [26, 0, 0] }).setFace('smile').idle(c.t, 0.4); level(CF.mil); CF.mil.cam.rotation.x -= 0.8; c.shot.flash = () => (lt > c.w('doručak') && lt < c.w('doručak') + 0.1 ? 0.5 : 0); } });
  shot({ line: 'i izgledao je kao u časopisu.', set: cafe, cam: { pos: [8, 5, 0], look: [8, 5, -5.8], fov: 50, blur: 0, push: 0.1 } });
  shot({ line: 'Moja baka', set: liv, cam: frame(1, 1, { size: 'close', side: -10 }),
    act(lt, c) { on(LV.baka).place(1, 1, 0).setFace('joy').idle(c.t); } });
  shot({ line: 'je slikala svoju mačku,', set: liv, sfx: [['pop', 'mačku', 0.6]], cam: frame(-2.5, 1, { size: 'full', side: 22 }),
    act(lt, c) { on(LV.baka, true).place(-1, 1.2, -0.9).pose(SNAP).setFace('smile').idle(c.t); level(LV.baka); kitty.tail.rotation.z = Math.sin(c.t * 3) * 0.4; c.shot.flash = () => (lt > c.w('mačku') && lt < c.w('mačku') + 0.1 ? 0.5 : 0); } });
  shot({ line: 'i sad ta mačka ima', set: liv, cam: { pos: [-5.4, 3.4, 0.6], look: [-6.2, 2.9, -3.5], fov: 46, blur: 0.2, push: 0.1 },
    act(lt, c) { kitty.tail.rotation.z = Math.sin(c.t * 3) * 0.4; } });
  shot({ line: 'sto hiljada pratilaca.', set: liv, sfx: [['ding', 'pratilaca', 0.7]], cam: { pos: [12, 7, 2], look: [12, 7, -5.84], fov: 46, blur: 0, push: 0.12 } });
  shot({ line: 'Čak i naša učiteljica', set: beach, cam: frame(0, 2, { size: 'close', side: 12 }),
    act(lt, c) { on(BE.uci).place(0, 2, -0.1).setFace('calm').idle(c.t); } });
  shot({ line: 'snima vlogove na odmoru.', set: beach, cam: handheld(frame(0, 2, { size: 'full', side: -16 }), 0.7),
    act(lt, c) { on(BE.uci, true).place(0, 2, 0.2).pose({ aR: [120, 30], aL: [30, 40] }).setFace('talk').talk(c.t); level(BE.uci); BE.uci.cam.rotation.y = Math.PI; } });
  shot({ line: 'A cena?', set: shop, cam: frame(0, 1.5, { size: 'close', side: -10 }),
    act(lt, c) { on(SH.me).place(0, 1.5, 0).setFace('smirk').idle(c.t); } });
  shot({ line: 'Samo dvadeset evra.', set: shop, sfx: [['sparkle', 'dvadeset', 0.8]], cam: { pos: [10.5, 6, 2], look: [10.5, 6, -5.8], fov: 44, blur: 0, push: 0.12 },
    act(lt, c) { SH.sp.at(lt - c.w('dvadeset'), [10.5, 3.5, -4.5], 1.2); } });
  shot({ line: 'Jedino ja nisam iznajmila kamericu.', set: street, cam: frame(2, 4, { size: 'medium', side: 12, dist: 1.3 }),
    act(lt, c) { on(ST.me).place(2, 4, 0).pose('shrug').setFace('uneasy').idle(c.t); on(ST.w1, true).place(-1.5, 2.5, 0.4).pose(SNAP).setFace('joy').idle(c.t); level(ST.w1); on(ST.w2, true).place(5.5, 2.5, -0.4).pose(SNAP).setFace('joy').idle(c.t); level(ST.w2); } });
  shot({ line: 'Zato što sam ja ta koja ih izdaje.', set: shop, sfx: [['pop', 'izdaje', 0.7]], cam: { pos: [0, 6, 14], look: [0, 4.6, -2], fov: 54, blur: 0, push: 0.07 },
    act(lt, c) { on(SH.me, true).place(0, -3.6, 0).pose({ aR: [70, -10], aL: [60, 30] }).setFace(lt < c.w('izdaje') ? 'smirk' : 'winkjoy').idle(c.t); level(SH.me); } });
  shot({ line: 'Piši mi u DM!', set: shop, cam: frame(0, 1.5, { size: 'face', side: 8, push: 0.12 }),
    act(lt, c) { on(SH.me).place(0, 1.5, 0).pose('point').setFace(lt < 0.4 ? 'say' : 'winkjoy').talk(c.t, lt < 0.6 ? 1 : 0); } });
});
