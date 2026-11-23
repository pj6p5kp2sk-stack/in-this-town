# split the one combined voiceover into parts: audio/vo{N}.wav + timings{N}.json (+ holds{N}.json applied)
import json, wave, numpy as np, re
T = json.load(open('timings.json')); f = wave.open('audio/vo.wav'); sr = f.getframerate(); a = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16); f.close()
norm = lambda w: re.sub(r"[^a-z0-9'\-$%]", '', w.lower().replace('’', "'"))
counts = [sum(1 for w in open(f'tts{p}.txt').read().split() if norm(w)) for p in (1, 2, 3)]; assert sum(counts) == len(T), (counts, len(T))
i0 = 0
for p, n in zip((1, 2, 3), counts):
    i1 = i0 + n; s = max(0.0, T[i0][0] - 0.04); e = T[i1 - 1][1] + 0.4
    if i1 < len(T): e = min(e, T[i1][0] - 0.02)
    seg = a[int(s * sr):int(e * sr)].copy(); tt = [[round(x - s, 3), round(y - s, 3)] for x, y in T[i0:i1]]
    for idx, sec in sorted(json.load(open(f'holds{p}.json')), reverse=True):
        if idx >= len(tt) - 1: continue
        c = int((tt[idx][1] + 0.02) * sr); seg = np.concatenate([seg[:c], np.zeros(int(sec * sr), np.int16), seg[c:]])
        for k in range(idx + 1, len(tt)): tt[k] = [round(tt[k][0] + sec, 3), round(tt[k][1] + sec, 3)]
    w = wave.open(f'audio/vo{p}.wav', 'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(seg.tobytes()); w.close()
    json.dump(tt, open(f'timings{p}.json', 'w')); print(p, n, 'words', round(len(seg) / sr, 2), 's'); i0 = i1
