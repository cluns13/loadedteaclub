import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple function to test location URL formatting
function formatLocationUrl(city: string, state: string): string {
  const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
  const formattedState = state.toLowerCase();
  return `${formattedCity}-${formattedState}`;
}

// Test function
function runLocationServiceTests() {
  console.log('Starting Location Service Diagnostic Test');

  const testCases = [
    { city: 'Austin', state: 'TX', expected: 'austin-tx' },
    { city: 'New York', state: 'NY', expected: 'new-york-ny' },
    { city: 'San Francisco', state: 'CA', expected: 'san-francisco-ca' }
  ];

  for (const { city, state, expected } of testCases) {
    const result = formatLocationUrl(city, state);
    console.log(`Testing: ${city}, ${state} → ${result}`);
    
    if (result !== expected) {
      console.error(`Location URL formatting failed for ${city}, ${state}`);
      console.error(`Expected: ${expected}, Got: ${result}`);
      process.exit(1);
    }
  }
  
  console.log('Location URL Formatting Test Passed ✓');
  console.log('\nLocation Service Diagnostic Test Complete ✓');
  process.exit(0);
}

// Run the tests
runLocationServiceTests();
