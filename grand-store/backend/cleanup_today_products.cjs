const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/';

mongoose.connect(MONGO_URI).then(async () => {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  // 1. Delete the 6 products seeded today
  const deleteIds = [
    '6a85b7b2f65fd21c2f672053',
    '6a85b7b2f65fd21c2f672052',
    '6a85b7b2f65fd21c2f672051',
    '6a85b7b2f65fd21c2f672050',
    '6a85b7b2f65fd21c2f67204f',
    '6a85b7b2f65fd21c2f67204e'
  ];

  const deleteResult = await Product.deleteMany({
    _id: { $in: deleteIds.map(id => new mongoose.Types.ObjectId(id)) }
  });
  console.log(`Deleted ${deleteResult.deletedCount} seeded products from today.`);

  // 2. Update VINO TINTO to be featured and newest
  const updatedVino = await Product.findOneAndUpdate(
    { name: /VINO TINTO/i },
    {
      $set: {
        featured: true,
        approvalStatus: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { new: true }
  );

  console.log('\nUpdated VINO TINTO:', JSON.stringify(updatedVino, null, 2));

  // 3. List all remaining products sorted by createdAt desc
  const remaining = await Product.find().sort({ createdAt: -1 });
  console.log(`\nRemaining Products Count: ${remaining.length}`);
  remaining.forEach((p, i) => {
    console.log(`[${i + 1}] ID: ${p._id} | Name: ${p.name} | Featured: ${p.featured} | CreatedAt: ${p.createdAt}`);
  });

  mongoose.disconnect();
}).catch(console.error);
