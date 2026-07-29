const Replicate = require('replicate');
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'your_replicate_token_here',
});

async function run() {
  console.log('Testing MusicGen...');
  try {
    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
      {
        input: {
          prompt: "Suspenseful orchestral music",
          duration: 3
        }
      }
    );
    console.log('Music output:', output);
  } catch(e) {
    console.error('Music error:', e.message);
  }
}
run();
