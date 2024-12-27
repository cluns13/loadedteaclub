require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

// Helper function to create a test business
async function createTestBusiness() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    const business = {
        name: 'Test Admin Review Club',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        phone: '555-555-5555',
        claimed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await db.collection('businesses').insertOne(business);
    await client.close();
    return result.insertedId.toString();
}

// Helper function to create a test claim
async function createTestClaim(businessId) {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    const claim = {
        businessId: new ObjectId(businessId),
        userId: new ObjectId('000000000000000000000001'),
        status: 'pending',
        documents: {
            businessLicense: 'test/test-license.jpg',
            proofOfOwnership: 'test/test-ownership.jpg',
            governmentId: 'test/test-id.jpg',
            utilityBill: 'test/test-bill.jpg'
        },
        additionalNotes: 'Test claim for admin review',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await db.collection('businessClaims').insertOne(claim);
    await client.close();
    return result.insertedId.toString();
}

// Helper function to cleanup test data
async function cleanupTestData(businessId, claimId) {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    await db.collection('businesses').deleteOne({ _id: new ObjectId(businessId) });
    await db.collection('businessClaims').deleteOne({ _id: new ObjectId(claimId) });
    
    await client.close();
}

// Test the API
async function testApi() {
    console.log('🧪 Starting API tests...\n');
    
    let businessId, claimId;
    
    try {
        // Test 1: Ping
        console.log('1️⃣ Testing ping...');
        const pingResponse = await fetch(`${BASE_URL}/api/test-api?action=ping`);
        const responseText = await pingResponse.text();
        console.log('Raw response:', responseText);
        
        try {
            const pingData = JSON.parse(responseText);
            console.log('Ping response:', pingData);
            console.assert(pingData.message === 'pong', 'Expected pong response');
        } catch (e) {
            console.error('Failed to parse JSON:', e);
        }

        // Test 2: Create test data
        console.log('\n2️⃣ Creating test business and claim...');
        businessId = await createTestBusiness();
        claimId = await createTestClaim(businessId);
        console.log('✅ Test data created');

        // Test 3: List claims
        console.log('\n3️⃣ Testing claims list...');
        const listResponse = await fetch(`${BASE_URL}/api/test-api?action=listClaims&status=pending`);
        const listData = await listResponse.json();
        console.log('Claims found:', listData.claims.length);
        console.assert(listData.claims.length > 0, 'Expected to find claims');

        // Test 4: Review claim
        console.log('\n4️⃣ Testing claim review...');
        const reviewResponse = await fetch(`${BASE_URL}/api/test-api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'reviewClaim',
                claimId,
                reviewAction: 'approve',
                reviewNotes: 'Approved in test'
            })
        });
        
        const reviewData = await reviewResponse.json();
        console.log('Review response:', reviewData);
        console.assert(reviewData.success, 'Expected successful review');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        // Cleanup
        if (businessId && claimId) {
            console.log('\n🧹 Cleaning up test data...');
            await cleanupTestData(businessId, claimId);
            console.log('✅ Test data cleaned up');
        }
    }
}

// Run the tests
testApi().catch(console.error);
