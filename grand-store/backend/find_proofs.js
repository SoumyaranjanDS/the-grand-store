const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://soumyaranjansahoo97292_db_user:MhyaihjRhis8NgOU@cluster0.neotr0o.mongodb.net/",
);
const Order = require("./models/Order");
Order.find({ proofUrl: { $exists: true } })
  .select("orderId proofUrl paymentStatus")
  .then((orders) => {
    console.log(orders);
    process.exit(0);
  });
