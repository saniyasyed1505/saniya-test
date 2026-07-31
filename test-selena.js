const fs = require('fs');

async function test(model, promptText) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?nologo=true&model=${model}`;
  const res = await globalThis.fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(`selena_${model}.jpg`, Buffer.from(buffer));
  console.log(`Saved selena_${model}.jpg`);
}

async function run() {
  const enhancedPrompt = "A professional, photorealistic 8k portrait photograph of the real Selena Gomez holding brownies, exact facial features, true likeness, highly detailed";
  await test('turbo', enhancedPrompt);
  await test('flux', enhancedPrompt);
}
run();
