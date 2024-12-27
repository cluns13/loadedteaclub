import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Validate required environment variables
const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize S3 client with retry configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  maxAttempts: 3, // Enable retry with max 3 attempts
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadPurpose = 'claim' | 'profile' | 'business';

export interface UploadParams {
  fileType: string;
  fileName: string;
  fileSize: number;
  purpose: UploadPurpose;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export async function validateFile({ fileType, fileSize }: UploadParams): Promise<void> {
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    throw new FileValidationError(
      `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
    );
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `File too large. Maximum size allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }
}

export async function generateUploadUrl(params: UploadParams): Promise<{ url: string; key: string }> {
  await validateFile(params);

  // Generate a unique file key with purpose-based folder structure
  const fileExtension = params.fileName.split('.').pop();
  const randomString = crypto.randomBytes(16).toString('hex');
  const timestamp = new Date().toISOString().split('T')[0];
  const key = `${params.purpose}/${timestamp}/${randomString}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: params.fileType,
    ContentLength: params.fileSize,
    Metadata: {
      purpose: params.purpose,
      originalName: params.fileName,
    },
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return { url, key };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      await s3Client.send(command);
      return;
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file after multiple attempts');
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
}

export function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

// Helper function to validate environment setup
export function validateS3Setup(): boolean {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS S3 bucket name is not configured');
    }
    return true;
  } catch (error) {
    console.error('S3 setup validation failed:', error);
    return false;
  }
}
