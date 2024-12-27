const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoUri ? 'Found connection string' : 'Not found');

// State name to abbreviation mapping
const stateNameToAbbr = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 
  'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 
  'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 
  'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 
  'Wisconsin': 'WI', 'Wyoming': 'WY'
};

function extractState(address) {
  // First, try to find a two-letter state abbreviation
  const abbrevMatch = address.match(/\b([A-Z]{2})\b/);
  if (abbrevMatch) return abbrevMatch[1];

  // If no abbreviation, look for full state name
  const stateMatch = address.match(/([A-Za-z\s]+)\s+\d{5}/);
  if (stateMatch) {
    const stateName = stateMatch[1].trim();
    return stateNameToAbbr[stateName] || 'Unknown';
  }

  return 'Unknown';
}

function normalizeAddress(address) {
  // Remove ", United States" from the end of the address
  return address.replace(/, United States$/, '').trim();
}

function processNutritionClubs(clubs) {
  // Categorize by state and prepare for MongoDB
  const processedClubs = clubs.map((club, index) => ({
    _id: `club_${index + 1}`, // Generate unique MongoDB _id
    name: club['Club Name'],
    address: {
      full: normalizeAddress(club.Address),
      state: extractState(club.Address)
    },
    contact: {
      phone: club['Phone Number'] || '',
      phoneLink: club['Phone Link'] || ''
    },
    socialMedia: {
      facebook: club['Facebook Link'] || '',
      instagram: club['Instagram Link'] || ''
    },
    profileLink: club['Profile Link'] || '',
    image: club.Image || '',
    metadata: {
      source: 'Nutrition Club Directory',
      importedAt: new Date().toISOString()
    }
  }));

  // Generate state statistics
  const stateStats = processedClubs.reduce((acc, club) => {
    const state = club.address.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  const stateStatsArray = Object.entries(stateStats)
    .map(([state, clubCount]) => ({ state, clubCount }))
    .sort((a, b) => b.clubCount - a.clubCount);

  return {
    clubs: processedClubs,
    stateStats: stateStatsArray,
    totalClubs: processedClubs.length
  };
}

async function saveToMongoDB(processedData) {
  if (!mongoUri) {
    console.error('MongoDB URI is not set');
    return;
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const database = client.db('tea-finder');
    
    // Drop existing collections if they exist
    await database.collection('nutrition-clubs').drop().catch(() => {});
    await database.collection('state-stats').drop().catch(() => {});

    // Insert nutrition clubs
    const clubsCollection = database.collection('nutrition-clubs');
    await clubsCollection.insertMany(processedData.clubs);

    // Insert state statistics
    const statsCollection = database.collection('state-stats');
    await statsCollection.insertMany(processedData.stateStats);

    console.log(`Successfully inserted ${processedData.totalClubs} nutrition clubs`);
    console.log('State Statistics:', processedData.stateStats);
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
  } finally {
    await client.close();
  }
}

// Read and process the JSON file
const inputFile = path.join(__dirname, '..', 'data', 'nutrition-clubs.json');
const outputFile = path.join(__dirname, '..', 'data', 'processed-nutrition-clubs.json');

fs.readFile(inputFile, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const clubs = JSON.parse(data);
    const processedData = processNutritionClubs(clubs);
    
    // Save to JSON file
    fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));

    // Save to MongoDB
    await saveToMongoDB(processedData);

    console.log('Processed nutrition clubs data successfully!');
    console.log('Total Clubs:', processedData.totalClubs);
  } catch (parseErr) {
    console.error('Error processing data:', parseErr);
  }
});
