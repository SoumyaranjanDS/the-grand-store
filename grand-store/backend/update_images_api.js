const http = require('http');

const updates = [
  { id: 'd5970438-e05c-4f5d-afaa-ad952ce06661', image: '/uploads/delmaguey_transparent_full.png' },
  { id: 'prod_1787654841808_342', image: '/uploads/aberlour_transparent_full.png' },
  { id: 'prod_1787654842540_619', image: '/uploads/ardbeg_transparent_full.png' }
];

updates.forEach(update => {
  const data = JSON.stringify({ image: update.image });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/products/${update.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, res => {
    console.log(`Status for ${update.id}: ${res.statusCode}`);
  });

  req.on('error', error => {
    console.error(error);
  });

  req.write(data);
  req.end();
});
