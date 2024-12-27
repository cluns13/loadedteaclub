import { GooglePlacesService } from './services/googlePlacesService';

async function testNutritionSearch() {
  console.log('Starting Nutrition Business Search Test');

  // Create service instance
  const placesService = new GooglePlacesService();

  // Test locations (Austin coordinates)
  const testLocations = [
    { latitude: 30.2672, longitude: -97.7431 }, // Austin city center
    { latitude: 30.3950, longitude: -97.7336 }, // North Austin
    { latitude: 30.2241, longitude: -97.7470 }  // South Austin
  ];

  for (const { latitude, longitude } of testLocations) {
    console.log(`\nSearching near coordinates: ${latitude}, ${longitude}`);

    try {
      const results = await placesService.searchNearbyPlaces(
        latitude, 
        longitude
      );

      console.log(`Found ${results.length} nutrition businesses`);

      // Validate each result
      results.forEach(place => {
        console.log('---');
        console.log('Name:', place.name);
        console.log('Address:', place.address);
        console.log('Rating:', place.rating);
        
        // Verify 'nutrition' is in the name
        if (!place.name.toLowerCase().includes('nutrition')) {
          console.error(`Invalid result: ${place.name} does not contain 'nutrition'`);
          process.exit(1);
        }
      });

    } catch (error) {
      console.error('Search failed:', error);
      process.exit(1);
    }
  }

  console.log('\nNutrition Business Search Test Completed Successfully ✓');
  process.exit(0);
}

// Run the test
testNutritionSearch().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
