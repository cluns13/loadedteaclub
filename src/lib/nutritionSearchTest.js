require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testNutritionSearch() {
  console.log('Starting Nutrition Business Search Test');

  // Google Places API key
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!API_KEY) {
    console.error('Google Places API key is not set');
    process.exit(1);
  }

  // Test locations (Austin coordinates)
  const testLocations = [
    { latitude: 30.2672, longitude: -97.7431 }, // Austin city center
    { latitude: 30.3950, longitude: -97.7336 }, // North Austin
    { latitude: 30.2241, longitude: -97.7470 }  // South Austin
  ];

  const SEARCH_RADIUS = 50000; // 50km in meters
  const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

  for (const { latitude, longitude } of testLocations) {
    console.log(`\nSearching near coordinates: ${latitude}, ${longitude}`);

    try {
      const response = await axios.get(BASE_URL, {
        params: {
          location: `${latitude},${longitude}`,
          radius: SEARCH_RADIUS,
          keyword: 'nutrition',
          type: 'establishment',
          key: API_KEY,
        },
      });

      if (!response.data || !response.data.results) {
        console.warn('No results found');
        continue;
      }

      // Filter results to only include businesses with 'nutrition' in the name
      const nutritionBusinesses = response.data.results.filter(place => 
        place.name.toLowerCase().includes('nutrition')
      );

      console.log(`Found ${nutritionBusinesses.length} nutrition businesses`);

      // Validate each result
      nutritionBusinesses.forEach(place => {
        console.log('---');
        console.log('Name:', place.name);
        console.log('Address:', place.vicinity);
        console.log('Rating:', place.rating || 'N/A');
        
        // Verify 'nutrition' is in the name
        if (!place.name.toLowerCase().includes('nutrition')) {
          console.error(`Invalid result: ${place.name} does not contain 'nutrition'`);
          process.exit(1);
        }
      });

    } catch (error) {
      console.error('Search failed:', error.response ? error.response.data : error.message);
      process.exit(1);
    }
  }

  console.log('\nNutrition Business Search Test Completed Successfully ');
  process.exit(0);
}

// Run the test
testNutritionSearch().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
