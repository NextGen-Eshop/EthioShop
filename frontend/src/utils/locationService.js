/**
 * Ethiopian Location Detection and Geocoding Service
 * Accurately detects actual Ethiopian cities (Adama, Addis Ababa, Hawassa, Bahir Dar, etc.)
 * using browser GPS with reverse-geocoding, geometric distance matching, and IP geolocation fallback.
 */

export const ETHIOPIAN_CITIES = [
  { name: 'Addis Ababa', region: 'Addis Ababa', lat: 9.0320, lon: 38.7480, standardFee: 100, expressFee: 150 },
  { name: 'Adama', region: 'Oromia', lat: 8.5400, lon: 39.2700, standardFee: 150, expressFee: 200 },
  { name: 'Bishoftu', region: 'Oromia', lat: 8.7523, lon: 38.9785, standardFee: 130, expressFee: 180 },
  { name: 'Hawassa', region: 'Sidama', lat: 7.0504, lon: 38.4955, standardFee: 180, expressFee: 250 },
  { name: 'Bahir Dar', region: 'Amhara', lat: 11.5742, lon: 37.3614, standardFee: 200, expressFee: 270 },
  { name: 'Dire Dawa', region: 'Dire Dawa', lat: 9.6009, lon: 41.8501, standardFee: 220, expressFee: 300 },
  { name: 'Gondar', region: 'Amhara', lat: 12.6030, lon: 37.4521, standardFee: 210, expressFee: 280 },
  { name: 'Mekelle', region: 'Tigray', lat: 13.4967, lon: 39.4753, standardFee: 230, expressFee: 310 },
  { name: 'Jimma', region: 'Oromia', lat: 7.6734, lon: 36.8344, standardFee: 190, expressFee: 260 },
  { name: 'Dessie', region: 'Amhara', lat: 11.1300, lon: 39.6300, standardFee: 200, expressFee: 270 },
  { name: 'Harar', region: 'Harari', lat: 9.3139, lon: 42.1182, standardFee: 220, expressFee: 300 },
  { name: 'Shashemene', region: 'Oromia', lat: 7.2000, lon: 38.6000, standardFee: 170, expressFee: 240 },
  { name: 'Arba Minch', region: 'SNNPR', lat: 6.0333, lon: 37.5500, standardFee: 210, expressFee: 280 },
  { name: 'Jigjiga', region: 'Somali', lat: 9.3500, lon: 42.8000, standardFee: 250, expressFee: 330 },
  { name: 'Asella', region: 'Oromia', lat: 7.9556, lon: 39.1225, standardFee: 160, expressFee: 220 },
  { name: 'Debre Birhan', region: 'Amhara', lat: 9.6800, lon: 39.5300, standardFee: 150, expressFee: 210 },
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function matchEthiopianCity(cityNameOrCoords, maybeLon) {
  if (typeof cityNameOrCoords === 'number' && typeof maybeLon === 'number') {
    const lat = cityNameOrCoords;
    const lon = maybeLon;
    let closest = ETHIOPIAN_CITIES[0];
    let minDistance = Infinity;

    for (const city of ETHIOPIAN_CITIES) {
      const dist = calculateDistanceKm(lat, lon, city.lat, city.lon);
      if (dist < minDistance) {
        minDistance = dist;
        closest = city;
      }
    }
    return closest;
  }

  if (typeof cityNameOrCoords === 'string') {
    const query = cityNameOrCoords.trim().toLowerCase();
    if (query.includes('adama') || query.includes('nazret') || query.includes('nazreth')) {
      return ETHIOPIAN_CITIES.find((c) => c.name === 'Adama');
    }
    if (query.includes('addis') || query.includes('finfinne')) {
      return ETHIOPIAN_CITIES.find((c) => c.name === 'Addis Ababa');
    }
    if (query.includes('bishoftu') || query.includes('debre zeit')) {
      return ETHIOPIAN_CITIES.find((c) => c.name === 'Bishoftu');
    }
    const found = ETHIOPIAN_CITIES.find((c) => query.includes(c.name.toLowerCase()));
    if (found) return found;
  }

  return ETHIOPIAN_CITIES[0];
}

export async function detectCurrentLocation() {
  return new Promise((resolve) => {
    const fallbackLocation = {
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      subCity: 'Bole Sub-City',
      placeName: 'Addis Ababa, Ethiopia',
      latitude: 9.0320,
      longitude: 38.7480,
      accuracy: 50,
      isDetected: false,
      standardFee: 100,
      expressFee: 150,
    };

    if (!navigator.geolocation) {
      resolve(fallbackLocation);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        try {
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const rawCity =
              addr.city ||
              addr.town ||
              addr.municipality ||
              addr.village ||
              addr.county ||
              addr.state_district ||
              addr.state ||
              '';

            const matchedCity = matchEthiopianCity(rawCity) || matchEthiopianCity(latitude, longitude);

            resolve({
              city: matchedCity.name,
              region: matchedCity.region,
              subCity: addr.suburb || addr.neighbourhood || addr.city_district || `${matchedCity.name} Central`,
              placeName: data.display_name || `${matchedCity.name}, ${matchedCity.region}, Ethiopia`,
              latitude,
              longitude,
              accuracy: Math.round(accuracy),
              isDetected: true,
              standardFee: matchedCity.standardFee,
              expressFee: matchedCity.expressFee,
            });
            return;
          }
        } catch (_) {
          // Geometric distance fallback
        }

        const matchedCity = matchEthiopianCity(latitude, longitude);
        resolve({
          city: matchedCity.name,
          region: matchedCity.region,
          subCity: `${matchedCity.name} Central`,
          placeName: `${matchedCity.name}, ${matchedCity.region}, Ethiopia`,
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          isDetected: true,
          standardFee: matchedCity.standardFee,
          expressFee: matchedCity.expressFee,
        });
      },
      async () => {
        // Geolocation denied or unavailable -> Try IP-based city detection fallback
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData && ipData.city) {
              const matched = matchEthiopianCity(ipData.city);
              resolve({
                city: matched.name,
                region: matched.region,
                subCity: `${matched.name} Central`,
                placeName: `${matched.name}, Ethiopia`,
                latitude: ipData.latitude || matched.lat,
                longitude: ipData.longitude || matched.lon,
                accuracy: 1000,
                isDetected: true,
                standardFee: matched.standardFee,
                expressFee: matched.expressFee,
              });
              return;
            }
          }
        } catch (_) {
          // ignore
        }

        resolve(fallbackLocation);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  });
}
