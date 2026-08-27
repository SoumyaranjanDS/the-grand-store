const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'oioqrgj0',
  api_key: '782922137546894',
  api_secret: '9sgEWIPABZjV0aOy1gIFu9i7KXY'
});

const uploadVideo = async () => {
  try {
    const result = await cloudinary.uploader.upload(
      'c:\\office\\store-new\\cigar-store\\public\\media\\cigar-main-video.mp4',
      {
        resource_type: 'video',
        folder: 'cigar-store/hero'
      }
    );
    console.log('Upload Success:');
    console.log(result.secure_url);
  } catch (error) {
    console.error('Upload Error:', error);
  }
};

uploadVideo();
