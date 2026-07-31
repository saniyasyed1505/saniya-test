const axios = require('axios');

async function testPixabay() {
  const url = `https://pixabay.com/api/?key=56782653-729ae44df703f0c3467ad8d77&q=dua+lipa`;
  const res = await axios.get(url);
  if (res.data.hits && res.data.hits.length > 0) {
    console.log(res.data.hits[0].largeImageURL);
  } else {
    console.log('No results');
  }
}

testPixabay().catch(console.error);
