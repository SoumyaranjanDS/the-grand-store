const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');

process.env.PAYFAST_IS_LIVE = 'false';
process.env.PAYFAST_TEST_MERCHANT_ID = '10000100';
process.env.PAYFAST_TEST_MERCHANT_KEY = 'test-key';
process.env.PAYFAST_TEST_PASSPHRASE = 'test-passphrase';

const payfastRoutes = require('../routes/payfastRoutes');

const generateSignature = (data, passphrase) => {
  const fields = Object.entries(data)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => (
      `${key}=${encodeURIComponent(value.toString().trim()).replace(/%20/g, '+')}`
    ));

  fields.push(`passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`);
  return crypto.createHash('md5').update(fields.join('&')).digest('hex');
};

const withServer = async (callback) => {
  const app = express();
  app.use(express.json());
  app.use('/api/payfast', payfastRoutes);

  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });

  try {
    const address = server.address();
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
};

test('PayFast ITN route parses urlencoded form posts', async () => {
  await withServer(async (baseUrl) => {
    const payload = {
      m_payment_id: 'IGNORED-123',
      payment_status: 'CANCELLED',
      merchant_id: process.env.PAYFAST_TEST_MERCHANT_ID,
    };
    payload.signature = generateSignature(payload, process.env.PAYFAST_TEST_PASSPHRASE);

    const response = await fetch(`${baseUrl}/api/payfast/itn`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload),
    });

    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'OK');
  });
});

test('PayFast ITN route rejects an invalid signature', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/payfast/itn`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        m_payment_id: 'IGNORED-123',
        payment_status: 'CANCELLED',
        merchant_id: process.env.PAYFAST_TEST_MERCHANT_ID,
        signature: 'invalid',
      }),
    });

    assert.equal(response.status, 400);
    assert.equal(await response.text(), 'Invalid signature');
  });
});
