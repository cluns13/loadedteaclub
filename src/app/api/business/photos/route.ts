import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import type { LoadedTeaClub } from '@/types/models';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const businessId = formData.get('businessId') as string;
    const photos = formData.getAll('photos');
    const isCoverPhoto = formData.get('isCoverPhoto') === 'true';

    if (!businessId || !photos.length) {
      return NextResponse.json(
        { error: 'Business ID and photos are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      _id: new ObjectId(businessId),
      claimedBy: new ObjectId(session.user.id)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Upload photos to S3
    const photoUrls = await Promise.all(
      photos.map(async (photo: any) => {
        const buffer = Buffer.from(await photo.arrayBuffer());
        const key = 'businesses/' + businessId + '/' + uuidv4() + '-' + photo.name;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: photo.type,
          })
        );

        return 'https://' + BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com/' + key;
      })
    );

    // Update business with new photo URLs
    if (isCoverPhoto) {
      await db.collection<LoadedTeaClub>('businesses').updateOne(
        { _id: new ObjectId(businessId) },
        { 
          $set: { coverPhoto: photoUrls[0] },
          $push: { photos: photoUrls[0] }
        }
      );
    } else {
      await db.collection<LoadedTeaClub>('businesses').updateOne(
        { _id: new ObjectId(businessId) },
        { $push: { photos: { $each: photoUrls } } }
      );
    }

    return NextResponse.json({ success: true, photoUrls });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { businessId, photoUrl, isCoverPhoto } = await request.json();

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      _id: new ObjectId(businessId),
      claimedBy: new ObjectId(session.user.id)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Set photo as cover photo
    await db.collection<LoadedTeaClub>('businesses').updateOne(
      { _id: new ObjectId(businessId) },
      { $set: { coverPhoto: photoUrl } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cover photo:', error);
    return NextResponse.json(
      { error: 'Failed to update cover photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const photoUrl = searchParams.get('photoUrl');

    if (!businessId || !photoUrl) {
      return NextResponse.json(
        { error: 'Business ID and photo URL are required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if user owns this business
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      _id: new ObjectId(businessId),
      claimedBy: new ObjectId(session.user.id)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Delete from S3
    const key = photoUrl.split('.amazonaws.com/')[1];
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );

    // Remove URL from business
    await db.collection<LoadedTeaClub>('businesses').updateOne(
      { _id: new ObjectId(businessId) },
      { $pull: { photos: photoUrl } }
    );

    // If the deleted photo is the cover photo, remove it
    const businessData = await db.collection<LoadedTeaClub>('businesses').findOne(
      { _id: new ObjectId(businessId) }
    );

    if (businessData?.coverPhoto === photoUrl) {
      await db.collection<LoadedTeaClub>('businesses').updateOne(
        { _id: new ObjectId(businessId) },
        { $unset: { coverPhoto: '' } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
