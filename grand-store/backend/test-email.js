require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

async function test() {
  try {
    const info = await sendEmail({
      to: process.env.SMTP_USER,
      subject: 'Test Email Attachment',
      html: '<p>Testing attachment</p>',
      attachments: [
        {
          filename: 'test.txt',
          content: Buffer.from('Hello world', 'utf-8'),
          contentType: 'text/plain'
        }
      ]
    });
    console.log('Success:', info.messageId);
  } catch (e) {
    console.error('Failure:', e);
  }
}
test();
