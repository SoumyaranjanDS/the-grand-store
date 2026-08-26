require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

const imagePath = 'C:\\Users\\RITESH\\.gemini\\antigravity-ide\\brain\\2fd3aea6-4d21-4add-9cfa-9744892e6eb8\\.user_uploaded\\media_1787729785789.png';

cloudinary.uploader.upload(imagePath, { folder: 'grand-store/assets' })
  .then(result => {
    console.log('UPLOAD_SUCCESS:' + result.secure_url);
  })
  .catch(error => {
    console.error('UPLOAD_ERROR:', error);
  });
