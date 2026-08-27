import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'oioqrgj0',
  api_key: '782922137546894',
  api_secret: '9sgEWIPABZjV0aOy1gIFu9i7KXY',
});

const videos = [
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\media\\grand-store-hero-scrub.mp4',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\media\\grand-store-hero-cellar-hd.mp4',
  'C:\\office\\store-new\\grand-store\\frontend\\public\\assets\\media\\grand-store-hero-third.mp4'
];

async function uploadVideos() {
  console.log('Starting Cloudinary video upload...');
  
  for (const filePath of videos) {
    try {
      console.log(`Uploading ${filePath}...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'grand-store/hero-react-native',
        resource_type: 'video',
        use_filename: true,
        unique_filename: false,
        overwrite: true
      });
      console.log(`Uploaded! URL: ${result.secure_url}`);
    } catch (error) {
      console.error(`Error uploading ${filePath}:`, error);
    }
  }
}

uploadVideos();
