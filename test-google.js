const google = require('googlethis');

async function test() {
  const options = {
    page: 0, 
    safe: false, // Safe Search
    additional_params: { 
      hl: 'en' 
    }
  };
  
  const response = await google.image('Dua Lipa', options);
  if (response && response.length > 0) {
    console.log(response[0]);
  } else {
    console.log('No results');
  }
}

test().catch(console.error);
