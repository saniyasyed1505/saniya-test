const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const inputImage = 'https://image.pollinations.ai/prompt/cyberpunk%20city';
const outputPath = 'zoom-test.mp4';

ffmpeg(inputImage)
  .loop(3) // 3 seconds
  .videoFilters([
    "zoompan=z='min(zoom+0.0015,1.5)':d=90:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  ])
  .outputOptions([
    '-c:v', 'libx264',
    '-t', '3',
    '-pix_fmt', 'yuv420p'
  ])
  .save(outputPath)
  .on('end', () => console.log('Done'))
  .on('error', (err) => console.error(err));
