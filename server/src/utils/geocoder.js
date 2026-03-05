/**
 * Geocoding utility using OpenStreetMap Nominatim API
 */

/**
 * Fetches coordinates for a given address
 * @param {Object} address - { city, state, country }
 * @returns {Promise<[number, number]|null>} - [longitude, latitude] or null
 */
async function getCoordinates(address) {
    const { city, state, country } = address;

    // Construct the search query with more specificity
    const queryParts = [];
    if (city) queryParts.push(city);
    if (state) queryParts.push(state);
    if (country) queryParts.push(country);

    if (queryParts.length === 0) return null;

    // Use structured params for Nominatim to be more precise if possible
    const params = new URLSearchParams({
        format: 'json',
        limit: '1',
        city: city || '',
        state: state || '',
        country: country || '',
    });

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Staylix-Travel-App/1.0 (contact@staylix.com)' // Better User-Agent format
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API returned status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            // Ensure we use high-precision decimals
            const lon = parseFloat(data[0].lon);
            const lat = parseFloat(data[0].lat);

            if (!isNaN(lon) && !isNaN(lat)) {
                return [lon, lat];
            }
        }

        return null;
    } catch (error) {
        console.error('Geocoding error for address:', address, error.message);
        return null;
    }
}

module.exports = { getCoordinates };
