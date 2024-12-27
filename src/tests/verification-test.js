require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

// Helper function to create a test business
async function createTestBusiness() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    const business = {
        name: 'Test Verification Club',
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
            utilityBill: 'test/test-bill.jpg',
            taxDocument: 'test/test-tax.pdf',
            articleOfIncorporation: 'test/test-incorporation.pdf'
        },
        businessEmail: 'owner@testclub.com',
        businessPhone: '555-555-5555',
        additionalNotes: 'Test claim for verification',
        createdAt: new Date(),
        updatedAt: new Date(),
        verificationStatus: []
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

// Test the verification system
async function testVerification() {
    console.log('🧪 Starting verification tests...\n');
    
    let businessId, claimId;
    
    try {
        // Test 1: Create test data
        console.log('1️⃣ Creating test business and claim...');
        businessId = await createTestBusiness();
        claimId = await createTestClaim(businessId);
        console.log('✅ Test data created');

        // Test 2: Initiate email verification
        console.log('\n2️⃣ Testing email verification...');
        const emailResponse = await fetch(`${BASE_URL}/api/test-api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'initiateVerification',
                claimId,
                method: 'email'
            })
        });
        
        const emailData = await emailResponse.json();
        console.log('Email verification response:', emailData);
        console.assert(emailData.success, 'Expected successful email verification initiation');

        // Test 3: Check verification status
        console.log('\n3️⃣ Checking verification status...');
        const statusResponse = await fetch(`${BASE_URL}/api/test-api?action=verificationStatus&claimId=${claimId}`);
        const statusData = await statusResponse.json();
        console.log('Verification status:', statusData);
        console.assert(statusData.status.length > 0, 'Expected verification status to exist');

        // Test 4: Initiate document verification
        console.log('\n4️⃣ Testing document verification...');
        const docResponse = await fetch(`${BASE_URL}/api/test-api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'initiateVerification',
                claimId,
                method: 'documents'
            })
        });
        
        const docData = await docResponse.json();
        console.log('Document verification response:', docData);
        console.assert(docData.success, 'Expected successful document verification initiation');

        // Test 5: Review claim
        console.log('\n5️⃣ Testing claim review...');
        const reviewResponse = await fetch(`${BASE_URL}/api/test-api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'reviewClaim',
                claimId,
                reviewAction: 'approve',
                reviewNotes: 'Verified through testing'
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
testVerification().catch(console.error);
