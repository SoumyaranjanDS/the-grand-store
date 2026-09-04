const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { randomUUID } = require('crypto');
const path = require('path');
// Ensure .env is explicitly loaded from backend directory regardless of cwd
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
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

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_NAME || 'oioqrgj0';
const apiKey = process.env.CLOUDINARY_API_KEY || '782922137546894';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '9sgEWIPABZjV0aOy1gIFu9i7KXY';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(true);
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

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
