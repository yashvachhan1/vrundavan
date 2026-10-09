const https = require('https');
const url = 'https://www.instagram.com/p/DdFvzOloggK/media/?size=l';
https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  if (res.statusCode === 302 || res.statusCode === 301) {
    console.log('Location:', res.headers.location);
  }
}).on('error', (e) => {
  console.error(e);
});
