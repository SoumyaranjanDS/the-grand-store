const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

const MONGO_URI = "mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/";

mongoose.connect(MONGO_URI).then(async () => {
  const orders = await Order.find();
  for (const order of orders) {
    let modified = false;
    for (const item of order.orderItems) {
      if (!item.vendorId) {
        const product = await Product.findOne({ id: item.product });
        if (product) {
          item.vendorId = product.vendorId;
          modified = true;
          console.log(`Updated item ${item.name} with vendorId ${product.vendorId}`);
        }
      }
    }
    if (modified) {
      await order.save();
      console.log(`Saved order ${order.invoiceNumber}`);
    }
  }
  mongoose.disconnect();
}).catch(console.error);
