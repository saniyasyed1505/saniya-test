const ddg = require('duckduckgo-search');

async function testDDG() {
  try {
    const results = await ddg.images('Dua Lipa', { safeSearch: 'Off' });
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
