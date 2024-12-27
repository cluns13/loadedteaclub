require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testHastingsSearch() {
  console.log('Starting Hastings Search Test');

  // Google Places API key
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!API_KEY) {
    console.error('Google Places API key is not set');
    process.exit(1);
  }

  // Hastings coordinates
  const hastingsCoords = {
    latitude: 29.4574,   // City center coordinates
    longitude: -81.5158
  };

  const SEARCH_RADIUS = 50000; // 50km in meters
  const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

  console.log(`Searching near Hastings coordinates: ${hastingsCoords.latitude}, ${hastingsCoords.longitude}`);

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        location: `${hastingsCoords.latitude},${hastingsCoords.longitude}`,
        radius: SEARCH_RADIUS,
        keyword: 'nutrition',
        type: 'establishment',
        key: API_KEY,
      },
    });

    if (!response.data || !response.data.results) {
      console.warn('No results found');
      process.exit(0);
    }

    // Create a more precise regex for exact word matching
    const nutritionRegex = /\bnutrition\b/i;

    // Filter results based on 'nutrition' as a whole word
    const nutritionBusinesses = response.data.results.filter(place => 
      nutritionRegex.test(place.name)
    );

    console.log(`Found ${nutritionBusinesses.length} nutrition businesses`);

    // Log details of each result
    nutritionBusinesses.forEach((place, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log('Name:', place.name);
      console.log('Address:', place.vicinity);
      console.log('Types:', place.types);
      console.log('Rating:', place.rating || 'N/A');
    });

  } catch (error) {
    console.error('Search failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  process.exit(0);
}

// Run the test
testHastingsSearch().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
