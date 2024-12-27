require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
        userId: new ObjectId('000000000000000000000001'), // Test user ID
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

// Test admin claim review functionality
async function testAdminClaimReview() {
    console.log('🧪 Starting admin claim review tests...\n');
    
    let businessId, claimId;
    
    try {
        // Step 1: Create test data
        console.log('1️⃣ Creating test business and claim...');
        businessId = await createTestBusiness();
        claimId = await createTestClaim(businessId);
        console.log('✅ Test data created\n');

        // Step 2: Test fetching claims list
        console.log('2️⃣ Testing claims list endpoint...');
        const listResponse = await fetch(`${BASE_URL}/api/test/admin/claims?status=pending`);
        const listData = await listResponse.json();
        
        console.log(`Status: ${listResponse.status}`);
        console.log('Claims found:', listData.claims.length);
        console.assert(listResponse.ok, 'Expected successful claims list response');
        console.assert(listData.claims.length > 0, 'Expected to find at least one claim');

        // Step 3: Test claim approval
        console.log('\n3️⃣ Testing claim approval...');
        const approveResponse = await fetch(`${BASE_URL}/api/test/admin/claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                claimId,
                action: 'approve',
                reviewNotes: 'Approved in test'
            })
        });
        
        const approveData = await approveResponse.json();
        console.log(`Status: ${approveResponse.status}`, approveData);
        console.assert(approveResponse.ok, 'Expected successful approval');

        // Step 4: Test claim rejection
        console.log('\n4️⃣ Testing claim rejection...');
        const rejectResponse = await fetch(`${BASE_URL}/api/admin/claims`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                claimId,
                action: 'reject',
                reviewNotes: 'Rejected in test'
            })
        });
        
        const rejectData = await rejectResponse.json();
        console.log(`Status: ${rejectResponse.status}`, rejectData);
        console.assert(!rejectResponse.ok, 'Expected rejection of already approved claim');

        console.log('\n✅ All admin review tests completed');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    } finally {
        // Cleanup test data
        if (businessId && claimId) {
            console.log('\n🧹 Cleaning up test data...');
            await cleanupTestData(businessId, claimId);
            console.log('✅ Test data cleaned up');
        }
    }
}

// Run the tests
testAdminClaimReview().catch(console.error);
