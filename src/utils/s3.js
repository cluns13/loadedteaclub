import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a unique file key for S3 storage
 * @param {string} folder - The folder to store the file in (e.g., 'claims', 'profiles')
 * @param {string} originalFilename - The original filename
 * @returns {string} The generated file key
 */
export function generateFileKey(folder, originalFilename) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop();
  return `${folder}/${timestamp}-${randomString}.${extension}`;
}

/**
 * Uploads a file to S3
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} key - The file key (path in S3)
 * @param {string} contentType - The file's content type
 * @returns {Promise<string>} The URL of the uploaded file
 */
export async function uploadFile(fileBuffer, key, contentType) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  await s3Client.send(new PutObjectCommand(params));
  return key;
}

/**
 * Generates a signed URL for temporary file access
 * @param {string} key - The file key in S3
 * @param {number} expiresIn - Number of seconds until the URL expires (default: 3600)
 * @returns {Promise<string>} The signed URL
 */
export async function getSignedFileUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Deletes a file from S3
 * @param {string} key - The file key to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
}

/**
 * Checks if a file exists in S3
 * @param {string} key - The file key to check
 * @returns {Promise<boolean>} Whether the file exists
 */
export async function fileExists(key) {
  try {
    await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return false;
    }
    throw error;
  }
}
