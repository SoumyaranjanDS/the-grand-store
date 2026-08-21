
(async () => {
  const address = "Cape Town, South Africa";
  const geoUrl = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(address) + "&format=json&limit=1";
  const geoRes = await fetch(geoUrl, { headers: { "User-Agent": "GrandStoreApp/1.0" } });
  const geoData = await geoRes.json();
  if (geoData.length > 0) {
    const { lat, lon } = geoData[0];
    console.log("Got lat/lon:", lat, lon);
    const postnetUrl = "https://pnsa.restapis.co.za/public/store/locator?latitude=" + lat + "&longitude=" + lon;
    const postnetRes = await fetch(postnetUrl);
    const postnetData = await postnetRes.json();
    console.log("PostNet stores:", JSON.stringify(postnetData.slice(0,2), null, 2));
  } else {
    console.log("No geocoding result");
  }
})();

