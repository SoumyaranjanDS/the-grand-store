require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const files = [
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\wine_categories\\red_wine.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\wine_categories\\white_wine.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\wine_categories\\rose_wine.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\wine_categories\\sparkling_wine.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\wine_categories\\fortified_wine.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\images\\shop-theme-banner.jpg',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\images\\auction-campaign-banner.jpg'
];

async function uploadAll() {
  for (const file of files) {
    try {
      const result = await cloudinary.uploader.upload(file, { folder: 'grand-store/assets' });
      console.log(`FILE: ${file} => ${result.secure_url}`);
    } catch (err) {
      console.error(`Error uploading ${file}:`, err.message);
    }
  }
}

uploadAll();
