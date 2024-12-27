import { signIn, signOut } from 'next-auth/react';

export const testRoutes = {
  // Test user credentials
  testUser: {
    email: 'test@example.com',
    password: 'testpassword123'
  },

  // Authentication tests
  async testAuth() {
    console.log('Testing authentication...');
    try {
      // Test sign in
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: this.testUser.email,
        password: this.testUser.password
      });
      console.log('Sign in result:', signInResult);

      // Test sign out
      const signOutResult = await signOut({ redirect: false });
      console.log('Sign out result:', signOutResult);
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  },

  // Search functionality tests
  async testSearch(query: string) {
    console.log('Testing search with query:', query);
    try {
      const response = await fetch('/api/test/maps-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      console.log('Search results:', data);
      return data;
    } catch (error) {
      console.error('Search test failed:', error);
    }
  },

  // Save location test
  async testSaveLocation(locationId: string) {
    console.log('Testing save location:', locationId);
    try {
      const response = await fetch('/api/locations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locationId })
      });
      const data = await response.json();
      console.log('Save location result:', data);
      return data;
    } catch (error) {
      console.error('Save location test failed:', error);
    }
  },

  // Business claim test
  async testBusinessClaim(businessId: string) {
    console.log('Testing business claim:', businessId);
    try {
      const response = await fetch('/api/business/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ businessId })
      });
      const data = await response.json();
      console.log('Business claim result:', data);
      return data;
    } catch (error) {
      console.error('Business claim test failed:', error);
    }
  }
};

// Helper function to run all tests
export async function runAllTests() {
  console.log('Starting all tests...');
  
  // Auth tests
  await testRoutes.testAuth();
  
  // Search tests
  await testRoutes.testSearch('Jacksonville');
  
  // Save location test
  await testRoutes.testSaveLocation('test-location-id');
  
  // Business claim test
  await testRoutes.testBusinessClaim('test-business-id');
  
  console.log('All tests completed!');
}
