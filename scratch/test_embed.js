const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode, location: res.headers.location });
    }).on('error', (e) => {
      resolve({ url, error: e.message });
    });
  });
}

async function test() {
  const urls = [
    'https://www.instagram.com/reel/DdFvzOloggK/embed/?theme=dark',
    'https://www.instagram.com/p/DdFvzOloggK/embed/?theme=dark',
    'https://www.instagram.com/reel/DdFvzOloggK/embed',
    'https://www.instagram.com/reel/C_q8oG8S22y/embed/?theme=dark' // A known reel from the defaults
  ];
  for (const u of urls) {
    const res = await checkUrl(u);
    console.log(res);
  }
}
test();
