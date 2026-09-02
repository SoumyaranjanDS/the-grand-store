const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/categories/admin',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    if (res.statusCode !== 200) {
      console.log(data);
      return;
    }
    const categories = JSON.parse(data);
    categories.forEach(c => {
      console.log(`Category: ${c.name}, Logos count: ${c.brandLogos ? c.brandLogos.length : 0}`);
    });
  });
});
req.end();
