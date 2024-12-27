require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkBusinesses() {
    try {
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db();
        
        const businesses = await db.collection('businesses')
            .find({})
            .limit(5)
            .toArray();

        console.log('Found businesses:', businesses.map(b => ({
            _id: b._id.toString(),
            name: b.name,
            claimed: b.claimed || false
        })));

        await client.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkBusinesses().catch(console.error);
