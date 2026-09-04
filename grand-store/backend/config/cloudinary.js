const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { randomUUID } = require('crypto');
const path = require('path');
require('dotenv').config();

const RAW_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv']);

const getFileExtension = (file) => path.extname(file?.originalname || '').toLowerCase();

const isPdf = (file) => file?.mimetype === 'application/pdf' || getFileExtension(file) === '.pdf';

const isRawDocument = (file) => {
  const extension = getFileExtension(file);
  return isPdf(file)
    || RAW_DOCUMENT_EXTENSIONS.has(extension)
    || file?.mimetype?.includes('msword')
    || file?.mimetype?.includes('document')
    || file?.mimetype?.includes('pdf');
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = getFileExtension(file);
    const isDoc = isRawDocument(file);
    const isVideo = file.mimetype && file.mimetype.startsWith('video/');
    const resourceType = isDoc ? 'raw' : (isVideo ? 'video' : 'image');

    return {
      folder: 'grandstore-uploads',
      resource_type: resourceType,
      public_id: isDoc 
        ? `document-${randomUUID()}${ext || '.pdf'}`
        : `upload-${randomUUID()}`
    };
  }
});

module.exports = {
  cloudinary,
  storage
};
