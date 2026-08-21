// @desc    Get nearest PostNet stores based on vendor's address string
// @route   GET /api/postnet/locator?address=...
// @access  Private (Vendor only)
const getNearestStores = async (req, res) => {
  try {
    let { address, lat, lng } = req.query;

    if (!address && (!lat || !lng)) {
      return res.status(400).json({ message: 'Address or coordinates are required' });
    }

    let finalLat = lat;
    let finalLon = lng;

    if (!finalLat || !finalLon) {
      // 1. Convert address to Lat/Lon using Nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
      
      let geoRes;
      if (typeof globalThis.fetch === 'function') {
        geoRes = await globalThis.fetch(nominatimUrl, { headers: { 'User-Agent': 'GrandStoreApp/1.0' } });
      } else {
        const fetch = require('node-fetch');
        geoRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'GrandStoreApp/1.0' } });
      }

      const geoData = await geoRes.json();
      
      if (!geoData || geoData.length === 0) {
        return res.status(404).json({ message: 'Could not find coordinates for the given address' });
      }

      finalLat = geoData[0].lat;
      finalLon = geoData[0].lon;
    }

    // 2. Fetch nearest stores from PostNet API
    const postnetUrl = `https://pnsa.restapis.co.za/public/store/locator?latitude=${finalLat}&longitude=${finalLon}`;
    
    let postnetRes;
    if (typeof globalThis.fetch === 'function') {
      postnetRes = await globalThis.fetch(postnetUrl);
    } else {
      const fetch = require('node-fetch');
      postnetRes = await fetch(postnetUrl);
    }

    const postnetData = await postnetRes.json();

    // 3. Return top 3 nearest stores within 50km
    let nearestStores = [];
    if (Array.isArray(postnetData)) {
      nearestStores = postnetData.filter(store => store.distance <= 50).slice(0, 3);
    }
    
    res.json({
      stores: nearestStores,
      coordinates: { lat: finalLat, lon: finalLon }
    });

  } catch (error) {
    console.error('Error fetching PostNet stores:', error);
    res.status(500).json({ message: 'Failed to retrieve nearest PostNet stores', error: error.message });
  }
};

module.exports = {
  getNearestStores
};
