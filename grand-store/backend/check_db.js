require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const categories = await Category.find({});
  console.log(JSON.stringify(categories, null, 2));
  process.exit(0);
}
test();
