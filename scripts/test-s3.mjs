import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testS3Operations() {
  const testKey = 'test/test-file.txt';
  const testContent = 'This is a test file for the Loaded Tea Finder application.';

  try {
    // Test 1: Upload file
    console.log('Testing file upload...');
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    }));
    console.log('✅ File upload successful');

    // Test 2: Generate signed URL
    console.log('\nTesting signed URL generation...');
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
    }), { expiresIn: 3600 });
    console.log('✅ Signed URL generated successfully');
    console.log('Signed URL:', signedUrl);

    // Test 3: Delete file
    console.log('\nTesting file deletion...');
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
    }));
    console.log('✅ File deletion successful');

    console.log('\n🎉 All S3 operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during S3 operations:', error);
    process.exit(1);
  }
}

testS3Operations();
