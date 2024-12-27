process.env.NODE_ENV = 'development';

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function createTestImage() {
  console.log('\n1️⃣ Creating test image...');
  
  const testImagePath = path.join(process.cwd(), 'test-image.jpg');
  const imageData = Buffer.alloc(1024); // 1KB of data
  fs.writeFileSync(testImagePath, imageData);
  
  console.log('✅ Test image created');
  return testImagePath;
}

async function testFileUpload(imagePath) {
  console.log('\n2️⃣ Testing file upload...');

  const { default: fetch } = await import('node-fetch');
  const formData = new FormData();
  const fileStream = fs.createReadStream(imagePath);
  formData.append('file', fileStream, {
    filename: 'test-image.jpg',
    contentType: 'image/jpeg'
  });
  formData.append('purpose', 'test');

  const headers = {
    ...formData.getHeaders(),
    'accept': 'application/json',
  };
  console.log('Request headers:', headers);

  const url = `${BASE_URL}/api/test/upload`;
  console.log('Sending request to:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response text:', responseText);

    if (!response.ok) {
      throw new Error(`Upload failed (${response.status}): ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse response as JSON: ${responseText}`);
    }

    console.log('✅ File uploaded successfully');
    console.log('📝 Response:', data);
    return data;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function cleanup(imagePath) {
  console.log('\n3️⃣ Cleaning up...');
  try {
    fs.unlinkSync(imagePath);
    console.log('✅ Test image deleted');
  } catch (error) {
    console.error('❌ Error deleting test image:', error);
  }
}

async function runTests() {
  console.log('🧪 Starting upload tests...');
  
  const imagePath = await createTestImage();
  await testFileUpload(imagePath);
  await cleanup(imagePath);
}

runTests().catch(console.error);
