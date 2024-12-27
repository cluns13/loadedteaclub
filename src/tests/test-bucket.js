require('dotenv').config({ path: '.env.local' });

const { S3Client, HeadBucketCommand, CreateBucketCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testBucket() {
  console.log('Testing bucket operations with:', {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
    bucket: process.env.AWS_S3_BUCKET,
  });

  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucketName = process.env.AWS_S3_BUCKET;

  try {
    // Try to check if bucket exists
    console.log('Checking if bucket exists...');
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log('✅ Bucket exists');
    } catch (error) {
      console.log('Error checking bucket:', {
        name: error.name,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode,
        message: error.message,
      });

      if (error.$metadata?.httpStatusCode === 404 || error.$metadata?.httpStatusCode === 403) {
        console.log('Creating bucket...');
        try {
          await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
          console.log('✅ Bucket created successfully');
        } catch (createError) {
          console.error('Error creating bucket:', {
            name: createError.name,
            code: createError.Code,
            statusCode: createError.$metadata?.httpStatusCode,
            message: createError.message,
          });
          throw createError;
        }
      } else {
        throw error;
      }
    }

    // Try to upload a test file
    console.log('Uploading test file...');
    const testData = Buffer.from('Hello, World!');
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: 'test.txt',
      Body: testData,
      ContentType: 'text/plain',
    }));
    console.log('✅ Test file uploaded successfully');

  } catch (error) {
    console.error('Error:', {
      name: error.name,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message,
    });
    throw error;
  }
}

testBucket().catch(console.error);
