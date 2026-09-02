const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'grandstore-uploads',
    resource_type: async (req, file) => {
      if (!file) return 'auto';
      const isRaw = file.mimetype === 'application/pdf' || file.mimetype.includes('msword') || file.mimetype.includes('document');
      return isRaw ? 'raw' : 'auto';
    },
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'pdf', 'doc', 'docx'],
  }
});

module.exports = {
  cloudinary,
  storage
};
