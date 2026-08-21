const express = require('express');
const router = express.Router();
const { getStoreById } = require('../controllers/shopController');

router.route('/stores/:id').get(getStoreById);

module.exports = router;
