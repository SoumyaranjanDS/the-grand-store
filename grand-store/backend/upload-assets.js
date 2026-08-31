require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const files = [
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\mobile-hero\\premium-bar.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\mobile-hero\\champagne-pour.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\mobile-hero\\moet-ice.jpg'
];

async function uploadAll() {
  for (const file of files) {
    try {
      const result = await cloudinary.uploader.upload(file, { folder: 'grand-store/mobile-hero' });
      console.log(`FILE: ${file} => ${result.secure_url}`);
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }
}

uploadAll();
