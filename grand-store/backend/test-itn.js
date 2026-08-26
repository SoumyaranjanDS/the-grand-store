const http = require('http');
const crypto = require('crypto');
const { URLSearchParams } = require('url');

// Hardcoded for default testing
const passphrase = process.env.PAYFAST_PASSPHRASE || 'grandstore123'; 

// Function from payfastController
const generateSignature = (data, passphrase) => {
  let pfOutput = '';
  for (let key in data) {
    if(data.hasOwnProperty(key)){
      if (data[key] !== '') {
        pfOutput +=`${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`;
      }
    }
  }
  let getString = pfOutput.slice(0, -1);
  if (passphrase !== null && passphrase !== '') {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }
  return crypto.createHash('md5').update(getString).digest('hex');
};

const payload = {
  m_payment_id: 'SHP-6a82b65b02f90b75bff8b311', // Will need to replace this with actual pending order ID
  payment_status: 'COMPLETE',
  merchant_id: '10000100', // Sandbox ID
  item_name: 'Test Order'
};

payload.signature = generateSignature(payload, passphrase);

const postData = new URLSearchParams(payload).toString();

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/payfast/itn',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Sending ITN payload:', payload);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
