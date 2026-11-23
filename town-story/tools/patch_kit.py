# python3 tools/patch_kit.py   -- run ONCE after writing the blocky-story-shorts kit files.
# Retunes the kit to the "In this town" reference (73.6 s, 30 fps study). Idempotent; fails loudly if the kit changed.
#  captions: Montserrat 800, 62 px on 1080 (was 98), thin 9 px outline, baseline 59.3% down (was 62.3%)
#            ALL-CAPS words keep their case and "!" (the catchphrase card: HUSS!, GRIND!, ZOOM!)
#            caption disappears 0.35 s after a word ends (silent holds show a clean frame)
#  pace:     3.05 words/s estimate (was 3.5); push-in default 0.07 (~9%/s picture growth, was 0.035)
#  audio:    no synth music bed unless audio/music.* exists or MUSIC=1 (the reference is voice + effects only)
import sys, re
def patch(path, pairs):
    s = open(path).read(); orig = s
    for old, new in pairs:
        if new in s: continue
        if old not in s: sys.exit(f'patch_kit: could not find in {path}:\n  {old[:90]}\nThe kit changed: apply the same change by hand (see SKILL.md section 7).')
        s = s.replace(old, new, 1)
    if s != orig: open(path, 'w').write(s); print('patched', path)
    else: print('already patched', path)
patch('src/core.js', [
  ("export const cap = w => w.toLowerCase().replace(/[^a-z0-9'’\\-$%]/g, '').replace('’', \"'\");",
   "export const cap = w => w.toLowerCase().replace(/[^a-z0-9'’\\-$%]/g, '').replace('’', \"'\");\nconst disp = (raw, c) => (/^[A-Z][A-Z'!?\\-]+[!?]*$/.test(raw.replace(/[.,;:]+$/, '')) ? raw.replace(/[.,;:]+$/, '') : c);"),
  ("if (c) WORDS.push({ raw, cap: c, shot: def.i });", "if (c) WORDS.push({ raw, cap: c, disp: disp(raw, c), shot: def.i });"),
  ("const WPS = 3.5, TAIL = 0.3;", "const WPS = 3.05, TAIL = 0.45;"),
  ("if (!w || Q.get('nocap')) return;", "if (!w || Q.get('nocap') || (w.e !== undefined && t > w.e + 0.35 && w !== WORDS[WORDS.length - 1])) return;"),
  ("og.font = '700 98px Montserrat';", "og.font = '800 62px Montserrat';"),
  ("const x = W / 2, y = H * 0.623 + 28;", "const x = W / 2, y = H * 0.593 + 18;"),
  ("og.shadowColor = 'rgba(0,0,0,0.55)'; og.shadowBlur = 14; og.shadowOffsetY = 5; og.strokeStyle = '#000'; og.lineWidth = 15; og.strokeText(w.cap, x, y);",
   "og.shadowColor = 'rgba(0,0,0,0.6)'; og.shadowBlur = 8; og.shadowOffsetY = 3; og.strokeStyle = '#1a1a1a'; og.lineWidth = 9; og.strokeText(w.disp || w.cap, x, y);"),
  ("og.shadowColor = 'transparent'; og.fillStyle = '#fff'; og.fillText(w.cap, x, y);", "og.shadowColor = 'transparent'; og.fillStyle = '#fff'; og.fillText(w.disp || w.cap, x, y);"),
  ("const push = c.push === undefined ? 0.035 : c.push;", "const push = c.push === undefined ? 0.07 : c.push;"),
])
import os
if os.path.exists('tools/audio.py'):
    patch('tools/audio.py', [("music = pad(np.tile(load(mfile), 1 + n // max(1, len(load(mfile))))) if mfile else bed(n / SR)",
                              "music = pad(np.tile(load(mfile), 1 + n // max(1, len(load(mfile))))) if mfile else (bed(n / SR) if os.environ.get('MUSIC') == '1' else np.zeros(n))"),
                             ("vr = rms(vo[np.abs(vo) > 0.01]); music *= 10 ** ((vr - 22 - rms(music)) / 20); music *= duck",
                              "vr = rms(vo[np.abs(vo) > 0.01]); music *= (10 ** ((vr - 22 - rms(music)) / 20)) if np.abs(music).max() > 0 else 0; music *= duck")])
