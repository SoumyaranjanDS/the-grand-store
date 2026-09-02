const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { randomUUID } = require('crypto');
const path = require('path');
require('dotenv').config();

const RAW_DOCUMENT_EXTENSIONS = new Set(['.doc', '.docx']);

const getFileExtension = (file) => path.extname(file?.originalname || '').toLowerCase();

const isPdf = (file) => file?.mimetype === 'application/pdf' || getFileExtension(file) === '.pdf';

const isRawDocument = (file) => {
  const extension = getFileExtension(file);
  return RAW_DOCUMENT_EXTENSIONS.has(extension)
    || file?.mimetype?.includes('msword')
    || file?.mimetype?.includes('document');
};

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
      // Cloudinary treats PDFs as image assets. This preserves the .pdf format
      // in the delivery URL and allows browsers to render the uploaded file.
      if (isPdf(file)) return 'image';
      return isRawDocument(file) ? 'raw' : 'auto';
    },
    // Raw assets must include their extension in the public ID. Images and PDFs
    // should keep Cloudinary's generated public ID and receive their format in
    // the delivery URL instead.
    public_id: async (req, file) => isRawDocument(file)
      ? `document-${randomUUID()}${getFileExtension(file)}`
      : undefined,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'pdf', 'doc', 'docx'],
  }
});

module.exports = {
  cloudinary,
  storage
};
