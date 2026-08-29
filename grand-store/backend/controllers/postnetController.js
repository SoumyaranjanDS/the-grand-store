const { findNearestPostnetStores } = require('../services/postnetLocator');

// @desc    Get PostNet stores for a selected city, or the nearest alternatives
// @route   GET /api/postnet/locator?address=...&city=...&lat=...&lng=...
// @access  Private
const getNearestStores = async (req, res) => {
  try {
    const { address, lat, lng, city } = req.query;

    if (!address && (!lat || !lng)) {
      return res.status(400).json({ message: 'Address or coordinates are required' });
    }

    const result = await findNearestPostnetStores({
      address,
      lat,
      lng,
      city,
      limit: 6
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching PostNet stores:', error);
    res.status(error.statusCode || 502).json({
      message: error.message || 'Failed to retrieve nearest PostNet stores'
    });
  }
};

module.exports = {
  getNearestStores
};
