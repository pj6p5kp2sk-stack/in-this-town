# Dramatic silences. The reference is a fast unbroken read EXCEPT 2-4 deliberate holds per minute
# (after "the crowd went silent", after a shocked reveal, before the punchline). voice.py removes every pause,
# so holds are marked in story lines and re-inserted afterwards:
#   in a shot line write  //  (0.6 s hold) or  ///  (1.0 s hold) after a word, e.g. 'The crowd went silent. //'
#   python3 tools/holds.py prep    script.txt -> script_tts.txt (markers removed: send THIS to nixly_voiceover) + holds.json
#   (nixly_voiceover, download, then:  python3 tools/voice.py audio/vo_raw.mp3 script_tts.txt 3.05)
#   python3 tools/holds.py apply   inserts the silences into audio/vo.wav and shifts timings.json
import sys, json, re, wave, numpy as np
mode = sys.argv[1]
if mode == 'prep':
    toks = open(sys.argv[2] if len(sys.argv) > 2 else 'script.txt').read().split(); words = 0; holds = []; out = []
    norm = lambda w: re.sub(r"[^a-z0-9'\-$%]", '', w.lower().replace('’', "'"))
    for t in toks:
        if re.fullmatch(r'/{2,}', t): holds.append([words - 1, 0.6 if len(t) == 2 else 1.0]); continue
        out.append(t); words += 1 if norm(t) else 0
    open('script_tts.txt', 'w').write(' '.join(out) + '\n'); json.dump(holds, open('holds.json', 'w')); print(json.dumps({'words': words, 'holds': holds}))
elif mode == 'apply':
    holds = json.load(open('holds.json')); T = json.load(open('timings.json'))
    f = wave.open('audio/vo.wav'); sr = f.getframerate(); a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).copy(); f.close()
    for idx, sec in sorted(holds, reverse=True):
        if idx < 0 or idx >= len(T) - 1: continue
        cut = T[idx][1] + 0.02; i = int(cut * sr); a = np.concatenate([a[:i], np.zeros(int(sec * sr), np.int16), a[i:]])
        for k in range(idx + 1, len(T)): T[k] = [round(T[k][0] + sec, 3), round(T[k][1] + sec, 3)]
    w = wave.open('audio/vo.wav', 'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(a.tobytes()); w.close()
    json.dump(T, open('timings.json', 'w')); print(json.dumps({'holds_inserted': len(holds), 'seconds': round(len(a) / sr, 2)}))
