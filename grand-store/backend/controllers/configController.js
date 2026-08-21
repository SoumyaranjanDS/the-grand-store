const axios = require('axios');

let cachedRates = null;
let lastFetchTime = null;
const CACHE_TTL = 1000 * 60 * 60 * 2; // 2 hours

// @desc    Get currency exchange rates
// @route   GET /api/config/currency-rates
// @access  Public
exports.getCurrencyRates = async (req, res) => {
  try {
    const now = new Date();
    
    // Return cached rates if valid
    if (cachedRates && lastFetchTime && (now - lastFetchTime < CACHE_TTL)) {
      return res.json(cachedRates);
    }
    
    // Fetch fresh rates
    const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await axios.get(apiUrl);
    
    if (response.data && response.data.rates) {
      cachedRates = response.data;
      lastFetchTime = now;
      return res.json(cachedRates);
    }
    
    res.status(500).json({ message: 'Invalid response from exchange rate API' });
  } catch (error) {
    console.error('Error fetching currency rates:', error.message);
    
    // Fallback to cached rates if available even if expired
    if (cachedRates) {
      return res.json(cachedRates);
    }
    
    res.status(500).json({ message: 'Server error fetching rates', error: error.message });
  }
};
