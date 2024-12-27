require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { createCanvas } = require('canvas');

// Use node-fetch v2 for CommonJS compatibility
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Helper function to create a test image
async function createTestImage(filename) {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    
    // Draw something on the canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText('Test Document', 50, 100);
    
    // Save the canvas to a file
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

    console.log(`Uploading ${path.basename(filePath)}...`);
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
    console.log(`✅ ${path.basename(filePath)} uploaded successfully`);
    return result.key;
}

// Helper function to submit a claim
async function submitClaim(claimData) {
    console.log('Submitting claim with data:', claimData);
    
    const response = await fetch(`${BASE_URL}/api/test/claim`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(claimData),
    });

    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(`Claim submission failed (${response.status}): ${JSON.stringify(result)}`);
    }

    return result;
}

// Main test function
async function runClaimTest() {
    console.log('🧪 Starting business claim tests...\n');
    
    const testFiles = {
        businessLicense: 'test-business-license.jpg',
        proofOfOwnership: 'test-proof-ownership.jpg',
        governmentId: 'test-government-id.jpg',
        utilityBill: 'test-utility-bill.jpg',
    };

    try {
        // Step 1: Create test images
        console.log('1️⃣ Creating test documents...');
        for (const [key, filename] of Object.entries(testFiles)) {
            await createTestImage(filename);
        }
        console.log('✅ Test documents created\n');

        // Step 2: Upload all documents
        console.log('2️⃣ Uploading documents...');
        const uploadedFiles = {};
        for (const [key, filename] of Object.entries(testFiles)) {
            uploadedFiles[key] = await uploadFile(filename);
        }
        console.log('✅ All documents uploaded\n');

        // Step 3: Submit claim
        console.log('3️⃣ Submitting business claim...');
        const claimData = {
            businessId: '6769b356f654ed3a67c2157e', // Valid business ID from our database
            ...uploadedFiles,
            additionalNotes: 'This is a test claim submission',
        };

        const result = await submitClaim(claimData);
        console.log('✅ Claim submitted successfully');
        console.log('📝 Response:', result);

        // Step 4: Clean up
        console.log('\n4️⃣ Cleaning up...');
        for (const filename of Object.values(testFiles)) {
            fs.unlinkSync(filename);
        }
        console.log('✅ Test files cleaned up');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        // Clean up files even if test fails
        for (const filename of Object.values(testFiles)) {
            if (fs.existsSync(filename)) {
                fs.unlinkSync(filename);
            }
        }
        process.exit(1);
    }
}

// Run the test
runClaimTest().catch(console.error);
