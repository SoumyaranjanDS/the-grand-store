const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Order = require('./models/Order');

const MONGO_URI = "mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/";

mongoose.connect(MONGO_URI).then(async () => {
  const latestOrders = await Order.find().sort({ createdAt: -1 }).limit(3);
  console.log(JSON.stringify(latestOrders, null, 2));
  mongoose.disconnect();
}).catch(console.error);
