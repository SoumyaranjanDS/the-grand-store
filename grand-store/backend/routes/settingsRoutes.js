const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getPublicSettings, updateSettings } = require("../controllers/settingsController");

router.get("/public", getPublicSettings);
router.put("/", protect, updateSettings);

module.exports = router;
