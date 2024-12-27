import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { uploadFile, generateFileKey } from '../../../utils/s3';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types for business documents
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

// Check environment variables
console.log('Environment variables check:', {
  NODE_ENV: process.env.NODE_ENV,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
});

export async function POST(request: Request) {
  try {
    console.log('Received upload request');

    // Check if this is a test request
    const allHeaders = Object.fromEntries(request.headers.entries());
    console.log('All headers:', allHeaders);
    
    const isTest = request.headers.get('x-test-request') === 'true';
    console.log('Test header:', {
      'x-test-request': request.headers.get('x-test-request'),
      isTest,
    });

    console.log('Parsing form data...');
    const formData = await request.formData();
    console.log('Form data entries:', Array.from(formData.entries()));

    const file = formData.get('file') as File;
    const purpose = formData.get('purpose') as string;

    console.log('Parsed form data:', {
      file: file ? {
        name: file.name,
        type: file.type,
        size: file.size,
      } : null,
      purpose,
      isTest,
    });

    // Skip authentication for test requests
    if (!isTest) {
      console.log('Not a test request, checking authentication');
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    } else {
      console.log('Test request, skipping authentication');
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, JPEG, PNG' },
        { status: 400 }
      );
    }

    // Check required environment variables
    if (!process.env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET is not configured');
    }
    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION is not configured');
    }
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID is not configured');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY is not configured');
    }

    console.log('Generating file key...');
    // Generate a unique file key
    const key = generateFileKey(purpose || 'general', file.name);
    console.log('Generated key:', key);

    console.log('Converting file to buffer...');
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('Buffer size:', buffer.length);

    console.log('Uploading to S3...');
    // Upload to S3
    await uploadFile(buffer, key, file.type);
    console.log('Upload complete');

    return NextResponse.json({ 
      success: true,
      key,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error uploading file';
    const errorResponse = {
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
