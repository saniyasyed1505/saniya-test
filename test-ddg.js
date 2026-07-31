const { image_search } = require('duckduckgo-images-api');

image_search({ query: 'Dua Lipa', moderate: true }).then(results => {
  if (results && results.length > 0) {
    console.log(results[0].image);
  } else {
    console.log('No results found');
  }
}).catch(console.error);
