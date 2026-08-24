require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

// Middleware
// Parse allowed origins from .env or fallback to localhost
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes("*")
      ) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "The CORS policy for this site does not allow access from the specified Origin.",
          ),
        );
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Database Connection
const startAuctionCronJobs = require("./jobs/auctionJobs");
const startVendorTrustJobs = require("./jobs/vendorTrustJob");

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    // Start jobs ONLY after successful DB connection to avoid Mongoose buffering timeouts
    startAuctionCronJobs();
    startVendorTrustJobs();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const vendorRoutes = require("./routes/vendorRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const eventRoutes = require("./routes/eventRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");
const socialProofRoutes = require("./routes/socialProofRoutes");
const estateRoutes = require("./routes/estateRoutes");
const hostApplicationRoutes = require("./routes/hostApplicationRoutes");
const postnetRoutes = require("./routes/postnetRoutes");
const payfastRoutes = require("./routes/payfastRoutes");
const configRoutes = require("./routes/configRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/social-proof", socialProofRoutes);
app.use("/api/estates", estateRoutes);
app.use("/api/host-applications", hostApplicationRoutes);
app.use("/api/postnet", postnetRoutes);
app.use("/api/payfast", payfastRoutes);
app.use("/api/config", configRoutes);
app.use("/api/trade-enquiries", require("./routes/tradeEnquiryRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
