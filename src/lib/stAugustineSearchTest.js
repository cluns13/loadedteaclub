require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function testStAugustineSearch() {
  console.log('Starting St. Augustine Search Test');

  // Google Places API key
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
  if (!API_KEY) {
    console.error('Google Places API key is not set');
    process.exit(1);
  }

  // St. Augustine coordinates
  const stAugustineCoords = {
    latitude: 29.8947,   // City center coordinates
    longitude: -81.3130
  };

  const SEARCH_RADIUS = 50000; // 50km in meters
  const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

  console.log(`Searching near St. Augustine coordinates: ${stAugustineCoords.latitude}, ${stAugustineCoords.longitude}`);

  try {
    // Search with multiple keywords to capture more potential results
    const keywords = ['loaded tea', 'nutrition', 'herbalife'];
    const allResults = [];

    for (const keyword of keywords) {
      const response = await axios.get(BASE_URL, {
        params: {
          location: `${stAugustineCoords.latitude},${stAugustineCoords.longitude}`,
          radius: SEARCH_RADIUS,
          keyword: keyword,
          type: 'establishment',
          key: API_KEY,
        },
      });

      if (response.data && response.data.results) {
        allResults.push(...response.data.results);
      }
    }

    if (allResults.length === 0) {
      console.warn('No results found');
      process.exit(0);
    }

    // Create a more precise regex for exact word matching
    const stAugustineRegex = /\b(st\.?\s*augustine|st\s*aug)\b/i;
    const nutritionRegex = /\b(nutrition|loaded\s*tea|herbalife)\b/i;

    // Remove duplicates and filter results
    const uniqueResults = Array.from(
      new Map(allResults.map(place => [place.place_id, place])).values()
    );

    const filteredResults = uniqueResults.filter(place => {
      console.log('Checking place:', place.name);
      console.log('Vicinity:', place.vicinity);

      const hasNutritionKeyword = nutritionRegex.test(place.name);
      const isInStAugustine = place.vicinity && stAugustineRegex.test(place.vicinity);

      const passesFilter = hasNutritionKeyword && isInStAugustine;
      
      console.log('Nutrition Keyword:', hasNutritionKeyword);
      console.log('In St. Augustine:', isInStAugustine);
      console.log('Passes filter:', passesFilter);
      console.log('---');

      return passesFilter;
    });

    console.log(`Filtered results found: ${filteredResults.length}`);

    // Log details of each result
    filteredResults.forEach((place, index) => {
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
testStAugustineSearch().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
