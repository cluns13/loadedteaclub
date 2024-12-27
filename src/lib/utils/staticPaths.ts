import { getDb } from '../db/mongodb';

export async function generateStaticCityPaths() {
  try {
    const db = await getDb();
    const cities = await db.collection('businesses').distinct('city');
    const states = await db.collection('businesses').distinct('state');

    const paths = [];
    for (const city of cities) {
      for (const state of states) {
        // Verify this city-state combination exists
        const exists = await db.collection('businesses').findOne({ city, state });
        if (exists) {
          paths.push({
            params: {
              city: city.toLowerCase().replace(/ /g, '-'),
              state: state.toLowerCase()
            }
          });
        }
      }
    }

    return paths;
  } catch (error) {
    console.error('Error generating static paths:', error);
    return [];
  }
}
