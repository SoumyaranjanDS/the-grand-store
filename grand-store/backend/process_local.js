const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const files = [
  { id: 'prod_1787654842540_619', file: 'C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch/ardbeg.jpg' },
  { id: 'prod_1787654841808_342', file: 'C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch/aberlour.jpg' },
  { id: 'd5970438-e05c-4f5d-afaa-ad952ce06661', file: 'C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch/delmaguey.jpg' }
];

async function processLocalFiles() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  for (const item of files) {
    console.log('Processing:', item.file);
    try {
      const blob = await removeBackground('file:///' + item.file);
      const buffer = Buffer.from(await blob.arrayBuffer());
      
      const p = await Product.findOne({ id: item.id });
      if (!p) {
        console.log('Product not found:', item.id);
        continue;
      }

      const outName = 'bg-removed-' + p._id.toString() + '.png';
      const outPath = '../backend/uploads/' + outName;
      fs.writeFileSync(outPath, buffer);
      
      p.image = '/uploads/' + outName;
      p.backgroundRemovalStatus = 'completed';
      p.markModified('image');
      p.markModified('backgroundRemovalStatus');
      await p.save();
      
      console.log('Successfully saved and updated DB:', outName);
    } catch (e) {
      console.error('Error on', item.file, e);
    }
  }
  await mongoose.disconnect();
}

processLocalFiles();
