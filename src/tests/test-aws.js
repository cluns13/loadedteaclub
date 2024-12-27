require('dotenv').config({ path: '.env.local' });

const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testAwsConnection() {
  console.log('Testing AWS connection with:', {
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

  try {
    console.log('Listing buckets...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('Buckets:', response.Buckets?.map(b => b.Name));
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

testAwsConnection().catch(console.error);
