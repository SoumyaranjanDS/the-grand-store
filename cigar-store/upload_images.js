import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'oioqrgj0',
  api_key: '782922137546894',
  api_secret: '9sgEWIPABZjV0aOy1gIFu9i7KXY',
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'public', 'images');

const defaultImages = [
  'ChatGPT Image Aug 25, 2026, 05_02_00 PM.png',
  'ChatGPT Image Aug 25, 2026, 05_02_12 PM.png',
  'ChatGPT Image Aug 25, 2026, 05_02_22 PM.png',
  'ChatGPT Image Aug 25, 2026, 05_02_31 PM.png',
  'ChatGPT Image Aug 25, 2026, 05_30_51 PM.png',
  'ChatGPT Image Aug 25, 2026, 05_40_14 PM.png',
  'mosi-new.png'
];

const requestedImages = process.argv.slice(2);
const imagesToUpload = requestedImages.length ? requestedImages : defaultImages;
const uploadFolder = requestedImages.length
  ? 'cigar-store/mosi-oa-tunya-gallery'
  : 'cigar-store';

async function uploadImages() {
  console.log('Starting Cloudinary upload...');
  const mapping = {};

  for (const imageName of imagesToUpload) {
    const filePath = path.join(imagesDir, imageName);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    try {
      console.log(`Uploading ${imageName}...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: uploadFolder,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        quality: 'auto',
        fetch_format: 'auto'
      });
      mapping[imageName] = result.secure_url;
      console.log(`Uploaded! URL: ${result.secure_url}`);
    } catch (error) {
      console.error(`Error uploading ${imageName}:`, error);
    }
  }

  console.log('\n--- UPLOAD COMPLETE ---');
  console.log(JSON.stringify(mapping, null, 2));
}

uploadImages();
