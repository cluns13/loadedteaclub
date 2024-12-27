import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

console.log('Initializing S3 client with:', {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
  bucket: process.env.AWS_S3_BUCKET,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Checks if a bucket exists and creates it if it doesn't
 * @returns {Promise<void>}
 */
async function ensureBucketExists(): Promise<void> {
  const bucketName = process.env.AWS_S3_BUCKET!;
  
  try {
    // Try to check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log('Bucket exists:', bucketName);
  } catch (error: any) {
    console.log('Error checking bucket:', {
      name: error.name,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      message: error.message
    });

    // Check if bucket doesn't exist or we don't have permission to check
    if (error.$metadata?.httpStatusCode === 404 || error.$metadata?.httpStatusCode === 403) {
      console.log('Bucket may not exist, attempting to create:', bucketName);
      try {
        const createBucketCommand = new CreateBucketCommand({ 
          Bucket: bucketName,
        });
        
        await s3Client.send(createBucketCommand);
        console.log('Bucket created successfully');
      } catch (createError: any) {
        console.error('Error creating bucket:', {
          name: createError.name,
          code: createError.Code,
          statusCode: createError.$metadata?.httpStatusCode,
          message: createError.message
        });
        throw new Error(`Failed to create S3 bucket: ${createError.message}`);
      }
    } else {
      console.error('Unexpected error checking bucket:', error);
      throw new Error(`Unexpected error checking S3 bucket: ${error.message}`);
    }
  }
}

/**
 * Generates a unique file key for S3 storage
 * @param {string} folder - The folder to store the file in (e.g., 'claims', 'profiles')
 * @param {string} originalFilename - The original filename
 * @returns {string} The generated file key
 */
export function generateFileKey(folder: string, originalFilename: string): string {
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
export async function uploadFile(fileBuffer: Buffer, key: string, contentType: string): Promise<string> {
  console.log('Uploading file to S3:', {
    key,
    contentType,
    bucketName: process.env.AWS_S3_BUCKET,
    bufferSize: fileBuffer.length,
  });

  // Ensure bucket exists before uploading
  await ensureBucketExists();

  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    console.log('Sending PutObjectCommand to S3...');
    await s3Client.send(new PutObjectCommand(params));
    console.log('File uploaded successfully');
    return key;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Generates a signed URL for temporary file access
 * @param {string} key - The file key in S3
 * @param {number} expiresIn - Number of seconds until the URL expires (default: 3600)
 * @returns {Promise<string>} The signed URL
 */
export async function getSignedFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
  // Ensure bucket exists before getting URL
  await ensureBucketExists();
  
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Deletes a file from S3
 * @param {string} key - The file key to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(key: string): Promise<void> {
  // Ensure bucket exists before deleting
  await ensureBucketExists();
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  };
  await s3Client.send(new DeleteObjectCommand(params));
}

/**
 * Checks if a file exists in S3
 * @param {string} key - The file key to check
 * @returns {Promise<boolean>} Whether the file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    // Ensure bucket exists before checking
    await ensureBucketExists();
    
    await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
    );
    return true;
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}
