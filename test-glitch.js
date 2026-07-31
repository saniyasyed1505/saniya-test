const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

async function run() {
  const imageUrl = `https://image.pollinations.ai/prompt/brad%20pitt?nologo=true&model=turbo`;
  const res = await globalThis.fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync('temp.jpg', Buffer.from(buffer));

  ffmpeg('temp.jpg')
    .loop(3)
    .videoFilters([
      `zoompan=z='min(zoom+0.0015,1.5)':d=90:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
      'framerate=30'
    ])
    .outputOptions([
      '-c:v', 'libx264',
      '-t', '3',
      '-pix_fmt', 'yuv420p',
      '-y'
    ])
    .save('output.mp4')
    .on('end', () => console.log('Done'))
    .on('error', (err) => console.error(err));
}
run();
