const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Product = require('./models/Product');
  const Attribute = require('./models/Attribute');
  
  const p = await Product.findOne({ 'flavorProfile.0': { $exists: true } });
  console.log(p.name);
  console.log('flavorProfile:', p.flavorProfile);
  console.log('foodPairing:', p.foodPairing);
  
  const attrFlavors = await Attribute.find({ type: 'flavor' });
  console.log('Attributes in DB flavors:', attrFlavors.map(a => a.value));

  const attrPair = await Attribute.find({ type: 'pairing' });
  console.log('Attributes in DB pairing:', attrPair.map(a => a.value));

  mongoose.disconnect();
});
