require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { createCanvas } = require('canvas');
const { MongoClient, ObjectId } = require('mongodb');

// Use node-fetch v2 for CommonJS compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Helper function to create a test image
async function createTestImage(filename) {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('Test Document', 50, 100);
    const buffer = canvas.toBuffer('image/jpeg');
    fs.writeFileSync(filename, buffer);
    return filename;
}

// Helper function to upload a file
async function uploadFile(filePath, type = 'image/jpeg') {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: type,
    });

    const response = await fetch(`${BASE_URL}/api/test/upload`, {
        method: 'POST',
        body: formData,
        headers: {
            ...formData.getHeaders(),
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed (${response.status}): ${text}`);
    }

    const result = await response.json();
    return result.key;
}

// Helper function to submit a claim
async function submitClaim(claimData) {
    const response = await fetch(`${BASE_URL}/api/test/claim`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(claimData),
    });

    return {
        ok: response.ok,
        status: response.status,
        data: await response.json()
    };
}

// Helper function to mark a business as claimed in the database
async function markBusinessAsClaimed(businessId) {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    await db.collection('businesses').updateOne(
        { _id: new ObjectId(businessId) },
        { $set: { claimed: true, updatedAt: new Date() } }
    );

    await client.close();
}

// Helper function to create test documents
async function createAndUploadDocuments() {
    const testFiles = {
        businessLicense: 'test-business-license.jpg',
        proofOfOwnership: 'test-proof-ownership.jpg',
        governmentId: 'test-government-id.jpg',
        utilityBill: 'test-utility-bill.jpg',
    };

    // Create and upload all documents
    const uploadedFiles = {};
    for (const [key, filename] of Object.entries(testFiles)) {
        await createTestImage(filename);
        uploadedFiles[key] = await uploadFile(filename);
        fs.unlinkSync(filename);
    }

    return uploadedFiles;
}

// Helper function to create a test business
async function createTestBusiness() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    const business = {
        name: 'Test Nutrition Club',
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

// Main test function
async function runErrorTests() {
    console.log('🧪 Starting business claim error tests...\n');
    
    try {
        // Create a test business
        console.log('📝 Creating test business...');
        const validBusinessId = await createTestBusiness();
        console.log('✅ Test business created\n');

        // Upload test documents once to use in multiple tests
        console.log('📝 Preparing test documents...');
        const documents = await createAndUploadDocuments();
        console.log('✅ Test documents prepared\n');

        // Test Case 1: Invalid Business ID
        console.log('1️⃣ Testing invalid business ID...');
        const invalidIdResult = await submitClaim({
            businessId: '000000000000000000000000',
            ...documents,
            additionalNotes: 'Test with invalid business ID',
        });
        console.log(`Status: ${invalidIdResult.status}`, invalidIdResult.data);
        console.assert(invalidIdResult.status === 404, 'Expected 404 status for invalid business ID');

        // Test Case 2: Invalid Document Format
        console.log('\n2️⃣ Testing invalid document format...');
        const invalidFormatResult = await submitClaim({
            businessId: validBusinessId,
            ...documents,
            businessLicense: 'invalid-path',
            additionalNotes: 'Test with invalid document format',
        });
        console.log(`Status: ${invalidFormatResult.status}`, invalidFormatResult.data);
        console.assert(invalidFormatResult.status === 400, 'Expected 400 status for invalid document format');

        // Test Case 3: Already Claimed Business
        console.log('\n3️⃣ Testing already claimed business...');
        await markBusinessAsClaimed(validBusinessId);
        const claimedResult = await submitClaim({
            businessId: validBusinessId,
            ...documents,
            additionalNotes: 'Test with already claimed business',
        });
        console.log(`Status: ${claimedResult.status}`, claimedResult.data);
        console.assert(claimedResult.status === 400, 'Expected 400 status for claimed business');

        // Test Case 4: Missing Required Documents
        console.log('\n4️⃣ Testing missing required documents...');
        const { businessLicense, ...incompleteDocuments } = documents;
        const missingDocsResult = await submitClaim({
            businessId: validBusinessId,
            ...incompleteDocuments,
            additionalNotes: 'Test with missing documents',
        });
        console.log(`Status: ${missingDocsResult.status}`, missingDocsResult.data);
        console.assert(missingDocsResult.status === 400, 'Expected 400 status for missing documents');

        console.log('\n✅ All error tests completed');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the tests
runErrorTests().catch(console.error);
