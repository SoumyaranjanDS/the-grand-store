const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const EstateProfile = require('../models/EstateProfile');
const AuctionLot = require('../models/AuctionLot');
const Testimonial = require('../models/Testimonial');
const ExpertReview = require('../models/ExpertReview');
const Order = require('../models/Order');

const isLocalUpload = (url) => {
  if (!url) return false;
  const str = String(url);
  return str.includes('uploads/') || str.includes('uploads\\');
};

const getLocalPath = (url) => {
  const str = String(url).replace(/\\/g, '/');
  const filename = str.substring(str.indexOf('uploads/') + 8);
  return path.join(__dirname, '../uploads', filename);
};

const uploadToCloudinary = async (localPath) => {
  try {
    if (!fs.existsSync(localPath)) {
      console.warn(`File not found locally: ${localPath}`);
      return null;
    }
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'grandstore-uploads',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (err) {
    console.error(`Failed to upload ${localPath}:`, err.message);
    return null;
  }
};

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const backupFile = path.join(__dirname, 'cloudinary_migration_backup.json');
    const urlMap = {}; // Maps old URL to new Cloudinary URL

    const processField = async (doc, fieldPath) => {
      // Split fieldPath for nested objects (not arrays yet)
      const parts = fieldPath.split('.');
      let val = doc;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!val) break;
        val = val[parts[i]];
      }
      if (!val) return false;
      const key = parts[parts.length - 1];
      const currentUrl = val[key];

      if (isLocalUpload(currentUrl)) {
        if (urlMap[currentUrl]) {
          val[key] = urlMap[currentUrl];
          return true;
        } else {
          const localPath = getLocalPath(currentUrl);
          const newUrl = await uploadToCloudinary(localPath);
          if (newUrl) {
            urlMap[currentUrl] = newUrl;
            val[key] = newUrl;
            return true;
          }
        }
      }
      return false;
    };

    const processArrayField = async (doc, arrayField) => {
      const arr = doc[arrayField];
      let updated = false;
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          const currentUrl = arr[i];
          if (isLocalUpload(currentUrl)) {
            if (urlMap[currentUrl]) {
              arr[i] = urlMap[currentUrl];
              updated = true;
            } else {
              const localPath = getLocalPath(currentUrl);
              const newUrl = await uploadToCloudinary(localPath);
              if (newUrl) {
                urlMap[currentUrl] = newUrl;
                arr[i] = newUrl;
                updated = true;
              }
            }
          }
        }
      }
      return updated;
    };

    const processDocument = async (doc, stringFields, arrayFields, nestedArrays = []) => {
      let updated = false;
      for (const field of stringFields) {
        if (await processField(doc, field)) updated = true;
      }
      for (const field of arrayFields) {
        if (await processArrayField(doc, field)) updated = true;
      }
      for (const nested of nestedArrays) {
        const arr = doc[nested.array];
        if (Array.isArray(arr)) {
          for (let item of arr) {
            for (const field of nested.fields) {
              if (await processField(item, field)) updated = true;
            }
          }
        }
      }
      if (updated) {
        await doc.save();
        console.log(`Updated ${doc.constructor.modelName} ${doc._id}`);
      }
    };

    // 1. Products
    const products = await Product.find({});
    for (const p of products) {
      await processDocument(p, ['image', 'factSheetPdf'], ['gallery']);
    }

    // 2. Vendors
    const vendors = await Vendor.find({});
    for (const v of vendors) {
      await processDocument(v, [
        'logoUrl', 'bannerUrl', 'idDocumentUrl', 'taxClearanceUrl',
        'licenceDocumentUrl', 'exportDocumentUrl', 'bankConfirmationUrl', 'wineryPhotosUrl'
      ], []);
    }

    // 3. Events
    const events = await Event.find({});
    for (const e of events) {
      await processDocument(e, ['image'], []);
    }

    // 4. EstateProfiles
    const estates = await EstateProfile.find({});
    for (const ep of estates) {
      await processDocument(ep, 
        ['imageUrl', 'heroImageUrl', 'tastingsImageUrl'], 
        ['images'], 
        [
          { array: 'experiences', fields: ['imageUrl'] },
          { array: 'galleries', fields: ['imageUrl'] }
        ]
      );
    }

    // 5. AuctionLots
    const lots = await AuctionLot.find({});
    for (const l of lots) {
      await processDocument(l, [], ['images']);
    }

    // 6. Testimonials
    const testimonials = await Testimonial.find({});
    for (const t of testimonials) {
      await processDocument(t, ['image'], []);
    }

    // 7. ExpertReviews
    const reviews = await ExpertReview.find({});
    for (const r of reviews) {
      await processDocument(r, ['expertImage'], []);
    }

    // 8. Orders
    const orders = await Order.find({});
    for (const o of orders) {
      await processDocument(o, ['proofUrl'], [], [
        { array: 'orderItems', fields: ['image'] }
      ]);
    }

    fs.writeFileSync(backupFile, JSON.stringify(urlMap, null, 2));
    console.log(`Migration complete. Backup mapping saved to ${backupFile}`);
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
