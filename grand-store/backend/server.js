require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const attributeRoutes = require("./routes/attributeRoutes");
const glossaryRoutes = require("./routes/glossaryRoutes");

const app = express();
app.set('trust proxy', 1);

// Middleware
// Parse allowed origins from .env or fallback to localhost
let allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:56842",
    ];

const productionDomains = [
  "https://grandstore.yogapranafitness.com",
  "https://www.grandstore.yogapranafitness.com",
  "http://grandstore.yogapranafitness.com",
  "http://www.grandstore.yogapranafitness.com",
  "https://cigar.yogapranafitness.com",
  "https://www.cigar.yogapranafitness.com",
];

productionDomains.forEach((domain) => {
  if (!allowedOrigins.includes(domain)) {
    allowedOrigins.push(domain);
  }
});

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Added for PayFast ITN form data

app.use(cookieParser());
// NOTE: xss-clean is currently disabled because it crashes on Express 5.x 
// due to trying to mutate the read-only req.query getter (same issue as mongo-sanitize).
// app.use(xssClean());

// Secure HTTP headers (allow cross-origin resources like Cloudinary images)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Sanitize MongoDB data (prevent NoSQL injection)
// NOTE: express-mongo-sanitize is currently disabled because it crashes on Express 5.x 
// due to trying to mutate the read-only req.query getter.
// app.use(mongoSanitize());

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(globalLimiter);

// Specific limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many authentication attempts, please try again later'
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many payment requests, please try again later'
});

app.use("/uploads", express.static("uploads"));

// Database Connection
const startAuctionCronJobs = require("./jobs/auctionJobs");
const startVendorTrustJobs = require("./jobs/vendorTrustJob");
const startReminderJobs = require("./jobs/reminderJobs");
const startEventJobs = require("./jobs/eventJobs");
const startVendorJobs = require("./jobs/vendorJobs");

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    const seedAdminStaff = require("./services/seedAdminStaff");
    await seedAdminStaff();
    // Start jobs ONLY after successful DB connection to avoid Mongoose buffering timeouts
    startAuctionCronJobs();
    startVendorTrustJobs();
    startReminderJobs();
    startEventJobs();
    startVendorJobs();
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
const newsletterRoutes = require("./routes/newsletterRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const couponRoutes = require("./routes/couponRoutes");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", paymentLimiter, checkoutRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/social-proof", socialProofRoutes);
app.use("/api/estates", estateRoutes);
app.use("/api/host-applications", hostApplicationRoutes);
app.use("/api/postnet", postnetRoutes);
app.use("/api/payfast", paymentLimiter, payfastRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/glossary", glossaryRoutes);
app.use("/api/config", configRoutes);
app.use("/api/trade-enquiries", require("./routes/tradeEnquiryRoutes"));
app.use("/api/cigar-enquiries", require("./routes/cigarEnquiryRoutes"));
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/advertisements", require("./routes/advertisementRoutes"));
app.use("/api/chatbot", chatbotRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
