const axios = require("axios");

const geocodeLocation = async (address) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
    });

    if (res.data && res.data.length > 0) {
      const { lon, lat } = res.data[0];
      return [parseFloat(lon), parseFloat(lat)]; // [lng, lat]
    }

    return null; // invalid address
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return null;
  }
};

module.exports = geocodeLocation;
