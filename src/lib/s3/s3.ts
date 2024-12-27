import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function deleteS3Object(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    return false;
  }
}

export async function deleteS3Objects(keys: string[]) {
  const results = await Promise.allSettled(
    keys.map(key => deleteS3Object(key))
  );

  return results.map((result, index) => ({
    key: keys[index],
    success: result.status === 'fulfilled' && result.value,
  }));
}

// Helper to extract key from S3 URL
export function getS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash
    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
