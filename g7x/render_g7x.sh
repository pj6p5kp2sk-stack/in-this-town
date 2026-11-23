until grep -q ALLDONE ../usher/render_all.log; do sleep 15; done
for w in 0 1 2; do PORT=8125 SCALE=0.75 node tools/render.mjs $w 3 > r$w.log 2>&1 & done; wait
python3 -c "
from PIL import Image; import glob
for f in sorted(glob.glob('frames/f*.jpg')):
    im=Image.open(f)
    if im.size!=(1080,1920): im.convert('RGB').resize((1080,1920),Image.LANCZOS).save(f,quality=95)"
ffmpeg -v error -y -framerate 30 -i frames/f%05d.jpg -i audio/final_audio.wav -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -tune animation -movflags +faststart -c:a aac -b:a 256k -shortest g7x_srpski.mp4
ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration -of compact g7x_srpski.mp4
echo G7XDONE
