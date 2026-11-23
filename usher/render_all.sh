set -e
for p in 1 2 3; do
  for w in 0 1 2; do PORT=8124 QUERY=part=$p FRAMES=frames$p SCALE=0.75 node tools/render.mjs $w 3 > r$p$w.log 2>&1 & done; wait
  python3 -c "
from PIL import Image; import glob
for f in sorted(glob.glob('frames$p/f*.jpg')):
    im=Image.open(f)
    if im.size!=(1080,1920): im.convert('RGB').resize((1080,1920),Image.LANCZOS).save(f,quality=95)"
  ffmpeg -v error -y -framerate 30 -i frames$p/f%05d.jpg -i audio/final$p.wav -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -tune animation -movflags +faststart -c:a aac -b:a 256k -shortest usher_part$p.mp4
  ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration -of compact usher_part$p.mp4
done
echo ALLDONE
