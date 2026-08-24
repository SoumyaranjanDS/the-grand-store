const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getPublicSettings, updateSettings } = require("../controllers/settingsController");
const testimonialController = require("../controllers/testimonialController");

router.get("/public", getPublicSettings);
router.get("/testimonials", testimonialController.getPublicTestimonials);
router.put("/", protect, updateSettings);

module.exports = router;
