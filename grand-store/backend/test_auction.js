const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
mongoose.connect('mongodb+srv://crmisa1000_db_user:Ug5sH8m4vxCjmZHN@cluster0.8snrppp.mongodb.net/test?retryWrites=true&w=majority').then(async () => {
  const AuctionLot = mongoose.model('AuctionLot', new mongoose.Schema({}, { strict: false }));
  const lot = await AuctionLot.findOne();
  if(lot) {
    const http = require('http');
    http.get('http://localhost:5000/api/auction/' + lot._id, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => console.log('Response:', data));
    });
  } else {
    console.log('No lot found');
  }
});
