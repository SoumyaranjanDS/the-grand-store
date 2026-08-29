const sharp = require('sharp');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const files = [
  { id: 'prod_1787654842540_619', name: 'ardbeg', splitLeft: 380, width: 381, height: 1200 },
  { id: 'prod_1787654841808_342', name: 'aberlour', splitLeft: 600, width: 600, height: 1200 },
  { id: 'd5970438-e05c-4f5d-afaa-ad952ce06661', name: 'delmaguey', splitLeft: 600, width: 600, height: 1200 }
];

async function go() {
  await mongoose.connect(process.env.MONGO_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  for (const item of files) {
    const fileIn = `C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch/${item.name}.jpg`;
    const fileHalf = `C:/Users/RITESH/.gemini/antigravity-ide/brain/2fd3aea6-4d21-4add-9cfa-9744892e6eb8/scratch/${item.name}_right.jpg`;
    
    await sharp(fileIn)
      .extract({ left: item.splitLeft, top: 0, width: item.width, height: item.height })
      .toFile(fileHalf);
      
    const blob = await removeBackground('file:///' + fileHalf);
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    const p = await Product.findOne({ id: item.id });
    if (!p) continue;
    
    const outName = 'bg-removed-' + p._id.toString() + '.png';
    const outPath = '../backend/uploads/' + outName;
    fs.writeFileSync(outPath, buffer);
    
    p.image = '/uploads/' + outName;
    p.backgroundRemovalStatus = 'completed';
    p.markModified('image');
    p.markModified('backgroundRemovalStatus');
    await p.save();
    console.log('Fixed:', item.name);
  }
  await mongoose.disconnect();
}

go().catch(console.error);
