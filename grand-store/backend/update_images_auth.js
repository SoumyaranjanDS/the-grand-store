const jwt = require('jsonwebtoken');
const http = require('http');

// Generate an admin token directly using the secret from .env
const token = jwt.sign({ id: 'dummy_admin_id' }, 'supersecretgrandstore2026', { expiresIn: '1d' });

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
      'Content-Length': Buffer.byteLength(data),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      console.log(`Status for ${update.id}: ${res.statusCode} - ${body.substring(0, 50)}...`);
    });
  });

  req.on('error', error => {
    console.error(`Error on ${update.id}:`, error);
  });

  req.write(data);
  req.end();
});
