const { image_search } = require('duckduckgo-search');

async function testDDG() {
  try {
    const results = await image_search({ query: 'Dua Lipa', moderate: true });
    if (results && results.length > 0) {
      console.log(results[0].image);
    } else {
      console.log('No results');
    }
  } catch (e) {
    console.error(e);
  }
}

testDDG();
