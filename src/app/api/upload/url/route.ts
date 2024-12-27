import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { generateUploadUrl, FileValidationError, validateS3Setup, UploadPurpose } from '@/lib/storage/s3';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

// Rate limiter: 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

// Request validation schema
const uploadRequestSchema = z.object({
  fileType: z.string(),
  fileName: z.string(),
  fileSize: z.number().positive(),
  purpose: z.enum(['claim', 'profile', 'business'] as const),
});

export async function POST(request: Request) {
  try {
    // Check S3 setup
    if (!validateS3Setup()) {
      console.error('S3 is not properly configured');
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    try {
      await limiter.check(5, session.user.id); // 5 requests per minute per user
    } catch {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = uploadRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { fileType, fileName, fileSize, purpose } = validationResult.data;

    try {
      const { url, key } = await generateUploadUrl({
        fileType,
        fileName,
        fileSize,
        purpose,
      });

      // Log upload attempt
      console.log({
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        action: 'upload_url_generated',
        purpose,
        fileType,
        fileSize,
      });

      return NextResponse.json({ url, key });
    } catch (error) {
      if (error instanceof FileValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
