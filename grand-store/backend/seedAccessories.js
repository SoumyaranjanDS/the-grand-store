const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const accessories = [
  {
    id: `prod_acc_${Date.now()}_1`,
    name: 'Arcoroc Hi Ball Glass 270ml - Case of 48',
    type: 'accessory',
    description: '<p>Get ready for your next occasion with these Hi Ball glasses. These versatile glasses hold a generous amount of liquid. Turn every day into an occasion!</p><ul><li>Dishwasher safe for easy cleaning</li><li>Capacity 270ml</li><li>Sleek design suits any occasion</li><li>Set of 48 for versatile use</li><li>Durable, Functional and stylish</li><li>Perfect for juices, cocktails, and more</li></ul>',
    price: '199.99', 
    image: 'https://via.placeholder.com/300x400?text=Arcoroc+Hi+Ball',
    gallery: [],
    stock: 50,
    options: ['Case of 48'],
    tags: ['Glassware', 'Hi Ball', 'Arcoroc'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_2`,
    name: 'Arcoroc Willy Glass 380ml - Case of 48',
    type: 'accessory',
    description: '<p>Get ready for your next occasion with these Willy glasses. These versatile glasses hold a generous amount of liquid. Turn every day into an occasion!</p><ul><li>Dishwasher safe for easy cleaning</li><li>Capacity 380ml</li><li>Curved design suits any occasion</li><li>Durable, Functional and stylish</li><li>Set of 48 for versatile use</li><li>Perfect for juices, cocktails, and more</li></ul>',
    price: '249.99',
    image: 'https://via.placeholder.com/300x400?text=Arcoroc+Willy',
    gallery: [],
    stock: 50,
    options: ['Case of 48'],
    tags: ['Glassware', 'Willy Glass', 'Arcoroc'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_3`,
    name: 'Arcoroc Zombie Glass 330ml - Case of 48',
    type: 'accessory',
    description: '<p>Get ready for your next occasion with these Zombie glasses. These versatile glasses hold a generous amount of liquid. Turn every day into an occasion!</p><ul><li>Dishwasher safe for easy cleaning</li><li>Capacity 330ml</li><li>Sleek design suits any occasion</li><li>Set of 48 for versatile use</li><li>Durable, Functional and stylish</li><li>Perfect for juices, cocktails, and more</li></ul>',
    price: '219.99',
    image: 'https://via.placeholder.com/300x400?text=Arcoroc+Zombie',
    gallery: [],
    stock: 50,
    options: ['Case of 48'],
    tags: ['Glassware', 'Zombie Glass', 'Arcoroc'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_4`,
    name: 'Bohemia Bar Retro Gin Glasses 680ml 2pk',
    type: 'accessory',
    description: '<p>Popular cocktails, exotic mixed long drinks and classic drinks like wine, champagne and beer are served perfectly with the glasses of the collection Bar. Stylish, sophisticated and elegant, Bohemia Cristal offers an extensive range of drinkware, perfect for any home.</p><ul><li>Set of 2 gin glasses</li><li>Durable, Bohemian crystal.</li><li>100% ultra-clear glass.</li><li>Suitable for use in the home or the hospitality industry.</li><li>Dishwasher safe.</li></ul>',
    price: '149.99',
    image: 'https://via.placeholder.com/300x400?text=Bohemia+Gin+Glass',
    gallery: [],
    stock: 50,
    options: ['2pk'],
    tags: ['Glassware', 'Gin', 'Bohemia Crystal'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_5`,
    name: 'Bohemia Crystal Pinna Tumbler, 350ml 6pk',
    type: 'accessory',
    description: '<p>Experience a lavish moment with this Six-piece tumbler set from Whisky Bohemia collection. Perfect for enjoying your favourite whisky</p><ul><li>Pack of 6 Pina tumblers.</li><li>350ml capacity.</li><li>Perfect for serving whisky.</li><li>Sparkly personality and an incredible brightness.</li><li>Material: Crystal.</li><li>Dishwasher safe.</li></ul>',
    price: '189.99',
    image: 'https://via.placeholder.com/300x400?text=Bohemia+Tumbler',
    gallery: [],
    stock: 50,
    options: ['6pk'],
    tags: ['Glassware', 'Tumbler', 'Bohemia Crystal'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_6`,
    name: 'Bohemia Crystal Safari Hiball Tumblers 300ml - Set of 6',
    type: 'accessory',
    description: '<p>Bohemia Crystal Safari Hiball Tumblers is a striking collection that seamlessly blends safari-inspired design with functionality. Crafted with precision, each tumbler features an eye-catching motif reminiscent of the wild, combining a giraffes elegance with subtle zebra stripes. With a generous 300ml capacity, these tumblers are perfect for serving a variety of beverages, from refreshing iced drinks to cocktails.</p><p>Set of 6 Safari Hiball Tumblers.</p><p>300ml capacity.</p>',
    price: '209.99',
    image: 'https://via.placeholder.com/300x400?text=Bohemia+Safari+Hiball',
    gallery: [],
    stock: 50,
    options: ['Set of 6'],
    tags: ['Glassware', 'Hiball', 'Bohemia Crystal'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_7`,
    name: 'Bohemia Crystal Parus Optic White Wine Glass, 250ml 6pk',
    type: 'accessory',
    description: '<p>The Bohemia Crystal Parus Optic White wine glasses are premium quality and also guarantees to add a touch of luxury to your fine dining experience.</p><ul><li>Pack of 6 White wine glasses.</li><li>250ml capacity.</li><li>Perfect for serving White Wines.</li><li>Sparkly personality and an incredible brightness.</li><li>Material: Crystal.</li><li>Dishwasher safe.</li></ul>',
    price: '199.99',
    image: 'https://via.placeholder.com/300x400?text=Bohemia+White+Wine+Glass',
    gallery: [],
    stock: 50,
    options: ['6pk'],
    tags: ['Glassware', 'Wine Glass', 'Bohemia Crystal'],
    approvalStatus: 'approved',
    vendorId: null
  },
  {
    id: `prod_acc_${Date.now()}_8`,
    name: 'Bohemia Crystal Sarah Titanium Flute 260ml 6pk',
    type: 'accessory',
    description: '<p>The Bohemia Royal Cystal Sarah Titanium Glass range is premium quality and also guarantees to add a touch of luxury to your fine dining experience.</p><ul><li>Set of 6 flute Glasses.</li><li>260ml Capacity.</li><li>Perfect for serving champagne.</li><li>sparkly personality and an incredible brightness.</li><li>Material: Crystal.</li><li>Dishwasher safe.</li></ul>',
    price: '229.99',
    image: 'https://via.placeholder.com/300x400?text=Bohemia+Flute',
    gallery: [],
    stock: 50,
    options: ['6pk'],
    tags: ['Glassware', 'Flute', 'Bohemia Crystal'],
    approvalStatus: 'approved',
    vendorId: null
  }
];

const seedAccessories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing accessories (optional but good for dev)
    await Product.deleteMany({ type: 'accessory' });
    console.log('Deleted old accessories');

    await Product.insertMany(accessories);
    console.log('Inserted new accessories');

    process.exit();
  } catch (error) {
    console.error('Error seeding accessories:', error);
    process.exit(1);
  }
};

seedAccessories();
