const fs = require('fs');

async function testCeleb(name) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(name)}?nologo=true&model=turbo&seed=123`;
  const res = await globalThis.fetch(url);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(`${name.replace(/ /g, '_')}.jpg`, Buffer.from(buf));
  console.log(`Saved ${name}.jpg`);
}

testCeleb("Dua Lipa");
