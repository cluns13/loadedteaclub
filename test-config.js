import { OpenAI } from 'openai';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "gpt-3.5-turbo",
    });

    console.log('OpenAI API Test: SUCCESS');
    console.log('Response:', completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Test: FAILED');
    console.error('Error:', error.message);
  }
}

async function testAWS() {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });

    console.log('\nTesting S3 Permissions...');
    
    // Test ListBucket
    console.log('\n1. Testing ListBucket permission...');
    const objects = await s3.listObjects({
      Bucket: process.env.AWS_S3_BUCKET,
      MaxKeys: 1
    }).promise();
    console.log(' ListBucket: SUCCESS');

    // Test PutObject
    console.log('\n2. Testing PutObject permission...');
    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'test-file.txt',
      Body: 'This is a test file'
    }).promise();
    console.log(' PutObject: SUCCESS');

    // Test GetObject
    console.log('\n3. Testing GetObject permission...');
    const getResult = await s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'test-file.txt'
    }).promise();
    console.log(' GetObject: SUCCESS');

    // Test DeleteObject
    console.log('\n4. Testing DeleteObject permission...');
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: 'test-file.txt'
    }).promise();
    console.log(' DeleteObject: SUCCESS');

    console.log('\nAWS S3 Test: ALL PERMISSIONS VERIFIED SUCCESSFULLY');
  } catch (error) {
    console.error('\nAWS S3 Test: FAILED');
    console.error('Error:', error.message);
  }
}

// Run tests
console.log('Starting configuration tests...\n');
testOpenAI();
testAWS();
