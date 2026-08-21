const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/currency-rates', configController.getCurrencyRates);

module.exports = router;
