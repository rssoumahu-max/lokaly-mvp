const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export async function geocodeNlPostcodeHouse(
  postalCode,
  houseNumber,
  country = 'NL'
) {
  const pc = (postalCode || '').trim().toUpperCase().replace(/\s+/g, '');
  const hn = (houseNumber || '').trim();

  if (!pc || !hn) {
    throw new Error('Postcode en huisnummer zijn verplicht.');
  }

  const address = `${pc} ${hn}, Netherlands`;

  const base =
    `https://maps.googleapis.com/maps/api/geocode/json?` +
    `address=${encodeURIComponent(address)}` +
    `&region=nl` +
    `&components=${encodeURIComponent(`country:${country}`)}` +
    `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`;

  const fetchGeo = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results?.length) {
      throw new Error(data.error_message || `Geocoding failed: ${data.status}`);
    }

    return data.results[0];
  };

  let best = await fetchGeo(base);

  const getComp = (type) =>
    best.address_components?.find((c) => c.types?.includes(type))?.long_name ||
    '';

  let route = getComp('route');
  let streetNo = getComp('street_number');
  const locality = getComp('locality') || getComp('postal_town');
  const admin2 = getComp('administrative_area_level_2');
  const admin1 = getComp('administrative_area_level_1');

  if (!route) {
    const url2 =
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(address)}` +
      `&region=nl` +
      `&key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}`;

    best = await fetchGeo(url2);

    const getComp2 = (type) =>
      best.address_components?.find((c) => c.types?.includes(type))
        ?.long_name || '';

    route = getComp2('route') || route;
    streetNo = getComp2('street_number') || streetNo;
  }

  const loc = best.geometry?.location;

  return {
    place_id: best.place_id || null,
    formatted_address: best.formatted_address || null,
    lat: typeof loc?.lat === 'number' ? loc.lat : null,
    lng: typeof loc?.lng === 'number' ? loc.lng : null,
    street: route || null,
    street_number: streetNo || hn || null,
    city: locality || admin2 || admin1 || null,
    postal_code: pc || null,
    country_code: country || null,
  };
}